import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
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
  fetchServerYouth,
  createServerYouth,
  updateServerYouth,
  deleteServerYouth,
} from "../services/crm.service";

const STATUS_OPTIONS = ["Ativo", "Inativo", "Licença", "Pendente"];
const MARITAL_STATUS_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];
const YOUTH_ROLE = "Jovem";

interface YouthRecord {
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

export default function Youth() {
  const [youth, setYouth] = useState<YouthRecord[]>(() => {
    try {
      const cached = localStorage.getItem("youth_data");
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
    const loadYouth = async () => {
      try {
        const response = await fetchServerYouth();
        const backendYouth = Array.isArray(response?.youth) ? response.youth : [];
        setYouth(backendYouth);
        cacheRecordsWithoutEmbeddedPhotos("youth_data", backendYouth);
      } catch (error) {
        console.warn("Não foi possível carregar jovens do servidor:", error);
      }
    };

    loadYouth();
  }, []);

  useEffect(() => {
    cacheRecordsWithoutEmbeddedPhotos("youth_data", youth);
  }, [youth]);

  const formatStoredDate = (value?: string | number) => {
    if (!value) return "";
    const date = typeof value === "number" ? new Date(value) : new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
  };

  const getRegistrationDate = (record: YouthRecord) => {
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

  const populateForm = (item: YouthRecord) => {
    setEditingId(item.id);
    setName(item.name);
    setPhone(item.phone);
    setEmail(item.email || "");
    setCellName(item.cellName || "");
    setAddress(item.address || "");
    setNeighborhood(item.neighborhood || "");
    setCity(item.city || "");
    setMaritalStatus(item.maritalStatus || "");
    setBaptismDate(item.baptismDate || "");
    setBirthDate(item.birthDate || "");
    setReferredBy(item.referredBy || "");
    setStatus(item.status);
    setNotes(item.notes || "");
    setPhotoPreview(item.photoUrl || null);
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
        role: YOUTH_ROLE,
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
        const response = await updateServerYouth(editingId, payload);
        setYouth((current) => current.map((it) => (it.id === editingId ? response.youth : it)));
      } else {
        const response = await createServerYouth(payload);
        setYouth((current) => [response.youth, ...current]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setMessage(error.message || "Erro ao salvar o cadastro. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (id: number, base64: string | null) => {
    const item = youth.find((y) => y.id === id);
    if (!item) return;
    const updated = { ...item, photoUrl: base64 || undefined };
    setYouth((current) => current.map((it) => (it.id === id ? updated : it)));
    try {
      const response = await updateServerYouth(id, updated);
      setYouth((current) => current.map((it) => (it.id === id ? response.youth : it)));
    } catch (err) {
      console.warn("Falha ao salvar foto no backend:", err);
      setYouth((current) => current.map((it) => (it.id === id ? item : it)));
      alert("Não foi possível salvar a foto no servidor. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteServerYouth(id);
      setYouth((current) => current.filter((it) => it.id !== id));
    } catch (err) {
      console.warn("Falha ao excluir jovem:", err);
      alert("Não foi possível excluir o registro. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const filtered = youth.filter((it) => {
    const matchesSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.phone.toLowerCase().includes(search.toLowerCase()) ||
      (it.cellName || "").toLowerCase().includes(search.toLowerCase()) ||
      (it.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (it.neighborhood || "").toLowerCase().includes(search.toLowerCase()) ||
      (it.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || it.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusStyle = (s: string) => {
    switch (s) {
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
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Jovens</h2>
          <p className="text-sm text-zinc-400 mt-1">Cadastro e listagem de jovens no mesmo padrão dos membros.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 px-4 py-3 rounded-xl text-sm font-semibold transition-all">
            <Users size={16} />
            Novo Registro
          </button>
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 px-4 py-3 rounded-xl text-sm font-semibold">
              <Download size={16} />
              Exportar
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={() => {
                  const csvData = filtered.map((item) => ({
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
                  exportToCSV(csvData, [
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
                  ], "jovens_crm");
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
              >
                <FileSpreadsheet size={14} className="inline-block mr-2" /> Exportar CSV
              </button>
              <button
                onClick={() => {
                  const pdfData = filtered.map((item) => ({
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
                  exportToPDF(pdfData, [
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
                  ], "Relatório de Jovens", "jovens_crm");
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
              >
                <FileText size={14} className="inline-block mr-2" /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={16} className="text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone, cidade, célula..." className="w-full bg-transparent outline-none text-sm text-white" />
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white">
            <option value="All">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-white/3 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-zinc-400">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Célula</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-white/6">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                      {item.photoUrl ? <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" /> : <div className="text-zinc-400">{item.name?.[0]}</div>}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-zinc-400">{item.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-300">{item.phone}</td>
                <td className="px-4 py-3 text-zinc-300">{item.cellName || "-"}</td>
                <td className="px-4 py-3 text-zinc-300">{getRegistrationDate(item)}</td>
                <td className={`px-4 py-3 ${statusStyle(item.status)} rounded-full inline-block`}>{item.status}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => populateForm(item)} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/6 text-sm text-zinc-200">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-sm text-rose-200">
                      <Trash2 size={14} />
                    </button>
                    <PhotoUpload
                      onPhotoChange={(base64) => handlePhotoChange(item.id, base64)}
                      photoUrl={item.photoUrl}
                      name={item.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setIsModalOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{editingId ? "Editar Jovem" : "Novo Jovem"}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-zinc-400">Fechar</button>
            </div>
            {message ? <div className="rounded p-3 bg-rose-500/10 text-rose-200 mb-3">{message}</div> : null}
            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="grid lg:grid-cols-2 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid lg:grid-cols-2 gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <input value={cellName} onChange={(e) => setCellName(e.target.value)} placeholder="Grupo / Célula" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid lg:grid-cols-3 gap-2">
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid lg:grid-cols-3 gap-2">
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white">
                  <option value="">Estado civil</option>
                  {MARITAL_STATUS_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <input type="date" value={baptismDate} onChange={(e) => setBaptismDate(e.target.value)} className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid lg:grid-cols-2 gap-2">
                <input value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Indicação" className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white">
                  {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <label className="block">
                <PhotoUpload photoUrl={photoPreview || undefined} name={name || "Novo Jovem"} onPhotoChange={(b) => setPhotoPreview(b)} />
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações" rows={4} className="w-full rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-white" />

              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-xl bg-white/5">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-xl bg-emerald-500 text-white">{isSaving ? 'Salvando...' : (editingId ? 'Salvar' : 'Criar')}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
