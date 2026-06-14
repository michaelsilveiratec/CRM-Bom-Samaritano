import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Baby,
  Calendar,
  CheckCircle,
  Church,
  Download,
  Edit2,
  FileText,
  PenLine,
  QrCode,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { fetchServerSettings } from "../services/crm.service";
import { createQrCodeDataUrl } from "../utils/qrcode";

const CERTIFICATE_PASTOR_NAME_KEY = "certificates_pastor_name";
const CERTIFICATE_PASTOR_SIGNATURE_KEY = "certificates_pastor_signature";

type CertificateForm = {
  certificateNumber: string;
  fatherName: string;
  motherName: string;
  childName: string;
  childGender: "boy" | "girl";
  birthDate: string;
  presentationDate: string;
  churchName: string;
  churchLogo: string;
  pastorName: string;
  pastorSignature: string;
  bibleVerse: string;
};

type SavedCertificate = {
  id: string;
  certificateNumber: string;
  childName: string;
  presentationDate: string;
  churchName: string;
  form: CertificateForm;
  createdAt: string;
  updatedAt: string;
};

function readSavedCertificates(): SavedCertificate[] {
  try {
    const saved = localStorage.getItem("certificates_saved") || localStorage.getItem("certificates_history");
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => {
      const fallbackForm: CertificateForm = {
        certificateNumber: item.certificateNumber || "",
        fatherName: "",
        motherName: "",
        childName: item.childName || "",
        childGender: item.form?.childGender || "boy",
        birthDate: "",
        presentationDate: item.presentationDate || "",
        churchName: item.churchName || localStorage.getItem("settings_church_name") || "Bom Samaritano",
        churchLogo: localStorage.getItem("settings_church_logo") || "/logo.png",
        pastorName: localStorage.getItem("settings_pastor_name") || "Pastor",
        pastorSignature: "",
        bibleVerse: "Instrui o menino no caminho em que deve andar. - Proverbios 22:6",
      };

      const itemForm = { ...fallbackForm, ...(item.form || {}) };
      return {
        id: item.id || `${Date.now()}`,
        certificateNumber: item.certificateNumber || itemForm.certificateNumber,
        childName: item.childName || itemForm.childName || "",
        presentationDate: item.presentationDate || itemForm.presentationDate || "",
        churchName: item.churchName || itemForm.churchName || fallbackForm.churchName,
        form: itemForm,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

function createCertificateNumber() {
  const today = new Date();
  const datePart = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");
  const next = readSavedCertificates().length + 1;
  return `AP-${datePart}-${String(next).padStart(4, "0")}`;
}

function readDefaultPastorName() {
  const savedCertificateName = localStorage.getItem(CERTIFICATE_PASTOR_NAME_KEY);
  const savedSettingsName = localStorage.getItem("settings_pastor_name");
  const defaultNames = new Set(["Pastor", "Pr. Anderson Silva", "Pr. Anderson Silva (Google)", "Anderson Silva"]);

  if (savedCertificateName?.trim()) return savedCertificateName;
  if (savedSettingsName?.trim() && !defaultNames.has(savedSettingsName)) return savedSettingsName;
  return "Michael Ramos";
}

const emptyForm: CertificateForm = {
  certificateNumber: createCertificateNumber(),
  fatherName: "",
  motherName: "",
  childName: "",
  childGender: "boy",
  birthDate: "",
  presentationDate: "",
  churchName: localStorage.getItem("settings_church_name") || "Bom Samaritano",
  churchLogo: localStorage.getItem("settings_church_logo") || "/logo.png",
  pastorName: readDefaultPastorName(),
  pastorSignature: localStorage.getItem(CERTIFICATE_PASTOR_SIGNATURE_KEY) || "",
  bibleVerse: "Instrui o menino no caminho em que deve andar. - Proverbios 22:6",
};

function formatDate(value: string) {
  if (!value) return "00/00/0000";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "00/00/0000";
  return `${day}/${month}/${year}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOfficialSealSvg(size = 96) {
  return `
    <svg class="official-seal" width="${size}" height="${size}" viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Selo oficial cristao">
      <defs>
        <radialGradient id="sealGold" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stop-color="#fff4ba"/>
          <stop offset="42%" stop-color="#dca83f"/>
          <stop offset="78%" stop-color="#a96d18"/>
          <stop offset="100%" stop-color="#f5cf69"/>
        </radialGradient>
        <radialGradient id="sealBlue" cx="48%" cy="36%" r="72%">
          <stop offset="0%" stop-color="#102f78"/>
          <stop offset="65%" stop-color="#071d55"/>
          <stop offset="100%" stop-color="#031136"/>
        </radialGradient>
        <linearGradient id="ribbonGold" x1="0" x2="1">
          <stop offset="0%" stop-color="#9c6418"/>
          <stop offset="34%" stop-color="#f7d36b"/>
          <stop offset="70%" stop-color="#c28625"/>
          <stop offset="100%" stop-color="#7b4d10"/>
        </linearGradient>
        <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#2f1d04" flood-opacity=".28"/>
        </filter>
      </defs>
      <g filter="url(#sealShadow)">
        <path d="M74 158 L48 252 L87 232 L112 260 L137 232 L176 252 L148 158 Z" fill="url(#ribbonGold)"/>
        <path d="M80 168 L64 229 L88 216 L108 238 L118 168 Z" fill="#7b4d10" opacity=".28"/>
        <path d="M141 168 L156 229 L132 216 L112 238 L102 168 Z" fill="#7b4d10" opacity=".24"/>
        <path d="M110 6
          C119 6 126 18 135 20 C144 22 155 14 164 18 C173 22 174 36 181 42
          C188 48 202 47 207 56 C212 65 204 76 207 86 C210 96 222 103 222 112
          C222 121 210 128 207 138 C204 148 212 159 207 168 C202 177 188 176 181 182
          C174 188 173 202 164 206 C155 210 144 202 135 204 C126 206 119 218 110 218
          C101 218 94 206 85 204 C76 202 65 210 56 206 C47 202 46 188 39 182
          C32 176 18 177 13 168 C8 159 16 148 13 138 C10 128 -2 121 -2 112
          C-2 103 10 96 13 86 C16 76 8 65 13 56 C18 47 32 48 39 42
          C46 36 47 22 56 18 C65 14 76 22 85 20 C94 18 101 6 110 6 Z" fill="url(#sealGold)"/>
        <circle cx="110" cy="112" r="86" fill="none" stroke="#fff1a8" stroke-width="3"/>
        <circle cx="110" cy="112" r="74" fill="url(#sealBlue)" stroke="#f2cc62" stroke-width="4"/>
        <path d="M103 49 H119 V88 H153 V107 H119 V168 H103 V107 H67 V88 H103 Z" fill="#f7d56d" stroke="#8a5b12" stroke-width="2"/>
        <path d="M110 54 H116 V166 H110 Z" fill="#fff2a8" opacity=".58"/>
        <path d="M64 126 C81 113 99 119 110 131 C121 119 139 113 156 126 V158 C139 149 122 151 110 164 C98 151 81 149 64 158 Z" fill="#fff8df" stroke="#d3a33f" stroke-width="3"/>
        <path d="M110 131 V164" stroke="#0b1e5b" stroke-width="3"/>
        <path d="M70 148 C87 141 99 144 110 153 M150 148 C133 141 121 144 110 153" fill="none" stroke="#0b1e5b" stroke-width="2"/>
        <path d="M50 154 C72 189 101 194 110 194 C119 194 148 189 170 154" fill="none" stroke="#f2cc62" stroke-width="5" stroke-linecap="round"/>
        ${Array.from({ length: 9 }, (_, index) => {
          const x = 54 + index * 6.4;
          const y = 149 + index * 4.8;
          const angle = -50 + index * 9;
          const rx = 5.5;
          const ry = 13;
          return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f6d46d" transform="rotate(${angle} ${x} ${y})"/>`;
        }).join("")}
        ${Array.from({ length: 9 }, (_, index) => {
          const x = 166 - index * 6.4;
          const y = 149 + index * 4.8;
          const angle = 50 - index * 9;
          const rx = 5.5;
          const ry = 13;
          return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f6d46d" transform="rotate(${angle} ${x} ${y})"/>`;
        }).join("")}
      </g>
    </svg>
  `;
}

export default function Certificates() {
  const [form, setForm] = useState<CertificateForm>(emptyForm);
  const [savedCertificates, setSavedCertificates] = useState<SavedCertificate[]>(readSavedCertificates);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const validationCode = `CERT:${form.certificateNumber}`.slice(0, 48);
  const qrCodeDataUrl = useMemo(() => createQrCodeDataUrl(validationCode), [validationCode]);

  useEffect(() => {
    if (!localStorage.getItem(CERTIFICATE_PASTOR_NAME_KEY)) {
      localStorage.setItem(CERTIFICATE_PASTOR_NAME_KEY, "Michael Ramos");
    }

    const applyLocalSettings = () => {
      setForm((current) => ({
        ...current,
        churchName: localStorage.getItem("settings_church_name") || current.churchName || "Bom Samaritano",
        churchLogo: localStorage.getItem("settings_church_logo") || current.churchLogo || "/logo.png",
        pastorName: localStorage.getItem(CERTIFICATE_PASTOR_NAME_KEY) || current.pastorName || readDefaultPastorName(),
      }));
    };

    applyLocalSettings();
    window.addEventListener("crm-settings-updated", applyLocalSettings);

    fetchServerSettings()
      .then((response) => {
        const settings = response?.settings;
        if (!settings) return;
        setForm((current) => ({
          ...current,
          churchName: settings.churchName || current.churchName,
          churchLogo: localStorage.getItem("settings_church_logo") || current.churchLogo || "/logo.png",
          pastorName: localStorage.getItem(CERTIFICATE_PASTOR_NAME_KEY) || current.pastorName || settings.pastorName || readDefaultPastorName(),
        }));
      })
      .catch((error) => {
        console.warn("Nao foi possivel carregar configuracoes para certificados:", error);
      });

    return () => window.removeEventListener("crm-settings-updated", applyLocalSettings);
  }, []);

  const requiredComplete = useMemo(() => {
    return Boolean(
      form.fatherName.trim() &&
      form.motherName.trim() &&
      form.childName.trim() &&
      form.birthDate &&
      form.presentationDate &&
      form.churchName.trim() &&
      form.pastorName.trim()
    );
  }, [form]);

  const updateField = (field: keyof CertificateForm, value: string) => {
    if (field === "pastorName") {
      localStorage.setItem(CERTIFICATE_PASTOR_NAME_KEY, value || "Michael Ramos");
    }
    if (field === "pastorSignature") {
      if (value) {
        localStorage.setItem(CERTIFICATE_PASTOR_SIGNATURE_KEY, value);
      } else {
        localStorage.removeItem(CERTIFICATE_PASTOR_SIGNATURE_KEY);
      }
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const persistSavedCertificates = (items: SavedCertificate[]) => {
    setSavedCertificates(items);
    localStorage.setItem("certificates_saved", JSON.stringify(items));
    localStorage.setItem("certificates_history", JSON.stringify(items));
  };

  const buildSavedCertificate = (id = `${Date.now()}`): SavedCertificate => {
    const existing = savedCertificates.find((item) => item.id === id);
    const now = new Date().toISOString();

    return {
      id,
      certificateNumber: form.certificateNumber,
      childName: form.childName,
      presentationDate: form.presentationDate,
      churchName: form.churchName,
      form: { ...form },
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
  };

  const saveCurrentCertificate = (showAlert = true) => {
    if (!requiredComplete) {
      alert("Preencha todos os campos obrigatorios antes de salvar o certificado.");
      return null;
    }

    const saved = buildSavedCertificate(editingCertificateId || `${Date.now()}`);
    const nextCertificates = editingCertificateId
      ? savedCertificates.map((item) => (item.id === editingCertificateId ? saved : item))
      : [saved, ...savedCertificates];

    persistSavedCertificates(nextCertificates.slice(0, 100));
    setEditingCertificateId(saved.id);

    if (showAlert) {
      alert("Certificado salvo no sistema.");
    }

    return saved;
  };

  const resetCertificateForm = () => {
    setEditingCertificateId(null);
    setForm({
      ...emptyForm,
      certificateNumber: createCertificateNumber(),
      churchName: localStorage.getItem("settings_church_name") || form.churchName || "Bom Samaritano",
      churchLogo: localStorage.getItem("settings_church_logo") || form.churchLogo || "/logo.png",
      pastorName: localStorage.getItem(CERTIFICATE_PASTOR_NAME_KEY) || form.pastorName || "Michael Ramos",
      pastorSignature: form.pastorSignature,
      bibleVerse: form.bibleVerse,
    });
  };

  const editSavedCertificate = (certificate: SavedCertificate) => {
    setEditingCertificateId(certificate.id);
    setForm(certificate.form);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSavedCertificate = (id: string) => {
    if (!window.confirm("Deseja excluir este certificado salvo?")) return;
    const nextCertificates = savedCertificates.filter((item) => item.id !== id);
    persistSavedCertificates(nextCertificates);
    if (editingCertificateId === id) {
      resetCertificateForm();
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "pastorSignature" | "churchLogo",
    label: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert(`Envie ${label} em PNG ou JPG.`);
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(`${label} deve ter no maximo 2MB.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField(field, String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event, "pastorSignature", "a assinatura");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event, "churchLogo", "o logotipo da igreja");
  };


  const buildPremiumCertificateHtml = (certificateForm: CertificateForm = form) => {
    const certificateQrCodeDataUrl = createQrCodeDataUrl(`CERT:${certificateForm.certificateNumber}`.slice(0, 48));
    const childPronoun = certificateForm.childGender === "girl" ? "apresentada" : "apresentado";
    const accentColor = certificateForm.childGender === "girl" ? "#CF6C9B" : "#2C77D8";
    const pageColor = "#F8F5EE";
    const frameColor = "#0B2347";
    const goldColor = "#C9A227";
    const textColor = "#0B2347";
    const detailText = "#414558";
    const logoHtml = certificateForm.churchLogo
      ? `<div class="logo-medallion"><img class="church-logo" src="${certificateForm.churchLogo}" alt="Logotipo da igreja" /></div>`
      : `<div class="logo-placeholder">${escapeHtml(certificateForm.churchName || "Igreja Internacional da Graça de Deus")}</div>`;
    const rawVerse = certificateForm.bibleVerse.trim() || "Deixai vir a mim os pequeninos, porque deles é o Reino de Deus.";
    const [verseText, verseReference] = rawVerse.includes("-")
      ? rawVerse.split("-").map((part) => part.trim())
      : [rawVerse, "Marcos 10:14"];
    const sealHtml = buildOfficialSealSvg(96);

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Certificado - ${escapeHtml(certificateForm.childName || "Apresentação de Criança")}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: ${pageColor};
              font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
              color: ${textColor};
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 1000px;
              height: 706px;
              padding: 20px;
              background: ${pageColor};
              border: 18px solid ${frameColor};
              position: relative;
              overflow: hidden;
            }
            .page:before {
              content: "";
              position: absolute;
              inset: 22px;
              border: 4px solid ${goldColor};
              pointer-events: none;
              box-shadow: inset 0 0 0 1px rgba(11,35,71,.08);
            }
            .page:after {
              content: "";
              position: absolute;
              inset: 0;
              background-image: radial-gradient(circle at 50% 50%, rgba(11,35,71,.06) 0%, rgba(11,35,71,0) 44%),
                linear-gradient(145deg, rgba(255,255,255,.22) 0%, transparent 12%, transparent 100%);
              pointer-events: none;
            }
            .certificate {
              position: relative;
              width: 100%;
              height: 100%;
              padding: 36px 44px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              gap: 18px;
            }
            .watermark {
              position: absolute;
              inset: 0;
              display: grid;
              place-items: center;
              opacity: 0.08;
              pointer-events: none;
            }
            .watermark svg {
              width: 320px;
              height: 320px;
            }
            .logo-medallion,
            .logo-placeholder {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto;
            }
            .logo-placeholder {
              width: 260px;
              height: 66px;
              border-radius: 20px;
              border: 1px solid rgba(11,35,71,.12);
              background: rgba(255,255,255,.95);
              color: ${textColor};
              font-size: 11px;
              letter-spacing: .24em;
              text-transform: uppercase;
              font-weight: 700;
              padding: 0 16px;
              text-align: center;
            }
            .church-logo {
              max-width: 260px;
              max-height: 66px;
              object-fit: contain;
            }
            .title-main {
              margin: 0 auto;
              font-size: 62px;
              line-height: 1;
              font-family: Georgia, "Times New Roman", serif;
              letter-spacing: .16em;
              text-transform: uppercase;
              color: ${frameColor};
            }
            .title-sub {
              margin: 8px auto 0;
              font-size: 18px;
              font-weight: 700;
              letter-spacing: .18em;
              text-transform: uppercase;
              color: ${goldColor};
            }
            .label-cert {
              margin: 24px auto 0;
              display: inline-flex;
              padding: 10px 28px;
              border-radius: 999px;
              border: 1px solid ${frameColor};
              background: rgba(255,255,255,.95);
              color: ${frameColor};
              font-size: 12px;
              font-weight: 700;
              letter-spacing: .28em;
            }
            .child-name {
              margin: 18px auto 0;
              font-size: 56px;
              line-height: 1;
              font-family: Georgia, "Times New Roman", serif;
              font-weight: 900;
              letter-spacing: .08em;
              text-transform: uppercase;
              color: ${frameColor};
              text-align: center;
              width: fit-content;
              border-bottom: 5px solid ${goldColor};
              padding-bottom: 6px;
            }
            .copy {
              margin: 18px auto 0;
              max-width: 740px;
              text-align: center;
              color: ${detailText};
              font-size: 16px;
              line-height: 1.85;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin: 28px auto 0;
              width: 100%;
              max-width: 760px;
            }
            .info-card {
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding: 18px 20px;
              border-radius: 20px;
              background: rgba(255,255,255,.95);
              border: 1px solid rgba(196,162,39,.35);
              box-shadow: 0 4px 18px rgba(11,35,71,.06);
            }
            .info-card span {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: .24em;
              text-transform: uppercase;
              color: ${detailText};
            }
            .info-card strong {
              font-size: 24px;
              line-height: 1.2;
              color: ${textColor};
            }
            .verse-banner {
              margin: 28px auto 0;
              padding: 18px 24px;
              max-width: 780px;
              border-radius: 24px;
              background: ${frameColor};
              border: 1px solid ${goldColor};
              color: white;
              text-align: center;
              font-size: 14px;
              line-height: 1.7;
            }
            .verse-banner strong {
              display: block;
              margin-top: 6px;
              font-size: 12px;
              color: ${goldColor};
            }
            .signature-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 18px;
              margin-top: 28px;
            }
            .signature-block {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .signature-line {
              width: 220px;
              height: 1px;
              background: rgba(11,35,71,.2);
            }
            .signature-title {
              font-size: 11px;
              letter-spacing: .18em;
              text-transform: uppercase;
              color: ${detailText};
            }
            .signature-name {
              font-size: 14px;
              font-weight: 700;
              color: ${textColor};
            }
            .seal-holder {
              position: absolute;
              left: 42px;
              bottom: 42px;
              width: 108px;
              height: 108px;
            }
            .qr-holder {
              position: absolute;
              right: 42px;
              bottom: 42px;
              display: flex;
              align-items: center;
              gap: 12px;
              background: rgba(255,255,255,.94);
              border: 1px solid rgba(11,35,71,.12);
              border-radius: 24px;
              padding: 12px 14px;
            }
            .qr-holder img {
              width: 72px;
              height: 72px;
              border-radius: 18px;
              background: white;
              padding: 8px;
              border: 1px solid rgba(0,0,0,.08);
            }
            .qr-holder div {
              font-size: 11px;
              color: ${detailText};
              line-height: 1.4;
            }
            .qr-holder strong {
              display: block;
              color: ${textColor};
              font-size: 12px;
              margin-top: 4px;
            }
            @media print {
              body { background: white; }
              .page { box-shadow: none; margin: 0 auto; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="watermark">
              <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="98" stroke="#0B2347" stroke-width="2" fill="none" />
                <circle cx="120" cy="120" r="70" stroke="#0B2347" stroke-width="1" fill="none" />
                <path d="M40 120H200M120 40V200M64 60C106 108 176 108 216 60M64 180C106 132 176 132 216 180" fill="none" stroke="#0B2347" stroke-width="1" />
                <path d="M112 74H128V132H154V150H128V208H112V150H86V132H112Z" fill="#0B2347" opacity="0.9" />
              </svg>
            </div>
            <div class="certificate">
              ${logoHtml}
              <div class="title-main">CERTIFICADO</div>
              <div class="title-sub">DE APRESENTAÇÃO AO SENHOR</div>
              <div class="label-cert">CERTIFICAMOS QUE</div>
              <div class="child-name">${escapeHtml(certificateForm.childName || "NOME DA CRIANÇA")}</div>
              <div class="copy">Certificamos que o(a) menor acima identificado(a) foi ${childPronoun} ao Senhor Jesus Cristo, conforme os princípios da Palavra de Deus e o exemplo deixado por nosso Salvador, recebendo a oração de consagração perante a Igreja.</div>
              <div class="info-grid">
                <div class="info-card"><span>Data da Apresentação</span><strong>${formatDate(certificateForm.presentationDate)}</strong></div>
                <div class="info-card"><span>Igreja</span><strong>${escapeHtml(certificateForm.churchName || "Igreja Internacional da Graça de Deus")}</strong></div>
              </div>
              <div class="verse-banner">"${escapeHtml(verseText)}"${verseReference ? `<strong>${escapeHtml(verseReference)}</strong>` : ""}</div>
              <div class="signature-grid">
                <div class="signature-block">
                  ${certificateForm.pastorSignature ? `<img class="signature" src="${certificateForm.pastorSignature}" alt="Assinatura do pastor" />` : `<div class="signature-line"></div>`}
                  <div class="signature-name">${escapeHtml(certificateForm.pastorName || "Nome do Pastor")}</div>
                  <div class="signature-title">Pastor Responsável</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">${escapeHtml(certificateForm.fatherName || "Nome do Pai")} & ${escapeHtml(certificateForm.motherName || "Nome da Mãe")}</div>
                  <div class="signature-title">Pais ou Responsáveis</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">${escapeHtml(certificateForm.churchName || "Igreja da Graça")}</div>
                  <div class="signature-title">Igreja da Graça</div>
                </div>
              </div>
              <div class="seal-holder">${sealHtml}</div>
              <div class="qr-holder">
                <img src="${certificateQrCodeDataUrl}" alt="QR Code de validação" />
                <div><strong>Validação</strong>${escapeHtml(certificateForm.certificateNumber)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>`;
  };
  const handleGenerateCertificate = () => {
    if (!requiredComplete) {
      alert("Preencha todos os campos obrigatorios antes de gerar o certificado.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      alert("Nao foi possivel abrir a janela de impressao. Verifique o bloqueador de pop-ups.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPremiumCertificateHtml());
    printWindow.document.close();

    saveCurrentCertificate(false);
  };

  const generateSavedCertificate = (certificate: SavedCertificate) => {
    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      alert("Nao foi possivel abrir a janela de impressao. Verifique o bloqueador de pop-ups.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPremiumCertificateHtml(certificate.form));
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Certificados</span>
          <span>&gt;</span>
          <span className="text-zinc-300">Gerar certificado de apresentacao de bebe</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Certificados</h2>
        <p className="text-sm text-zinc-400">
          Gere certificados pastorais com formulario, assinatura e pre-visualizacao.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-3 text-purple-300">
            <FileText size={30} />
          </div>
          <div>
              <h3 className="text-lg font-extrabold text-purple-100">
                {editingCertificateId ? "Editando certificado salvo" : "Gerar certificado de apresentacao de bebe"}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">Preencha as informacoes abaixo para gerar e salvar o certificado.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetCertificateForm}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-white/10"
          >
            Novo certificado
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.38fr]">
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <Baby size={18} className="text-purple-400" />
              <h3 className="text-sm font-extrabold text-purple-200">Informacoes do Certificado</h3>
            </div>
            <div className="space-y-4">
              <TextInput label="Numero do certificado" value={form.certificateNumber} onChange={(value) => updateField("certificateNumber", value)} />
              <TextInput label="Nome do Pai" required value={form.fatherName} onChange={(value) => updateField("fatherName", value)} />
              <TextInput label="Nome da Mae" required value={form.motherName} onChange={(value) => updateField("motherName", value)} />
              <TextInput label="Nome da Crianca" required value={form.childName} onChange={(value) => updateField("childName", value)} />
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateField("childGender", "boy")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${form.childGender === "boy" ? "border-blue-300 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/5 text-zinc-200 hover:border-blue-400/40"}`}
                >
                  Menino
                </button>
                <button
                  type="button"
                  onClick={() => updateField("childGender", "girl")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${form.childGender === "girl" ? "border-pink-300 bg-pink-500/15 text-pink-100" : "border-white/10 bg-white/5 text-zinc-200 hover:border-pink-400/40"}`}
                >
                  Menina
                </button>
              </div>
              <DateInput label="Data de nascimento" required value={form.birthDate} onChange={(value) => updateField("birthDate", value)} />
              <DateInput label="Data da apresentacao" required value={form.presentationDate} onChange={(value) => updateField("presentationDate", value)} />
              <TextInput label="Versiculo biblico opcional" value={form.bibleVerse} onChange={(value) => updateField("bibleVerse", value)} />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <Church size={18} className="text-purple-400" />
              <h3 className="text-sm font-extrabold text-purple-200">Informacoes da Igreja</h3>
            </div>
            <div className="space-y-4">
              <TextInput label="Nome da Igreja" required value={form.churchName} onChange={(value) => updateField("churchName", value)} />
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Logotipo da Igreja
                </label>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex min-h-[96px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-5 text-center transition hover:border-purple-400/40 hover:bg-purple-500/10"
                >
                  {form.churchLogo ? (
                    <span className="flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-white p-2">
                      <img src={form.churchLogo} alt="Logotipo da igreja" className="h-full w-full object-contain" />
                    </span>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-zinc-400" />
                      <span className="mt-2 text-xs font-semibold text-zinc-400">Clique para enviar o logotipo</span>
                      <span className="mt-1 text-[11px] text-zinc-600">PNG ou JPG (max. 2MB)</span>
                    </>
                  )}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <PenLine size={18} className="text-purple-400" />
              <h3 className="text-sm font-extrabold text-purple-200">Assinatura do Pastor</h3>
            </div>
            <div className="space-y-4">
              <TextInput label="Nome do Pastor" required value={form.pastorName} onChange={(value) => updateField("pastorName", value)} />
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Assinatura do Pastor
                </label>
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="flex min-h-[96px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-5 text-center transition hover:border-purple-400/40 hover:bg-purple-500/10"
                >
                  {form.pastorSignature ? (
                    <img src={form.pastorSignature} alt="Assinatura do pastor" className="max-h-16 object-contain" />
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-zinc-400" />
                      <span className="mt-2 text-xs font-semibold text-zinc-400">Clique para enviar a assinatura</span>
                      <span className="mt-1 text-[11px] text-zinc-600">PNG ou JPG (max. 2MB)</span>
                    </>
                  )}
                </button>
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleSignatureUpload}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => saveCurrentCertificate(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              <Save size={18} />
              Salvar Certificado
            </button>
            <button
              type="button"
              onClick={handleGenerateCertificate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500"
            >
              <Download size={18} />
              Gerar e Salvar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <Award size={18} className="text-purple-400" />
              <h3 className="text-sm font-extrabold text-zinc-200">Pre-visualizacao</h3>
            </div>
            <PremiumCertificatePreview form={form} qrCodeDataUrl={qrCodeDataUrl} />
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <QrCode size={18} className="text-emerald-300" />
              <h3 className="text-sm font-extrabold text-zinc-200">Validacao digital</h3>
            </div>
            <div className="flex items-center gap-4">
              <img src={qrCodeDataUrl} alt="QR Code de validacao" className="h-20 w-20 rounded-lg bg-white p-2" />
              <div>
                <p className="text-xs font-bold text-zinc-300">Codigo: {form.certificateNumber}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">O QR Code e impresso no certificado para conferencia e arquivamento.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-amber-300" />
              <h3 className="text-sm font-extrabold text-zinc-200">Dicas</h3>
            </div>
            <ul className="space-y-2 text-xs leading-6 text-zinc-400">
              <li>Verifique todas as informacoes antes de gerar o certificado.</li>
              <li>A assinatura do pastor sera exibida no certificado.</li>
              <li>O certificado gerado pode ser salvo como PDF pela janela de impressao.</li>
            </ul>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} className="text-cyan-300" />
              <h3 className="text-sm font-extrabold text-zinc-200">Historico de certificados</h3>
            </div>
            {savedCertificates.length === 0 ? (
              <p className="text-xs text-zinc-500">Nenhum certificado gerado ainda.</p>
            ) : (
              <div className="space-y-2">
                {savedCertificates.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{item.childName}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                          {item.certificateNumber} - {formatDate(item.presentationDate)} - salvo em {new Date(item.updatedAt || item.createdAt).toLocaleString("pt-BR")}
                    </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editSavedCertificate(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-bold text-blue-200 transition hover:bg-blue-500/20"
                        >
                          <Edit2 size={12} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => generateSavedCertificate(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-500/20"
                        >
                          <Download size={12} />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSavedCertificate(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-200 transition hover:bg-rose-500/20"
                        >
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Digite ${label.toLowerCase()}`}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/60"
      />
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-purple-400/60"
        />
        <Calendar size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
      </div>
    </div>
  );
}

function PremiumCertificatePreview({ form, qrCodeDataUrl }: { form: CertificateForm; qrCodeDataUrl: string }) {
  const isGirl = form.childGender === "girl";
  const childPronoun = isGirl ? "apresentada" : "apresentado";
  const frameColor = "#0B2347";
  const goldColor = "#C9A227";
  const paper = "#F8F5EE";
  const detailText = "#4f5165";
  const accent = isGirl ? "#CF6C9B" : "#2C77D8";
  const logoName = form.churchName || "Igreja Internacional da Graça de Deus";
  const rawVerse = form.bibleVerse.trim() || "Deixai vir a mim os pequeninos, porque deles é o Reino de Deus.";
  const [verseText, verseReference] = rawVerse.includes("-")
    ? rawVerse.split("-").map((part) => part.trim())
    : [rawVerse, "Marcos 10:14"];

  return (
    <div className="mx-auto max-w-[700px] rounded-3xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" style={{ background: paper }}>
      <div className="relative overflow-hidden rounded-[34px] border-8" style={{ borderColor: frameColor, background: paper }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(11,35,71,0.08)_0%,_transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(201,162,39,0.12)_0%,_transparent_35%)]" />
        <div className="absolute inset-0 border-4 border-[#C9A227]" />
        <div className="relative flex min-h-[880px] flex-col justify-between p-10">
          <div className="absolute inset-0 grid place-items-center opacity-10">
            <div className="text-[220px] font-black uppercase tracking-[0.26em] text-[#0B2347]">IIGD</div>
          </div>
          <div className="relative z-10 space-y-5">
            <div className="mx-auto flex h-[72px] w-[280px] items-center justify-center rounded-3xl bg-white/90 border border-[#0B2347]/10 px-6 text-center text-xs font-black uppercase tracking-[0.28em] text-[#0B2347] shadow-sm">
              {form.churchLogo ? <img src={form.churchLogo} alt="Logotipo da igreja" className="max-h-[56px] object-contain" /> : logoName}
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-20 rounded-full bg-[#0B2347]" />
              <div className="text-sm font-semibold uppercase tracking-[0.36em] text-[#C9A227]">certificado</div>
              <div className="h-1 w-20 rounded-full bg-[#0B2347]" />
            </div>
            <div className="text-center">
              <div className="text-[52px] font-serif font-black uppercase leading-none tracking-[0.16em] text-[#0B2347]">CERTIFICADO</div>
              <div className="mt-2 text-[16px] font-semibold uppercase tracking-[0.26em] text-[#C9A227]">de apresentação ao Senhor</div>
            </div>
            <div className="mx-auto inline-flex rounded-full border border-[#0B2347] bg-white/90 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#0B2347]">
              Certificamos que
            </div>
            <div className="mx-auto max-w-[680px] text-center text-[54px] font-serif font-black uppercase leading-none tracking-[0.06em] text-[#0B2347]">
              {form.childName || "Nome da Criança"}
            </div>
            <p className="mx-auto max-w-[720px] text-center text-sm leading-7 text-[#4f5165]">
              Certificamos que o(a) menor acima identificado(a) foi <span className="font-semibold text-[#0B2347]">{childPronoun}</span> ao Senhor Jesus Cristo, conforme os princípios da Palavra de Deus e o exemplo deixado por nosso Salvador, recebendo a oração de consagração perante a Igreja.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#C9A227]/30 bg-white/90 p-5 shadow-[0_8px_24px_rgba(11,35,71,0.08)]">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f5165]">Data da Apresentação</div>
                <div className="mt-3 text-[22px] font-semibold text-[#0B2347]">{formatDate(form.presentationDate)}</div>
              </div>
              <div className="rounded-[24px] border border-[#C9A227]/30 bg-white/90 p-5 shadow-[0_8px_24px_rgba(11,35,71,0.08)]">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f5165]">Igreja</div>
                <div className="mt-3 text-[22px] font-semibold text-[#0B2347]">{form.churchName || "Igreja Internacional da Graça de Deus"}</div>
              </div>
            </div>
            <div className="mx-auto mt-2 max-w-[760px] rounded-[26px] border border-[#0B2347]/10 bg-[#0B2347] px-6 py-5 text-center text-sm font-semibold leading-7 text-white shadow-sm">
              {verseText}
              <span className="mt-2 block text-[11px] text-[#E0C66C]">{verseReference}</span>
            </div>
          </div>

          <div className="relative z-10 grid gap-5 lg:grid-cols-[1.12fr_0.66fr]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="signature-block rounded-[24px] border border-[#C9A227]/25 bg-white/95 p-5 text-center shadow-[0_10px_24px_rgba(11,35,71,0.08)]">
                {form.pastorSignature ? (
                  <img src={form.pastorSignature} alt="Assinatura do pastor" className="mx-auto h-16 object-contain" />
                ) : (
                  <div className="mx-auto h-[1px] w-40 bg-[#4f5165]" />
                )}
                <div className="mt-3 text-[14px] font-semibold text-[#0B2347]">{form.pastorName || "Nome do Pastor"}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#4f5165]">Pastor Responsável</div>
              </div>
              <div className="signature-block rounded-[24px] border border-[#C9A227]/25 bg-white/95 p-5 text-center shadow-[0_10px_24px_rgba(11,35,71,0.08)]">
                <div className="mx-auto h-[1px] w-40 bg-[#4f5165]" />
                <div className="mt-3 text-[14px] font-semibold text-[#0B2347]">{form.fatherName || "Nome do Pai"} & {form.motherName || "Nome da Mãe"}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#4f5165]">Pais ou Responsáveis</div>
              </div>
            </div>

            <div className="relative rounded-[24px] border border-[#C9A227]/25 bg-white/95 p-5 shadow-[0_10px_24px_rgba(11,35,71,0.08)]">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A227] px-4 py-1 text-[10px] uppercase tracking-[0.28em] text-[#0B2347]">Selo Oficial</div>
              <div className="flex h-full flex-col items-center justify-center gap-4 pt-6">
                <div className="h-[112px] w-[112px]" dangerouslySetInnerHTML={{ __html: buildOfficialSealSvg(112) }} />
                <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f5165]">Validação digital</div>
                <div className="rounded-3xl border border-[#0B2347]/10 bg-[#F8F5EE] p-3">
                  <img src={qrCodeDataUrl} alt="QR Code de validação" className="mx-auto h-24 w-24 rounded-2xl bg-white p-2" />
                  <div className="mt-3 text-[11px] text-[#4f5165]">Código</div>
                  <div className="text-[12px] font-semibold text-[#0B2347]">{form.certificateNumber}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

