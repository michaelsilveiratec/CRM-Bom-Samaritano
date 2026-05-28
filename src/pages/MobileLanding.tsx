import { ArrowRight, Info, Users, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServerSettings } from "../services/crm.service";

export default function MobileLanding() {
  const [churchName, setChurchName] = useState("Bom Samaritano");
  const [pastorName, setPastorName] = useState("Pastor");
  const [pastorPhoto, setPastorPhoto] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchServerSettings()
      .then((response) => {
        if (!isMounted || !response?.settings) return;
        setChurchName(response.settings.churchName || "Bom Samaritano");
        setPastorName(response.settings.pastorName || "Pastor");
        setPastorPhoto(response.settings.pastorPhoto || "");
      })
      .catch((error) => {
        console.warn("Nao foi possivel carregar configuracoes no mobile:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-[2rem] border border-violet-500/30 bg-white/5 p-5 shadow-[0_24px_80px_-40px_rgba(84,73,210,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-3xl bg-violet-500/10 p-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-3xl bg-black/20 border border-violet-500/25">
            {pastorPhoto ? (
              <img src={pastorPhoto} alt={pastorName} className="h-full w-full object-cover" />
            ) : (
              <img src="/logo.png" alt="Logo Bom Samaritano" className="h-14 w-14 object-contain" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{churchName}</p>
            <p className="text-sm text-zinc-300">Pastor responsavel: {pastorName}</p>
            <p className="mt-1 text-xs text-zinc-400">Cadastros enviados para o sistema principal.</p>
          </div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-[0.35em] text-zinc-400">O que voce deseja fazer?</div>

      <div className="space-y-4">
        <Link
          to="members"
          className="group block rounded-[2rem] border border-emerald-500/20 bg-gradient-to-r from-emerald-500/12 to-emerald-500/6 p-5 shadow-[0_24px_80px_-55px_rgba(16,185,129,0.35)] transition hover:border-emerald-400/40 hover:from-emerald-500/22 hover:to-emerald-500/12"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <UserPlus size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Cadastrar Membro</h3>
              <p className="mt-1 text-sm text-zinc-300">Adicione um novo membro a igreja.</p>
            </div>
            <ArrowRight size={20} className="text-zinc-300 transition group-hover:text-white" />
          </div>
        </Link>

        <Link
          to="visitors"
          className="group block rounded-[2rem] border border-sky-500/20 bg-gradient-to-r from-sky-500/12 to-sky-500/6 p-5 shadow-[0_24px_80px_-55px_rgba(14,165,233,0.35)] transition hover:border-sky-400/40 hover:from-sky-500/22 hover:to-sky-500/12"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <Users size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Cadastrar Visitante</h3>
              <p className="mt-1 text-sm text-zinc-300">Adicione um novo visitante a igreja.</p>
            </div>
            <ArrowRight size={20} className="text-zinc-300 transition group-hover:text-white" />
          </div>
        </Link>
      </div>

      <div className="rounded-[2rem] border border-violet-500/20 bg-white/5 p-5 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.8)]">
        <div className="flex items-start gap-3 text-zinc-300">
          <div className="mt-1 rounded-2xl bg-violet-500/10 p-2 text-violet-300">
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Importante</p>
            <p className="mt-2 text-sm text-zinc-300">Todos os cadastros feitos aqui serao enviados automaticamente para o sistema principal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
