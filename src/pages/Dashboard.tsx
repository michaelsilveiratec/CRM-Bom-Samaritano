import { useState, useEffect } from "react";
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
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  CalendarDays,
  Target,
  Gift,
  Send
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // Pastor name — reactive to Settings changes
  const [pastorName, setPastorName] = useState(() =>
    localStorage.getItem("settings_pastor_name") || "Pastor"
  );
  useEffect(() => {
    const handleUpdate = () =>
      setPastorName(localStorage.getItem("settings_pastor_name") || "Pastor");
    window.addEventListener("crm-settings-updated", handleUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleUpdate);
  }, []);

  // Local storage based tasks for interactivity
  const [tasks, setTasks] = useState<{ id: number; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem("dashboard_tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Preparar sermão de domingo sobre João 3:16", completed: false },
      { id: 2, text: "Ligar para novos visitantes do último culto", completed: true },
      { id: 3, text: "Reunião de líderes de célula - 19:30", completed: false },
      { id: 4, text: "Revisar relatório financeiro semanal", completed: false }
    ];
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

  // Dynamic Birthday Members and Stats
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);
  const [dynamicStats, setDynamicStats] = useState({
    members: 1248,
    visitors: 86,
    cells: 104,
    finance: 145250
  });

  useEffect(() => {
    // Calculate Stats from LocalStorage
    let membersCount = 1248;
    let cellsCount = 104;
    let visitorsCount = 86;
    let totalFinance = 145250;

    // 1. Members and Cells
    const membersRaw = localStorage.getItem("members_data");
    if (membersRaw) {
      try {
        const membersParsed = JSON.parse(membersRaw);
        const activeMembers = membersParsed.filter((m: any) => m.status === "Ativo");
        if (membersParsed.length > 0) membersCount = activeMembers.length;
        
        const uniqueCells = new Set();
        membersParsed.forEach((m: any) => {
          if (m.cellName && m.cellName.trim() !== "" && m.cellName !== "Nenhuma") {
            uniqueCells.add(m.cellName.trim());
          }
        });
        if (uniqueCells.size > 0) cellsCount = uniqueCells.size;

        // Calculate birthdays
        const bdays = membersParsed.filter((m: any) => {
          if (!m.birthDate) return false;
          const parts = m.birthDate.split("-");
          if (parts.length === 3) {
            const mmdd = `${parts[1]}-${parts[2]}`;
            return mmdd === todayMonthDay;
          }
          return false;
        });
        setBirthdayMembers(bdays);
      } catch (e) {}
    } else {
      // Fallback if no members data yet
      setBirthdayMembers([
        { id: 1, name: "Sandra Regina", role: "Obreira", phone: "(11) 98888-7777" }
      ]);
    }

    // 2. Visitors
    const visitorsRaw = localStorage.getItem("visitors_data");
    if (visitorsRaw) {
      try {
        const visitorsParsed = JSON.parse(visitorsRaw);
        if (visitorsParsed.length > 0) visitorsCount = visitorsParsed.length;
      } catch (e) {}
    }

    // 3. Finance
    const financeRaw = localStorage.getItem("financial_records_data");
    if (financeRaw) {
      try {
        const financeParsed = JSON.parse(financeRaw);
        if (financeParsed.length > 0) {
          totalFinance = financeParsed.reduce((acc: number, record: any) => acc + (Number(record.value) || 0), 0);
        }
      } catch (e) {}
    }

    setDynamicStats({
      members: membersCount,
      visitors: visitorsCount,
      cells: cellsCount,
      finance: totalFinance
    });
  }, [todayMonthDay]);

  const [sendingStates, setSendingStates] = useState<{ [key: number]: "idle" | "loading" | "sent" }>({});

  const handleFastWhatsAppSend = async (member: any) => {
    // Set to loading
    setSendingStates(prev => ({ ...prev, [member.id]: "loading" }));
    
    try {
      // Disparo real usando a API do backend
      await fetch("http://localhost:3001/api/messages/birthday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: member.phone,
          memberName: member.name,
          pastorName: pastorName
        }),
      });

      setSendingStates(prev => ({ ...prev, [member.id]: "sent" }));
      setTimeout(() => {
        setSendingStates(prev => ({ ...prev, [member.id]: "idle" }));
      }, 3000);
    } catch (err) {
      console.error(err);
      setSendingStates(prev => ({ ...prev, [member.id]: "idle" }));
    }
  };

  const getWhatsAppLink = (name: string, phone: string) => {
    if (!phone) return "#";
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = `Graça e Paz, querida ${name}! Nós da Igreja Bom Samaritano te desejamos um feliz aniversário! 🎉 Que o Senhor te abençoe rica e abundantemente neste dia tão especial. Um forte abraço do seu ${pastorName}! 🙏✨`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // Dynamically populated stats
  const stats = [
    { label: "Membros Ativos", value: dynamicStats.members.toLocaleString("pt-BR"), change: "+4.2%", isPositive: true, icon: Users, color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30" },
    { label: "Visitantes Registrados", value: dynamicStats.visitors.toString(), change: "+12.8%", isPositive: true, icon: UserCheck, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
    { label: "Células Ativas", value: dynamicStats.cells.toString(), change: "+2 novas", isPositive: true, icon: Target, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
    { label: "Entradas Financeiras", value: formatCurrency(dynamicStats.finance), change: "Atualizado", isPositive: true, icon: DollarSign, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" }
  ];

  const recentActivities = [
    { id: 1, user: "Pr. Anderson", type: "culto", desc: "Registrou novo visitante: Isabela Costa", time: "Hoje, 14:30", icon: UserCheck, color: "text-blue-400 bg-blue-500/10" },
    { id: 2, user: "Líder Carlos", type: "discipulado", desc: "Dupla de discipulado concluída (Lição 4)", time: "Hoje, 10:15", icon: Heart, color: "text-pink-400 bg-pink-500/10" },
    { id: 3, user: "Tesouraria", type: "financeiro", desc: "Lançamento de dízimo mensal realizado", time: "Ontem, 18:45", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10" },
    { id: 4, user: "Secretaria", type: "membro", desc: "Novo membro cadastrado: Rodrigo Souza", time: "Ontem, 11:20", icon: Users, color: "text-purple-400 bg-purple-500/10" }
  ];

  return (
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
              Graça e Paz, {pastorName.replace(/^(Pr\.|Dr\.|Pas\.?)\s*/i, "").split(" ")[0] || "Pastor"}!
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              Aqui está o panorama completo da sua igreja para hoje. Acompanhe dízimos, visitantes, discipulados e agende suas atividades ministeriais com facilidade.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 text-purple-300 text-xs font-semibold">
              <CalendarDays size={16} />
              <span>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Birthday Alerts Panel */}
      {birthdayMembers.length > 0 && (
        <div className="relative glass-card p-6 border border-emerald-500/30 bg-gradient-to-r from-zinc-950 to-emerald-950/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 mt-1">
                <Gift size={26} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  🎉 Aniversariantes de Hoje!
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl">
                  Hoje {birthdayMembers.length === 1 ? "temos 1 membro completando" : `temos ${birthdayMembers.length} membros completando`} ano de vida! Demonstre carinho pastoral enviando uma benção especial diretamente no WhatsApp dele(a).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {birthdayMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 bg-white/5 border border-white/5 p-3 rounded-xl min-w-[260px] hover:border-emerald-500/20 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{member.name}</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold">{member.role}</span>
                  </div>
                  <button
                    onClick={() => handleFastWhatsAppSend(member)}
                    disabled={sendingStates[member.id] === "loading" || sendingStates[member.id] === "sent"}
                    className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                      sendingStates[member.id] === "sent"
                        ? "bg-purple-600 text-white shadow-purple-600/10 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 cursor-pointer"
                    }`}
                  >
                    {sendingStates[member.id] === "loading" ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : sendingStates[member.id] === "sent" ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Enviado!</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>WhatsApp (1-Click)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
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
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-zinc-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} border border-white/5`}>
                <stat.icon size={22} className="text-white" />
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
              <p className="text-xs text-zinc-400">Dados consolidados de frequência (Janeiro a Dezembro)</p>
            </div>
            <select className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500">
              <option>Ano Inteiro</option>
              <option>Últimos 6 meses</option>
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
            <svg viewBox="0 0 600 200" className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none">
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
                d="M 25 180 L 75 170 L 125 160 L 175 140 L 225 150 L 275 145 L 325 130 L 375 120 L 425 110 L 475 90 L 525 70 L 575 40 L 575 200 L 25 200 Z"
                fill="url(#chart-grad)"
                className="transition-all duration-500"
              />
              {/* Glowing Line */}
              <path
                d="M 25 180 L 75 170 L 125 160 L 175 140 L 225 150 L 275 145 L 325 130 L 375 120 L 425 110 L 475 90 L 525 70 L 575 40"
                fill="none"
                stroke="url(#line-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dot Markers */}
              <circle cx="25" cy="180" r="4" fill="#818CF8" />
              <circle cx="75" cy="170" r="4" fill="#818CF8" />
              <circle cx="125" cy="160" r="4" fill="#818CF8" />
              <circle cx="175" cy="140" r="4" fill="#9333EA" />
              <circle cx="225" cy="150" r="4" fill="#9333EA" />
              <circle cx="275" cy="145" r="4" fill="#9333EA" />
              <circle cx="325" cy="130" r="4" fill="#C084FC" />
              <circle cx="375" cy="120" r="4" fill="#C084FC" />
              <circle cx="425" cy="110" r="4" fill="#C084FC" />
              <circle cx="475" cy="90" r="4" fill="#F472B6" />
              <circle cx="525" cy="70" r="4" fill="#F472B6" />
              <circle cx="575" cy="40" r="4" fill="#F472B6" />
            </svg>

            {/* Labels overlay */}
            <div className="absolute inset-x-0 bottom-[-24px] flex justify-between px-2 text-[10px] font-semibold text-zinc-500">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
              <span>Set</span>
              <span>Out</span>
              <span>Nov</span>
              <span>Dez</span>
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
              onClick={() => navigate("/members", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/30 hover:bg-purple-600/5 transition-all text-center group"
            >
              <Users className="text-purple-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Novo Membro</span>
            </button>
            <button
              onClick={() => navigate("/visitors", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-center group"
            >
              <UserCheck className="text-blue-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Novo Visitante</span>
            </button>
            <button
              onClick={() => navigate("/discipleship", { state: { openModal: true } })}
              className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-pink-500/30 hover:bg-pink-600/5 transition-all text-center group"
            >
              <Heart className="text-pink-400 group-hover:scale-110 transition-transform mb-2" size={24} />
              <span className="text-xs font-semibold text-zinc-200">Discipulado</span>
            </button>
            <button
              onClick={() => navigate("/financial", { state: { openModal: true } })}
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
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start">
                <div className={`p-2.5 rounded-xl ${act.color} border border-white/5 mt-0.5`}>
                  <act.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{act.user}</p>
                    <span className="text-[10px] text-zinc-500 font-medium">{act.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}