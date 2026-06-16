import { useEffect, useState } from "react";
import PhotoUpload from "../components/PhotoUpload";
import { fetchServerSettings, saveServerSettings } from "../services/crm.service";
import {
  Database,
  Building,
  Sliders,
  Save,
  CheckCircle,
  RefreshCw,
  Trash2,
  Bell,
  MessageSquare,
  Key,
  Link2,
  ShieldCheck,
  FileText,
  UserX,
  History,
  Download,
  ExternalLink,
  ClipboardCheck
} from "lucide-react";

const LGPD_REQUESTS_KEY = "lgpd_requests";

type LgpdRequestType = "exclusao" | "revogacao" | "anonimizacao" | "bloqueio_contato";

type LgpdRequest = {
  id: string;
  type: LgpdRequestType;
  label: string;
  createdAt: string;
  responsible: string;
  status: "registrada";
};

const lgpdRequestLabels: Record<LgpdRequestType, string> = {
  exclusao: "Solicitação de exclusão",
  revogacao: "Revogação de consentimento",
  anonimizacao: "Anonimização de registros",
  bloqueio_contato: "Bloqueio de contato",
};

function readLgpdRequests(): LgpdRequest[] {
  try {
    const stored = localStorage.getItem(LGPD_REQUESTS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Settings() {
  const defaultPastorNames = new Set(["Pr. Anderson Silva", "Pr. Anderson Silva (Google)", "Anderson Silva"]);

  const [churchName, setChurchName] = useState(() => 
    localStorage.getItem("settings_church_name") || "Bom Samaritano"
  );
  const [pastorName, setPastorName] = useState(() => {
    const storedName = localStorage.getItem("settings_pastor_name");
    return storedName && !defaultPastorNames.has(storedName) ? storedName : "Pastor";
  });
  const [whatsappCode, setWhatsappCode] = useState(() =>
    localStorage.getItem("settings_whatsapp_code") || "55"
  );
  const [birthdayNotifications, setBirthdayNotifications] = useState(() =>
    localStorage.getItem("settings_birthday_notif") !== "false"
  );
  const [waAutoDispatch, setWaAutoDispatch] = useState(() =>
    localStorage.getItem("settings_wa_auto") === "true"
  );
  const [waApiUrl, setWaApiUrl] = useState(() =>
    localStorage.getItem("settings_wa_api_url") || ""
  );
  const [waApiKey, setWaApiKey] = useState(() =>
    localStorage.getItem("settings_wa_api_key") || ""
  );
  const [financialPassword, setFinancialPassword] = useState(() =>
    localStorage.getItem("settings_financial_password") || "1234"
  );
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pastorPhoto, setPastorPhoto] = useState<string | null>(
    () => localStorage.getItem("settings_pastor_photo") || null
  );
  const [lgpdRequests, setLgpdRequests] = useState<LgpdRequest[]>(readLgpdRequests);

  useEffect(() => {
    let isMounted = true;

    fetchServerSettings()
      .then((response) => {
        if (!isMounted || !response?.settings) return;

        const settings = response.settings;
        const hasSavedServerSettings = Boolean(settings.updatedAt);
        const localPastorName = localStorage.getItem("settings_pastor_name");
        const localChurchName = localStorage.getItem("settings_church_name");

        if (settings.churchName && (hasSavedServerSettings || !localChurchName)) {
          setChurchName(settings.churchName);
          localStorage.setItem("settings_church_name", settings.churchName);
        }
        if (
          settings.pastorName &&
          !defaultPastorNames.has(settings.pastorName) &&
          (hasSavedServerSettings || !localPastorName || defaultPastorNames.has(localPastorName))
        ) {
          setPastorName(settings.pastorName);
          localStorage.setItem("settings_pastor_name", settings.pastorName);
        }
        if (settings.pastorPhoto && (hasSavedServerSettings || !localStorage.getItem("settings_pastor_photo"))) {
          setPastorPhoto(settings.pastorPhoto);
          localStorage.setItem("settings_pastor_photo", settings.pastorPhoto);
        }
        if (settings.whatsappCode) {
          setWhatsappCode(settings.whatsappCode);
          localStorage.setItem("settings_whatsapp_code", settings.whatsappCode);
        }
        setBirthdayNotifications(settings.birthdayNotifications !== false);
        localStorage.setItem("settings_birthday_notif", String(settings.birthdayNotifications !== false));
        setWaAutoDispatch(settings.waAutoDispatch === true);
        localStorage.setItem("settings_wa_auto", String(settings.waAutoDispatch === true));
        if (settings.waApiUrl) {
          setWaApiUrl(settings.waApiUrl);
          localStorage.setItem("settings_wa_api_url", settings.waApiUrl);
        }
        if (settings.financialPassword) {
          setFinancialPassword(settings.financialPassword);
          localStorage.setItem("settings_financial_password", settings.financialPassword);
        }
        window.dispatchEvent(new Event("crm-settings-updated"));
      })
      .catch((error) => {
        console.warn("Não foi possível carregar configurações do backend:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePastorPhotoChange = (base64: string | null) => {
    setPastorPhoto(base64);
    if (base64) {
      localStorage.setItem("settings_pastor_photo", base64);
    } else {
      localStorage.removeItem("settings_pastor_photo");
    }
    saveServerSettings({
      churchName,
      pastorName,
      pastorPhoto: base64 || "",
      whatsappCode,
      birthdayNotifications,
      waAutoDispatch,
      waApiUrl,
      financialPassword,
    }).catch((error) => {
      console.warn("Não foi possível salvar a foto do pastor no backend local:", error);
    });
    window.dispatchEvent(new Event("crm-settings-updated"));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("settings_church_name", churchName);
    localStorage.setItem("settings_pastor_name", pastorName);
    localStorage.setItem("settings_whatsapp_code", whatsappCode);
    localStorage.setItem("settings_birthday_notif", String(birthdayNotifications));
    localStorage.setItem("settings_wa_auto", String(waAutoDispatch));
    localStorage.setItem("settings_wa_api_url", waApiUrl);
    localStorage.setItem("settings_wa_api_key", waApiKey);
    localStorage.setItem("settings_financial_password", financialPassword || "1234");
    // Also update the user profile name inside crm_user
    const savedUser = localStorage.getItem("crm_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.name = pastorName;
      // Derive initials from the new pastor name
      const initials = pastorName
        .replace(/^(Pr\.|Dr\.|Pas\.|Pastor|Pastora)\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0].toUpperCase())
        .join("");
      user.avatar = initials || user.avatar;
      localStorage.setItem("crm_user", JSON.stringify(user));
    }
    try {
      await saveServerSettings({
        churchName,
        pastorName,
        pastorPhoto: pastorPhoto || "",
        whatsappCode,
        birthdayNotifications,
        waAutoDispatch,
        waApiUrl,
        financialPassword: financialPassword || "1234",
      });
    } catch (error) {
      console.warn("Não foi possível salvar configurações no backend local:", error);
    }
    // Notify all listening components (Sidebar, Dashboard, etc.) of the change
    window.dispatchEvent(new Event("crm-settings-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearData = () => {
    const keysToKeep = ["crm_user"];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    setShowClearConfirm(false);
    alert("Todos os dados do CRM foram apagados. A página será recarregada.");
    window.location.reload();
  };

  const getResponsibleUser = () => {
    try {
      const savedUser = localStorage.getItem("crm_user");
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      return parsedUser?.name || pastorName || "Usuário do sistema";
    } catch {
      return pastorName || "Usuário do sistema";
    }
  };

  const registerLgpdRequest = (type: LgpdRequestType) => {
    const request: LgpdRequest = {
      id: `lgpd-${Date.now()}`,
      type,
      label: lgpdRequestLabels[type],
      createdAt: new Date().toISOString(),
      responsible: getResponsibleUser(),
      status: "registrada",
    };
    const nextRequests = [request, ...lgpdRequests].slice(0, 100);
    localStorage.setItem(LGPD_REQUESTS_KEY, JSON.stringify(nextRequests));
    setLgpdRequests(nextRequests);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const downloadTextFile = (fileName: string, content: string, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadConsentTerm = () => {
    downloadTextFile(
      "termo_consentimento_bom_samaritano.txt",
      [
        "TERMO DE CONSENTIMENTO - SISTEMA BOM SAMARITANO",
        "",
        "Declaro que autorizo o tratamento dos meus dados pessoais pelo Sistema Bom Samaritano - CRM Pastoral, para fins de cadastro pastoral, acompanhamento ministerial, comunicação institucional, discipulado, batismo e emissão de certificados.",
        "",
        "Titular dos dados: ____________________________________",
        "Responsável legal, quando aplicável: __________________",
        "Origem do consentimento: ______________________________",
        "Data e hora: __________________________________________",
        "Usuário responsável: __________________________________",
        "",
        "O consentimento poderá ser revogado a qualquer momento, mediante solicitação ao administrador responsável.",
      ].join("\n")
    );
  };

  const openPrivacyPolicy = () => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.open(`${basePath}/privacidade`, "_blank", "noopener,noreferrer");
  };

  const exportLgpdAudit = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      system: "Bom Samaritano - CRM Pastoral",
      responsible: "Pastor Michael Ramos",
      church: churchName,
      requests: lgpdRequests,
      documents: [
        "docs/LGPD.md",
        "docs/POLITICA_PRIVACIDADE.md",
        "docs/TERMO_CONSENTIMENTO.md",
        "docs/RETENCAO_DADOS.md",
        "docs/CONTROLE_ACESSO.md",
        "docs/AUDITORIA.md",
      ],
      protectedDataPolicy:
        "Banco real, planilhas, backups, arquivos .env, uploads e dados pessoais não devem ser enviados ao GitHub.",
    };
    downloadTextFile(
      "lgpd_auditoria_bom_samaritano.json",
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Configurações</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Ajuste as preferências do CRM, perfil da igreja e conexões de banco de dados
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Church Profile Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/10">
          <h3 className="text-base font-bold text-zinc-200 mb-6 flex items-center gap-2">
            <Building className="text-purple-400" size={18} />
            <span>Perfil da Igreja e do Pastor</span>
          </h3>

          {/* Pastor Photo Upload */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-white/5 border border-white/5 rounded-xl">
            <PhotoUpload
              photoUrl={pastorPhoto || undefined}
              name={pastorName}
              size="xl"
              onPhotoChange={handlePastorPhotoChange}
            />
            <div>
              <h4 className="text-sm font-bold text-zinc-200">{pastorName}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Pastor Presidente</p>
              <p className="text-[10px] text-zinc-500 mt-2 max-w-xs leading-relaxed">
                Clique na foto para alterar. Suportado: JPG, PNG, WEBP (máx. 3MB).
                A foto aparece na barra lateral e em todo o sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome da Igreja</label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pastor Presidente</label>
              <input
                type="text"
                value={pastorName}
                onChange={(e) => setPastorName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Local Database Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
              <Database className="text-blue-400" size={18} />
              <span>Conexão de Banco de Dados</span>
            </h3>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Local / No notebook
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Servidor local</label>
              <input
                type="text"
                readOnly
                value={import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-default font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Arquivos de dados</label>
              <input
                type="text"
                readOnly
                value="backend/users.json, backend/members.json, backend/visitors.json e dados do navegador local"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-default font-mono"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp API Configuration Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
              <MessageSquare className="text-emerald-400" size={18} />
              <span>Conexão WhatsApp API (Disparo Automático)</span>
            </h3>
            <button
              type="button"
              onClick={() => setWaAutoDispatch(!waAutoDispatch)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                waAutoDispatch ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  waAutoDispatch ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Ative para realizar disparos automáticos em segundo plano diretamente pela API (ex: Evolution API, Baileys, Meta Cloud ou WPPConnect), sem precisar abrir abas do WhatsApp Web.
          </p>

          {waAutoDispatch && (
            <div className="space-y-4 pt-2 border-t border-white/5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 size={14} className="text-purple-400" />
                  URL do Endpoint da API (Instância)
                </label>
                <input
                  type="text"
                  value={waApiUrl}
                  onChange={(e) => setWaApiUrl(e.target.value)}
                  placeholder="Ex: https://api.ultramsg.com/instance176612/messages/chat"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key size={14} className="text-amber-400" />
                  API Key / Token de Autenticação
                </label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  placeholder="Insira seu token de autorização da instância"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Global preferences */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/10">
          <h3 className="text-base font-bold text-zinc-200 mb-6 flex items-center gap-2">
            <Sliders className="text-amber-400" size={18} />
            <span>Preferências do Sistema</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">DDI WhatsApp Padrão</label>
              <input
                type="text"
                value={whatsappCode}
                onChange={(e) => setWhatsappCode(e.target.value)}
                placeholder="Ex: 55"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Idioma Padrão</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer">
                <option value="pt" className="bg-zinc-900">Português (Brasil)</option>
                <option value="en" className="bg-zinc-900">English</option>
                <option value="es" className="bg-zinc-900">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key size={14} className="text-emerald-400" />
                Senha do Financeiro
              </label>
              <input
                type="password"
                value={financialPassword}
                onChange={(e) => setFinancialPassword(e.target.value)}
                placeholder="Ex: 1234"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Esta senha será solicitada antes de abrir o painel financeiro.
              </p>
            </div>
          </div>

          {/* Notification Toggle */}
          <div className="mt-6 flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Alertas de Aniversariantes</p>
                <p className="text-xs text-zinc-500 mt-0.5">Exibir banner no Dashboard quando membros fazem aniversário</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBirthdayNotifications(!birthdayNotifications)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                birthdayNotifications ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  birthdayNotifications ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* LGPD and privacy */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span>LGPD e Privacidade</span>
            </h3>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <ClipboardCheck size={12} />
              Base documental ativa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={openPrivacyPolicy}
              className="group flex min-h-[112px] items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-purple-400/40 hover:bg-white/10 active:scale-[0.99]"
            >
              <FileText className="mt-0.5 shrink-0 text-purple-400" size={20} />
              <span>
                <span className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                  Política de Privacidade
                  <ExternalLink size={14} className="text-zinc-500 group-hover:text-purple-300" />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                  Abre a página pública /privacidade para apresentação da política.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={downloadConsentTerm}
              className="flex min-h-[112px] items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-emerald-400/40 hover:bg-white/10 active:scale-[0.99]"
            >
              <ClipboardCheck className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <span>
                <span className="text-sm font-bold text-zinc-100">Termo de Consentimento</span>
                <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                  Baixa um modelo simples para coleta de autorização do titular ou responsável.
                </span>
              </span>
            </button>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <UserX className="mt-0.5 shrink-0 text-rose-400" size={20} />
                <div>
                  <p className="text-sm font-bold text-zinc-100">Solicitações de Exclusão</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    Registre pedidos de exclusão, anonimização, revogação ou bloqueio de contato.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => registerLgpdRequest("exclusao")}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => registerLgpdRequest("anonimizacao")}
                  className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
                >
                  Anonimizar
                </button>
                <button
                  type="button"
                  onClick={() => registerLgpdRequest("revogacao")}
                  className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-500/20"
                >
                  Revogar
                </button>
                <button
                  type="button"
                  onClick={() => registerLgpdRequest("bloqueio_contato")}
                  className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
                >
                  Bloquear
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 shrink-0 text-blue-400" size={20} />
                  <div>
                    <p className="text-sm font-bold text-zinc-100">Auditoria LGPD</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {lgpdRequests.length} registro(s) local(is) de solicitações LGPD.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exportLgpdAudit}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  <Download size={14} />
                  Exportar
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {lgpdRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <p className="text-xs font-bold text-zinc-200">{request.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      {new Date(request.createdAt).toLocaleString("pt-BR")} por {request.responsible}
                    </p>
                  </div>
                ))}
                {lgpdRequests.length === 0 && (
                  <p className="rounded-lg border border-white/5 bg-black/20 px-3 py-3 text-xs text-zinc-500">
                    Nenhuma solicitação LGPD registrada neste navegador.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-xs leading-relaxed text-zinc-400">
              Exportação de Dados: use o arquivo de auditoria apenas para controle interno.
              Bancos reais, planilhas, backups, arquivos .env, uploads e dados pessoais
              devem permanecer fora do GitHub.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 bg-gradient-to-br from-rose-950/20 to-zinc-950 border border-rose-500/20">
          <h3 className="text-base font-bold text-rose-400 mb-4 flex items-center gap-2">
            ⚠️ Zona de Perigo
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Esta ação irá apagar todos os dados cadastrados no CRM (membros, visitantes, discipulado e financeiro). Os dados de login serão mantidos. Esta ação <strong className="text-rose-400">não pode ser desfeita</strong>.
          </p>
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              <Trash2 size={16} />
              <span>Apagar Todos os Dados do CRM</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-rose-300 font-semibold">Tem certeza? Esta ação é irreversível!</span>
              <button
                type="button"
                onClick={handleClearData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                Sim, apagar tudo
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Save button bar */}
        <div className="flex gap-4 items-center justify-between">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all active:scale-95"
          >
            <RefreshCw size={16} />
            <span>Recarregar Página</span>
          </button>

          <div className="flex items-center gap-4">
            {saved && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-400 font-semibold animate-fade-in">
                <CheckCircle size={16} />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Save size={16} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
