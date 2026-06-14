import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Check, ImagePlus } from "lucide-react";
import { createServerChild } from "../services/crm.service";
import { compressImageFile, dataUrlSize } from "../utils/image";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

const STATUS_OPTIONS = ["Ativo", "Inativo", "Licença", "Pendente"];
const MARITAL_STATUS_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viuvo(a)"];

export default function MobileChildren() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role] = useState("Criança");
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
  const [photoStepDone, setPhotoStepDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePhotoChange = async (file?: File | null) => {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      const size = dataUrlSize(compressed);
      if (size > 1_200_000) {
        setPhotoPreview(null);
        setMessage("A imagem é muito grande e foi omitida do envio.");
      } else {
        setPhotoPreview(compressed);
        setMessage(null);
      }
    } catch (err) {
      console.error(err);
      setPhotoPreview(null);
      setMessage("Erro ao processar imagem. Envio sem foto.");
    }
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
    setPhotoStepDone(false);
    setMessage(null);
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
        role,
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
        source: "mobile",
      };
      const size = new TextEncoder().encode(JSON.stringify(payload)).length;
      if (size > 950 * 1024) {
        payload.photoUrl = undefined;
        setMessage("Imagem muito grande; envio efetuado sem foto para evitar erro do servidor.");
      }

      const response = await createServerChild(payload);
      const newChildRecord = { ...response.child, createdByMobile: true };
      const existingChildren = localStorage.getItem("children_data");
      let childrenList: any[] = [];
      try {
        childrenList = existingChildren ? JSON.parse(existingChildren) : [];
      } catch {
        childrenList = [];
      }
      cacheRecordsWithoutEmbeddedPhotos("children_data", [newChildRecord, ...childrenList]);

      setSuccessMessage("Cadastro realizado com sucesso!");
      resetForm();
      setTimeout(() => navigate("/mobile"), 3500);
    } catch (error: any) {
      setMessage(error.message || "Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex min-h-[45vh] items-start justify-center pt-8">
        <div className="flex w-full items-center gap-5 rounded-3xl border border-emerald-300/60 bg-[#eafff6] px-6 py-6 shadow-lg shadow-emerald-500/10">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <Check size={38} strokeWidth={4} />
          </div>
          <h3 className="text-xl font-extrabold text-emerald-950">{successMessage}</h3>
        </div>
      </div>
    );
  }

  if (!photoStepDone) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">Primeiro passo</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Tire sua foto</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">A foto ajuda a identificar a criança no sistema.</p>
            </div>
            <Link to="/mobile" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
              Voltar
            </Link>
          </div>
        </div>

        {message ? (
          <div className="rounded-3xl border border-white/10 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">
            {message}
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center">
          <div className="mx-auto grid h-48 w-48 place-items-center overflow-hidden rounded-full border border-fuchsia-500/25 bg-black/20">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview da foto" className="h-full w-full object-cover" />
            ) : (
              <Camera size={64} className="text-fuchsia-300" />
            )}
          </div>

          <label className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-3xl bg-fuchsia-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400">
            <ImagePlus size={18} />
            {photoPreview ? "Trocar foto" : "Tirar foto agora"}
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={() => setPhotoStepDone(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10"
          >
            {photoPreview ? "Continuar cadastro" : "Continuar sem foto"}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Nova Criança</h2>
            <p className="text-sm text-zinc-400">Registre uma criança no sistema mobile.</p>
          </div>
          <Link to="/mobile" className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
            Voltar
          </Link>
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-3">
          <div className="w-20 h-20 rounded-full bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-zinc-400">Foto</span>
            )}
          </div>
          <div className="flex-1 grid gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                (async () => {
                  try {
                    const compressed = await compressImageFile(f);
                    const size = dataUrlSize(compressed);
                    if (size > 1_200_000) {
                      setPhotoPreview(null);
                      setMessage("A imagem é muito grande e foi omitida do envio.");
                    } else {
                      setPhotoPreview(compressed);
                    }
                  } catch (err) {
                    console.error(err);
                    setMessage("Erro ao processar imagem. Envio sem foto.");
                    setPhotoPreview(null);
                  }
                })();
              }}
              className="text-xs text-zinc-300"
            />
            {photoPreview ? (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="text-xs text-rose-400"
              >
                Remover foto
              </button>
            ) : null}
          </div>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <input
          value={cellName}
          onChange={(e) => setCellName(e.target.value)}
          placeholder="Nome do grupo / célula"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Endereço"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bairro"
            className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Cidade"
            className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
          />
        </div>
        <select
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        >
          <option value="">Estado civil</option>
          {MARITAL_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Data de Nascimento
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Data do Batismo
            <input
              type="date"
              value={baptismDate}
              onChange={(e) => setBaptismDate(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
            />
          </label>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Data de registro: automática
        </div>
        <input
          value={referredBy}
          onChange={(e) => setReferredBy(e.target.value)}
          placeholder="Indicação"
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações"
          rows={4}
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-3xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Enviando..." : "Enviar cadastro"}
        </button>
      </form>
    </div>
  );
}
