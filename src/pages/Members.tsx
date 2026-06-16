import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";
import { exportToCSV, exportToPDF } from "../utils/exportData";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";
import { fetchServerMembers, createServerMember, updateServerMember, deleteServerMember } from "../services/crm.service";
import { sendBirthdayMessage } from "../services/whatsapp";
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
  Trash2,
  Edit2,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  role: "Pastor" | "Diácono" | "Obreiro" | "Líder de Célula" | "Membro";
  phone: string;
  email: string;
  cellName: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  maritalStatus?: string;
  registrationDate?: string;
  baptismDate: string;
  birthDate: string;
  status: "Ativo" | "Inativo" | "Licença";
  photoUrl?: string;
  source?: string;
  createdByMobile?: boolean;
  createdAt?: string;
}

export default function Members() {
  // Generate today's dates for dynamic anniversary demonstration
  const todayObj = new Date();
  const currentMonthDay = `${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

  const normalizeMember = (member: any): Member => ({
    id: member.id ?? Date.now(),
    ...member,
    role: (member.role || "Membro") as Member["role"],
    status: (member.status || "Ativo") as Member["status"],
    createdByMobile: member.source === "mobile" || member.createdByMobile === true,
    createdAt: member.createdAt || new Date().toISOString(),
  });

  const loadCachedMembers = () => {
    try {
      const cached = localStorage.getItem("members_data");
      return cached ? JSON.parse(cached).map(normalizeMember) : [];
    } catch {
      return [];
    }
  };

  const [members, setMembers] = useState<Member[]>(loadCachedMembers);

  useEffect(() => {
    const loadRemoteMembers = async () => {
      try {
        const response = await fetchServerMembers();
        const backendMembers = (response?.members || []).map(normalizeMember);
        setMembers(backendMembers);
        cacheRecordsWithoutEmbeddedPhotos("members_data", backendMembers);
      } catch (error) {
        console.warn("Não foi possível carregar membros do servidor:", error);
      }
    };

    loadRemoteMembers();
  }, []);

  useEffect(() => {
    cacheRecordsWithoutEmbeddedPhotos("members_data", members);
  }, [members]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingBirthdayId, setSendingBirthdayId] = useState<number | null>(null);
  const [birthdayMessages, setBirthdayMessages] = useState<{ memberId: number; success: boolean; message: string }[]>([]);
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
  const [newAddress, setNewAddress] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newMaritalStatus, setNewMaritalStatus] = useState("");
  const [newBaptism, setNewBaptism] = useState("");
  const [newBirth, setNewBirth] = useState("");
  const [newStatus, setNewStatus] = useState<Member["status"]>("Ativo");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const formatStoredDate = (value?: string | number) => {
    if (!value) return "";
    const date =
      typeof value === "number"
        ? new Date(value)
        : new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
  };

  const getRegistrationDate = (member: Member) => {
    return (
      formatStoredDate(member.registrationDate) ||
      formatStoredDate(member.createdAt) ||
      formatStoredDate(member.id > 1000000000000 ? member.id : undefined) ||
      "Não informado"
    );
  };

  const resetForm = () => {
    setNewName("");
    setNewRole("Membro");
    setNewPhone("");
    setNewEmail("");
    setNewCellName("");
    setNewAddress("");
    setNewNeighborhood("");
    setNewCity("");
    setNewMaritalStatus("");
    setNewBaptism("");
    setNewBirth("");
    setNewStatus("Ativo");
    setNewPhoto(null);
    setEditingId(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    if (editingId) {
      const updatedMember = {
        name: newName,
        role: newRole,
        phone: newPhone,
        email: newEmail,
        cellName: newCellName,
        address: newAddress,
        neighborhood: newNeighborhood,
        city: newCity,
        maritalStatus: newMaritalStatus,
        baptismDate: newBaptism,
        birthDate: newBirth,
        status: newStatus,
        photoUrl: newPhoto || undefined,
      };
      
      try {
        const response = await updateServerMember(editingId, {
          name: updatedMember.name,
          role: updatedMember.role,
          phone: updatedMember.phone,
          email: updatedMember.email,
          cellName: updatedMember.cellName,
          address: updatedMember.address,
          neighborhood: updatedMember.neighborhood,
          city: updatedMember.city,
          maritalStatus: updatedMember.maritalStatus,
          baptismDate: updatedMember.baptismDate,
          birthDate: updatedMember.birthDate,
          status: updatedMember.status,
          photoUrl: updatedMember.photoUrl,
        });
        setMembers(members.map(m => 
          m.id === editingId ? normalizeMember(response.member) : m
        ));
      } catch (error) {
        console.warn("Falha ao atualizar membro no backend:", error);
        alert("Não foi possível salvar o membro no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    } else {
      const registrationDate = new Date().toISOString().split("T")[0];
      const newMember = {
        name: newName,
        role: newRole,
        phone: newPhone,
        email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        cellName: newCellName || "Não Associado",
        address: newAddress,
        neighborhood: newNeighborhood,
        city: newCity,
        maritalStatus: newMaritalStatus,
        registrationDate,
        baptismDate: newBaptism || new Date().toISOString().split("T")[0],
        birthDate: newBirth || "2000-01-01",
        status: newStatus,
        photoUrl: newPhoto || undefined,
      };
      
      try {
        // Send to backend API
        const response = await createServerMember({
          name: newMember.name,
          role: newMember.role,
          phone: newMember.phone,
          email: newMember.email,
          cellName: newMember.cellName,
          address: newMember.address,
          neighborhood: newMember.neighborhood,
          city: newMember.city,
          maritalStatus: newMember.maritalStatus,
          registrationDate: newMember.registrationDate,
          baptismDate: newMember.baptismDate,
          birthDate: newMember.birthDate,
          status: newMember.status,
          photoUrl: newMember.photoUrl,
          source: "web",
          visitDate: "",
          referredBy: "",
          notes: "",
        });
        setMembers([normalizeMember(response.member), ...members]);
      } catch (error) {
        console.warn("Falha ao salvar membro no backend:", error);
        alert("Não foi possível salvar o membro no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (member: Member) => {
    setNewName(member.name);
    setNewRole(member.role);
    setNewPhone(member.phone);
    setNewEmail(member.email);
    setNewCellName(member.cellName);
    setNewAddress(member.address || "");
    setNewNeighborhood(member.neighborhood || "");
    setNewCity(member.city || "");
    setNewMaritalStatus(member.maritalStatus || "");
    setNewBaptism(member.baptismDate);
    setNewBirth(member.birthDate);
    setNewStatus(member.status);
    setNewPhoto(member.photoUrl || null);
    setEditingId(member.id);
    setIsModalOpen(true);
  };

  const handleMemberPhotoChange = async (id: number, base64: string | null) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const updatedMember = { ...member, photoUrl: base64 || undefined };
    setMembers(members.map(m =>
      m.id === id ? updatedMember : m
    ));

    try {
      const response = await updateServerMember(id, updatedMember);
      setMembers((current) => current.map((m) => (m.id === id ? normalizeMember(response.member) : m)));
    } catch (error) {
      console.warn("Falha ao salvar foto do membro no backend:", error);
      setMembers((current) => current.map((m) => (m.id === id ? member : m)));
      alert("Não foi possível salvar a foto no servidor. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await deleteServerMember(id);
    } catch (error) {
      console.warn("Falha ao deletar membro no backend:", error);
      alert("Não foi possível deletar o membro no servidor. Verifique se o backend está rodando na porta 3001.");
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const cycleStatus = async (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const statuses: Member["status"][] = ["Ativo", "Inativo", "Licença"];
    const nextIdx = (statuses.indexOf(member.status) + 1) % statuses.length;
    const newStatus = statuses[nextIdx];

    try {
      const response = await updateServerMember(id, { ...member, status: newStatus });
      setMembers(
        members.map((m) => {
          if (m.id === id) {
            return normalizeMember(response.member);
          }
          return m;
        })
      );
    } catch (error) {
      console.warn("Falha ao atualizar status no backend:", error);
      alert("Não foi possível atualizar o status no servidor. Verifique se o backend está rodando na porta 3001.");
      return;
    }
  };

  const isBirthdayToday = (birthStr: string) => {
    if (!birthStr) return false;
    const parts = birthStr.split("-");
    if (parts.length < 3) return false;
    const m = parts[1];
    const d = parts[2];
    return `${m}-${d}` === currentMonthDay;
  };


  const handleSendBirthday = async (member: Member) => {
    if (!member.phone) {
      alert("Telefone do membro não disponível!");
      return;
    }

    setSendingBirthdayId(member.id);
    const pastorName = localStorage.getItem("settings_pastor_name") || "Pastor";
    
    try {
      const result = await sendBirthdayMessage(member.phone, member.name, pastorName, member.photoUrl);
      
      if (result.success) {
        setBirthdayMessages((prev) => [
          ...prev,
          { memberId: member.id, success: true, message: `✅ Parabéns enviado para ${member.name}!` },
        ]);
        setTimeout(() => {
          setBirthdayMessages((prev) => prev.filter((msg) => msg.memberId !== member.id));
        }, 5000);
      } else {
        setBirthdayMessages((prev) => [
          ...prev,
          { memberId: member.id, success: false, message: `❌ Erro: ${result.error || "Falha ao enviar"}` },
        ]);
      }
    } catch (error: any) {
      setBirthdayMessages((prev) => [
        ...prev,
        { memberId: member.id, success: false, message: `❌ Erro ao enviar: ${error.message}` },
      ]);
    } finally {
      setSendingBirthdayId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.cellName.toLowerCase().includes(search.toLowerCase()) ||
      (m.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.neighborhood || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.maritalStatus || "").toLowerCase().includes(search.toLowerCase());
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
      {/* Notificações de Aniversário */}
      {birthdayMessages.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {birthdayMessages.map((msg) => (
            <div
              key={`${msg.memberId}-${msg.success}`}
              className={`p-4 rounded-lg border ${
                msg.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              } animate-pulse`}
            >
              {msg.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Membros</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Cadastro de obreiros, líderes de célula e membros batizados
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <button
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-zinc-300 hover:text-emerald-400 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => {
                  const csvData = filteredMembers.map((m) => ({
                    foto: m.photoUrl || "",
                    nome: m.name,
                    cargo: m.role,
                    telefone: m.phone,
                    email: m.email,
                    celula: m.cellName,
                    endereço: m.address || "",
                    bairro: m.neighborhood || "",
                    cidade: m.city || "",
                    estadoCivil: m.maritalStatus || "",
                    dataRegistro: getRegistrationDate(m),
                    nascimento: new Date(m.birthDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    batismo: new Date(m.baptismDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    status: m.status,
                  }));
                  exportToCSV(
                    csvData,
                    [
                      { key: "foto", label: "Foto" },
                      { key: "nome", label: "Nome" },
                      { key: "cargo", label: "Cargo" },
                      { key: "telefone", label: "Telefone" },
                      { key: "email", label: "E-mail" },
                      { key: "celula", label: "Célula" },
                      { key: "endereço", label: "Endereço" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estadoCivil", label: "Estado Civil" },
                      { key: "dataRegistro", label: "Data de Registro" },
                      { key: "nascimento", label: "Nascimento" },
                      { key: "batismo", label: "Batismo" },
                      { key: "status", label: "Status" },
                    ],
                    "membros_eclesia_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              >
                <FileSpreadsheet size={16} />
                <span>Baixar CSV (Excel)</span>
              </button>
              <button
                onClick={() => {
                  const pdfData = filteredMembers.map((m) => ({
                    foto: m.photoUrl || "",
                    nome: m.name,
                    cargo: m.role,
                    telefone: m.phone,
                    email: m.email,
                    celula: m.cellName,
                    endereço: m.address || "",
                    bairro: m.neighborhood || "",
                    cidade: m.city || "",
                    estadoCivil: m.maritalStatus || "",
                    dataRegistro: getRegistrationDate(m),
                    nascimento: new Date(m.birthDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    batismo: new Date(m.baptismDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    status: m.status,
                  }));
                  exportToPDF(
                    pdfData,
                    [
                      { key: "foto", label: "Foto" },
                      { key: "nome", label: "Nome" },
                      { key: "cargo", label: "Cargo" },
                      { key: "telefone", label: "Telefone" },
                      { key: "email", label: "E-mail" },
                      { key: "celula", label: "Célula" },
                      { key: "endereço", label: "Endereço" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estadoCivil", label: "Estado Civil" },
                      { key: "dataRegistro", label: "Data de Registro" },
                      { key: "nascimento", label: "Nascimento" },
                      { key: "batismo", label: "Batismo" },
                      { key: "status", label: "Status" },
                    ],
                    "Relatório de Membros",
                    "membros_eclesia_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-400 transition-all border-t border-white/5"
              >
                <FileText size={16} />
                <span>Baixar PDF (Impressão)</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Cadastrar Membro</span>
          </button>
        </div>
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
            placeholder="Buscar membros por nome, célula, telefone, bairro, cidade..."
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
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Datas</th>
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
                          size="md"
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
                      <div className="text-xs text-zinc-300 font-medium">
                        {member.address || "Não informado"}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {[member.neighborhood, member.city].filter(Boolean).join(" - ") || "Bairro/Cidade não informado"}
                      </div>
                      {member.maritalStatus && (
                        <div className="text-[10px] text-zinc-500">
                          Estado civil: {member.maritalStatus}
                        </div>
                      )}
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
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Calendar size={11} className="shrink-0" />
                        <span>Reg: {getRegistrationDate(member)}</span>
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
                          <button
                            onClick={() => handleSendBirthday(member)}
                            disabled={sendingBirthdayId === member.id}
                            title="Enviar parabéns automático via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:cursor-wait"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(member)}
                          title="Editar Membro"
                          className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-all active:scale-90"
                        >
                          <Edit2 size={15} />
                        </button>
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
                  <td colSpan={7} className="py-16 text-center text-zinc-500 text-sm font-semibold">
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
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" size={20} />
                <span>{editingId ? "Editar Membro" : "Cadastrar Novo Membro"}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
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

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Endereço</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bairro</label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    placeholder="Ex: Centro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cidade</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Estado Civil</label>
                  <select
                    value={newMaritalStatus}
                    onChange={(e) => setNewMaritalStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">Não informado</option>
                    <option value="Solteiro(a)" className="bg-zinc-900">Solteiro(a)</option>
                    <option value="Casado(a)" className="bg-zinc-900">Casado(a)</option>
                    <option value="Divorciado(a)" className="bg-zinc-900">Divorciado(a)</option>
                    <option value="Viúvo(a)" className="bg-zinc-900">Viúvo(a)</option>
                    <option value="União Estável" className="bg-zinc-900">União Estável</option>
                  </select>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {editingId ? "Salvar Alterações" : "Salvar Membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
