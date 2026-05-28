import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const tokenParam = searchParams.get("token") || "";
    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !token) {
      setFormError("Link inválido ou expirado. Solicite um novo e-mail de recuperação.");
      return;
    }

    if (password.length < 8) {
      setFormError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    const success = await auth.resetPassword(email, token, password);
    if (success) {
      setSuccessMessage("Senha redefinida com sucesso. Você já pode acessar o painel com sua nova senha.");
    } else {
      setFormError(auth.error || "Não foi possível redefinir a senha.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-600/10 text-purple-300">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Use o formulário abaixo para criar uma nova senha para sua conta.
          </p>
        </div>

        {formError && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {formError}
          </div>
        )}

        {successMessage ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-white">{successMessage}</p>
              <p className="text-sm text-zinc-400">Clique abaixo para voltar ao login e acessar sua conta.</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold transition hover:bg-purple-500"
            >
              Voltar ao Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">E-mail</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Confirmar senha</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
            <button
              type="submit"
              disabled={auth.loading}
              className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold transition hover:bg-purple-500 disabled:opacity-50"
            >
              {auth.loading ? "Aguarde..." : "Redefinir senha"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-purple-500"
            >
              Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
