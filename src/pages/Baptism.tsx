import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Droplets,
  Edit2,
  FileText,
  Plus,
  Printer,
  Trash2,
  UploadCloud,
  UserCheck,
  Users,
  Waves,
} from "lucide-react";
import { createServerMember } from "../services/crm.service";
import { compressImageFile } from "../utils/image";
import { cacheRecordsWithoutEmbeddedPhotos } from "../utils/localCache";

type BaptismStatus = "Novo" | "Em discipulado" | "Aprovado para batismo" | "Batizado";

interface BaptismCandidate {
  id: number;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  photoUrl?: string;
  gender: string;
  maritalStatus: string;
  conversionDate: string;
  congregates: boolean;
  attendanceTime: string;
  didDiscipleship: boolean;
  baptismCourseDone: boolean;
  plannedBaptismDate: string;
  baptismLocation: string;
  responsiblePastor: string;
  pastoralNotes: string;
  status: BaptismStatus;
  checklist: {
    acceptedJesus: boolean;
    attendsServices: boolean;
    didDiscipleship: boolean;
    participatesCell: boolean;
    courseDone: boolean;
    pastoralInterview: boolean;
  };
  baptizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "baptism_candidates_data";
const STATUS_OPTIONS: BaptismStatus[] = ["Novo", "Em discipulado", "Aprovado para batismo", "Batizado"];
const GENDER_OPTIONS = ["Masculino", "Feminino"];
const MARITAL_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viuvo(a)", "Uniao estavel"];

const emptyChecklist = {
  acceptedJesus: false,
  attendsServices: false,
  didDiscipleship: false,
  participatesCell: false,
  courseDone: false,
  pastoralInterview: false,
};

const createEmptyCandidate = (): BaptismCandidate => ({
  id: 0,
  fullName: "",
  birthDate: "",
  phone: "",
  address: "",
  neighborhood: "",
  city: "",
  photoUrl: "",
  gender: "",
  maritalStatus: "",
  conversionDate: "",
  congregates: true,
  attendanceTime: "",
  didDiscipleship: false,
  baptismCourseDone: false,
  plannedBaptismDate: "",
  baptismLocation: "",
  responsiblePastor: localStorage.getItem("settings_pastor_name") || "Pastor",
  pastoralNotes: "",
  status: "Novo",
  checklist: { ...emptyChecklist },
  baptizedAt: "",
  createdAt: "",
  updatedAt: "",
});

const readCandidates = (): BaptismCandidate[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveCandidates = (items: BaptismCandidate[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const statusClasses: Record<BaptismStatus, string> = {
  Novo: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  "Em discipulado": "border-amber-500/30 bg-amber-500/10 text-amber-200",
  "Aprovado para batismo": "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  Batizado: "border-purple-500/30 bg-purple-500/10 text-purple-200",
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

const formatLongDate = (date?: string) => {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${Number(day)} de ${months[Number(month) - 1] || month} de ${year}`;
};

const escapeHtml = (value?: string) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function Baptism() {
  const [activeTab, setActiveTab] = useState<"new" | "list" | "agenda" | "certificates" | "reports">("new");
  const [candidates, setCandidates] = useState<BaptismCandidate[]>(readCandidates);
  const [form, setForm] = useState<BaptismCandidate>(createEmptyCandidate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return {
      total: candidates.length,
      discipulado: candidates.filter((item) => item.status === "Em discipulado").length,
      aprovados: candidates.filter((item) => item.status === "Aprovado para batismo").length,
      batizadosMes: candidates.filter((item) => item.status === "Batizado" && (item.baptizedAt || "").startsWith(currentMonth)).length,
      ultimoBatismo: candidates
        .filter((item) => item.status === "Batizado" && item.baptizedAt)
        .sort((a, b) => String(b.baptizedAt).localeCompare(String(a.baptizedAt)))[0],
    };
  }, [candidates]);

  const nextBaptism = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return candidates
      .filter((item) => item.plannedBaptismDate && item.plannedBaptismDate >= today && item.status !== "Batizado")
      .sort((a, b) => itemDate(a).localeCompare(itemDate(b)))[0];
  }, [candidates]);

  function itemDate(item: BaptismCandidate) {
    return item.plannedBaptismDate || "9999-99-99";
  }

  const updateField = (field: keyof BaptismCandidate, value: any) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateChecklist = (field: keyof BaptismCandidate["checklist"], value: boolean) => {
    setForm((current) => ({
      ...current,
      checklist: { ...current.checklist, [field]: value },
      didDiscipleship: field === "didDiscipleship" ? value : current.didDiscipleship,
      baptismCourseDone: field === "courseDone" ? value : current.baptismCourseDone,
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, { maxWidth: 900, maxHeight: 900, initialQuality: 0.82 });
      updateField("photoUrl", compressed);
    } catch (error) {
      console.error(error);
      alert("Nao foi possivel processar a foto.");
    } finally {
      event.target.value = "";
    }
  };

  const resetForm = () => {
    setForm(createEmptyCandidate());
    setEditingId(null);
  };

  const persist = (items: BaptismCandidate[]) => {
    setCandidates(items);
    saveCandidates(items);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      alert("Informe nome completo e telefone.");
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();
    const candidate: BaptismCandidate = {
      ...form,
      id: editingId || Date.now(),
      fullName: form.fullName.trim(),
      baptizedAt: form.status === "Batizado" ? form.baptizedAt || new Date().toISOString().slice(0, 10) : form.baptizedAt,
      createdAt: form.createdAt || now,
      updatedAt: now,
    };

    const nextCandidates = editingId
      ? candidates.map((item) => (item.id === editingId ? candidate : item))
      : [candidate, ...candidates];

    persist(nextCandidates);
    setMessage(editingId ? "Batizante atualizado com sucesso." : "Batizante cadastrado com sucesso.");
    window.setTimeout(() => setMessage(""), 3000);
    resetForm();
    setActiveTab("list");
    setIsSaving(false);
  };

  const editCandidate = (candidate: BaptismCandidate) => {
    setForm({ ...createEmptyCandidate(), ...candidate, checklist: { ...emptyChecklist, ...candidate.checklist } });
    setEditingId(candidate.id);
    setActiveTab("new");
  };

  const deleteCandidate = (id: number) => {
    if (!window.confirm("Deseja excluir este batizante?")) return;
    persist(candidates.filter((item) => item.id !== id));
  };

  const updateCandidateStatus = (candidate: BaptismCandidate, status: BaptismStatus) => {
    const updated = {
      ...candidate,
      status,
      baptizedAt: status === "Batizado" ? candidate.baptizedAt || new Date().toISOString().slice(0, 10) : candidate.baptizedAt,
      updatedAt: new Date().toISOString(),
    };
    persist(candidates.map((item) => (item.id === candidate.id ? updated : item)));
  };

  const convertToMember = async (candidate: BaptismCandidate) => {
    try {
      const payload = {
        name: candidate.fullName,
        role: "Membro",
        phone: candidate.phone,
        email: "",
        cellName: "",
        address: candidate.address,
        neighborhood: candidate.neighborhood,
        city: candidate.city,
        maritalStatus: candidate.maritalStatus,
        baptismDate: candidate.baptizedAt || new Date().toISOString().slice(0, 10),
        birthDate: candidate.birthDate,
        visitDate: candidate.createdAt.slice(0, 10),
        referredBy: "Modulo Batismo",
        status: "Ativo",
        notes: `Convertido automaticamente apos batismo. Pastor responsavel: ${candidate.responsiblePastor}. ${candidate.pastoralNotes || ""}`,
        photoUrl: candidate.photoUrl || undefined,
        source: "baptism",
      };
      const response = await createServerMember(payload);
      const existingMembers = JSON.parse(localStorage.getItem("members_data") || "[]");
      cacheRecordsWithoutEmbeddedPhotos("members_data", [{ ...response.member, createdFromBaptism: true }, ...existingMembers]);
      setMessage(`${candidate.fullName} foi convertido em membro.`);
      window.setTimeout(() => setMessage(""), 3500);
    } catch (error: any) {
      alert(error.message || "Nao foi possivel converter em membro.");
    }
  };

  const generateCertificate = (candidate: BaptismCandidate) => {
    const churchName = localStorage.getItem("settings_church_name") || "Bom Samaritano";
    const pastorName = candidate.responsiblePastor || localStorage.getItem("settings_pastor_name") || "Michael Ramos";
    const candidateName = escapeHtml(candidate.fullName);
    const safeChurchName = escapeHtml(churchName);
    const safePastorName = escapeHtml(pastorName);
    const baptismDate = candidate.baptizedAt || candidate.plannedBaptismDate;
    const validationCode = `BT-${candidate.id}`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <title>Certificado de Batismo - ${candidateName}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #dfe9e3;
              color: #0d4b35;
              font-family: "Segoe UI", Arial, sans-serif;
            }
            .cert {
              position: relative;
              width: 1123px;
              height: 794px;
              overflow: hidden;
              padding: 42px 66px 38px;
              text-align: center;
              background:
                radial-gradient(circle at 81% 29%, rgba(218, 241, 232, .78) 0 16%, transparent 35%),
                radial-gradient(circle at 74% 61%, rgba(126, 202, 184, .28) 0 10%, transparent 30%),
                linear-gradient(105deg, rgba(255,255,255,.96), rgba(249,251,247,.95) 62%, rgba(231,244,238,.88));
              box-shadow: 0 24px 80px rgba(0,0,0,.22);
              isolation: isolate;
            }
            .cert::before,
            .cert::after {
              content: "";
              position: absolute;
              inset: 18px;
              border: 2px solid #c79b3c;
              pointer-events: none;
              z-index: 3;
            }
            .cert::after {
              inset: 28px;
              border-width: 1px;
              border-color: rgba(199, 155, 60, .55);
            }
            .corner {
              position: absolute;
              width: 360px;
              height: 360px;
              border-radius: 0 0 0 100%;
              background:
                linear-gradient(140deg, #0b4d39 0 54%, #c89b3c 55% 60%, #0d5b43 61% 100%);
              box-shadow: inset 18px -18px 24px rgba(0,0,0,.18);
              z-index: 1;
            }
            .corner.top { top: -190px; right: -170px; transform: rotate(6deg); }
            .corner.bottom { right: -140px; bottom: -220px; transform: rotate(185deg); }
            .gold-curve {
              position: absolute;
              right: -34px;
              bottom: 2px;
              width: 360px;
              height: 220px;
              border-top: 12px solid #c89b3c;
              border-radius: 100% 0 0 0;
              transform: rotate(-13deg);
              z-index: 2;
              opacity: .9;
            }
            .leaf {
              position: absolute;
              left: 62px;
              top: 56px;
              width: 142px;
              height: 260px;
              opacity: .18;
              z-index: 0;
            }
            .leaf span {
              position: absolute;
              width: 42px;
              height: 100px;
              border-radius: 50% 0 50% 0;
              background: #0d4b35;
              transform-origin: bottom center;
            }
            .leaf span:nth-child(1) { left: 48px; top: 0; transform: rotate(14deg); }
            .leaf span:nth-child(2) { left: 20px; top: 50px; transform: rotate(-30deg); }
            .leaf span:nth-child(3) { left: 74px; top: 64px; transform: rotate(42deg); }
            .leaf span:nth-child(4) { left: 4px; top: 118px; transform: rotate(-42deg); }
            .leaf span:nth-child(5) { left: 86px; top: 128px; transform: rotate(55deg); }
            .leaf::after {
              content: "";
              position: absolute;
              left: 66px;
              top: 24px;
              width: 4px;
              height: 228px;
              border-radius: 999px;
              background: #0d4b35;
              transform: rotate(20deg);
            }
            .dove {
              position: absolute;
              right: 128px;
              top: 150px;
              font-size: 62px;
              color: rgba(13, 75, 53, .16);
              transform: rotate(-8deg);
              z-index: 2;
            }
            .water {
              position: absolute;
              right: 68px;
              bottom: 122px;
              width: 325px;
              height: 160px;
              z-index: 1;
              opacity: .86;
              background:
                radial-gradient(ellipse at 54% 73%, rgba(255,255,255,.7) 0 5%, transparent 7%),
                radial-gradient(ellipse at 48% 72%, rgba(31,129,113,.24) 0 32%, transparent 34%),
                linear-gradient(180deg, transparent 0 35%, rgba(82, 169, 154, .22) 36% 100%);
              border-bottom: 3px solid rgba(31,129,113,.35);
              border-radius: 20% 55% 45% 42%;
            }
            .water::before {
              content: "";
              position: absolute;
              right: 96px;
              bottom: 46px;
              width: 126px;
              height: 126px;
              border: 4px solid rgba(31,129,113,.45);
              border-left-color: transparent;
              border-bottom-color: transparent;
              border-radius: 12% 86% 43% 86%;
              transform: rotate(45deg);
            }
            .bubble {
              position: absolute;
              right: 294px;
              top: 270px;
              width: 9px;
              height: 9px;
              border-radius: 999px;
              border: 1.5px solid rgba(31,129,113,.48);
              box-shadow: 28px 20px 0 -2px rgba(31,129,113,.32), 48px -10px 0 -3px rgba(31,129,113,.28), 70px 18px 0 -4px rgba(31,129,113,.3);
              z-index: 2;
            }
            .content {
              position: relative;
              z-index: 4;
              height: 100%;
            }
            .cross {
              margin: 0 auto 12px;
              width: 48px;
              height: 58px;
              position: relative;
            }
            .cross::before,
            .cross::after {
              content: "";
              position: absolute;
              background: #0d4b35;
              left: 50%;
              transform: translateX(-50%);
            }
            .cross::before { width: 9px; height: 42px; top: 0; }
            .cross::after { width: 34px; height: 8px; top: 14px; }
            .waves {
              position: absolute;
              left: 4px;
              bottom: 2px;
              width: 40px;
              height: 18px;
              background:
                radial-gradient(ellipse at 12px 7px, transparent 0 8px, #0d4b35 8px 10px, transparent 10px),
                radial-gradient(ellipse at 28px 7px, transparent 0 8px, #0d4b35 8px 10px, transparent 10px);
              opacity: .95;
            }
            h1 {
              margin: 0;
              color: #0d4b35;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 70px;
              font-weight: 400;
              letter-spacing: 21px;
              line-height: 1;
            }
            .subtitle {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 24px;
              margin-top: 16px;
              color: #0d4b35;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 27px;
              letter-spacing: 16px;
              font-weight: 600;
            }
            .subtitle::before,
            .subtitle::after {
              content: "";
              width: 46px;
              height: 1px;
              background: #c89b3c;
              box-shadow: 15px 0 0 -13px #c89b3c;
            }
            .certify {
              margin: 26px 0 8px;
              color: #1f2f2c;
              font: 400 22px Georgia, serif;
            }
            .name {
              display: inline-block;
              min-width: 650px;
              margin: 0 auto;
              padding: 0 28px 16px;
              border-bottom: 2px solid #c89b3c;
              color: #0d4b35;
              font-family: "Segoe Script", "Brush Script MT", cursive;
              font-size: 58px;
              line-height: 1.05;
              white-space: nowrap;
              transform: rotate(-1deg);
            }
            .divider-dot {
              margin: -9px auto 18px;
              width: 8px;
              height: 8px;
              background: #c89b3c;
              transform: rotate(45deg);
            }
            .main-text {
              max-width: 670px;
              margin: 0 auto;
              color: #263936;
              font-size: 19px;
              line-height: 1.52;
            }
            .verse {
              display: grid;
              grid-template-columns: auto 1fr;
              align-items: center;
              gap: 14px;
              max-width: 460px;
              margin: 24px auto 18px;
              color: #0d4b35;
              font-weight: 800;
              font-size: 18px;
              line-height: 1.32;
            }
            .verse small { display: block; color: #263936; font-weight: 500; font-size: 17px; }
            .book {
              width: 48px;
              height: 38px;
              border: 3px solid #0d4b35;
              border-radius: 4px;
              position: relative;
            }
            .book::before {
              content: "";
              position: absolute;
              left: 50%;
              top: 0;
              bottom: 0;
              border-left: 3px solid #0d4b35;
            }
            .book::after {
              content: "";
              position: absolute;
              left: 7px;
              right: 7px;
              top: 12px;
              height: 3px;
              background: #0d4b35;
              box-shadow: 0 9px 0 #0d4b35;
            }
            .info-row {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 26px;
              max-width: 780px;
              margin: 30px auto 40px;
              text-align: left;
            }
            .info {
              display: grid;
              grid-template-columns: 44px 1fr;
              gap: 12px;
              align-items: center;
              min-height: 58px;
              border-right: 1px solid rgba(199,155,60,.75);
            }
            .info:last-child { border-right: none; }
            .info .icon {
              display: grid;
              place-items: center;
              width: 36px;
              height: 36px;
              color: #0d4b35;
              font-size: 28px;
            }
            .info b {
              display: block;
              color: #0d4b35;
              font-size: 13px;
              letter-spacing: .8px;
              text-transform: uppercase;
            }
            .info strong {
              display: block;
              margin-top: 5px;
              color: #202b29;
              font-size: 16px;
            }
            .footer {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              align-items: end;
              gap: 42px;
              padding: 0 86px;
            }
            .signature {
              text-align: center;
              color: #111;
            }
            .signature .script {
              height: 42px;
              color: #111;
              font-family: "Segoe Script", "Brush Script MT", cursive;
              font-size: 30px;
              line-height: 1;
            }
            .line {
              width: 230px;
              height: 1px;
              margin: 0 auto 9px;
              background: #b88732;
            }
            .signature b {
              display: block;
              color: #1a1d1f;
              font-size: 15px;
              letter-spacing: .8px;
            }
            .signature span {
              display: block;
              margin-top: 4px;
              color: #232a2a;
              font-size: 13px;
            }
            .footer-verse {
              color: #2d3a37;
              font-size: 12px;
              line-height: 1.45;
            }
            .hands {
              margin: 0 auto 8px;
              color: #0d4b35;
              font-size: 34px;
            }
            .seal {
              position: absolute;
              right: 116px;
              bottom: 72px;
              z-index: 5;
              width: 142px;
              height: 142px;
              border-radius: 999px;
              display: grid;
              place-items: center;
              background:
                radial-gradient(circle, #0d4b35 0 58%, transparent 59%),
                conic-gradient(from 0deg, #91631f, #ffd56f, #b87a21, #fff0a4, #91631f);
              box-shadow: 0 10px 22px rgba(0,0,0,.22);
              color: #f9d66a;
              border: 4px solid #c89b3c;
            }
            .seal-inner {
              width: 112px;
              height: 112px;
              border: 2px solid rgba(255,213,111,.8);
              border-radius: 999px;
              display: grid;
              place-items: center;
              padding: 16px 10px;
              font-family: Georgia, serif;
              font-size: 16px;
              line-height: 1.1;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .seal small {
              display: block;
              margin-top: 8px;
              font: 700 10px "Segoe UI", Arial, sans-serif;
              letter-spacing: 0;
              text-transform: none;
            }
            .validation {
              position: absolute;
              left: 38px;
              bottom: 28px;
              z-index: 5;
              color: rgba(13,75,53,.72);
              font-size: 11px;
              font-weight: 700;
            }
            @media print {
              body { background: white; display: block; }
              .cert { width: 297mm; height: 210mm; margin: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <main class="cert">
            <div class="corner top"></div>
            <div class="corner bottom"></div>
            <div class="gold-curve"></div>
            <div class="leaf"><span></span><span></span><span></span><span></span><span></span></div>
            <div class="dove">&#10023;</div>
            <div class="water"></div>
            <div class="bubble"></div>

            <section class="content">
              <div class="cross"><div class="waves"></div></div>
              <h1>CERTIFICADO</h1>
              <div class="subtitle">DE BATISMO</div>

              <p class="certify">Certificamos que</p>
              <div class="name">${candidateName}</div>
              <div class="divider-dot"></div>
              <p class="main-text">
                foi batizado(a) nas aguas, em nome do Pai, do Filho e do Espirito Santo,
                conforme a ordem do Senhor Jesus Cristo, e, assim, declara publicamente
                a sua fe e compromisso em segui-lo.
              </p>

              <div class="verse">
                <span class="book"></span>
                <span>&ldquo;Quem crer e for batizado sera salvo;&rdquo;<small>Marcos 16:16</small></span>
              </div>

              <div class="info-row">
                <div class="info">
                  <span class="icon">&#128197;</span>
                  <span><b>Data do Batismo</b><strong>${formatLongDate(baptismDate)}</strong></span>
                </div>
                <div class="info">
                  <span class="icon">&#9962;</span>
                  <span><b>Igreja</b><strong>${safeChurchName}</strong></span>
                </div>
                <div class="info">
                  <span class="icon">&#128100;</span>
                  <span><b>Pastor Oficiante</b><strong>Pr. ${safePastorName}</strong></span>
                </div>
              </div>

              <div class="footer">
                <div class="signature">
                  <div class="script">Michael Ramos</div>
                  <div class="line"></div>
                  <b>PR. MICHAEL RAMOS</b>
                  <span>Pastor Presidente</span>
                </div>
                <div class="footer-verse">
                  <div class="hands">&#9825;</div>
                  Arrependam-se e sejam batizados cada um de voces em nome de Jesus Cristo
                  para perdao dos pecados.<br/>Atos 2:38
                </div>
                <div class="signature">
                  <div class="script">${safePastorName}</div>
                  <div class="line"></div>
                  <b>PR. ${safePastorName.toUpperCase()}</b>
                  <span>Ministro de Batismo</span>
                </div>
              </div>
            </section>

            <div class="seal">
              <div class="seal-inner">Ordenanca<br/>de Cristo<small>Mateus 28:19</small></div>
            </div>
            <div class="validation">Validacao: ${validationCode}</div>
          </main>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const checklistItems: Array<[keyof BaptismCandidate["checklist"], string]> = [
    ["acceptedJesus", "Aceitou Jesus"],
    ["attendsServices", "Frequenta cultos"],
    ["didDiscipleship", "Fez discipulado"],
    ["participatesCell", "Participa da celula"],
    ["courseDone", "Curso concluido"],
    ["pastoralInterview", "Entrevista pastoral"],
  ];

  const tabs = [
    { id: "new", label: "Novo Batizante", icon: Plus },
    { id: "list", label: "Lista de Batizantes", icon: Users },
    { id: "agenda", label: "Agenda de Batismo", icon: Calendar },
    { id: "certificates", label: "Certificados", icon: Award },
    { id: "reports", label: "Relatorios", icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
            <Droplets className="text-teal-400" size={32} />
            Batismo
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Acompanhe a jornada espiritual do novo convertido ate o batismo nas aguas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setActiveTab("new");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-500"
        >
          <Plus size={18} />
          Novo Batizante
        </button>
      </div>

      {message ? (
        <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-5 py-3 text-sm font-bold text-teal-200">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Candidatos" value={stats.total} tone="teal" />
        <StatCard icon={ClipboardCheck} label="Em discipulado" value={stats.discipulado} tone="amber" />
        <StatCard icon={CheckCircle} label="Aprovados" value={stats.aprovados} tone="emerald" />
        <StatCard icon={Waves} label="Batizados no mes" value={stats.batizadosMes} tone="purple" />
      </div>

      <div className="glass-card border border-teal-500/20 bg-teal-500/10 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-teal-300">Proximo batismo</p>
            <h3 className="mt-1 text-xl font-extrabold text-white">
              {nextBaptism ? `${formatDate(nextBaptism.plannedBaptismDate)} - ${nextBaptism.fullName}` : "Nenhuma data prevista"}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              {nextBaptism ? `${nextBaptism.baptismLocation || "Local a definir"} - ${nextBaptism.responsiblePastor}` : "Cadastre candidatos e informe a data prevista do batismo."}
            </p>
          </div>
          <div className="text-sm font-semibold text-zinc-300">
            Ultimo batismo: {stats.ultimoBatismo ? `${stats.ultimoBatismo.fullName} em ${formatDate(stats.ultimoBatismo.baptizedAt)}` : "-"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-teal-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "new" && (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-base font-extrabold text-white">Foto do Batizante</h3>
              <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-teal-500/30 bg-teal-500/5 p-6 text-center transition hover:bg-teal-500/10">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt={form.fullName || "Batizante"} className="h-48 w-48 rounded-full object-cover" />
                ) : (
                  <>
                    <UploadCloud size={34} className="text-teal-300" />
                    <span className="mt-3 text-sm font-bold text-zinc-300">Upload da foto</span>
                    <span className="mt-1 text-xs text-zinc-500">PNG ou JPG com preview automatico</span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {form.photoUrl ? (
                <button type="button" onClick={() => updateField("photoUrl", "")} className="mt-3 text-xs font-bold text-rose-300">
                  Remover foto
                </button>
              ) : null}
            </div>

            <div className="glass-card p-6">
              <h3 className="mb-4 text-base font-extrabold text-white">Checklist espiritual</h3>
              <div className="space-y-3">
                {checklistItems.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.checklist[key]}
                      onChange={(e) => updateChecklist(key, e.target.checked)}
                      className="h-4 w-4 accent-teal-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-white">{editingId ? "Editar Batizante" : "Cadastro de Batizante"}</h3>
              {editingId ? (
                <button type="button" onClick={resetForm} className="text-xs font-bold text-zinc-400 hover:text-white">
                  Cancelar edicao
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Nome Completo" required value={form.fullName} onChange={(value) => updateField("fullName", value)} />
              <TextInput label="Telefone" required value={form.phone} onChange={(value) => updateField("phone", value)} />
              <DateInput label="Data de Nascimento" value={form.birthDate} onChange={(value) => updateField("birthDate", value)} />
              <SelectInput label="Sexo" value={form.gender} options={["", ...GENDER_OPTIONS]} onChange={(value) => updateField("gender", value)} />
              <SelectInput label="Estado Civil" value={form.maritalStatus} options={["", ...MARITAL_OPTIONS]} onChange={(value) => updateField("maritalStatus", value)} />
              <DateInput label="Data da Conversao" value={form.conversionDate} onChange={(value) => updateField("conversionDate", value)} />
              <TextInput label="Endereco" value={form.address} onChange={(value) => updateField("address", value)} />
              <TextInput label="Bairro" value={form.neighborhood} onChange={(value) => updateField("neighborhood", value)} />
              <TextInput label="Cidade" value={form.city} onChange={(value) => updateField("city", value)} />
              <SelectInput label="Ja congrega?" value={form.congregates ? "Sim" : "Nao"} options={["Sim", "Nao"]} onChange={(value) => updateField("congregates", value === "Sim")} />
              <TextInput label="Frequenta ha quanto tempo?" value={form.attendanceTime} onChange={(value) => updateField("attendanceTime", value)} />
              <SelectInput label="Ja fez discipulado?" value={form.didDiscipleship ? "Sim" : "Nao"} options={["Sim", "Nao"]} onChange={(value) => updateField("didDiscipleship", value === "Sim")} />
              <SelectInput label="Curso de Batismo concluido?" value={form.baptismCourseDone ? "Sim" : "Nao"} options={["Sim", "Nao"]} onChange={(value) => updateField("baptismCourseDone", value === "Sim")} />
              <DateInput label="Data prevista do Batismo" value={form.plannedBaptismDate} onChange={(value) => updateField("plannedBaptismDate", value)} />
              <TextInput label="Local do Batismo" value={form.baptismLocation} onChange={(value) => updateField("baptismLocation", value)} />
              <TextInput label="Pastor responsavel" value={form.responsiblePastor} onChange={(value) => updateField("responsiblePastor", value)} />
              <SelectInput label="Status do Batizante" value={form.status} options={STATUS_OPTIONS} onChange={(value) => updateField("status", value as BaptismStatus)} />
              {form.status === "Batizado" ? (
                <DateInput label="Data realizada do Batismo" value={form.baptizedAt || ""} onChange={(value) => updateField("baptizedAt", value)} />
              ) : null}
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">Observacoes pastorais</span>
              <textarea
                rows={5}
                value={form.pastoralNotes}
                onChange={(e) => updateField("pastoralNotes", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-teal-400"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-500 disabled:opacity-60"
            >
              <CheckCircle size={18} />
              {isSaving ? "Salvando..." : editingId ? "Salvar alteracoes" : "Cadastrar batizante"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "list" && (
        <CandidateList
          candidates={candidates}
          onEdit={editCandidate}
          onDelete={deleteCandidate}
          onStatus={updateCandidateStatus}
          onCertificate={generateCertificate}
          onConvert={convertToMember}
        />
      )}

      {activeTab === "agenda" && (
        <Agenda candidates={candidates} onStatus={updateCandidateStatus} />
      )}

      {activeTab === "certificates" && (
        <Certificates candidates={candidates.filter((item) => item.status === "Batizado")} onCertificate={generateCertificate} />
      )}

      {activeTab === "reports" && (
        <Reports candidates={candidates} stats={stats} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <div className={`glass-card border p-5 border-${tone}-500/20 bg-${tone}-500/5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-white">{value}</h3>
        </div>
        <div className={`rounded-xl border border-${tone}-500/20 bg-${tone}-500/10 p-3 text-${tone}-300`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">{label}{required ? " *" : ""}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-teal-400"
      />
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-teal-400"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-teal-400"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option} className="bg-zinc-900">
            {option || "Selecione"}
          </option>
        ))}
      </select>
    </label>
  );
}

function CandidateList({
  candidates,
  onEdit,
  onDelete,
  onStatus,
  onCertificate,
  onConvert,
}: {
  candidates: BaptismCandidate[];
  onEdit: (candidate: BaptismCandidate) => void;
  onDelete: (id: number) => void;
  onStatus: (candidate: BaptismCandidate, status: BaptismStatus) => void;
  onCertificate: (candidate: BaptismCandidate) => void;
  onConvert: (candidate: BaptismCandidate) => void;
}) {
  if (candidates.length === 0) {
    return <EmptyState text="Nenhum batizante cadastrado ainda." />;
  }

  return (
    <div className="grid gap-4">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="glass-card grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {candidate.photoUrl ? (
                <img src={candidate.photoUrl} alt={candidate.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-teal-300"><Droplets size={24} /></div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{candidate.fullName}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClasses[candidate.status]}`}>
                  {candidate.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {candidate.phone} - {candidate.city || "Cidade nao informada"} - Pastor: {candidate.responsiblePastor || "-"}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {["Conversao", "Discipulado", "Curso", "Aprovacao", "Batismo"].map((step, index) => {
                  const active =
                    index === 0 ||
                    (index === 1 && candidate.didDiscipleship) ||
                    (index === 2 && candidate.baptismCourseDone) ||
                    (index === 3 && ["Aprovado para batismo", "Batizado"].includes(candidate.status)) ||
                    (index === 4 && candidate.status === "Batizado");
                  return (
                    <div key={step} className={`rounded-lg border px-2 py-2 text-[10px] font-bold ${active ? "border-teal-500/30 bg-teal-500/10 text-teal-200" : "border-white/10 bg-white/[0.03] text-zinc-500"}`}>
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <select
              value={candidate.status}
              onChange={(e) => onStatus(candidate, e.target.value as BaptismStatus)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 outline-none"
            >
              {STATUS_OPTIONS.map((status) => <option key={status} value={status} className="bg-zinc-900">{status}</option>)}
            </select>
            {candidate.status === "Batizado" ? (
              <>
                <ActionButton onClick={() => onCertificate(candidate)} icon={Award} label="Certificado" tone="teal" />
                <ActionButton onClick={() => onConvert(candidate)} icon={UserCheck} label="Converter em membro" tone="emerald" />
              </>
            ) : null}
            <ActionButton onClick={() => onEdit(candidate)} icon={Edit2} label="Editar" tone="blue" />
            <ActionButton onClick={() => onDelete(candidate.id)} icon={Trash2} label="Excluir" tone="rose" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Agenda({ candidates, onStatus }: { candidates: BaptismCandidate[]; onStatus: (candidate: BaptismCandidate, status: BaptismStatus) => void }) {
  const agenda = candidates
    .filter((item) => item.plannedBaptismDate)
    .sort((a, b) => itemDateForAgenda(a).localeCompare(itemDateForAgenda(b)));

  if (agenda.length === 0) return <EmptyState text="Nenhum batismo agendado ainda." />;

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-white">Agenda de Batismo</h3>
          <p className="text-sm text-zinc-400">Organize data, local, pastor responsavel e candidatos.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300">
          <Printer size={15} /> Imprimir
        </button>
      </div>
      <div className="grid gap-3">
        {agenda.map((candidate) => (
          <div key={candidate.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-extrabold text-white">{formatDate(candidate.plannedBaptismDate)} - {candidate.fullName}</p>
                <p className="mt-1 text-xs text-zinc-400">{candidate.baptismLocation || "Local a definir"} - {candidate.responsiblePastor}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300">QR Presenca</span>
                {candidate.status !== "Batizado" ? (
                  <button onClick={() => onStatus(candidate, "Batizado")} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">Marcar batizado</button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function itemDateForAgenda(item: BaptismCandidate) {
  return item.plannedBaptismDate || "9999-99-99";
}

function Certificates({ candidates, onCertificate }: { candidates: BaptismCandidate[]; onCertificate: (candidate: BaptismCandidate) => void }) {
  if (candidates.length === 0) return <EmptyState text="Nenhum batizado disponivel para certificado." />;

  return (
    <div className="grid gap-3">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="glass-card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">{candidate.fullName}</h3>
            <p className="text-sm text-zinc-400">Batizado em {formatDate(candidate.baptizedAt || candidate.plannedBaptismDate)} - {candidate.responsiblePastor}</p>
          </div>
          <ActionButton onClick={() => onCertificate(candidate)} icon={FileText} label="Gerar PDF" tone="teal" />
        </div>
      ))}
    </div>
  );
}

function Reports({ candidates, stats }: { candidates: BaptismCandidate[]; stats: any }) {
  const byStatus = STATUS_OPTIONS.map((status) => ({
    status,
    count: candidates.filter((item) => item.status === status).length,
  }));
  const max = Math.max(1, ...byStatus.map((item) => item.count));

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="glass-card p-6">
        <h3 className="text-lg font-extrabold text-white">Resumo do Batismo</h3>
        <div className="mt-5 space-y-3 text-sm text-zinc-300">
          <p>Total de candidatos: <strong className="text-white">{stats.total}</strong></p>
          <p>Em discipulado: <strong className="text-white">{stats.discipulado}</strong></p>
          <p>Aprovados: <strong className="text-white">{stats.aprovados}</strong></p>
          <p>Batizados no mes: <strong className="text-white">{stats.batizadosMes}</strong></p>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-extrabold text-white">Distribuicao por status</h3>
        <div className="mt-5 space-y-4">
          {byStatus.map((item) => (
            <div key={item.status}>
              <div className="mb-1 flex justify-between text-xs font-bold text-zinc-400">
                <span>{item.status}</span>
                <span>{item.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon: Icon, label, tone }: { onClick: () => void; icon: any; label: string; tone: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-${tone}-500/30 bg-${tone}-500/10 px-3 py-2 text-xs font-bold text-${tone}-200 transition hover:bg-${tone}-500/20`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="glass-card border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
