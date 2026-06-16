import { Bell, Search, Calendar, Plus, Users, UserPlus, Heart, Wallet, X, Lock, Sparkles, Moon, Sun } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchServerMembers, fetchServerVisitors } from "../services/crm.service";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

type NotificationType = "member" | "visitor";

interface RegistrationRecord {
  id?: number | string;
  name?: string;
  source?: string;
  createdByMobile?: boolean;
  createdAt?: string;
  registrationDate?: string;
  visitDate?: string;
}

interface HeaderNotification {
  id: string;
  text: string;
  sub: string;
  type: NotificationType;
  link: string;
  createdAtMs: number;
}

const READ_NOTIFICATIONS_KEY = "crm_read_registration_notifications";

function safeParseRecords(key: string): RegistrationRecord[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRecordTime(record: RegistrationRecord) {
  const rawDate = record.createdAt || record.registrationDate || record.visitDate || "";
  const parsedDate = rawDate ? new Date(rawDate.includes("T") ? rawDate : `${rawDate}T00:00:00`).getTime() : 0;
  const idTime = typeof record.id === "number" ? record.id : Number(record.id || 0);

  return Number.isFinite(parsedDate) && parsedDate > 0 ? parsedDate : Number.isFinite(idTime) ? idTime : 0;
}

function getSourceLabel(record: RegistrationRecord) {
  return record.createdByMobile || record.source === "mobile" ? "enviado pelo cadastro mobile" : "registrado no sistema";
}

function formatNotificationDate(timestamp: number) {
  if (!timestamp) return "Data não informada";

  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readStoredNotificationIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]");
    return new Set<string>(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

function buildRegistrationNotifications(members: RegistrationRecord[], visitors: RegistrationRecord[]) {
  const memberNotifications = members
    .filter((member) => String(member.name || "").trim())
    .map((member): HeaderNotification => {
      const createdAtMs = getRecordTime(member);

      return {
        id: `member-${member.id || member.name}-${createdAtMs}`,
        text: `Novo membro: ${String(member.name || "").trim()}`,
        sub: `${getSourceLabel(member)} em ${formatNotificationDate(createdAtMs)}`,
        type: "member",
        link: "/app/members",
        createdAtMs,
      };
    });

  const visitorNotifications = visitors
    .filter((visitor) => String(visitor.name || "").trim())
    .map((visitor): HeaderNotification => {
      const createdAtMs = getRecordTime(visitor);

      return {
        id: `visitor-${visitor.id || visitor.name}-${createdAtMs}`,
        text: `Novo visitante: ${String(visitor.name || "").trim()}`,
        sub: `${getSourceLabel(visitor)} em ${formatNotificationDate(createdAtMs)}`,
        type: "visitor",
        link: "/app/visitors",
        createdAtMs,
      };
    });

  return [...memberNotifications, ...visitorNotifications]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 12);
}

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => readStoredNotificationIds());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [theme, setTheme] = useState<"dark" | "professional">(() => {
    return localStorage.getItem("crm_theme") === "professional" ? "professional" : "dark";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadCachedNotifications = () => {
      const cachedMembers = safeParseRecords("members_data");
      const cachedVisitors = safeParseRecords("visitors_data");
      setNotifications(buildRegistrationNotifications(cachedMembers, cachedVisitors));
    };

    const loadServerNotifications = async () => {
      try {
        const [membersResponse, visitorsResponse] = await Promise.all([
          fetchServerMembers(),
          fetchServerVisitors(),
        ]);
        const serverMembers = membersResponse?.members || [];
        const serverVisitors = visitorsResponse?.visitors || [];

        cacheRecordsWithoutEmbeddedPhotos("members_data", serverMembers);
        cacheRecordsWithoutEmbeddedPhotos("visitors_data", serverVisitors);
        setNotifications(buildRegistrationNotifications(serverMembers, serverVisitors));
      } catch (error) {
        console.warn("Não foi possível carregar alertas de cadastro do servidor:", error);
        loadCachedNotifications();
      }
    };

    loadCachedNotifications();
    loadServerNotifications();

    const interval = window.setInterval(() => {
      loadCachedNotifications();
      loadServerNotifications();
    }, 15000);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "members_data" || event.key === "visitors_data") {
        loadCachedNotifications();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("crm_theme", theme);
  }, [theme]);

  const timeLeft = { hours: 0, minutes: 0, seconds: 0, expired: false };
  const setShowUpgradeModal = (_value: boolean) => {};

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleNavigate = (path: string) => {
    setShowDropdown(false);
    navigate(path, { state: { openModal: true } });
  };

  const unreadNotifications = notifications.filter((notif) => !readNotificationIds.has(notif.id));
  const unreadCount = unreadNotifications.length;

  const markNotificationsAsRead = (items = notifications) => {
    if (items.length === 0) return;

    setReadNotificationIds((current) => {
      const next = new Set(current);
      items.forEach((item) => next.add(item.id));
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // Quick search results based on static data
  const quickSearchData = [
    { label: "Anderson Silva", type: "Membro", link: "/app/members" },
    { label: "Sandra Regina", type: "Membro - Aniversariante Hoje 🎂", link: "/app/members" },
    { label: "Lucas Rocha", type: "Líder de Célula", link: "/app/members" },
    { label: "Clarice Lima", type: "Visitante", link: "/app/visitors" },
    { label: "Rodrigo Alencar", type: "Visitante - Acompanhado", link: "/app/visitors" },
    { label: "Dashboard", type: "Página", link: "/app/dashboard" },
    { label: "Financeiro", type: "Página", link: "/app/financial" },
    { label: "Discipulado", type: "Página", link: "/app/discipleship" },
    { label: "Mensagens", type: "Página", link: "/app/messages" },
    { label: "Configurações", type: "Página", link: "/app/settings" },
  ];

  const filteredSearch = searchQuery.length >= 2
    ? quickSearchData.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-zinc-950/40 backdrop-blur-md sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80" ref={searchRef}>
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar membros, relatórios ou tarefas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length >= 2);
            }}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          )}

          {/* Search results dropdown */}
          {showSearchResults && filteredSearch.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl">
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Resultados ({filteredSearch.length})
              </div>
              {filteredSearch.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(result.link);
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-all text-left"
                >
                  <span className="text-zinc-200 font-semibold">{result.label}</span>
                  <span className="text-zinc-500 text-[10px] shrink-0">{result.type}</span>
                </button>
              ))}
            </div>
          )}
          {showSearchResults && filteredSearch.length === 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-zinc-950 border border-white/10 p-4 shadow-2xl z-50 text-center text-xs text-zinc-500">
              Nenhum resultado para "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">


        <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        <button
          type="button"
          onClick={() => setTheme((current) => current === "dark" ? "professional" : "dark")}
          title={theme === "dark" ? "Ativar tema profissional" : "Ativar tema dark"}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-300 transition-all hover:border-purple-500/30 hover:bg-white/10 hover:text-white active:scale-95"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden xl:inline">{theme === "dark" ? "Profissional" : "Dark"}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
            }}
            className={`relative p-2 rounded-xl transition-all border ${
              unreadCount > 0
                ? "text-purple-200 bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10 animate-pulse"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-transparent hover:border-white/10"
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-black text-white ring-2 ring-zinc-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                <span>Alertas de cadastro ({unreadCount})</span>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-600 hover:text-zinc-400">
                  <X size={14} />
                </button>
              </div>
              {unreadNotifications.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <Bell className="mx-auto mb-2 text-zinc-600" size={24} />
                  <p className="text-xs font-semibold text-zinc-400">Nenhum alerta pendente.</p>
                  <p className="mt-1 text-[10px] text-zinc-600">Quando chegar um novo cadastro, ele aparecerá aqui.</p>
                </div>
              )}
              {unreadNotifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => {
                    markNotificationsAsRead([notif]);
                    navigate(notif.link);
                    setShowNotifications(false);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-all border border-transparent"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      notif.type === "member"
                        ? "border-purple-500/20 bg-purple-500/10 text-purple-300"
                        : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    {notif.type === "member" ? <Users size={15} /> : <UserPlus size={15} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-200">{notif.text}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{notif.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Novo Registro Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl animate-scale-up">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Registrar Novo(a)
              </div>
              <button
                onClick={() => handleNavigate("/app/members")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent transition-all text-left"
              >
                <Users size={16} className="text-purple-400" />
                <span>Membro</span>
              </button>
              <button
                onClick={() => handleNavigate("/app/visitors")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent transition-all text-left"
              >
                <UserPlus size={16} className="text-blue-400" />
                <span>Visitante</span>
              </button>
              <button
                onClick={() => handleNavigate("/app/discipleship")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-rose-600/20 hover:border-rose-500/30 border border-transparent transition-all text-left"
              >
                <Heart size={16} className="text-rose-400" />
                <span>Dupla de Discipulado</span>
              </button>
              <button
                onClick={() => handleNavigate("/app/financial")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-emerald-600/20 hover:border-emerald-500/30 border border-transparent transition-all text-left"
              >
                <Wallet size={16} className="text-emerald-400" />
                <span>Lançamento Financeiro</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== UPGRADE / TRIAL EXPIRED MODAL ========== */}
      {/* Modal disabled - all users now have permanent plans */}
      {false && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-purple-500/30 rounded-3xl max-w-2xl w-full p-8 md:p-12 shadow-[0_0_100px_rgba(147,51,234,0.3)] text-center relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-600/20 rounded-full blur-[80px]" />

            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30 animate-bounce">
                {timeLeft.expired ? <Lock size={32} className="text-white" /> : <Sparkles size={32} className="text-white" />}
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  {timeLeft.expired ? "Acesso Expirado" : "Teste Premium em Andamento"}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white">
                  {timeLeft.expired ? "O seu teste de 24 horas chegou ao fim." : "Adquira o Acesso Definitivo"}
                </h3>
                <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                  {timeLeft.expired
                    ? "Para continuar utilizando o Eclesia CRM com todos os cadastros, relatórios e WhatsApp ilimitado, adquira uma licença definitiva para sua Igreja."
                    : "Você está aproveitando o período de teste. Garanta o acesso vitalício à ferramenta antes que seu tempo expire!"}
                </p>
              </div>

              {/* Pacotes / Preços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-left">
                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Plano Anual</div>
                  <div className="text-2xl font-black text-white">R$ 49,90<span className="text-xs font-normal text-zinc-400">/mês</span></div>
                  <p className="text-xs text-zinc-400">Até 5.000 membros, suporte prioritário e relatórios ilimitados.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/40 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xl shadow-purple-500/10">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-[9px] font-bold text-white px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Recomendado
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400">Licença Vitalícia</div>
                  <div className="text-2xl font-black text-white">R$ 497<span className="text-xs font-normal text-purple-300">/único</span></div>
                  <p className="text-xs text-zinc-300">Membros ilimitados, WhatsApp sem taxas, atualizações para sempre.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <a
                  href="https://api.whatsapp.com/send/?phone=5511993470407&text=Olá! Gostaria de adquirir o pacote premium do Eclesia CRM."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 rounded-2xl font-bold text-white shadow-2xl shadow-purple-500/30 transition-all text-base hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles size={20} className="text-yellow-300" />
                  <span>Liberar Acesso Definitivo (Falar com Consultor)</span>
                </a>

                {!timeLeft.expired && (
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-semibold"
                  >
                    Continuar testando (Restam {timeLeft.hours}h {timeLeft.minutes}m)
                  </button>
                )}

                {timeLeft.expired && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("crm_user");
                      navigate("/");
                    }}
                    className="text-xs text-rose-500 hover:text-rose-400 transition-colors font-semibold"
                  >
                    Sair do sistema
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
