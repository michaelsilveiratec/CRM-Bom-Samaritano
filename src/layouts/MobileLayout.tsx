import { Link, Outlet } from "react-router-dom";
import { Home } from "lucide-react";

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_28%),#05050b] text-white">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-4 pt-6 pb-4">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-violet-500/25 bg-violet-500/10 shadow-[0_20px_60px_-45px_rgba(168,85,247,0.45)]">
            <img src="/logo.png" alt="Logo Bom Samaritano" className="h-24 w-24 rounded-[1.75rem] object-contain" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Gestao Pastoral</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Bom <span className="text-violet-400">Samaritano</span></h1>
          </div>
        </header>

        <main className="px-4">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-zinc-950/95 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center justify-center">
            <Link to="/mobile" className="flex w-full flex-col items-center gap-1 rounded-3xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white shadow-sm shadow-black/20 transition hover:bg-white/10">
              <Home size={18} />
              Inicio
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
