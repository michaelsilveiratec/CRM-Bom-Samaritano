import { Bell, Search, Calendar, Plus, Users, UserPlus, Heart, Wallet, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleNavigate = (path: string) => {
    setShowDropdown(false);
    navigate(path, { state: { openModal: true } });
  };

  // Determine today's birthday members for notifications
  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Static notification list - birthday members
  const notifications = [
    { id: 1, text: "🎂 Sandra Regina faz aniversário hoje!", sub: "Clique para enviar parabéns", type: "birthday", link: "/members" },
    { id: 2, text: "🎂 Lucas Rocha faz aniversário hoje!", sub: "Clique para enviar parabéns", type: "birthday", link: "/members" },
    { id: 3, text: "👤 Novo visitante: Clarice Lima", sub: "Registrado em 10/05/2026", type: "visitor", link: "/visitors" },
    { id: 4, text: "💰 Dízimo de Anderson Silva registrado", sub: "R$ 800,00 via Pix", type: "financial", link: "/financial" },
  ];

  // Quick search results based on static data
  const quickSearchData = [
    { label: "Anderson Silva", type: "Membro", link: "/members" },
    { label: "Sandra Regina", type: "Membro - Aniversariante Hoje 🎂", link: "/members" },
    { label: "Lucas Rocha", type: "Líder de Célula", link: "/members" },
    { label: "Clarice Lima", type: "Visitante", link: "/visitors" },
    { label: "Rodrigo Alencar", type: "Visitante - Acompanhado", link: "/visitors" },
    { label: "Dashboard", type: "Página", link: "/dashboard" },
    { label: "Financeiro", type: "Página", link: "/financial" },
    { label: "Discipulado", type: "Página", link: "/discipleship" },
    { label: "Mensagens", type: "Página", link: "/messages" },
    { label: "Configurações", type: "Página", link: "/settings" },
  ];

  const filteredSearch = searchQuery.length >= 2
    ? quickSearchData.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-zinc-950/40 backdrop-blur-md sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80" ref={searchRef}>
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar membros, relatórios ou tarefas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length >= 2);
            }}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          )}

          {/* Search results dropdown */}
          {showSearchResults && filteredSearch.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl">
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Resultados ({filteredSearch.length})
              </div>
              {filteredSearch.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(result.link);
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-all text-left"
                >
                  <span className="text-zinc-200 font-semibold">{result.label}</span>
                  <span className="text-zinc-500 text-[10px] shrink-0">{result.type}</span>
                </button>
              ))}
            </div>
          )}
          {showSearchResults && filteredSearch.length === 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-zinc-950 border border-white/10 p-4 shadow-2xl z-50 text-center text-xs text-zinc-500">
              Nenhum resultado para "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                <span>Notificações ({notifications.length})</span>
                <button onClick={() => setShowNotifications(false)} className="text-zinc-600 hover:text-zinc-400">
                  <X size={14} />
                </button>
              </div>
              {notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => { navigate(notif.link); setShowNotifications(false); }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-all border border-transparent"
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-200">{notif.text}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{notif.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Novo Registro Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl animate-scale-up">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Registrar Novo(a)
              </div>
              <button
                onClick={() => handleNavigate("/members")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent transition-all text-left"
              >
                <Users size={16} className="text-purple-400" />
                <span>Membro</span>
              </button>
              <button
                onClick={() => handleNavigate("/visitors")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent transition-all text-left"
              >
                <UserPlus size={16} className="text-blue-400" />
                <span>Visitante</span>
              </button>
              <button
                onClick={() => handleNavigate("/discipleship")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-rose-600/20 hover:border-rose-500/30 border border-transparent transition-all text-left"
              >
                <Heart size={16} className="text-rose-400" />
                <span>Dupla de Discipulado</span>
              </button>
              <button
                onClick={() => handleNavigate("/financial")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-emerald-600/20 hover:border-emerald-500/30 border border-transparent transition-all text-left"
              >
                <Wallet size={16} className="text-emerald-400" />
                <span>Lançamento Financeiro</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
