import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardCheck,
  Download,
  History,
  Minus,
  PhoneCall,
  Plus,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { fetchServerMembers } from "../services/crm.service";
import { exportToCSV } from "../utils/exportData";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

type MemberStatus = "Ativo" | "Inativo" | "Licença";
type AttendanceStatus = "Presente" | "Ausente";

interface Member {
  id: number;
  name: string;
  role?: string;
  phone?: string;
  cellName?: string;
  status?: MemberStatus;
  photoUrl?: string;
}

interface AttendanceRecord {
  memberId: number;
  status: AttendanceStatus;
  note?: string;
}

interface AttendanceMeeting {
  id: number;
  title: string;
  date: string;
  records: AttendanceRecord[];
  createdAt: string;
}

interface PastoralAlert {
  member: Member;
  absences: number;
  lastAbsentDate: string;
}

const STORAGE_KEY = "attendance_records_data";

function createDefaultMeeting(title = "Culto de Domingo", date = getTodayInputValue()): AttendanceMeeting {
  return {
    id: Date.now(),
    title,
    date,
    records: [],
    createdAt: new Date().toISOString(),
  };
}

function normalizeMember(member: any): Member {
  return {
    id: Number(member.id ?? Date.now()),
    name: String(member.name || "Membro sem nome"),
    role: member.role || "Membro",
    phone: member.phone || "",
    cellName: member.cellName || "Não Associado",
    status: member.status || "Ativo",
    photoUrl: member.photoUrl || undefined,
  };
}

function readCachedMembers() {
  try {
    const cached = localStorage.getItem("members_data");
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeMember) : [];
  } catch {
    return [];
  }
}

function readMeetings(): AttendanceMeeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function formatDate(value: string) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Sem data" : date.toLocaleDateString("pt-BR");
}

function getTodayInputValue() {
  return new Date().toISOString().split("T")[0];
}

export default function Attendance() {
  const [members, setMembers] = useState<Member[]>(readCachedMembers);
  const [meetings, setMeetings] = useState<AttendanceMeeting[]>(() => {
    const storedMeetings = readMeetings();
    return storedMeetings.length > 0 ? storedMeetings : [createDefaultMeeting()];
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(() => {
    const storedMeetings = readMeetings();
    return storedMeetings[0]?.id ?? null;
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | AttendanceStatus>("Todos");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [newTitle, setNewTitle] = useState("Culto de Domingo");
  const [newDate, setNewDate] = useState(getTodayInputValue);
  const [feedback, setFeedback] = useState("Chamada pronta para registrar presença.");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetchServerMembers();
        const serverMembers = (response?.members || []).map(normalizeMember);
        setMembers(serverMembers);
        cacheRecordsWithoutEmbeddedPhotos("members_data", serverMembers);
      } catch (error) {
        console.warn("Não foi possível carregar membros do servidor:", error);
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  }, [meetings]);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status !== "Inativo"),
    [members]
  );

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) || meetings[0] || null,
    [meetings, selectedMeetingId]
  );

  useEffect(() => {
    if (!selectedMeetingId && meetings[0]) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  const roles = useMemo(
    () => ["Todos", ...Array.from(new Set(activeMembers.map((member) => member.role || "Membro")))],
    [activeMembers]
  );

  const recordsByMemberId = useMemo(() => {
    const map = new Map<number, AttendanceRecord>();
    selectedMeeting?.records.forEach((record) => map.set(record.memberId, record));
    return map;
  }, [selectedMeeting]);

  const attendanceStats = useMemo(() => {
    const present = selectedMeeting?.records.filter((record) => record.status === "Presente").length || 0;
    const total = activeMembers.length;
    const absent = Math.max(total - present, 0);
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
  }, [activeMembers.length, selectedMeeting]);

  const pastoralAlerts = useMemo<PastoralAlert[]>(() => {
    const countedMeetings = meetings.filter((meeting) => meeting.records.length > 0);

    return activeMembers
      .map((member) => {
        const absentMeetings = countedMeetings.filter((meeting) => {
          const record = meeting.records.find((item) => item.memberId === member.id);
          return record?.status !== "Presente";
        });

        return {
          member,
          absences: absentMeetings.length,
          lastAbsentDate: absentMeetings[0]?.date || "",
        };
      })
      .filter((alert) => alert.absences > 2)
      .sort((a, b) => b.absences - a.absences || a.member.name.localeCompare(b.member.name));
  }, [activeMembers, meetings]);

  const filteredMembers = activeMembers.filter((member) => {
    const record = recordsByMemberId.get(member.id);
    const attendanceStatus = record?.status || "Ausente";
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      (member.phone || "").includes(search) ||
      (member.cellName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || attendanceStatus === statusFilter;
    const matchesRole = roleFilter === "Todos" || member.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const recentMeetings = meetings.slice(0, 6).map((meeting) => {
    const present = meeting.records.filter((record) => record.status === "Presente").length;
    const percentage = activeMembers.length > 0 ? Math.round((present / activeMembers.length) * 100) : 0;
    return { ...meeting, present, percentage };
  });

  const createMeeting = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || !newDate) return;

    const meeting = createDefaultMeeting(title, newDate);

    setMeetings((current) => [meeting, ...current]);
    setSelectedMeetingId(meeting.id);
    setSearch("");
    setFeedback(`Chamada criada: ${title} em ${formatDate(newDate)}.`);
  };

  const updateRecord = (memberId: number, status: AttendanceStatus) => {
    if (!selectedMeeting) return;

    setMeetings((current) =>
      current.map((meeting) => {
        if (meeting.id !== selectedMeeting.id) return meeting;

        const existing = meeting.records.find((record) => record.memberId === memberId);
        const nextRecords =
          status === "Ausente"
            ? meeting.records.filter((record) => record.memberId !== memberId)
            : existing
            ? meeting.records.map((record) => (record.memberId === memberId ? { ...record, status } : record))
            : [...meeting.records, { memberId, status }];

        return { ...meeting, records: nextRecords };
      })
    );
    setFeedback(status === "Presente" ? "Presença marcada." : "Presença removida.");
  };

  const markAllPresent = () => {
    if (!selectedMeeting) {
      const meeting = createDefaultMeeting(newTitle, newDate);
      setMeetings((current) => [{ ...meeting, records: activeMembers.map((member) => ({ memberId: member.id, status: "Presente" as const })) }, ...current]);
      setSelectedMeetingId(meeting.id);
      setFeedback("Chamada criada e todos os membros ativos foram marcados como presentes.");
      return;
    }
    const records = activeMembers.map((member) => ({ memberId: member.id, status: "Presente" as const }));
    setMeetings((current) =>
      current.map((meeting) => (meeting.id === selectedMeeting.id ? { ...meeting, records } : meeting))
    );
    setFeedback("Todos os membros ativos foram marcados como presentes.");
  };

  const clearAttendance = () => {
    if (!selectedMeeting) return;
    setMeetings((current) =>
      current.map((meeting) => (meeting.id === selectedMeeting.id ? { ...meeting, records: [] } : meeting))
    );
    setFeedback("Chamada limpa.");
  };

  const exportMeeting = () => {
    if (!selectedMeeting) {
      setFeedback("Crie uma chamada antes de exportar.");
      return;
    }
    const rows = activeMembers.map((member) => {
      const status = recordsByMemberId.get(member.id)?.status || "Ausente";
      return {
        encontro: selectedMeeting.title,
        data: formatDate(selectedMeeting.date),
        nome: member.name,
        funcao: member.role || "",
        celula: member.cellName || "",
        telefone: member.phone || "",
        presenca: status,
      };
    });

    exportToCSV(
      rows,
      [
        { key: "encontro", label: "Encontro" },
        { key: "data", label: "Data" },
        { key: "nome", label: "Nome" },
        { key: "funcao", label: "Função" },
        { key: "celula", label: "Célula / Ministério" },
        { key: "telefone", label: "Telefone" },
        { key: "presenca", label: "Presença" },
      ],
      `presenca_${selectedMeeting.date}`
    );
    setFeedback("Arquivo CSV gerado.");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <ClipboardCheck size={14} />
            <span>Raio de presença</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Presença dos Membros</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Registre quem esteve no culto e acompanhe o pulso de participação da igreja.
          </p>
          <p className="mt-3 inline-flex rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
            {feedback}
          </p>
        </div>

        <form onSubmit={createMeeting} className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Encontro</label>
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Data</label>
            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-95"
          >
            <Plus size={16} />
            <span>Novo</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Presentes</p>
            <Check size={18} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{attendanceStats.present}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ausentes</p>
            <Minus size={18} className="text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{attendanceStats.absent}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Membros ativos</p>
            <Users size={18} className="text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{attendanceStats.total}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Frequência</p>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{attendanceStats.percentage}%</div>
        </div>
      </div>

      {pastoralAlerts.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg shadow-amber-500/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-100">
                  Alerta pastoral: {pastoralAlerts.length} membro(s) com mais de 2 faltas
                </h3>
                <p className="mt-1 text-sm text-amber-100/80">
                  Sinal de cuidado para contato, oração e acompanhamento antes que a pessoa se afaste.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("Ausente");
                setSearch("");
                setFeedback("Filtro aplicado para visualizar ausentes da chamada atual.");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 active:scale-95"
            >
              <AlertTriangle size={16} />
              <span>Ver ausentes</span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pastoralAlerts.slice(0, 6).map((alert) => (
              <div
                key={alert.member.id}
                className="rounded-xl border border-amber-500/20 bg-zinc-950/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-100">{alert.member.name}</h4>
                    <p className="mt-1 text-xs text-amber-100/70">
                      {alert.member.cellName || "Sem célula"} • {alert.member.role || "Membro"}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                    {alert.absences} faltas
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-amber-100/80">
                  <span>Última falta: {formatDate(alert.lastAbsentDate)}</span>
                  {alert.member.phone ? (
                    <a
                      href={`https://wa.me/${alert.member.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-bold text-amber-100 transition hover:bg-amber-500/20"
                    >
                      <PhoneCall size={12} />
                      <span>Contato</span>
                    </a>
                  ) : (
                    <span>Sem telefone</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <section className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <CalendarDays size={18} className="text-emerald-400" />
                  <span>{selectedMeeting?.title || "Nenhum encontro criado"}</span>
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedMeeting ? formatDate(selectedMeeting.date) : "Crie um encontro para começar a chamada."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  disabled={activeMembers.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>Todos presentes</span>
                </button>
                <button
                  type="button"
                  onClick={clearAttendance}
                  disabled={!selectedMeeting || attendanceStats.present === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={14} />
                  <span>Limpar</span>
                </button>
                <button
                  type="button"
                  onClick={exportMeeting}
                  disabled={!selectedMeeting || activeMembers.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome, telefone ou célula..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "Todos" | AttendanceStatus)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 outline-none transition focus:border-emerald-500"
              >
                <option value="Todos" className="bg-zinc-900">Todos</option>
                <option value="Presente" className="bg-zinc-900">Presentes</option>
                <option value="Ausente" className="bg-zinc-900">Ausentes</option>
              </select>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 outline-none transition focus:border-emerald-500"
              >
                {roles.map((role) => (
                  <option key={role} value={role} className="bg-zinc-900">
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-4">Membro</th>
                  <th className="px-5 py-4">Célula / Ministério</th>
                  <th className="px-5 py-4">Contato</th>
                  <th className="px-5 py-4 text-right">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => {
                  const isPresent = recordsByMemberId.get(member.id)?.status === "Presente";
                  const memberAlert = pastoralAlerts.find((alert) => alert.member.id === member.id);
                  return (
                    <tr key={member.id} className="transition hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-zinc-200">{member.name}</span>
                          {memberAlert && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                              <AlertTriangle size={10} />
                              <span>Cuidado</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">{member.role || "Membro"}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-300">{member.cellName || "Não Associado"}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400">{member.phone || "Não informado"}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => updateRecord(member.id, isPresent ? "Ausente" : "Presente")}
                            className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                              isPresent
                                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                            }`}
                          >
                            {isPresent ? <Check size={14} /> : <X size={14} />}
                            <span>{isPresent ? "Presente" : "Ausente"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-sm font-semibold text-zinc-500">
                      Nenhum membro encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="glass-card h-fit p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <History size={18} className="text-purple-400" />
            <span>Histórico</span>
          </h3>

          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                onClick={() => setSelectedMeetingId(meeting.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedMeeting?.id === meeting.id
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-zinc-200">{meeting.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">{formatDate(meeting.date)}</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-zinc-950/60 px-2 py-1 text-[10px] font-bold text-zinc-300">
                    {meeting.percentage}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${meeting.percentage}%` }} />
                </div>
                <div className="mt-2 text-xs text-zinc-500">{meeting.present} presença(s)</div>
              </button>
            ))}

            {recentMeetings.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
                Nenhum encontro registrado ainda.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
