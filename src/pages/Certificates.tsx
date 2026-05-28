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
        birthDate: "",
        presentationDate: item.presentationDate || "",
        churchName: item.churchName || localStorage.getItem("settings_church_name") || "Bom Samaritano",
        churchLogo: localStorage.getItem("settings_church_logo") || "/logo.png",
        pastorName: localStorage.getItem("settings_pastor_name") || "Pastor",
        pastorSignature: "",
        bibleVerse: "Instrui o menino no caminho em que deve andar. - Proverbios 22:6",
      };

      return {
        id: item.id || `${Date.now()}`,
        certificateNumber: item.certificateNumber || fallbackForm.certificateNumber,
        childName: item.childName || item.form?.childName || "",
        presentationDate: item.presentationDate || item.form?.presentationDate || "",
        churchName: item.churchName || item.form?.churchName || fallbackForm.churchName,
        form: item.form || fallbackForm,
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
    const logoHtml = certificateForm.churchLogo
      ? `<div class="logo-medallion"><img class="church-logo" src="${certificateForm.churchLogo}" alt="Logotipo da igreja" /></div>`
      : "";
    const signatureHtml = certificateForm.pastorSignature
      ? `<img class="signature" src="${certificateForm.pastorSignature}" alt="Assinatura do pastor" />`
      : `<div class="signature-line">${escapeHtml(certificateForm.pastorName || "Nome do Pastor")}</div>`;
    const verseHtml = certificateForm.bibleVerse.trim()
      ? `<p class="verse">${escapeHtml(certificateForm.bibleVerse.trim())}</p>`
      : "";
    const officialSealHtml = buildOfficialSealSvg(92);

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Certificado - ${escapeHtml(certificateForm.childName || "Apresentacao de Crianca")}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8f4ea;
              color: #0b1e5b;
              font-family: Georgia, "Times New Roman", serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .certificate {
              min-height: calc(297mm - 16mm);
              position: relative;
              overflow: hidden;
              padding: 7mm;
              text-align: center;
              border: 2px solid #c89b3c;
              background:
                radial-gradient(ellipse at top center, rgba(255,255,255,.08), transparent 42%),
                linear-gradient(135deg, #071742, #0b1e5b 48%, #071742);
            }
            .certificate:before {
              content: "";
              position: absolute;
              inset: 14px;
              border: 2px solid rgba(200,155,60,.92);
              pointer-events: none;
              z-index: 1;
            }
            .certificate:after {
              content: "";
              position: absolute;
              left: 50%;
              top: 50%;
              width: 78%;
              height: 78%;
              transform: translate(-50%, -50%);
              border-radius: 999px;
              border: 1px solid rgba(200,155,60,.18);
              z-index: 1;
            }
            .content {
              position: relative;
              z-index: 2;
              min-height: calc(297mm - 30mm);
              overflow: hidden;
              padding: 11mm 15mm 9mm;
              border: 2px solid rgba(200,155,60,.84);
              border-radius: 34px;
              background:
                repeating-radial-gradient(ellipse at top center, rgba(200,155,60,.10) 0 1px, transparent 1px 7px),
                radial-gradient(ellipse at 50% 0%, #fffdf6 0%, #f8f4ea 45%, #fffaf0 100%);
              box-shadow:
                inset 0 0 0 7px rgba(255,255,255,.45),
                inset 0 0 0 9px rgba(200,155,60,.28);
            }
            .content:before,
            .content:after {
              content: "";
              position: absolute;
              left: 50%;
              width: 112%;
              height: 160px;
              transform: translateX(-50%);
              border-radius: 50%;
              pointer-events: none;
              z-index: 0;
            }
            .content:before {
              top: -95px;
              border-bottom: 8px solid #c89b3c;
              box-shadow: 0 8px 0 #f5d98d, 0 16px 0 #0b1e5b;
            }
            .content:after {
              bottom: -95px;
              border-top: 8px solid #c89b3c;
              box-shadow: 0 -8px 0 #f5d98d, 0 -16px 0 #0b1e5b;
            }
            .topbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 18px;
              color: #0b1e5b;
              font-family: Arial, sans-serif;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: .8px;
              text-transform: uppercase;
            }
            .number {
              border: 1px solid rgba(200,155,60,.70);
              border-radius: 999px;
              padding: 7px 12px;
              background: rgba(255,255,255,.62);
              white-space: nowrap;
            }
            .top-church {
              max-width: 245px;
              text-align: right;
            }
            .logo-medallion {
              width: 330px;
              height: 190px;
              margin: 0 auto -4px;
              display: grid;
              place-items: center;
            }
            .church-logo {
              width: 310px;
              height: 178px;
              object-fit: contain;
            }
            .corner {
              position: absolute;
              width: 94px;
              height: 94px;
              border-color: #c89b3c;
              opacity: .98;
              z-index: 1;
            }
            .corner:after {
              content: "";
              position: absolute;
              width: 46px;
              height: 46px;
              border-color: #0b1e5b;
              opacity: .72;
            }
            .tl { top: 30px; left: 30px; border-top: 3px solid; border-left: 3px solid; border-radius: 18px 0 0 0; }
            .tl:after { top: 13px; left: 13px; border-top: 2px solid; border-left: 2px solid; border-radius: 12px 0 0 0; }
            .tr { top: 30px; right: 30px; border-top: 3px solid; border-right: 3px solid; border-radius: 0 18px 0 0; }
            .tr:after { top: 13px; right: 13px; border-top: 2px solid; border-right: 2px solid; border-radius: 0 12px 0 0; }
            .bl { bottom: 30px; left: 30px; border-bottom: 3px solid; border-left: 3px solid; border-radius: 0 0 0 18px; }
            .bl:after { bottom: 13px; left: 13px; border-bottom: 2px solid; border-left: 2px solid; border-radius: 0 0 0 12px; }
            .br { bottom: 30px; right: 30px; border-bottom: 3px solid; border-right: 3px solid; border-radius: 0 0 18px 0; }
            .br:after { bottom: 13px; right: 13px; border-bottom: 2px solid; border-right: 2px solid; border-radius: 0 0 12px 0; }
            .cross { color: #c89b3c; font-size: 22px; margin-bottom: 3px; }
            h1 {
              margin: 0;
              color: #0b1e5b;
              font-size: 62px;
              letter-spacing: 7px;
              text-transform: uppercase;
              text-shadow: 0 1px 0 #fff;
            }
            h2 {
              margin: 8px 0 10px;
              color: #c89b3c;
              font-size: 25px;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .divider {
              width: 240px;
              height: 1px;
              margin: 0 auto 16px;
              background: linear-gradient(90deg, transparent, #c89b3c, transparent);
            }
            .small {
              color: #27345e;
              font-family: Arial, sans-serif;
              font-size: 15px;
              line-height: 1.62;
              margin: 0;
            }
            .script {
              color: #0b1e5b;
              font-family: "Brush Script MT", "Segoe Script", cursive;
              font-size: 38px;
              line-height: 1.2;
              margin: 8px 0;
            }
            .child {
              color: #c89b3c;
              font-size: 54px;
              margin: 13px 0 14px;
            }
            .dates {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              max-width: 520px;
              margin: 0 auto 14px;
              font-family: Arial, sans-serif;
            }
            .date-box {
              border: 1px solid rgba(200,155,60,.78);
              border-radius: 8px;
              padding: 12px;
              background: rgba(255,255,255,.58);
              box-shadow: inset 0 0 0 1px rgba(11,30,91,.12);
            }
            .date-box span {
              display: block;
              margin-bottom: 5px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0b1e5b;
            }
            .date-box strong {
              color: #0b1e5b;
              font-size: 18px;
            }
            .message {
              max-width: 640px;
              margin: 0 auto 11px;
              color: #27345e;
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.64;
            }
            .verse {
              max-width: 620px;
              margin: 0 auto 12px;
              color: #ad7f2c;
              font-size: 14px;
              font-style: italic;
              line-height: 1.55;
            }
            .signature {
              max-width: 230px;
              max-height: 70px;
              object-fit: contain;
              margin: 2px auto 1px;
              display: block;
            }
            .signature-line {
              min-width: 260px;
              display: inline-block;
              border-bottom: 1px solid #0b1e5b;
              padding: 0 20px 5px;
              color: #0b1e5b;
              font-family: "Brush Script MT", "Segoe Script", cursive;
              font-size: 24px;
            }
            .pastor-label {
              margin-top: 2px;
              color: #0b1e5b;
              font-family: Arial, sans-serif;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .church {
              margin-top: 12px;
              color: #0b1e5b;
              font-size: 22px;
              font-weight: 800;
            }
            .seal {
              width: 92px;
              height: 108px;
              margin: 5px auto 0;
              display: block;
            }
            .seal .official-seal { width: 92px; height: 108px; display: block; }
            .validation {
              position: absolute;
              right: 18px;
              bottom: 18px;
              display: flex;
              align-items: center;
              gap: 8px;
              z-index: 2;
              color: #0b1e5b;
              font-family: Arial, sans-serif;
              font-size: 9px;
              text-align: left;
            }
            .validation img {
              width: 56px;
              height: 56px;
              padding: 3px;
              background: #fff;
              border: 1px solid rgba(200,155,60,.45);
            }
            @media print { body { background: #f8f4ea; } }
          </style>
        </head>
        <body>
          <main class="certificate">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
            <div class="content">
              <div class="topbar">
                <span class="number">${escapeHtml(certificateForm.certificateNumber)}</span>
                <span class="top-church">${escapeHtml(certificateForm.churchName || "Nome da Igreja")}</span>
              </div>
              ${logoHtml}
              <div class="cross">+</div>
              <h1>CERTIFICADO</h1>
              <h2>DE APRESENTACAO DE CRIANCA</h2>
              <div class="divider"></div>
              <p class="small">Certificamos que, no dia da apresentacao, os pais</p>
              <div class="script">${escapeHtml(certificateForm.fatherName || "Nome do Pai")}</div>
              <p class="small">e</p>
              <div class="script">${escapeHtml(certificateForm.motherName || "Nome da Mae")}</div>
              <p class="small">apresentaram diante de Deus e da igreja a crianca</p>
              <div class="script child">${escapeHtml(certificateForm.childName || "Nome da Crianca")}</div>
              <div class="dates">
                <div class="date-box"><span>Data de nascimento</span><strong>${formatDate(certificateForm.birthDate)}</strong></div>
                <div class="date-box"><span>Data da apresentacao</span><strong>${formatDate(certificateForm.presentationDate)}</strong></div>
              </div>
              <p class="message">
                Como ato de fe e compromisso, esta crianca foi consagrada ao Senhor,
                para que seja criada nos caminhos do Senhor e em amor e obediencia a Sua Palavra.
              </p>
              ${verseHtml}
              ${signatureHtml}
              <div class="pastor-label">Pastor</div>
              <div class="church">${escapeHtml(certificateForm.churchName || "Nome da Igreja")}</div>
              <div class="seal">${officialSealHtml}</div>
            </div>
            <div class="validation">
              <img src="${certificateQrCodeDataUrl}" alt="QR Code de validacao" />
              <div><strong>Validacao</strong><br />${escapeHtml(certificateForm.certificateNumber)}</div>
            </div>
          </main>
          <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
        </body>
      </html>
    `;
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
  return (
    <div className="mx-auto max-w-[640px] rounded-xl bg-[#0B1E5B] p-2 text-[#0B1E5B] shadow-2xl">
      <div className="relative min-h-[860px] overflow-hidden border-2 border-[#C89B3C] bg-gradient-to-br from-[#071742] via-[#0B1E5B] to-[#071742] p-5 text-center">
        <span className="absolute inset-3 border-2 border-[#C89B3C]/90" />
        <div className="relative min-h-[820px] overflow-hidden rounded-[34px] border-2 border-[#C89B3C]/85 bg-[#F8F4EA] px-8 py-8 shadow-inner">
          <span className="absolute -top-24 left-1/2 h-40 w-[112%] -translate-x-1/2 rounded-[50%] border-b-8 border-[#C89B3C] shadow-[0_8px_0_#F5D98D,0_16px_0_#0B1E5B]" />
          <span className="absolute -bottom-24 left-1/2 h-40 w-[112%] -translate-x-1/2 rounded-[50%] border-t-8 border-[#C89B3C] shadow-[0_-8px_0_#F5D98D,0_-16px_0_#0B1E5B]" />
          <span className="pointer-events-none absolute inset-[18px] border border-[#0B1E5B]/25 outline outline-1 -outline-offset-[7px] outline-[#C89B3C]/60" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[230px] leading-none text-[#0B1E5B]/[0.035]">+</span>
          <span className="absolute left-4 top-4 h-24 w-24 rounded-tl-2xl border-l-[3px] border-t-[3px] border-[#C89B3C] after:absolute after:left-3 after:top-3 after:h-12 after:w-12 after:rounded-tl-xl after:border-l-2 after:border-t-2 after:border-[#0B1E5B]/70" />
          <span className="absolute right-4 top-4 h-24 w-24 rounded-tr-2xl border-r-[3px] border-t-[3px] border-[#C89B3C] after:absolute after:right-3 after:top-3 after:h-12 after:w-12 after:rounded-tr-xl after:border-r-2 after:border-t-2 after:border-[#0B1E5B]/70" />
          <span className="absolute bottom-4 left-4 h-24 w-24 rounded-bl-2xl border-b-[3px] border-l-[3px] border-[#C89B3C] after:absolute after:bottom-3 after:left-3 after:h-12 after:w-12 after:rounded-bl-xl after:border-b-2 after:border-l-2 after:border-[#0B1E5B]/70" />
          <span className="absolute bottom-4 right-4 h-24 w-24 rounded-br-2xl border-b-[3px] border-r-[3px] border-[#C89B3C] after:absolute after:bottom-3 after:right-3 after:h-12 after:w-12 after:rounded-br-xl after:border-b-2 after:border-r-2 after:border-[#0B1E5B]/70" />

          <div className="relative z-10 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-wider">
            <span className="rounded-full border border-[#C89B3C]/70 bg-white/60 px-3 py-1">{form.certificateNumber}</span>
            <span className="max-w-[170px] truncate text-right">{form.churchName || "Nome da Igreja"}</span>
          </div>

          {form.churchLogo && (
            <div className="relative z-10 mx-auto -mt-1 grid h-[190px] w-[330px] place-items-center">
              <img src={form.churchLogo} alt="Logotipo da igreja" className="h-[178px] w-[310px] object-contain" />
            </div>
          )}

          <div className="relative z-10 -mt-1 text-2xl text-[#C89B3C]">+</div>
          <h1 className="relative z-10 mt-1 font-serif text-[56px] font-black uppercase leading-none tracking-[0.18em] text-[#0B1E5B]">
            Certificado
          </h1>
          <h2 className="relative z-10 mt-3 font-serif text-xl font-bold uppercase tracking-[0.12em] text-[#C89B3C]">
            de Apresentacao de Crianca
          </h2>
          <div className="relative z-10 mx-auto mt-4 h-px w-56 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />

          <p className="relative z-10 mt-6 text-sm text-[#27345e]">Certificamos que, no dia da apresentacao, os pais</p>
          <p className="relative z-10 mt-2 font-serif text-3xl italic text-[#0B1E5B]">{form.fatherName || "Nome do Pai"}</p>
          <p className="relative z-10 mt-1 text-sm text-[#27345e]">e</p>
          <p className="relative z-10 mt-1 font-serif text-3xl italic text-[#0B1E5B]">{form.motherName || "Nome da Mae"}</p>
          <p className="relative z-10 mt-4 text-sm text-[#27345e]">apresentaram diante de Deus e da igreja a crianca</p>
          <p className="relative z-10 mt-2 font-serif text-5xl italic text-[#C89B3C]">{form.childName || "Nome da Crianca"}</p>

          <div className="relative z-10 mx-auto mt-5 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#C89B3C]/80 bg-white/50 p-3 shadow-inner">
              <p className="text-[10px] font-black uppercase">Data de nascimento</p>
              <p className="mt-1 text-sm font-black">{formatDate(form.birthDate)}</p>
            </div>
            <div className="rounded-lg border border-[#C89B3C]/80 bg-white/50 p-3 shadow-inner">
              <p className="text-[10px] font-black uppercase">Data da apresentacao</p>
              <p className="mt-1 text-sm font-black">{formatDate(form.presentationDate)}</p>
            </div>
          </div>

          <p className="relative z-10 mx-auto mt-5 max-w-md text-sm leading-6 text-[#27345e]">
            Como ato de fe e compromisso, esta crianca foi consagrada ao Senhor, para que seja criada nos caminhos do Senhor
            e em amor e obediencia a Sua Palavra.
          </p>
          {form.bibleVerse.trim() && (
            <p className="relative z-10 mx-auto mt-2 max-w-md text-sm italic leading-6 text-[#AD7F2C]">"{form.bibleVerse}"</p>
          )}

          <div className="relative z-10 mt-5 flex flex-col items-center">
            {form.pastorSignature ? (
              <img src={form.pastorSignature} alt="Assinatura do pastor" className="max-h-16 max-w-[220px] object-contain" />
            ) : (
              <p className="min-w-[230px] border-b border-[#0B1E5B] pb-1 font-serif text-2xl italic">
                {form.pastorName || "Nome do Pastor"}
              </p>
            )}
            <p className="mt-1 text-[11px] font-black uppercase tracking-widest">Pastor</p>
          </div>

          <p className="relative z-10 mt-4 font-serif text-xl font-black text-[#0B1E5B]">{form.churchName || "Nome da Igreja"}</p>
          <div
            className="relative z-10 mx-auto mt-2 h-[108px] w-[92px]"
            dangerouslySetInnerHTML={{ __html: buildOfficialSealSvg(92) }}
          />

          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 text-left text-[9px] font-bold text-[#0B1E5B]">
            <img src={qrCodeDataUrl} alt="QR Code de validacao" className="h-14 w-14 bg-white p-1" />
            <span>
              Validacao
              <br />
              {form.certificateNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

