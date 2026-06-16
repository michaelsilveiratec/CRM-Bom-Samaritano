import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";
import { exportToCSV, exportToPDF } from "../utils/exportData";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";
import { fetchServerVisitors, createServerVisitor, updateServerVisitor, deleteServerVisitor } from "../services/crm.service";
import {
  UserPlus,
  Search,
  Phone,
  Calendar,
  MessageSquare,
  Plus,
  X,
  CheckCircle,
  Filter,
  Trash2,
  Edit2,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";

interface Visitor {
  id: number;
  name: string;
  phone: string;
  visitDate: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  maritalStatus?: string;
  birthDate?: string;
  referredBy: string;
  status: "Ativo" | "Inativo";
  notes: string;
  registrationDate?: string;
  photoUrl?: string;
  source?: string;
  createdByMobile?: boolean;
  createdAt?: string;
}

export default function Visitors() {
  const normalizeVisitorStatus = (status?: string): Visitor["status"] => {
    return status === "Inativo" ? "Inativo" : "Ativo";
  };

  const normalizeVisitor = (visitor: any): Visitor => ({
    id: visitor.id ?? Date.now(),
    ...visitor,
    status: normalizeVisitorStatus(visitor.status),
    createdByMobile: visitor.source === "mobile" || visitor.createdByMobile === true,
    createdAt: visitor.createdAt || new Date().toISOString(),
  });

  const loadCachedVisitors = () => {
    try {
      const cached = localStorage.getItem("visitors_data");
      return cached ? JSON.parse(cached).map(normalizeVisitor) : [];
    } catch {
      return [];
    }
  };

  const [visitors, setVisitors] = useState<Visitor[]>(loadCachedVisitors);

  useEffect(() => {
    const loadRemoteVisitors = async () => {
      try {
        const response = await fetchServerVisitors();
        const backendVisitors = (response?.visitors || []).map(normalizeVisitor);
        setVisitors(backendVisitors);
        cacheRecordsWithoutEmbeddedPhotos("visitors_data", backendVisitors);
      } catch (error) {
        console.warn("Não foi possível carregar visitantes do servidor:", error);
      }
    };

    loadRemoteVisitors();
  }, []);

  useEffect(() => {
    cacheRecordsWithoutEmbeddedPhotos("visitors_data", visitors);
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
  const [newAddress, setNewAddress] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newMaritalStatus, setNewMaritalStatus] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newReferred, setNewReferred] = useState("");
  const [newStatus, setNewStatus] = useState<Visitor["status"]>("Ativo");
  const [newNotes, setNewNotes] = useState("");
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

  const getRegistrationDate = (visitor: Visitor) => {
    return (
      formatStoredDate(visitor.registrationDate) ||
      formatStoredDate(visitor.createdAt) ||
      formatStoredDate(visitor.id > 1000000000000 ? visitor.id : undefined) ||
      "Não informado"
    );
  };

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewDate("");
    setNewAddress("");
    setNewNeighborhood("");
    setNewCity("");
    setNewMaritalStatus("");
    setNewBirthDate("");
    setNewReferred("");
    setNewStatus("Ativo");
    setNewNotes("");
    setNewPhoto(null);
    setEditingId(null);
  };

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    if (editingId) {
      const updatedVisitor = {
        name: newName,
        phone: newPhone,
        visitDate: newDate,
        address: newAddress,
        neighborhood: newNeighborhood,
        city: newCity,
        maritalStatus: newMaritalStatus,
        birthDate: newBirthDate,
        referredBy: newReferred,
        status: newStatus,
        notes: newNotes,
        photoUrl: newPhoto || undefined,
      };
      
      try {
        const response = await updateServerVisitor(editingId, {
          name: updatedVisitor.name,
          phone: updatedVisitor.phone,
          visitDate: updatedVisitor.visitDate,
          address: updatedVisitor.address,
          neighborhood: updatedVisitor.neighborhood,
          city: updatedVisitor.city,
          maritalStatus: updatedVisitor.maritalStatus,
          birthDate: updatedVisitor.birthDate,
          referredBy: updatedVisitor.referredBy,
          status: updatedVisitor.status,
          notes: updatedVisitor.notes,
          photoUrl: updatedVisitor.photoUrl,
        });
        setVisitors(visitors.map(v => 
          v.id === editingId ? normalizeVisitor(response.visitor) : v
        ));
      } catch (error) {
        console.warn("Falha ao atualizar visitante no backend:", error);
        alert("Não foi possível salvar o visitante no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    } else {
      const registrationDate = new Date().toISOString().split("T")[0];
      const newVisitor = {
        name: newName,
        phone: newPhone,
        visitDate: newDate || new Date().toISOString().split("T")[0],
        address: newAddress,
        neighborhood: newNeighborhood,
        city: newCity,
        maritalStatus: newMaritalStatus,
        birthDate: newBirthDate,
        referredBy: newReferred || "Espontâneo",
        status: newStatus,
        notes: newNotes,
        registrationDate,
        photoUrl: newPhoto || undefined,
      };
      
      try {
        // Send to backend API
        const response = await createServerVisitor({
          name: newVisitor.name,
          phone: newVisitor.phone,
          visitDate: newVisitor.visitDate,
          address: newVisitor.address,
          neighborhood: newVisitor.neighborhood,
          city: newVisitor.city,
          maritalStatus: newVisitor.maritalStatus,
          birthDate: newVisitor.birthDate || "",
          referredBy: newVisitor.referredBy,
          status: newVisitor.status,
          notes: newVisitor.notes,
          registrationDate: newVisitor.registrationDate,
          photoUrl: newVisitor.photoUrl,
          source: "web",
          role: "",
          email: "",
          cellName: "",
          baptismDate: "",
        });
        setVisitors([normalizeVisitor(response.visitor), ...visitors]);
      } catch (error) {
        console.warn("Falha ao salvar visitante no backend:", error);
        alert("Não foi possível salvar o visitante no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (visitor: Visitor) => {
    setNewName(visitor.name);
    setNewPhone(visitor.phone);
    setNewDate(visitor.visitDate);
    setNewAddress(visitor.address || "");
    setNewNeighborhood(visitor.neighborhood || "");
    setNewCity(visitor.city || "");
    setNewMaritalStatus(visitor.maritalStatus || "");
    setNewBirthDate(visitor.birthDate || "");
    setNewReferred(visitor.referredBy);
    setNewStatus(normalizeVisitorStatus(visitor.status));
    setNewNotes(visitor.notes);
    setNewPhoto(visitor.photoUrl || null);
    setEditingId(visitor.id);
    setIsModalOpen(true);
  };

  const handleVisitorPhotoChange = async (id: number, base64: string | null) => {
    const visitor = visitors.find((v) => v.id === id);
    if (!visitor) return;

    const updatedVisitor = { ...visitor, photoUrl: base64 || undefined };
    setVisitors(visitors.map(v =>
      v.id === id ? updatedVisitor : v
    ));

    try {
      const response = await updateServerVisitor(id, updatedVisitor);
      setVisitors((current) => current.map((v) => (v.id === id ? normalizeVisitor(response.visitor) : v)));
    } catch (error) {
      console.warn("Falha ao salvar foto do visitante no backend:", error);
      setVisitors((current) => current.map((v) => (v.id === id ? visitor : v)));
      alert("Não foi possível salvar a foto no servidor. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const handleDeleteVisitor = async (id: number) => {
    try {
      await deleteServerVisitor(id);
    } catch (error) {
      console.warn("Falha ao deletar visitante no backend:", error);
      alert("Não foi possível deletar o visitante no servidor. Verifique se o backend está rodando na porta 3001.");
      return;
    }
    setVisitors(visitors.filter((v) => v.id !== id));
  };

  const handleMakeContact = (name: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = `A paz do Senhor, ${name}! Aqui é o Pastor Anderson da Igreja Bom Samaritano. Gostamos muito da sua visita no nosso culto! Gostaríamos de saber como você está e se podemos orar por você. Que Deus te abençoe grandemente! 🙏✨`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const cycleStatus = async (id: number) => {
    const visitor = visitors.find((v) => v.id === id);
    if (!visitor) return;

    const newStatus: Visitor["status"] = visitor.status === "Ativo" ? "Inativo" : "Ativo";

    try {
      const response = await updateServerVisitor(id, { status: newStatus });
      setVisitors(
        visitors.map((v) => {
          if (v.id === id) {
            return normalizeVisitor(response.visitor);
          }
          return v;
        })
      );
    } catch (error) {
      console.warn("Falha ao atualizar status no backend:", error);
      alert("Não foi possível atualizar o status no servidor. Verifique se o backend está rodando na porta 3001.");
      return;
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.phone.includes(search) || 
                          (v.address || "").toLowerCase().includes(search.toLowerCase()) ||
                          (v.neighborhood || "").toLowerCase().includes(search.toLowerCase()) ||
                          (v.city || "").toLowerCase().includes(search.toLowerCase()) ||
                          v.referredBy.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "All" || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Visitor["status"]) => {
    switch (status) {
      case "Ativo":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Inativo":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Visitantes</h2>
          <p className="text-sm text-zinc-400 mt-1">Acompanhe e cuide das novas pessoas que visitam a igreja</p>
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
                  const csvData = filteredVisitors.map((v) => ({
                    foto: v.photoUrl || "",
                    nome: v.name,
                    telefone: v.phone,
                    endereço: v.address || "",
                    bairro: v.neighborhood || "",
                    cidade: v.city || "",
                    estado_civil: v.maritalStatus || "",
                    data_nascimento: formatStoredDate(v.birthDate),
                    data_visita: new Date(v.visitDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    data_registro: getRegistrationDate(v),
                    indicado_por: v.referredBy,
                    status: v.status,
                    observacoes: v.notes,
                  }));
                  exportToCSV(
                    csvData,
                    [
                      { key: "foto", label: "Foto" },
                      { key: "nome", label: "Nome" },
                      { key: "telefone", label: "Telefone" },
                      { key: "endereço", label: "Endereco" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estado_civil", label: "Estado Civil" },
                      { key: "data_nascimento", label: "Data de Nascimento" },
                      { key: "data_visita", label: "Data da Visita" },
                      { key: "data_registro", label: "Data de Registro" },
                      { key: "indicado_por", label: "Indicado Por" },
                      { key: "status", label: "Status" },
                      { key: "observacoes", label: "Observações" },
                    ],
                    "visitantes_eclesia_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              >
                <FileSpreadsheet size={16} />
                <span>Baixar CSV (Excel)</span>
              </button>
              <button
                onClick={() => {
                  const pdfData = filteredVisitors.map((v) => ({
                    foto: v.photoUrl || "",
                    nome: v.name,
                    telefone: v.phone,
                    endereço: v.address || "",
                    bairro: v.neighborhood || "",
                    cidade: v.city || "",
                    estado_civil: v.maritalStatus || "",
                    data_nascimento: formatStoredDate(v.birthDate),
                    data_visita: new Date(v.visitDate + "T00:00:00").toLocaleDateString("pt-BR"),
                    data_registro: getRegistrationDate(v),
                    indicado_por: v.referredBy,
                    status: v.status,
                    observacoes: v.notes,
                  }));
                  exportToPDF(
                    pdfData,
                    [
                      { key: "foto", label: "Foto" },
                      { key: "nome", label: "Nome" },
                      { key: "telefone", label: "Telefone" },
                      { key: "endereço", label: "Endereco" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estado_civil", label: "Estado Civil" },
                      { key: "data_nascimento", label: "Data de Nascimento" },
                      { key: "data_visita", label: "Data da Visita" },
                      { key: "data_registro", label: "Data de Registro" },
                      { key: "indicado_por", label: "Indicado Por" },
                      { key: "status", label: "Status" },
                      { key: "observacoes", label: "Observações" },
                    ],
                    "Relatório de Visitantes",
                    "visitantes_eclesia_crm"
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
            <span>Cadastrar Visitante</span>
          </button>
        </div>
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
              <option value="Ativo" className="bg-zinc-900">Ativo</option>
              <option value="Inativo" className="bg-zinc-900">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitors List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredVisitors.map((visitor) => (
          <div
            key={visitor.id}
            className="glass-card border border-white/5 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-4 transition-all duration-300 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <PhotoUpload
                  photoUrl={visitor.photoUrl}
                  name={visitor.name}
                  size="md"
                  onPhotoChange={(base64) => handleVisitorPhotoChange(visitor.id, base64)}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-extrabold text-zinc-100">
                    {visitor.name}
                    </h3>
                    <button
                      onClick={() => cycleStatus(visitor.id)}
                      title="Clique para alternar o status"
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide transition-all active:scale-95 ${getStatusBadge(visitor.status)}`}
                    >
                      {visitor.status}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-1.5 text-xs text-zinc-400 sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <Phone size={12} className="text-emerald-400" />
                      {visitor.phone}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-400" />
                      Visita: {formatStoredDate(visitor.visitDate)}
                    </span>
                    {(visitor.neighborhood || visitor.city) && (
                      <span className="truncate text-zinc-500">
                        {[visitor.neighborhood, visitor.city].filter(Boolean).join(" - ")}
                      </span>
                    )}
                    <span className="truncate text-zinc-500">
                      Indicador: {visitor.referredBy || "Espontaneo"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEditModal(visitor)}
                  title="Editar Visitante"
                  className="rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-blue-500/10 hover:text-blue-400 active:scale-90"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteVisitor(visitor.id)}
                  title="Excluir Visitante"
                  className="rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-rose-500/10 hover:text-rose-400 active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-white/5 pt-3 text-xs text-zinc-500">
              {(visitor.address || visitor.neighborhood || visitor.city) && (
                <div className="truncate">
                  Endereco: {[visitor.address, visitor.neighborhood, visitor.city].filter(Boolean).join(" - ")}
                </div>
              )}
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Registro: {getRegistrationDate(visitor)}</span>
                {visitor.birthDate && (
                  <span>Nascimento: {formatStoredDate(visitor.birthDate)}</span>
                )}
              </div>
            </div>

            {visitor.notes && (
              <p className="mt-3 line-clamp-2 rounded-lg border border-white/5 bg-white/5 p-2 text-xs leading-relaxed text-zinc-500">
                {visitor.notes}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleMakeContact(visitor.name, visitor.phone)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-zinc-300 transition-all hover:border-emerald-500/25 hover:bg-emerald-600/10 hover:text-emerald-300 active:scale-95"
              >
                <MessageSquare size={12} />
                <span>Contato</span>
              </button>
              <button
                onClick={() => cycleStatus(visitor.id)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-600/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400 transition-all hover:border-emerald-500/35 hover:bg-emerald-600/20 active:scale-95"
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
                <span>{editingId ? "Editar Visitante" : "Cadastrar Novo Visitante"}</span>
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

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Endereco</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Rua, numero e complemento"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bairro</label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    placeholder="Ex: Rochdale"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cidade</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Ex: Osasco"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Estado Civil</label>
                  <select
                    value={newMaritalStatus}
                    onChange={(e) => setNewMaritalStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">Selecione</option>
                    <option value="Solteiro(a)" className="bg-zinc-900">Solteiro(a)</option>
                    <option value="Casado(a)" className="bg-zinc-900">Casado(a)</option>
                    <option value="Divorciado(a)" className="bg-zinc-900">Divorciado(a)</option>
                    <option value="Viúvo(a)" className="bg-zinc-900">Viúvo(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
                Data de registro: automatica no momento do cadastro.
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
                    <option value="Ativo" className="bg-zinc-900">Ativo</option>
                    <option value="Inativo" className="bg-zinc-900">Inativo</option>
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
