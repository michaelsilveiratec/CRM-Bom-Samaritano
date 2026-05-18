import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Plus,
  X,
  Heart,
  Shield,
  Gift,
  Send,
  Trash2
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  role: "Pastor" | "Diácono" | "Obreiro" | "Líder de Célula" | "Membro";
  phone: string;
  email: string;
  cellName: string;
  baptismDate: string;
  birthDate: string;
  status: "Ativo" | "Inativo" | "Licença";
  photoUrl?: string;
}

export default function Members() {
  // Generate today's dates for dynamic anniversary demonstration
  const todayObj = new Date();
  const currentYear = todayObj.getFullYear();
  const currentMonthDay = `${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem("members_data");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Anderson Silva",
        role: "Pastor",
        phone: "(11) 99999-8888",
        email: "pr.anderson@bomsamaritano.org",
        cellName: "Ministério Pastoral",
        baptismDate: "2015-08-15",
        birthDate: "1985-06-15",
        status: "Ativo",
      },
      {
        id: 2,
        name: "Sandra Regina",
        role: "Obreiro",
        phone: "(11) 98888-7777",
        email: "sandra.regina@gmail.com",
        cellName: "Célula Bom Samaritano",
        baptismDate: "2018-04-12",
        birthDate: `${currentYear - 32}-${currentMonthDay}`, // ALWAYS CELEBRATES TODAY!
        status: "Ativo",
      },
      {
        id: 3,
        name: "Lucas Rocha",
        role: "Líder de Célula",
        phone: "(11) 97777-6666",
        email: "lucas.rocha@outlook.com",
        cellName: "Célula Resgatar",
        baptismDate: "2019-11-22",
        birthDate: `${currentYear - 28}-${currentMonthDay}`, // ALWAYS CELEBRATES TODAY!
        status: "Ativo",
      },
      {
        id: 4,
        name: "Renata Fagundes",
        role: "Membro",
        phone: "(11) 96666-5555",
        email: "renata.fagundes@gmail.com",
        cellName: "Célula Videira",
        baptismDate: "2021-06-30",
        birthDate: "2000-02-14",
        status: "Ativo",
      },
      {
        id: 5,
        name: "Carlos Eduardo",
        role: "Diácono",
        phone: "(11) 95555-4444",
        email: "carlos.diacono@hotmail.com",
        cellName: "Célula Graça",
        baptismDate: "2017-02-18",
        birthDate: "1988-11-05",
        status: "Ativo",
      },
      {
        id: 6,
        name: "Beatriz Oliveira",
        role: "Membro",
        phone: "(11) 94444-3333",
        email: "beatriz.oliveira@gmail.com",
        cellName: "Célula Videira",
        baptismDate: "2023-12-10",
        birthDate: "1997-05-01",
        status: "Inativo",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("members_data", JSON.stringify(members));
  }, [members]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
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
  const [newRole, setNewRole] = useState<Member["role"]>("Membro");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCellName, setNewCellName] = useState("");
  const [newBaptism, setNewBaptism] = useState("");
  const [newBirth, setNewBirth] = useState("");
  const [newStatus, setNewStatus] = useState<Member["status"]>("Ativo");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newMember: Member = {
      id: Date.now(),
      name: newName,
      role: newRole,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      cellName: newCellName || "Não Associado",
      baptismDate: newBaptism || new Date().toISOString().split("T")[0],
      birthDate: newBirth || "2000-01-01",
      status: newStatus,
      photoUrl: newPhoto || undefined,
    };

    setMembers([newMember, ...members]);
    setIsModalOpen(false);

    // Reset Form
    setNewName("");
    setNewRole("Membro");
    setNewPhone("");
    setNewEmail("");
    setNewCellName("");
    setNewBaptism("");
    setNewBirth("");
    setNewStatus("Ativo");
    setNewPhoto(null);
  };

  const handleMemberPhotoChange = (id: number, base64: string | null) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, photoUrl: base64 || undefined } : m
    ));
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm("Deseja realmente excluir este membro do sistema?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const cycleStatus = (id: number) => {
    setMembers(
      members.map((m) => {
        if (m.id === id) {
          const statuses: Member["status"][] = ["Ativo", "Inativo", "Licença"];
          const nextIdx = (statuses.indexOf(m.status) + 1) % statuses.length;
          return { ...m, status: statuses[nextIdx] };
        }
        return m;
      })
    );
  };

  const isBirthdayToday = (birthStr: string) => {
    if (!birthStr) return false;
    const parts = birthStr.split("-");
    if (parts.length < 3) return false;
    const m = parts[1];
    const d = parts[2];
    return `${m}-${d}` === currentMonthDay;
  };

  const getWhatsAppLink = (name: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = `Graça e Paz, querida ${name}! Nós da Igreja Bom Samaritano te desejamos um feliz aniversário! 🎉 Que o Senhor te abençoe rica e abundantemente neste dia tão especial. 'O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz.' (Números 6:24-26). Um forte abraço do seu Pastor Anderson! 🙏✨`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.cellName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || m.role === filterRole;
    const matchesStatus = filterStatus === "All" || m.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: Member["role"]) => {
    switch (role) {
      case "Pastor":
        return "bg-purple-500/15 text-purple-400 border border-purple-500/20";
      case "Diácono":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
      case "Obreiro":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
      case "Líder de Célula":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/20";
      case "Membro":
        return "bg-zinc-500/15 text-zinc-300 border border-white/5";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Membros</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Cadastro de obreiros, líderes de célula e membros batizados
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Cadastrar Membro</span>
        </button>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Ativos</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {members.filter((m) => m.status === "Ativo").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Líderes de Célula</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {members.filter((m) => m.role === "Líder de Célula").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Aniversariantes de Hoje</p>
            <h4 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Gift size={20} className="animate-bounce" />
              {members.filter((m) => isBirthdayToday(m.birthDate)).length}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar membros por nome, célula, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="All" className="bg-zinc-900">Todos Cargos</option>
            <option value="Pastor" className="bg-zinc-900">Pastores</option>
            <option value="Diácono" className="bg-zinc-900">Diáconos</option>
            <option value="Obreiro" className="bg-zinc-900">Obreiros</option>
            <option value="Líder de Célula" className="bg-zinc-900">Líderes de Célula</option>
            <option value="Membro" className="bg-zinc-900">Membros</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="All" className="bg-zinc-900">Todos Status</option>
            <option value="Ativo" className="bg-zinc-900">Ativo</option>
            <option value="Inativo" className="bg-zinc-900">Inativo</option>
            <option value="Licença" className="bg-zinc-900">Licença</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card overflow-hidden border border-white/5 bg-zinc-950/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">Membro / Cargo</th>
                <th className="px-6 py-4">Célula / Ministério</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Nascimento / Batismo</th>
                <th className="px-6 py-4">Status (Clique p/ Alternar)</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => {
                const isBirthday = isBirthdayToday(member.birthDate);
                return (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PhotoUpload
                          photoUrl={member.photoUrl}
                          name={member.name}
                          size="sm"
                          onPhotoChange={(base64) => handleMemberPhotoChange(member.id, base64)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors">
                              {member.name}
                            </h4>
                            {isBirthday && (
                              <span className="p-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse flex items-center gap-0.5 text-[9px] font-extrabold uppercase">
                                <Gift size={10} />
                                <span>Hoje!</span>
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                      {member.cellName}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Phone size={12} className="text-purple-400" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <Mail size={12} />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                        <Gift size={11} className="text-emerald-400 shrink-0" />
                        <span>Nasc: {new Date(member.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Calendar size={11} className="shrink-0" />
                        <span>Bat: {new Date(member.baptismDate + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => cycleStatus(member.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all ${
                          member.status === "Ativo"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : member.status === "Inativo"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 hover:bg-zinc-500/20"
                        }`}
                      >
                        {member.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isBirthday && (
                          <a
                            href={getWhatsAppLink(member.name, member.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Parabenizar no WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-90"
                          >
                            <Send size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          title="Excluir Membro"
                          className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500 text-sm font-semibold">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cadastrar Membro Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" size={20} />
                <span>Cadastrar Novo Membro</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 py-3">
                <PhotoUpload
                  photoUrl={newPhoto || undefined}
                  name={newName || "Novo Membro"}
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
                  placeholder="Ex: Lucas da Silva Rocha"
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cargo / Função</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Member["role"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Membro" className="bg-zinc-900">Membro</option>
                    <option value="Líder de Célula" className="bg-zinc-900">Líder de Célula</option>
                    <option value="Obreiro" className="bg-zinc-900">Obreiro</option>
                    <option value="Diácono" className="bg-zinc-900">Diácono</option>
                    <option value="Pastor" className="bg-zinc-900">Pastor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Célula / Ministério</label>
                  <input
                    type="text"
                    value={newCellName}
                    onChange={(e) => setNewCellName(e.target.value)}
                    placeholder="Ex: Célula Resgatar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Ex: lucas@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={newBirth}
                    onChange={(e) => setNewBirth(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data do Batismo</label>
                  <input
                    type="date"
                    value={newBaptism}
                    onChange={(e) => setNewBaptism(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Status do Cadastro</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Member["status"])}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Ativo" className="bg-zinc-900">Ativo</option>
                  <option value="Inativo" className="bg-zinc-900">Inativo</option>
                  <option value="Licença" className="bg-zinc-900">Licença</option>
                </select>
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
                  Salvar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
