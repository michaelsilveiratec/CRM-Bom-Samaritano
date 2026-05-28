import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Clock4,
  Gift,
  Image,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { sendWhatsAppMessage } from "../services/whatsapp";
import { compressImageFile, dataUrlSize } from "../utils/image";

type ScheduleStatus = "pendente" | "enviando" | "enviado" | "erro";

interface BirthdaySchedule {
  id: string;
  name: string;
  phone: string;
  dispatchDate: string;
  dispatchTime: string;
  message: string;
  photoUrl: string | null;
  photoName?: string;
  status: ScheduleStatus;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

const STORAGE_KEY = "birthday_schedules";

const defaultMessage = `Graca e paz, {nome}!

Hoje a {igreja} celebra sua vida com muita alegria.
Que Deus abencoe seu novo ciclo, fortaleca sua familia e conduza seus passos.

Receba nosso carinho e um forte abraco do {pastor}.`;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function renderTemplate(template: string, name: string) {
  const churchName = localStorage.getItem("settings_church_name") || "Igreja Bom Samaritano";
  const pastorName = localStorage.getItem("settings_pastor_name") || "Pastor";

  return template
    .replace(/\{nome\}/gi, name || "amigo")
    .replace(/\{igreja\}/gi, churchName)
    .replace(/\{pastor\}/gi, pastorName);
}

function normalizeStoredSchedules(value: string | null): BirthdaySchedule[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      id: String(item.id || Date.now()),
      name: String(item.name || ""),
      phone: String(item.phone || ""),
      dispatchDate: String(item.dispatchDate || todayISO()),
      dispatchTime: String(item.dispatchTime || "08:00"),
      message: String(item.message || defaultMessage),
      photoUrl: item.photoUrl || null,
      photoName: item.photoName,
      status: (item.status || "pendente") as ScheduleStatus,
      createdAt: String(item.createdAt || new Date().toISOString()),
      sentAt: item.sentAt,
      error: item.error,
    }));
  } catch {
    return [];
  }
}

export default function BirthdayScheduler() {
  const [schedules, setSchedules] = useState<BirthdaySchedule[]>(() =>
    normalizeStoredSchedules(localStorage.getItem(STORAGE_KEY))
  );
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dispatchDate: todayISO(),
    dispatchTime: "08:00",
    message: defaultMessage,
    photoUrl: null as string | null,
    photoName: "",
  });

  const pendingCount = schedules.filter((schedule) => schedule.status === "pendente").length;
  const sentCount = schedules.filter((schedule) => schedule.status === "enviado").length;
  const errorCount = schedules.filter((schedule) => schedule.status === "erro").length;

  const previewMessage = useMemo(
    () => renderTemplate(formData.message, formData.name || "Maria"),
    [formData.message, formData.name]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

  const showAlert = (text: string) => {
    setAlertMessage(text);
    window.setTimeout(() => setAlertMessage(""), 3500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      dispatchDate: todayISO(),
      dispatchTime: "08:00",
      message: defaultMessage,
      photoUrl: null,
      photoName: "",
    });
    setPhotoPreview(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Selecione uma imagem valida.");
      return;
    }

    setSaving(true);
    try {
      const base64 = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        initialQuality: 0.85,
      });
      setPhotoPreview(base64);
      setFormData((prev) => ({ ...prev, photoUrl: base64, photoName: file.name }));
    } catch (err: any) {
      showAlert(`Nao foi possivel processar a imagem: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = () => {
    if (!formData.name.trim()) {
      showAlert("Informe o nome da pessoa.");
      return;
    }

    if (!formData.phone.replace(/\D/g, "")) {
      showAlert("Informe um telefone de WhatsApp valido.");
      return;
    }

    if (!formData.message.trim()) {
      showAlert("Escreva a mensagem que sera enviada.");
      return;
    }

    if (!formData.dispatchDate || !formData.dispatchTime) {
      showAlert("Informe data e horario do disparo.");
      return;
    }

    const newSchedule: BirthdaySchedule = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      dispatchDate: formData.dispatchDate,
      dispatchTime: formData.dispatchTime,
      message: formData.message.trim(),
      photoUrl: formData.photoUrl,
      photoName: formData.photoName || undefined,
      status: "pendente",
      createdAt: new Date().toISOString(),
    };

    setSchedules((prev) => [newSchedule, ...prev]);
    showAlert("Disparo agendado com sucesso.");
    resetForm();
    setShowModal(false);
  };

  const sendSchedule = async (schedule: BirthdaySchedule) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === schedule.id ? { ...item, status: "enviando", error: undefined } : item
      )
    );

    const finalMessage = renderTemplate(schedule.message, schedule.name);
    const result = await sendWhatsAppMessage(schedule.phone, finalMessage, schedule.photoUrl || undefined);

    if (result.success) {
      setSchedules((prev) =>
        prev.map((item) =>
          item.id === schedule.id
            ? { ...item, status: "enviado", sentAt: new Date().toISOString(), error: undefined }
            : item
        )
      );
      showAlert(`Mensagem enviada para ${schedule.name}.`);
      return;
    }

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === schedule.id
          ? { ...item, status: "erro", error: result.error || "Falha no envio." }
          : item
      )
    );
    showAlert(`Erro ao enviar para ${schedule.name}: ${result.error || "Falha no envio."}`);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    showAlert("Disparo removido.");
  };

  useEffect(() => {
    const processDueSchedules = async () => {
      const now = new Date();
      const dueSchedules = schedules.filter((schedule) => {
        if (schedule.status !== "pendente") return false;
        const scheduledAt = new Date(`${schedule.dispatchDate}T${schedule.dispatchTime}:00`);
        return scheduledAt <= now;
      });

      for (const schedule of dueSchedules) {
        await sendSchedule(schedule);
      }
    };

    processDueSchedules();
    const interval = window.setInterval(processDueSchedules, 30 * 1000);
    return () => window.clearInterval(interval);
  }, [schedules]);

  const getStatusStyle = (status: ScheduleStatus) => {
    switch (status) {
      case "enviado":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "erro":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "enviando":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    }
  };

  const getStatusIcon = (status: ScheduleStatus) => {
    switch (status) {
      case "enviado":
        return <CheckCircle2 size={15} />;
      case "erro":
        return <AlertCircle size={15} />;
      case "enviando":
        return <Send size={15} />;
      default:
        return <Clock4 size={15} />;
    }
  };

  const getStatusLabel = (status: ScheduleStatus) => {
    switch (status) {
      case "enviado":
        return "Enviado";
      case "erro":
        return "Erro";
      case "enviando":
        return "Enviando";
      default:
        return "Pendente";
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const value = new Date(`${date}T${time}:00`);
    return Number.isNaN(value.getTime())
      ? `${date} ${time}`
      : value.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const imageSizeText = formData.photoUrl
    ? `${Math.round(dataUrlSize(formData.photoUrl) / 1024)} KB`
    : "";

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/70 to-zinc-950 border border-rose-500/20 shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <Gift className="text-rose-400" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Agendador de Aniversarios</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Envie mensagem personalizada com imagem no horario programado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Pendentes</span>
            <span className="text-sm font-bold text-amber-300">{pendingCount}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Enviados</span>
            <span className="text-sm font-bold text-emerald-300">{sentCount}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Erros</span>
            <span className="text-sm font-bold text-rose-300">{errorCount}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-lg font-semibold text-sm transition-all active:scale-95"
          >
            <Plus size={18} />
            Novo disparo
          </button>
        </div>
      </div>

      {alertMessage && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-semibold border ${
            alertMessage.toLowerCase().includes("erro") || alertMessage.toLowerCase().includes("nao")
              ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
          }`}
        >
          {alertMessage}
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="p-8 text-center bg-white/5 rounded-lg border border-dashed border-white/10">
          <Gift className="mx-auto mb-3 text-zinc-600" size={34} />
          <p className="text-zinc-300 text-sm font-semibold">Nenhum disparo agendado</p>
          <p className="text-zinc-500 text-xs mt-1">
            Crie um agendamento com nome, telefone, mensagem e uma imagem opcional.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="grid grid-cols-[56px_1fr] lg:grid-cols-[56px_1fr_auto] gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-rose-500/20 transition-all"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                {schedule.photoUrl ? (
                  <img src={schedule.photoUrl} alt={schedule.name} className="w-full h-full object-cover" />
                ) : (
                  <Image size={21} className="text-zinc-600" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white">{schedule.name}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusStyle(
                      schedule.status
                    )}`}
                  >
                    {getStatusIcon(schedule.status)}
                    {getStatusLabel(schedule.status)}
                  </span>
                </div>
                <div className="grid gap-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Phone size={12} />
                    {schedule.phone}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={12} />
                    {formatDateTime(schedule.dispatchDate, schedule.dispatchTime)}
                  </span>
                  <span className="flex items-center gap-2 min-w-0">
                    <MessageSquare size={12} />
                    <span className="truncate">{renderTemplate(schedule.message, schedule.name)}</span>
                  </span>
                  {schedule.sentAt && (
                    <span className="text-emerald-400">
                      Enviado em {new Date(schedule.sentAt).toLocaleString("pt-BR")}
                    </span>
                  )}
                  {schedule.error && <span className="text-rose-400">Erro: {schedule.error}</span>}
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 flex items-center justify-end gap-2">
                {schedule.status !== "enviado" && (
                  <button
                    type="button"
                    onClick={() => sendSchedule(schedule)}
                    disabled={schedule.status === "enviando"}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Send size={14} />
                    Enviar agora
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-2 text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Excluir disparo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Novo disparo de aniversario</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure o envio com mensagem personalizada e imagem opcional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
              <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Nome da pessoa
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Maria Silva"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: 21 99999-9999"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Data do disparo
                    </label>
                    <input
                      type="date"
                      value={formData.dispatchDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dispatchDate: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Horario
                    </label>
                    <input
                      type="time"
                      value={formData.dispatchTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dispatchTime: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    rows={8}
                    placeholder="Escreva a mensagem de aniversario..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-zinc-400">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{"{nome}"}</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{"{igreja}"}</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{"{pastor}"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Imagem opcional
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    id="birthday-image-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="birthday-image-input"
                    className="flex items-center justify-center gap-2 w-full bg-white/5 border border-dashed border-white/20 rounded-lg px-4 py-6 cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <Image size={18} className="text-zinc-400" />
                    <span className="text-sm text-zinc-400">
                      {formData.photoName || "Selecionar imagem para enviar junto"}
                    </span>
                  </label>

                  {photoPreview && (
                    <div className="mt-3 flex gap-3 items-start">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-28 h-28 object-cover rounded-lg border border-white/10"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-400">
                          Imagem otimizada para envio. Tamanho aproximado: {imageSizeText}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setFormData((prev) => ({ ...prev, photoUrl: null, photoName: "" }));
                          }}
                          className="mt-3 px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/20 transition-all"
                        >
                          Remover imagem
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-black/20 border-t lg:border-t-0 lg:border-l border-white/10">
                <div className="sticky top-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-rose-400" />
                      Preview do WhatsApp
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Assim a mensagem sera montada no envio.</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 space-y-3">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
                    ) : (
                      <div className="h-40 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-zinc-600">
                        <Image size={32} />
                      </div>
                    )}
                    <div className="rounded-lg bg-emerald-600/15 border border-emerald-500/20 p-3 text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                      {previewMessage}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <Clock size={14} className="text-amber-300 mb-2" />
                      <p className="text-zinc-500">Envio</p>
                      <p className="text-zinc-200 font-semibold mt-1">
                        {formatDateTime(formData.dispatchDate, formData.dispatchTime)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <Phone size={14} className="text-emerald-300 mb-2" />
                      <p className="text-zinc-500">Destino</p>
                      <p className="text-zinc-200 font-semibold mt-1 truncate">
                        {formData.phone || "Nao informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg font-semibold text-sm transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSchedule}
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 active:scale-95"
                    >
                      {saving ? "Processando..." : "Agendar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
