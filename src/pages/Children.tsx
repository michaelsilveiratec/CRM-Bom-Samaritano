import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import PhotoUpload from "../components/PhotoUpload";
import { exportToCSV, exportToPDF } from "../utils/exportData";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";
import {
  fetchServerChildren,
  createServerChild,
  updateServerChild,
  deleteServerChild,
} from "../services/crm.service";

const STATUS_OPTIONS = ["Ativo", "Inativo", "Licença", "Pendente"];
const MARITAL_STATUS_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];
const CHILD_ROLE = "Criança";

interface Child {
  id: number;
  name: string;
  role: string;
  phone: string;
  email?: string;
  cellName?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  maritalStatus?: string;
  registrationDate?: string;
  baptismDate?: string;
  birthDate?: string;
  visitDate?: string;
  referredBy?: string;
  status: string;
  notes?: string;
  photoUrl?: string;
  source?: string;
  createdByMobile?: boolean;
  createdAt?: string;
}

export default function Children() {
  const [children, setChildren] = useState<Child[]>(() => {
    try {
      const cached = localStorage.getItem("children_data");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cellName, setCellName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [baptismDate, setBaptismDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const response = await fetchServerChildren();
        const backendChildren = Array.isArray(response?.children) ? response.children : [];
        setChildren(backendChildren);
        cacheRecordsWithoutEmbeddedPhotos("children_data", backendChildren);
      } catch (error) {
        console.warn("Não foi possível carregar crianças do servidor:", error);
      }
    };

    loadChildren();
  }, []);

  useEffect(() => {
    cacheRecordsWithoutEmbeddedPhotos("children_data", children);
  }, [children]);

  const formatStoredDate = (value?: string | number) => {
    if (!value) return "";
    const date = typeof value === "number" ? new Date(value) : new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
  };

  const getRegistrationDate = (record: Child) => {
    return (
      formatStoredDate(record.registrationDate) ||
      formatStoredDate(record.createdAt) ||
      formatStoredDate(record.id > 1000000000000 ? record.id : undefined) ||
      "Não informado"
    );
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setCellName("");
    setAddress("");
    setNeighborhood("");
    setCity("");
    setMaritalStatus("");
    setBaptismDate("");
    setBirthDate("");
    setReferredBy("");
    setStatus("Ativo");
    setNotes("");
    setPhotoPreview(null);
    setEditingId(null);
    setMessage(null);
  };

  const populateForm = (child: Child) => {
    setEditingId(child.id);
    setName(child.name);
    setPhone(child.phone);
    setEmail(child.email || "");
    setCellName(child.cellName || "");
    setAddress(child.address || "");
    setNeighborhood(child.neighborhood || "");
    setCity(child.city || "");
    setMaritalStatus(child.maritalStatus || "");
    setBaptismDate(child.baptismDate || "");
    setBirthDate(child.birthDate || "");
    setReferredBy(child.referredBy || "");
    setStatus(child.status);
    setNotes(child.notes || "");
    setPhotoPreview(child.photoUrl || null);
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !phone) {
      setMessage("Nome e telefone são obrigatórios.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const registrationDate = new Date().toISOString().split("T")[0];
      const payload: any = {
        name,
        role: CHILD_ROLE,
        phone,
        email,
        cellName,
        address,
        neighborhood,
        city,
        maritalStatus,
        registrationDate,
        baptismDate,
        birthDate,
        visitDate: registrationDate,
        referredBy,
        status,
        notes,
        photoUrl: photoPreview || undefined,
        source: "web",
      };

      const size = new TextEncoder().encode(JSON.stringify(payload)).length;
      if (size > 950 * 1024) {
        payload.photoUrl = undefined;
        setMessage("Imagem muito grande; envio efetuado sem foto para evitar erro do servidor.");
      }

      if (editingId) {
        const response = await updateServerChild(editingId, payload);
        setChildren((current) => current.map((item) => (item.id === editingId ? response.child : item)));
      } else {
        const response = await createServerChild(payload);
        setChildren((current) => [response.child, ...current]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setMessage(error.message || "Erro ao salvar o cadastro. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChildPhotoChange = async (id: number, base64: string | null) => {
    const child = children.find((item) => item.id === id);
    if (!child) return;

    const updatedChild = { ...child, photoUrl: base64 || undefined };
    setChildren((current) => current.map((item) => (item.id === id ? updatedChild : item)));

    try {
      const response = await updateServerChild(id, updatedChild);
      setChildren((current) => current.map((item) => (item.id === id ? response.child : item)));
    } catch (error) {
      console.warn("Falha ao salvar foto da criança no backend:", error);
      setChildren((current) => current.map((item) => (item.id === id ? child : item)));
      alert("Não foi possível salvar a foto no servidor. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const handleDeleteChild = async (id: number) => {
    try {
      await deleteServerChild(id);
      setChildren((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.warn("Falha ao excluir criança no backend:", error);
      alert("Não foi possível excluir o registro. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(search.toLowerCase()) ||
      child.phone.toLowerCase().includes(search.toLowerCase()) ||
      (child.cellName || "").toLowerCase().includes(search.toLowerCase()) ||
      (child.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (child.neighborhood || "").toLowerCase().includes(search.toLowerCase()) ||
      (child.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || child.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusStyle = (childStatus: string) => {
    switch (childStatus) {
      case "Ativo":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Inativo":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-300 border border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Crianças</h2>
          <p className="text-sm text-zinc-400 mt-1">Cadastro e listagem de crianças no mesmo padrão dos membros.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            <Users size={16} />
            Novo Registro
          </button>
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 px-4 py-3 rounded-xl text-sm font-semibold transition-all">
              <Download size={16} />
              Exportar
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => {
                  const csvData = filteredChildren.map((item) => ({
                    nome: item.name,
                    telefone: item.phone,
                    email: item.email || "",
                    celula: item.cellName || "",
                    endereco: item.address || "",
                    bairro: item.neighborhood || "",
                    cidade: item.city || "",
                    estadoCivil: item.maritalStatus || "",
                    registro: getRegistrationDate(item),
                    nascimento: formatStoredDate(item.birthDate),
                    batismo: formatStoredDate(item.baptismDate),
                    status: item.status,
                  }));
                  exportToCSV(
                    csvData,
                    [
                      { key: "nome", label: "Nome" },
                      { key: "telefone", label: "Telefone" },
                      { key: "email", label: "E-mail" },
                      { key: "celula", label: "Grupo / Célula" },
                      { key: "endereco", label: "Endereço" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estadoCivil", label: "Estado Civil" },
                      { key: "registro", label: "Data de Registro" },
                      { key: "nascimento", label: "Nascimento" },
                      { key: "batismo", label: "Batismo" },
                      { key: "status", label: "Status" },
                    ],
                    "criancas_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              >
                <FileSpreadsheet size={16} />
                <span>Baixar CSV</span>
              </button>
              <button
                onClick={() => {
                  const pdfData = filteredChildren.map((item) => ({
                    nome: item.name,
                    telefone: item.phone,
                    email: item.email || "",
                    celula: item.cellName || "",
                    endereco: item.address || "",
                    bairro: item.neighborhood || "",
                    cidade: item.city || "",
                    estadoCivil: item.maritalStatus || "",
                    registro: getRegistrationDate(item),
                    nascimento: formatStoredDate(item.birthDate),
                    batismo: formatStoredDate(item.baptismDate),
                    status: item.status,
                  }));
                  exportToPDF(
                    pdfData,
                    [
                      { key: "nome", label: "Nome" },
                      { key: "telefone", label: "Telefone" },
                      { key: "email", label: "E-mail" },
                      { key: "celula", label: "Grupo / Célula" },
                      { key: "endereco", label: "Endereço" },
                      { key: "bairro", label: "Bairro" },
                      { key: "cidade", label: "Cidade" },
                      { key: "estadoCivil", label: "Estado Civil" },
                      { key: "registro", label: "Data de Registro" },
                      { key: "nascimento", label: "Nascimento" },
                      { key: "batismo", label: "Batismo" },
                      { key: "status", label: "Status" },
                    ],
                    "Relatório de Crianças",
                    "criancas_crm"
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
              >
                <FileText size={16} />
                <span>Baixar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Buscar</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar nome, telefone, célula..."
              className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-12 py-3 text-sm text-white"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full max-w-[220px] rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        >
          <option value="All">Todos Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden border border-white/5 bg-zinc-950/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">Nome / Perfil</th>
                <th className="px-6 py-4">Grupo / Célula</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Datas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredChildren.map((child) => (
                <tr key={child.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PhotoUpload photoUrl={child.photoUrl} name={child.name} size="md" onPhotoChange={(base64) => handleChildPhotoChange(child.id, base64)} />
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors">{child.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block bg-zinc-500/15 text-zinc-300 border border-white/5">
                          {child.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 font-medium">{child.cellName || "—"}</td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="text-xs text-zinc-300 font-medium">{child.address || "Não informado"}</div>
                    <div className="text-[11px] text-zinc-500">{[child.neighborhood, child.city].filter(Boolean).join(" - ") || "Bairro/Cidade não informado"}</div>
                    {child.maritalStatus && <div className="text-[10px] text-zinc-500">Estado civil: {child.maritalStatus}</div>}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400"><Phone size={12} className="text-purple-400" /><span>{child.phone}</span></div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500"><Mail size={12} /><span>{child.email || "-"}</span></div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium"><Calendar size={11} className="shrink-0" /><span>Nasc: {formatStoredDate(child.birthDate)}</span></div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500"><Calendar size={11} className="shrink-0" /><span>Bat: {formatStoredDate(child.baptismDate)}</span></div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500"><Calendar size={11} className="shrink-0" /><span>Reg: {getRegistrationDate(child)}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle(child.status)}`}>
                      {child.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => populateForm(child)} title="Editar" className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-all active:scale-90"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteChild(child.id)} title="Excluir" className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredChildren.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500 text-sm font-semibold">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users size={20} className="text-purple-400" />{editingId ? "Editar Criança" : "Cadastrar Criança"}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-zinc-500 hover:text-zinc-300 transition-colors"><ArrowLeft size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col items-center gap-3 py-3">
                <PhotoUpload photoUrl={photoPreview || undefined} name={name || "Nova Criança"} size="lg" onPhotoChange={(base64) => setPhotoPreview(base64)} />
                <p className="text-[10px] text-zinc-500">Clique para adicionar foto (opcional, máx. 3MB)</p>
              </div>
              {message ? <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{message}</div> : null}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Laura Souza" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@dominio.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Grupo / Célula</label>
                  <input type="text" value={cellName} onChange={(e) => setCellName(e.target.value)} placeholder="Ex: Célula Crianças" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Indicação</label>
                  <input type="text" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Quem indicou" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500">
                  <option value="">Estado civil</option>
                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
                <input type="date" value={baptismDate} onChange={(e) => setBaptismDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações" rows={3} className="w-full bg-white/5 border border-white/10 rounded-3xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500" />
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Foto opcional
                  <input type="file" accept="image/*" onChange={(e) => setPhotoPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white" />
                </label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white">
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isSaving} className="w-full rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSaving ? "Salvando..." : editingId ? "Atualizar criança" : "Cadastrar criança"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
