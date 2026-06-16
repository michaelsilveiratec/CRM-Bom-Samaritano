import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Gift, Mail, Phone, Search, Users } from "lucide-react";
import { fetchServerMembers } from "../services/crm.service";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

interface Member {
  id?: number | string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  cellName?: string;
  birthDate?: string;
  status?: string;
  photoUrl?: string;
}

interface BirthdayMember extends Member {
  birthDay: number;
  birthMonth: number;
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function parseBirthDate(value?: string): { day: number; month: number } | null {
  if (!value) return null;

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return { month: Number(isoMatch[2]), day: Number(isoMatch[3]) };
  }

  const brMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return { day: Number(brMatch[1]), month: Number(brMatch[2]) };
  }

  const date = new Date(text.includes("T") ? text : `${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return { day: date.getDate(), month: date.getMonth() + 1 };
}

function formatBirthDate(member: BirthdayMember) {
  return `${String(member.birthDay).padStart(2, "0")}/${String(member.birthMonth).padStart(2, "0")}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AN";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export default function Birthdays() {
  const currentMonth = new Date().getMonth();
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const cached = localStorage.getItem("members_data");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetchServerMembers();
        const backendMembers = response?.members || [];
        setMembers(backendMembers);
        cacheRecordsWithoutEmbeddedPhotos("members_data", backendMembers);
      } catch (error) {
        console.warn("Não foi possível carregar aniversariantes do servidor:", error);
      }
    };

    loadMembers();
  }, []);

  const birthdayMembers = useMemo<BirthdayMember[]>(() => {
    return members
      .map((member) => {
        const parsed = parseBirthDate(member.birthDate);
        if (!parsed || !parsed.day || !parsed.month) return null;

        return {
          ...member,
          birthDay: parsed.day,
          birthMonth: parsed.month,
        };
      })
      .filter((member): member is BirthdayMember => Boolean(member))
      .sort((a, b) => a.birthMonth - b.birthMonth || a.birthDay - b.birthDay || a.name.localeCompare(b.name));
  }, [members]);

  const monthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0);
    birthdayMembers.forEach((member) => {
      if (member.birthMonth >= 1 && member.birthMonth <= 12) {
        counts[member.birthMonth - 1] += 1;
      }
    });
    return counts;
  }, [birthdayMembers]);

  const selectedBirthdays = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return birthdayMembers
      .filter((member) => member.birthMonth === selectedMonth + 1)
      .filter((member) => {
        if (!normalizedSearch) return true;

        return (
          member.name.toLowerCase().includes(normalizedSearch) ||
          (member.cellName || "").toLowerCase().includes(normalizedSearch) ||
          (member.phone || "").toLowerCase().includes(normalizedSearch) ||
          (member.role || "").toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => a.birthDay - b.birthDay || a.name.localeCompare(b.name));
  }, [birthdayMembers, search, selectedMonth]);

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayBirthdays = birthdayMembers.filter(
    (member) => member.birthDay === todayDay && member.birthMonth === todayMonth
  );

  const nextMonth = () => setSelectedMonth((month) => (month + 1) % 12);
  const previousMonth = () => setSelectedMonth((month) => (month + 11) % 12);

  return (
    <div className="birthdays-page space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-300 text-sm font-bold uppercase tracking-wider">
            <Gift size={16} />
            <span>Aniversariantes</span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Calendário de Aniversários</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Veja, mês a mês, quais membros fazem aniversário durante o ano.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cadastrados</span>
            <strong className="mt-1 block text-xl text-white">{birthdayMembers.length}</strong>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-300">Hoje</span>
            <strong className="mt-1 block text-xl text-rose-100">{todayBirthdays.length}</strong>
          </div>
          <div className="col-span-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 sm:col-span-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Em {months[selectedMonth]}
            </span>
            <strong className="mt-1 block text-xl text-emerald-100">{monthlyCounts[selectedMonth]}</strong>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-2 xl:w-[360px]">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mês selecionado</span>
              <strong className="text-lg text-white">{months[selectedMonth]}</strong>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, cargo, telefone ou célula..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              onClick={() => setSelectedMonth(index)}
              className={`rounded-xl border px-3 py-3 text-left transition-all active:scale-95 ${
                selectedMonth === index
                  ? "border-rose-500/40 bg-rose-500/20 text-rose-100 shadow-lg shadow-rose-500/10"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <span className="block text-xs font-bold">{shortMonths[index]}</span>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                <Users size={12} />
                {monthlyCounts[index]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {todayBirthdays.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-100">
                  Aniversariante de hoje: {todayBirthdays.length} pessoa(s)
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {todayBirthdays.map((member) => (
                    <span
                      key={`today-${member.id || member.name}`}
                      className="rounded-full border border-amber-500/20 bg-zinc-950/40 px-3 py-1 text-xs font-semibold text-amber-100"
                    >
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMonth(today.getMonth())}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 active:scale-95"
            >
              <Calendar size={16} />
              <span>Ver mês atual</span>
            </button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden border border-white/5 bg-zinc-950/60">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{months[selectedMonth]}</h3>
            <p className="text-xs text-zinc-400">
              {selectedBirthdays.length} aniversariante(s) encontrado(s) neste mês
            </p>
          </div>
        </div>

        {selectedBirthdays.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Gift size={36} className="mx-auto text-zinc-600" />
            <h4 className="mt-4 text-base font-bold text-zinc-300">Nenhum aniversariante neste mês</h4>
            <p className="mt-1 text-sm text-zinc-500">
              Quando houver membros com data de nascimento em {months[selectedMonth]}, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {selectedBirthdays.map((member) => {
              const isToday = member.birthDay === todayDay && member.birthMonth === todayMonth;

              return (
                <div
                  key={`${member.id || member.name}-${member.birthDate}`}
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-white/5 md:grid-cols-[88px_1fr_auto]"
                >
                  <div className="flex items-center gap-3 md:block">
                    <div
                      className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border ${
                        isToday
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-100"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">{shortMonths[selectedMonth]}</span>
                      <strong className="text-2xl leading-none">{String(member.birthDay).padStart(2, "0")}</strong>
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 md:hidden">{formatBirthDate(member)}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/30 to-purple-500/30 text-sm font-bold text-white">
                          {getInitials(member.name)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-zinc-100">{member.name}</h4>
                        {isToday && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-200">
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span>{member.role || "Membro"}</span>
                        <span>{member.cellName || "Sem célula"}</span>
                        <span>{member.status || "Status não informado"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-1 text-xs text-zinc-400 md:items-end">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-rose-300" />
                      {formatBirthDate(member)}
                    </span>
                    {member.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-300" />
                        {member.phone}
                      </span>
                    )}
                    {member.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-blue-300" />
                        {member.email}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
