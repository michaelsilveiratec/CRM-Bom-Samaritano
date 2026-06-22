import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Heart,
  ClipboardCheck,
  Droplets,
  Wallet,
  MessageSquare,
  FileText,
  Gift,
  Settings,
  LogOut
} from "lucide-react";

function readUser() {
  const pastorName = localStorage.getItem("settings_pastor_name");
  const savedUser = localStorage.getItem("crm_user");
  const defaultNames = new Set(["Pr. Anderson Silva", "Pr. Anderson Silva (Google)", "Anderson Silva"]);
  let base = { name: "Pastor", role: "Pastor Presidente", avatar: "P" };

  if (savedUser) {
    try {
      base = { ...base, ...JSON.parse(savedUser) };
    } catch {
      localStorage.removeItem("crm_user");
    }
  }

  if (pastorName && !defaultNames.has(pastorName)) {
    base.name = pastorName;
  } else if (defaultNames.has(base.name) || (pastorName && defaultNames.has(pastorName))) {
    base.name = "Pastor";
    base.avatar = "P";
  }
  return base;
}

function readPastorPhoto(): string | null {
  return localStorage.getItem("settings_pastor_photo");
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser);
  const [pastorPhoto, setPastorPhoto] = useState<string | null>(readPastorPhoto);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setUser(readUser());
      setPastorPhoto(readPastorPhoto());
    };
    window.addEventListener("crm-settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleSettingsUpdate);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
    { icon: UserPlus, label: "Visitantes", path: "/app/visitors" },
    { icon: Users, label: "Membros", path: "/app/members" },
    { icon: ClipboardCheck, label: "Presença", path: "/app/attendance" },
    { icon: UserPlus, label: "Crianças", path: "/app/children" },
    { icon: UserPlus, label: "Jovens", path: "/app/youth" },
    { icon: Heart, label: "Discipulado", path: "/app/discipleship" },
    { icon: Droplets, label: "Batismo", path: "/app/baptism" },
    { icon: Wallet, label: "Financeiro", path: "/app/financial" },
    { icon: MessageSquare, label: "Mensagens", path: "/app/messages" },
    { icon: Gift, label: "Aniversariantes", path: "/app/birthdays" },
    { icon: FileText, label: "Certificados", path: "/app/certificates" },
    { icon: Settings, label: "Configurações", path: "/app/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("crm_user");
    navigate("/", { replace: true });
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col h-full justify-between">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="logo-led cursor-pointer">
            <img
              src="/logo.png"
              alt="Bom Samaritano Logo"
              className="theme-logo-dark w-16 h-16 object-contain rounded-xl"
            />
            <img
              src="/logo-profissional.svg"
              alt="Bom Samaritano Logo Profissional"
              className="theme-logo-professional w-16 h-16 object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Bom Samaritano
            </h1>
            <p className="text-xs text-zinc-500">Gestão Pastoral</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-purple-600/20 border border-purple-500/30 text-purple-200"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                     size={20}
                     className={`transition-transform duration-200 group-hover:scale-110 ${
                       isActive ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
                     }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile bottom card with built-in logout trigger */}
      <div className="p-4 border-t border-white/10 bg-zinc-950/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Pastor photo or initials */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0 shadow-lg">
            {pastorPhoto ? (
              <img src={pastorPhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                {user.avatar || "AS"}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-zinc-200 truncate">{user.name}</h4>
            <p className="text-xs text-zinc-500 truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sair do Sistema"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 transition-all shrink-0 cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
