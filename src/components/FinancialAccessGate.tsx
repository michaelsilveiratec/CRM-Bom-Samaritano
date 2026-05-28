import { FormEvent, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";

interface FinancialAccessGateProps {
  children: ReactNode;
}

const FINANCIAL_PASSWORD_KEY = "settings_financial_password";
const DEFAULT_FINANCIAL_PASSWORD = "1234";

export default function FinancialAccessGate({ children }: FinancialAccessGateProps) {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const savedPassword = localStorage.getItem(FINANCIAL_PASSWORD_KEY) || DEFAULT_FINANCIAL_PASSWORD;

    if (password === savedPassword) {
      setIsUnlocked(true);
      setPassword("");
      setError("");
      return;
    }

    setError("Senha incorreta. Tente novamente.");
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Acesso Financeiro</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Informe a senha para abrir o painel financeiro.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
                placeholder="Digite a senha"
              />
            </div>
            {error ? <p className="mt-2 text-xs font-semibold text-rose-400">{error}</p> : null}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/dashboard")}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-500 active:scale-95"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
