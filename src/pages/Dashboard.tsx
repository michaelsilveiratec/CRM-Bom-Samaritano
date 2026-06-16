import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  TrendingUp,
  Heart,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Target,
  X,
  Gift,
  Waves
} from "lucide-react";
import { API_BASE } from "../services/api";
import { fetchServerMembers, fetchServerSettings, fetchServerVisitors, saveServerSettings } from "../services/crm.service";
import { createQrCodeDataUrl } from "../utils/qrcode";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

interface BirthdayAlert {
  id: number | string;
  name: string;
  phone: string;
  type: "Membro" | "Visitante";
  birthDate: string;
}

type ChartRange = "year" | "last6";

interface ChartPointBreakdown {
  members: number;
  visitors: number;
}

const chartMonthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function readCachedArray(key: string) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRecordTimestamp(record: any) {
  const rawDate = record?.createdAt || record?.registrationDate || record?.visitDate || record?.id || "";
  const parsedDate =
    typeof rawDate === "number"
      ? rawDate
      : new Date(String(rawDate).includes("T") ? String(rawDate) : `${rawDate}T00:00:00`).getTime();
  const idDate = typeof record?.id === "number" ? record.id : Number(record?.id || 0);

  return Number.isFinite(parsedDate) && parsedDate > 0 ? parsedDate : Number.isFinite(idDate) ? idDate : 0;
}

function getChartBuckets(range: ChartRange) {
  const now = new Date();

  if (range === "year") {
    return chartMonthNames.map((label, month) => ({ label, month, year: now.getFullYear() }));
  }

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      label: chartMonthNames[date.getMonth()],
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  });
}

function buildFrequencyChart(members: any[], visitors: any[], range: ChartRange) {
  const buckets = getChartBuckets(range);
  const monthlyBreakdown = buckets.map<ChartPointBreakdown>(() => ({ members: 0, visitors: 0 }));

  const addRecord = (record: any, type: keyof ChartPointBreakdown) => {
    const timestamp = getRecordTimestamp(record);
    if (!timestamp) return;

    const date = new Date(timestamp);
    const bucketIndex = buckets.findIndex(
      (bucket) => bucket.month === date.getMonth() && bucket.year === date.getFullYear()
    );

    if (bucketIndex >= 0) {
      monthlyBreakdown[bucketIndex][type] += 1;
    }
  };

  members.forEach((member) => addRecord(member, "members"));
  visitors.forEach((visitor) => addRecord(visitor, "visitors"));

  const totals = monthlyBreakdown.reduce<number[]>((acc, value, index) => {
    acc[index] = value.members + value.visitors + (acc[index - 1] || 0);
    return acc;
  }, []);

  return {
    totals,
    breakdown: monthlyBreakdown,
  };
}
export default function Dashboard() {
  const navigate = useNavigate();
  const defaultPastorNames = new Set(["Pr. Anderson Silva", "Pr. Anderson Silva (Google)", "Anderson Silva"]);
  const defaultTasks = [
    { id: 1, text: "Preparar sermão de domingo sobre João 3:16", completed: false },
    { id: 2, text: "Ligar para novos visitantes do último culto", completed: true },
    { id: 3, text: "Reunião de líderes de célula - 19:30", completed: false },
    { id: 4, text: "Revisar relatório financeiro semanal", completed: false }
  ];

  const readPastorName = () => {
    const storedName = localStorage.getItem("settings_pastor_name");
    if (storedName && !defaultPastorNames.has(storedName)) {
      return storedName;
    }
    return "Pastor";
  };

  const getGreetingName = (name: string) => {
    const cleaned = name.trim().replace(/^(Pr\.|Dr\.|Pas\.|Pastor|Pastora)\s+/i, "");
    return cleaned.split(" ").filter(Boolean)[0] || name.trim() || "Pastor";
  };

  // Pastor name — reactive to Settings changes
  const [pastorName, setPastorName] = useState(readPastorName);
  useEffect(() => {
    const handleUpdate = () => setPastorName(readPastorName());
    window.addEventListener("crm-settings-updated", handleUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleUpdate);
  }, []);

  useEffect(() => {
    fetchServerSettings()
      .then((response) => {
        const serverPastorName = response?.settings?.pastorName;
        if (serverPastorName && !defaultPastorNames.has(serverPastorName)) {
          localStorage.setItem("settings_pastor_name", serverPastorName);
          setPastorName(serverPastorName);
        }
      })
      .catch((error) => {
        console.warn("Não foi possível carregar configurações do backend local:", error);
      });
  }, []);

  const [waAutoDispatch, setWaAutoDispatch] = useState(() => localStorage.getItem("settings_wa_auto") === "true");
  const [waApiUrl, setWaApiUrl] = useState(() => localStorage.getItem("settings_wa_api_url") || "");

  const [showMobileModal, setShowMobileModal] = useState(false);
  const [birthdayAlerts, setBirthdayAlerts] = useState<BirthdayAlert[]>([]);
  const tomorrowBirthdayLabel = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  }, []);
  const fallbackMobileLink = typeof window !== "undefined" ? `${window.location.origin}/mobile` : "/mobile";
  const [mobileLink, setMobileLink] = useState(fallbackMobileLink);
  const mobileQrSrc = useMemo(() => createQrCodeDataUrl(mobileLink), [mobileLink]);
  const [mobileCopyMsg, setMobileCopyMsg] = useState<string | null>(null);
  const [mobileQrError, setMobileQrError] = useState(false);

  useEffect(() => {
    const normalizeRecords = (items: any[], type: BirthdayAlert["type"]): BirthdayAlert[] =>
      items
        .map((item) => ({
          id: item.id || `${type}-${item.name}-${item.phone}`,
          name: String(item.name || "").trim(),
          phone: String(item.phone || "").trim(),
          type,
          birthDate: String(item.birthDate || "").trim(),
        }))
        .filter((item) => item.name && item.birthDate);

    const readCachedRecords = (key: string, type: BirthdayAlert["type"]) => {
      try {
        const cached = localStorage.getItem(key);
        return cached ? normalizeRecords(JSON.parse(cached), type) : [];
      } catch {
        return [];
      }
    };

    const getMonthDay = (value: string) => {
      if (!value) return "";
      const isoLike = value.includes("T") ? value : `${value}T00:00:00`;
      const date = new Date(isoLike);
      if (Number.isNaN(date.getTime())) return "";
      return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMonthDay = `${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const applyBirthdayFilter = (records: BirthdayAlert[]) =>
      records.filter((record) => getMonthDay(record.birthDate) === tomorrowMonthDay);

    const cachedRecords = [
      ...readCachedRecords("members_data", "Membro"),
      ...readCachedRecords("visitors_data", "Visitante"),
    ];
    setBirthdayAlerts(applyBirthdayFilter(cachedRecords));

    const loadServerBirthdays = async () => {
      try {
        const [membersResponse, visitorsResponse] = await Promise.all([
          fetchServerMembers(),
          fetchServerVisitors(),
        ]);
        const serverRecords = [
          ...normalizeRecords(membersResponse?.members || [], "Membro"),
          ...normalizeRecords(visitorsResponse?.visitors || [], "Visitante"),
        ];
        setBirthdayAlerts(applyBirthdayFilter(serverRecords));
      } catch (error) {
        console.warn("Não foi possível carregar aniversariantes do servidor:", error);
      }
    };

    loadServerBirthdays();
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE}/api/network-info`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.mobileUrl) {
          setMobileLink(data.mobileUrl);
        }
      })
      .catch((error) => {
        console.warn("Não foi possível carregar o link mobile da rede local:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const storedPastorName = localStorage.getItem("settings_pastor_name");
    if (!storedPastorName || defaultPastorNames.has(storedPastorName)) {
      return;
    }

    saveServerSettings({
      churchName: localStorage.getItem("settings_church_name") || "Bom Samaritano",
      pastorName,
      pastorPhoto: localStorage.getItem("settings_pastor_photo") || "",
      whatsappCode: localStorage.getItem("settings_whatsapp_code") || "55",
      birthdayNotifications: localStorage.getItem("settings_birthday_notif") !== "false",
      waAutoDispatch,
      waApiUrl,
    }).catch((error) => {
      console.warn("Não foi possível sincronizar configurações com o backend local:", error);
    });
  }, [pastorName, waAutoDispatch, waApiUrl]);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setWaAutoDispatch(localStorage.getItem("settings_wa_auto") === "true");
      setWaApiUrl(localStorage.getItem("settings_wa_api_url") || "");
    };

    window.addEventListener("crm-settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleSettingsUpdate);
  }, []);

  // Real-time Weather Geolocation & Fetch
  const [weatherData, setWeatherData] = useState<{
    cidade: string;
    temperatura: string;
    clima: string;
    chuva: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    async function fetchWeatherByCoords(lat: number, lon: number, cityName?: string) {
      try {
        let city = cityName;
        if (!city) {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
              "User-Agent": "CRM-Bom-Samaritano/1.0"
            }
          });
          const geoJson = await geoRes.json();
          const addr = geoJson.address || {};
          city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "Sua Localidade";
        }

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherJson = await weatherRes.json();
        const current = weatherJson.current_weather;

        const wmoCodes: Record<number, { text: string; icon: string; rain: string }> = {
          0: { text: "Céu Limpo", icon: "☀️", rain: "Não" },
          1: { text: "Principalmente Limpo", icon: "🌤️", rain: "Não" },
          2: { text: "Parcialmente Nublado", icon: "⛅", rain: "Não" },
          3: { text: "Nublado", icon: "☁️", rain: "Não" },
          45: { text: "Nevoeiro", icon: "🌫️", rain: "Não" },
          48: { text: "Nevoeiro", icon: "🌫️", rain: "Não" },
          51: { text: "Garoa Leve", icon: "🌧️", rain: "Sim" },
          53: { text: "Garoa", icon: "🌧️", rain: "Sim" },
          55: { text: "Garoa Densa", icon: "🌧️", rain: "Sim" },
          61: { text: "Chuva Fraca", icon: "🌧️", rain: "Sim" },
          63: { text: "Chuva Moderada", icon: "🌧️", rain: "Sim" },
          65: { text: "Chuva Forte", icon: "🌧️", rain: "Sim" },
          71: { text: "Neve", icon: "❄️", rain: "Não" },
          73: { text: "Neve", icon: "❄️", rain: "Não" },
          75: { text: "Neve Forte", icon: "❄️", rain: "Não" },
          80: { text: "Pancadas de Chuva", icon: "🌧️", rain: "Sim" },
          81: { text: "Pancadas de Chuva", icon: "🌧️", rain: "Sim" },
          82: { text: "Pancadas de Chuva", icon: "🌧️", rain: "Sim" },
          95: { text: "Tempestade", icon: "⛈️", rain: "Sim" },
          96: { text: "Tempestade", icon: "⛈️", rain: "Sim" },
          99: { text: "Tempestade Forte", icon: "⛈️", rain: "Sim" }
        };

        const code = current?.weathercode ?? 0;
        const condition = wmoCodes[code] || { text: "Céu Limpo", icon: "☀️", rain: "Não" };

        setWeatherData({
          cidade: city || "Barueri",
          temperatura: Math.round(current?.temperature ?? 22).toString(),
          clima: condition.text,
          chuva: condition.rain,
          icon: condition.icon
        });
      } catch (err) {
        console.error("Erro ao carregar clima por coordenadas:", err);
      }
    }

    async function fetchWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude);
          },
          async (error) => {
            console.warn("Geolocalização negada, usando fallback de IP:", error.message);
            try {
              const geoRes = await fetch("https://ipapi.co/json/");
              const geoData = await geoRes.json();
              const city = geoData.city || "São Paulo";
              const lat = geoData.latitude || -23.55;
              const lon = geoData.longitude || -46.63;
              await fetchWeatherByCoords(lat, lon, city);
            } catch (ipErr) {
              console.error("Erro no fallback de IP:", ipErr);
              await fetchWeatherByCoords(-23.50, -46.87, "Barueri");
            }
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        try {
          const geoRes = await fetch("https://ipapi.co/json/");
          const geoData = await geoRes.json();
          const city = geoData.city || "São Paulo";
          const lat = geoData.latitude || -23.55;
          const lon = geoData.longitude || -46.63;
          await fetchWeatherByCoords(lat, lon, city);
        } catch (ipErr) {
          console.error("Erro no fallback de IP:", ipErr);
          await fetchWeatherByCoords(-23.50, -46.87, "Barueri");
        }
      }
    }
    fetchWeather();
  }, []);

  // Local storage based tasks for interactivity
  const [tasks, setTasks] = useState<{ id: number; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem("dashboard_tasks");
    if (!saved) return defaultTasks;

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaultTasks;
    } catch {
      localStorage.removeItem("dashboard_tasks");
      return defaultTasks;
    }
  });

  const [newTaskText, setNewTaskText] = useState("");
  useEffect(() => {
    localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Generate today's month and day dynamically for continuous demonstration
  const today = new Date();
  const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Dynamic Recent Activities and Stats
  const [dynamicRecentActivities, setDynamicRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>(Array(12).fill(0));
  const [chartBreakdown, setChartBreakdown] = useState<ChartPointBreakdown[]>(Array(12).fill(null).map(() => ({ members: 0, visitors: 0 })));
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("year");
  const [dynamicStats, setDynamicStats] = useState({
    members: 0,
    visitors: 0,
    discipleship: 0,
    baptism2026: 0
  });

  useEffect(() => {
    // Calculate Stats from LocalStorage
    let membersCount = 0;
    let visitorsCount = 0;
    let baptism2026Count = 0;

    // 1. Members and Cells
    const membersRaw = localStorage.getItem("members_data");
    if (membersRaw) {
      try {
        const membersParsed = JSON.parse(membersRaw);
        const activeMembers = membersParsed.filter((m: any) => m.status === "Ativo");
        membersCount = activeMembers.length;
      } catch (e) {}
    }

    // 2. Visitors
    const visitorsRaw = localStorage.getItem("visitors_data");
    if (visitorsRaw) {
      try {
        const visitorsParsed = JSON.parse(visitorsRaw);
        visitorsCount = visitorsParsed.length;
      } catch (e) {}
    }

    // 3. Baptism candidates in 2026
    const baptismRaw = localStorage.getItem("baptism_candidates_data");
    if (baptismRaw) {
      try {
        const baptismParsed = JSON.parse(baptismRaw);
        baptism2026Count = Array.isArray(baptismParsed)
          ? baptismParsed.filter((candidate: any) => {
              const date = String(candidate.baptizedAt || candidate.plannedBaptismDate || candidate.createdAt || "");
              return date.startsWith("2026");
            }).length
          : 0;
      } catch (e) {}
    }

    // 4. Discipleship
    let discipleshipCount = 0;
    const discipleshipRaw = localStorage.getItem("discipleship_data");
    if (discipleshipRaw) {
      try {
        const discipleshipParsed = JSON.parse(discipleshipRaw);
        const activePairs = discipleshipParsed.filter((p: any) => p.status === "Em Progresso");
        discipleshipCount = activePairs.length;
      } catch (e) {}
    }

    setDynamicStats({
      members: membersCount,
      visitors: visitorsCount,
      discipleship: discipleshipCount,
      baptism2026: baptism2026Count
    });

    // 5. Recent Activities & Chart Data
    try {
      const allActivities: any[] = [];
      const safeParse = (key: string) => {
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          localStorage.removeItem(key);
          return [];
        }
      };

      const membersParsed = safeParse("members_data");
      const visitorsParsed = safeParse("visitors_data");
      const financeParsed = safeParse("financial_records_data");
      const pairsParsed = safeParse("discipleship_data");

      const monthlyGrowth = Array(12).fill(0);
      const currentYear = today.getFullYear();

      membersParsed.forEach((m: any) => {
        allActivities.push({
          id: m.id, timestamp: m.id, user: "Secretaria", type: "membro",
          desc: `Novo membro cadastrado: ${m.name}`, time: new Date(m.id).toLocaleString("pt-BR"),
          icon: Users, color: "text-purple-400 bg-purple-500/10"
        });
        const d = new Date(m.id);
        if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
          monthlyGrowth[d.getMonth()]++;
        }
      });

      visitorsParsed.forEach((v: any) => {
        allActivities.push({
          id: v.id, timestamp: v.id, user: "Recepção", type: "culto",
          desc: `Registrou novo visitante: ${v.name}`, time: new Date(v.id).toLocaleString("pt-BR"),
          icon: UserCheck, color: "text-blue-400 bg-blue-500/10"
        });
        const d = new Date(v.id);
        if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
          monthlyGrowth[d.getMonth()]++;
        }
      });

      // Accumulate growth (Crescimento de Culto)
      for (let i = 1; i < 12; i++) {
        monthlyGrowth[i] += monthlyGrowth[i - 1];
      }
      financeParsed.forEach((f: any) => {
        allActivities.push({
          id: f.id, timestamp: f.id, user: "Tesouraria", type: "financeiro",
          desc: `Lançamento de ${f.category} (${f.contributor})`, time: new Date(f.id).toLocaleString("pt-BR"),
          icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10"
        });
      });

      pairsParsed.forEach((p: any) => {
        allActivities.push({
          id: p.id, timestamp: p.id, user: "Discipulado", type: "discipulado",
          desc: `Dupla criada: ${p.mentor} & ${p.disciple}`, time: new Date(p.id).toLocaleString("pt-BR"),
          icon: Heart, color: "text-pink-400 bg-pink-500/10"
        });
      });

      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      if (allActivities.length > 0) {
        setDynamicRecentActivities(allActivities.slice(0, 5));
      } else {
        setDynamicRecentActivities([
          { id: 1, user: "Sistema", type: "info", desc: "Nenhuma atividade recente encontrada.", time: "Agora", icon: Sparkles, color: "text-zinc-400 bg-zinc-500/10" }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [todayMonthDay]);

  useEffect(() => {
    let isMounted = true;

    const applyDashboardRecords = (members: any[], visitors: any[]) => {
      if (!isMounted) return;

      setDynamicStats((current) => ({
        ...current,
        members: members.filter((member) => member.status === "Ativo").length,
        visitors: visitors.length,
      }));
      const chart = buildFrequencyChart(members, visitors, chartRange);
      setChartData(chart.totals);
      setChartBreakdown(chart.breakdown);
    };

    const loadCachedDashboardRecords = () => {
      applyDashboardRecords(readCachedArray("members_data"), readCachedArray("visitors_data"));
    };

    const loadServerDashboardRecords = async () => {
      try {
        const [membersResponse, visitorsResponse] = await Promise.all([
          fetchServerMembers(),
          fetchServerVisitors(),
        ]);
        const serverMembers = membersResponse?.members || [];
        const serverVisitors = visitorsResponse?.visitors || [];

        cacheRecordsWithoutEmbeddedPhotos("members_data", serverMembers);
        cacheRecordsWithoutEmbeddedPhotos("visitors_data", serverVisitors);
        applyDashboardRecords(serverMembers, serverVisitors);
      } catch (error) {
        console.warn("Não foi possível atualizar o grafico do dashboard:", error);
        loadCachedDashboardRecords();
      }
    };

    loadCachedDashboardRecords();
    loadServerDashboardRecords();

    const interval = window.setInterval(() => {
      loadCachedDashboardRecords();
      loadServerDashboardRecords();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [chartRange]);

  // Calculate SVG Chart Paths based on chartData
  const maxChartVal = Math.max(...chartData, 10);
  const chartLabels = getChartBuckets(chartRange).map((bucket) => bucket.label);
  const xCoords = chartData.map((_, i) => {
    const steps = Math.max(chartData.length - 1, 1);
    return 25 + (550 / steps) * i;
  });
  const yCoords = chartData.map(val => 180 - (val / maxChartVal) * 140);
  
  const linePath = xCoords.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${yCoords[i]}`).join(" ");
  const firstChartX = xCoords[0] || 25;
  const lastChartX = xCoords[xCoords.length - 1] || 575;
  const fillPath = `${linePath} L ${lastChartX} 200 L ${firstChartX} 200 Z`;
  const hoveredChartPoint =
    hoveredChartIndex === null
      ? null
      : {
          label: chartLabels[hoveredChartIndex],
          x: xCoords[hoveredChartIndex] || 0,
          y: yCoords[hoveredChartIndex] || 0,
          total: chartData[hoveredChartIndex] || 0,
          members: chartBreakdown[hoveredChartIndex]?.members || 0,
          visitors: chartBreakdown[hoveredChartIndex]?.visitors || 0,
        };

  // Dynamically populated stats
  const stats = [
    { label: "Membros Ativos", value: dynamicStats.members.toLocaleString("pt-BR"), change: "Dinâmico", isPositive: true, icon: Users, color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30" },
    { label: "Visitantes Registrados", value: dynamicStats.visitors.toString(), change: "Dinâmico", isPositive: true, icon: UserCheck, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
    { label: "Duplas Discipulado", value: dynamicStats.discipleship.toString(), change: "Dinâmico", isPositive: true, icon: Target, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
    {
      label: "Batizantes 2026",
      value: dynamicStats.baptism2026.toLocaleString("pt-BR"),
      change: "Dinâmico",
      isPositive: true,
      icon: Waves,
      color: "from-teal-500/20 to-cyan-500/20",
      border: "border-teal-500/30"
    }
  ];

  return (
    <>
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative glass-card p-8 overflow-hidden border border-purple-500/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-purple-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold tracking-wide text-sm uppercase">
              <Sparkles size={16} className="animate-pulse" />
              <span>Gestão Ministerial</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-300 bg-clip-text text-transparent">
              Graça e Paz, {getGreetingName(pastorName)}!
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              Aqui está o panorama completo da sua igreja para hoje. Acompanhe dízimos, visitantes, discipulados e agende suas atividades ministeriais com facilidade.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-500 active:scale-95"
            >
              <UserCheck size={16} />
              <span>QR Code Recepção</span>
            </button>
            {weatherData && (
              <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 text-purple-300 text-xs font-semibold">
                <span className="text-sm">{weatherData.icon}</span>
                <span>
                  {weatherData.cidade}: {weatherData.temperatura}°C • {weatherData.clima}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {localStorage.getItem("settings_birthday_notif") !== "false" && birthdayAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg shadow-amber-500/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-100">
                  Aniversario amanha ({tomorrowBirthdayLabel}): {birthdayAlerts.length} pessoa(s)
                </h3>
                <p className="mt-1 text-sm text-amber-100/80">
                  Programe a mensagem de aniversário para não deixar passar.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {birthdayAlerts.slice(0, 6).map((person) => (
                    <span
                      key={`${person.type}-${person.id}`}
                      className="rounded-full border border-amber-500/20 bg-zinc-950/40 px-3 py-1 text-xs font-semibold text-amber-100"
                    >
                      {person.name} ({person.type})
                    </span>
                  ))}
                  {birthdayAlerts.length > 6 && (
                    <span className="rounded-full border border-amber-500/20 bg-zinc-950/40 px-3 py-1 text-xs font-semibold text-amber-100">
                      +{birthdayAlerts.length - 6} outro(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app/messages")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 active:scale-95"
            >
              <Calendar size={16} />
              <span>Programar mensagem</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`glass-card p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between ${stat.border}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} border border-white/5`}>
                  <stat.icon size={22} className="text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs">
              <span className="text-zinc-500">Comparado a este mês</span>
              <span className={`font-semibold flex items-center gap-1 ${stat.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Graphics and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* visual SVG chart card */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between min-h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-400" />
                Frequência e Crescimento de Culto
              </h4>
              <p className="text-xs text-zinc-400">
                Dados consolidados por cadastro ({chartRange === "year" ? "Janeiro a Dezembro" : "últimos 6 meses"})
              </p>
            </div>
            <select
              value={chartRange}
              onChange={(event) => setChartRange(event.target.value as ChartRange)}
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="year">Ano Inteiro</option>
              <option value="last6">Últimos 6 meses</option>
            </select>
          </div>

          <div className="flex-1 flex items-end justify-between h-48 px-2 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-white/10 w-full h-0" />
              <div className="border-t border-white/10 w-full h-0" />
              <div className="border-t border-white/10 w-full h-0" />
              <div className="border-t border-white/10 w-full h-0" />
            </div>

            {/* Custom SVG line with glow */}
            <svg
              viewBox="0 0 600 200"
              className="absolute inset-0 w-full h-full p-2 overflow-visible"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredChartIndex(null)}
            >
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="50%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
              </defs>
              {/* Line Fill */}
              <path
                d={fillPath}
                fill="url(#chart-grad)"
                className="transition-all duration-500"
              />
              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#line-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
              {/* Dot Markers */}
              {xCoords.map((x, i) => (
                <g key={i} onMouseEnter={() => setHoveredChartIndex(i)} className="cursor-pointer">
                  <circle cx={x} cy={yCoords[i]} r="14" fill="transparent" />
                  <circle
                    cx={x}
                    cy={yCoords[i]}
                    r={hoveredChartIndex === i ? "6" : "4"}
                    fill={i < 4 ? "#818CF8" : i < 8 ? "#9333EA" : "#F472B6"}
                    className="transition-all duration-200"
                  />
                </g>
              ))}
            </svg>

            {hoveredChartPoint && (
              <div
                className="pointer-events-none absolute z-20 w-48 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl border border-white/10 bg-zinc-950/95 p-3 text-xs shadow-2xl shadow-black/30 backdrop-blur-xl"
                style={{
                  left: `${(hoveredChartPoint.x / 600) * 100}%`,
                  top: `${(hoveredChartPoint.y / 200) * 100}%`,
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{hoveredChartPoint.label}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                    Total {hoveredChartPoint.total}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Membros</span>
                    <strong className="text-purple-300">{hoveredChartPoint.members}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Visitantes</span>
                    <strong className="text-blue-300">{hoveredChartPoint.visitors}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Labels overlay */}
            <div className="absolute inset-x-0 bottom-[-24px] flex justify-between px-2 text-[10px] font-semibold text-zinc-500">
              {chartLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-yellow-400" />
              Ações Rápidas
            </h4>
            <p className="text-xs text-zinc-400 mb-6">Atalhos rápidos para lançar dados do sistema instantaneamente com abertura automática do formulário.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/app/members", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/30 hover:bg-purple-600/5 transition-all text-center group"
            >
              <Users className="text-purple-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Novo Membro</span>
            </button>
            <button
              onClick={() => navigate("/app/visitors", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-center group"
            >
              <UserCheck className="text-blue-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Novo Visitante</span>
            </button>
            <button
              onClick={() => navigate("/app/discipleship", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-pink-500/30 hover:bg-pink-600/5 transition-all text-center group"
            >
              <Heart className="text-pink-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Discipulado</span>
            </button>
            <button
              onClick={() => navigate("/app/financial", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-600/5 transition-all text-center group"
            >
              <DollarSign className="text-emerald-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Lançar Oferta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Manager & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Manager */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-purple-400" />
              Tarefas e Agenda Pastoral
            </h4>
            <p className="text-xs text-zinc-400">Organize seus compromissos e prioridades da semana</p>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Adicionar nova tarefa ministerial..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </form>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">Sem tarefas pendentes para hoje.</div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-zinc-900 focus:ring-2"
                    />
                    <span className={`text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              Atividades Recentes
            </h4>
            <p className="text-xs text-zinc-400">Atualizações de liderança e ações pastorais em tempo real</p>
          </div>

          <div className="space-y-4">
              {dynamicRecentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id || i} className="flex gap-4 relative group">
                    <div className={`p-2.5 rounded-xl ${activity.color} border border-white/5 mt-0.5`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-zinc-200 truncate">{activity.user}</p>
                        <span className="text-[10px] text-zinc-500 font-medium">{activity.time}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{activity.desc}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
    {showMobileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black/50">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">QR Code Recepcao</h3>
              <p className="mt-1 text-sm text-zinc-400">Escaneie no tablet ou celular da recepcao.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileModal(false)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar QR Code"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-72 w-72 items-center justify-center rounded-2xl border border-white/10 bg-white p-3">
              {mobileQrError ? (
                <div className="px-4 text-center text-sm font-semibold text-zinc-900">
                  Não foi possível carregar a imagem do QR. Use o link abaixo.
                </div>
              ) : (
                <img
                  src={mobileQrSrc}
                  alt="QR Code do cadastro mobile"
                  className="h-full w-full"
                  onError={() => setMobileQrError(true)}
                />
              )}
            </div>

            <div className="w-full break-words rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm text-zinc-200">
              {mobileLink}
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(mobileLink);
                    setMobileCopyMsg("Link copiado.");
                  } catch {
                    setMobileCopyMsg("Não foi possível copiar. Selecione o link acima.");
                  }
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                Copiar link
              </button>
              <a
                href={mobileLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-bold text-zinc-100 transition hover:bg-white/10"
              >
                Abrir
              </a>
            </div>

            {mobileCopyMsg ? <p className="text-xs text-zinc-400">{mobileCopyMsg}</p> : null}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
