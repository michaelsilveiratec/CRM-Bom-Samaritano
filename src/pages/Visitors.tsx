import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";
import {
  UserPlus,
  Search,
  Phone,
  Calendar,
  MessageSquare,
  Plus,
  X,
  CheckCircle,
  Clock,
  Heart,
  Filter,
  Trash2
} from "lucide-react";

interface Visitor {
  id: number;
  name: string;
  phone: string;
  visitDate: string;
  referredBy: string;
  status: "Pendente" | "Acompanhado" | "Decidido" | "Afastado";
  notes: string;
  photoUrl?: string;
}

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem("visitors_data");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Clarice Lima",
        phone: "(11) 98765-4321",
        visitDate: "2026-05-10",
        referredBy: "Obreira Sandra",
        status: "Pendente",
        notes: "Gostou muito do louvor, pediu oração pela família.",
      },
      {
        id: 2,
        name: "Rodrigo Alencar",
        phone: "(11) 97654-3210",
        visitDate: "2026-05-03",
        referredBy: "Membro Lucas",
        status: "Acompanhado",
        notes: "Já recebeu a primeira visita da equipe de discipulado.",
      },
      {
        id: 3,
        name: "Mariana Souza",
        phone: "(11) 96543-2109",
        visitDate: "2026-04-26",
        referredBy: "Espontâneo",
        status: "Decidido",
        notes: "Aceitou a Jesus no culto de domingo! Pronta para batismo.",
      },
      {
        id: 4,
        name: "Eduardo Santos",
        phone: "(11) 95432-1098",
        visitDate: "2026-04-12",
        referredBy: "Pastor Anderson",
        status: "Afastado",
        notes: "Mudou de bairro, tentando contato para transferir.",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("visitors_data", JSON.stringify(visitors));
  }, [visitors]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReferred, setNewReferred] = useState("");
  const [newStatus, setNewStatus] = useState<Visitor["status"]>("Pendente");
  const [newNotes, setNewNotes] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newVisitor: Visitor = {
      id: Date.now(),
      name: newName,
      phone: newPhone,
      visitDate: newDate || new Date().toISOString().split("T")[0],
      referredBy: newReferred || "Espontâneo",
      status: newStatus,
      notes: newNotes,
      photoUrl: newPhoto || undefined,
    };

    setVisitors([newVisitor, ...visitors]);
    setIsModalOpen(false);
    
    // Reset Form
    setNewName("");
    setNewPhone("");
    setNewDate("");
    setNewReferred("");
    setNewStatus("Pendente");
    setNewNotes("");
    setNewPhoto(null);
  };

  const handleVisitorPhotoChange = (id: number, base64: string | null) => {
    setVisitors(visitors.map(v =>
      v.id === id ? { ...v, photoUrl: base64 || undefined } : v
    ));
  };

  const handleDeleteVisitor = (id: number) => {
    if (window.confirm("Deseja realmente excluir este registro de visitante?")) {
      setVisitors(visitors.filter((v) => v.id !== id));
    }
  };

  const handleMakeContact = (name: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = `A paz do Senhor, ${name}! Aqui é o Pastor Anderson da Igreja Bom Samaritano. Gostamos muito da sua visita no nosso culto! Gostaríamos de saber como você está e se podemos orar por você. Que Deus te abençoe grandemente! 🙏✨`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const cycleStatus = (id: number) => {
    setVisitors(
      visitors.map((v) => {
        if (v.id === id) {
          const statuses: Visitor["status"][] = ["Pendente", "Acompanhado", "Decidido", "Afastado"];
          const nextIdx = (statuses.indexOf(v.status) + 1) % statuses.length;
          return { ...v, status: statuses[nextIdx] };
        }
        return v;
      })
    );
  };

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.phone.includes(search) || 
                          v.referredBy.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "All" || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Visitor["status"]) => {
    switch (status) {
      case "Pendente":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Acompanhado":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Decidido":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Afastado":
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Visitantes</h2>
          <p className="text-sm text-zinc-400 mt-1">Acompanhe e cuide das novas pessoas que visitam a igreja</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Cadastrar Visitante</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, indicador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none"
            >
              <option value="All" className="bg-zinc-900">Todos os Status</option>
              <option value="Pendente" className="bg-zinc-900">Pendente</option>
              <option value="Acompanhado" className="bg-zinc-900">Acompanhado</option>
              <option value="Decidido" className="bg-zinc-900">Decidido (Novo Convertido)</option>
              <option value="Afastado" className="bg-zinc-900">Afastado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVisitors.map((visitor) => (
          <div
            key={visitor.id}
            className="glass-card p-6 border border-white/5 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 relative group hover:border-purple-500/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-4">
                <PhotoUpload
                  photoUrl={visitor.photoUrl}
                  name={visitor.name}
                  size="md"
                  onPhotoChange={(base64) => handleVisitorPhotoChange(visitor.id, base64)}
                />
                <div>
                  <h3 className="text-base font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">
                    {visitor.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => cycleStatus(visitor.id)}
                      title="Clique para alternar o status"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase active:scale-95 transition-all ${getStatusBadge(visitor.status)}`}
                    >
                      {visitor.status}
                    </button>
                    <span className="text-xs text-zinc-500">Indicado por: {visitor.referredBy}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteVisitor(visitor.id)}
                title="Excluir Visitante"
                className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Phone size={14} className="text-purple-400" />
                <span>{visitor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 justify-end">
                <Calendar size={14} className="text-blue-400" />
                <span>Visita: {new Date(visitor.visitDate + "T00:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            {visitor.notes && (
              <p className="text-xs text-zinc-500 mt-4 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                {visitor.notes}
              </p>
            )}

            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => handleMakeContact(visitor.name, visitor.phone)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/20 text-purple-300 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare size={12} />
                <span>Fazer Contato</span>
              </button>
              <button
                onClick={() => cycleStatus(visitor.id)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle size={12} />
                <span>Acompanhar</span>
              </button>
            </div>
          </div>
        ))}

        {filteredVisitors.length === 0 && (
          <div className="col-span-full py-16 text-center glass-card border-dashed">
            <UserPlus size={48} className="mx-auto text-zinc-600 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-300">Nenhum visitante encontrado</h3>
            <p className="text-xs text-zinc-500 mt-1">Experimente alterar a busca ou filtro</p>
          </div>
        )}
      </div>

      {/* Cadastrar Visitante Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="text-purple-400" size={20} />
                <span>Cadastrar Novo Visitante</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVisitor} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 py-3">
                <PhotoUpload
                  photoUrl={newPhoto || undefined}
                  name={newName || "Novo Visitante"}
                  size="lg"
                  onPhotoChange={(base64) => setNewPhoto(base64)}
                />
                <p className="text-[10px] text-zinc-500">Clique para adicionar foto (opcional, máx. 3MB)</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Clarice de Lima"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data da Visita</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quem Indicou / Convidou</label>
                  <input
                    type="text"
                    value={newReferred}
                    onChange={(e) => setNewReferred(e.target.value)}
                    placeholder="Ex: Sandra (Célula)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Visitor["status"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Pendente" className="bg-zinc-900">Pendente</option>
                    <option value="Acompanhado" className="bg-zinc-900">Acompanhado</option>
                    <option value="Decidido" className="bg-zinc-900">Decidido</option>
                    <option value="Afastado" className="bg-zinc-900">Afastado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Observações / Pedido de Oração</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Detalhes adicionais importantes sobre o visitante..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
