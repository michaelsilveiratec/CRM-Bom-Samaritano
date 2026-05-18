import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload";
import {
  Database,
  Building,
  Sliders,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Bell
} from "lucide-react";

export default function Settings() {
  const [churchName, setChurchName] = useState(() => 
    localStorage.getItem("settings_church_name") || "Bom Samaritano"
  );
  const [pastorName, setPastorName] = useState(() => 
    localStorage.getItem("settings_pastor_name") || "Pr. Anderson Silva"
  );
  const [whatsappCode, setWhatsappCode] = useState(() =>
    localStorage.getItem("settings_whatsapp_code") || "55"
  );
  const [birthdayNotifications, setBirthdayNotifications] = useState(() =>
    localStorage.getItem("settings_birthday_notif") !== "false"
  );
  const [supabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || "Não configurado");
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pastorPhoto, setPastorPhoto] = useState<string | null>(
    () => localStorage.getItem("settings_pastor_photo") || null
  );

  const handlePastorPhotoChange = (base64: string | null) => {
    setPastorPhoto(base64);
    if (base64) {
      localStorage.setItem("settings_pastor_photo", base64);
    } else {
      localStorage.removeItem("settings_pastor_photo");
    }
    window.dispatchEvent(new Event("crm-settings-updated"));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("settings_church_name", churchName);
    localStorage.setItem("settings_pastor_name", pastorName);
    localStorage.setItem("settings_whatsapp_code", whatsappCode);
    localStorage.setItem("settings_birthday_notif", String(birthdayNotifications));
    // Also update the user profile name inside crm_user
    const savedUser = localStorage.getItem("crm_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      user.name = pastorName;
      // Derive initials from the new pastor name
      const initials = pastorName
        .replace(/^(Pr\.|Dr\.|Pas\.?)\s*/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0].toUpperCase())
        .join("");
      user.avatar = initials || user.avatar;
      localStorage.setItem("crm_user", JSON.stringify(user));
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

        {/* Database / Supabase Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
              <Database className="text-blue-400" size={18} />
              <span>Conexão de Banco de Dados</span>
            </h3>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Ativo / Conectado
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Supabase URL</label>
              <input
                type="text"
                readOnly
                value={supabaseUrl}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-default font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Supabase Anon Key</label>
              <div className="relative">
                <input
                  type={showAnonKey ? "text" : "password"}
                  readOnly
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2xweGx1a2JkZ2ZkYmppbGYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3ODY0MDI0NCwiZXhwIjoyMDA0MjE2MjQ0fQ"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-default font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  title={showAnonKey ? "Ocultar chave" : "Mostrar chave"}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showAnonKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
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
