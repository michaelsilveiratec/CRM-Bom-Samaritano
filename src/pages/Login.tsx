import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  // Navigation Guard: if already authenticated, redirect to dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/app/dashboard");
    }
  }, [auth.isAuthenticated, navigate]);

  // Auth Modes: 'email' | 'recover' | 'register'
  const [authMode, setAuthMode] = useState<"email" | "recover" | "register">("email");
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Recovery State Machine
  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Error handling
  const [formError, setFormError] = useState<string | null>(null);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError("Por favor, preencha todos os campos.");
      return;
    }
    const success = await auth.login(email, password);
    if (success) {
      navigate("/app/dashboard");
    } else {
      setFormError(auth.error || "Erro ao realizar login.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!regName || !regEmail || !regPassword) {
      setFormError("Por favor, preencha todos os campos do cadastro.");
      return;
    }

    // Admin user gets Premium plan, others get 24h trial
    const plan = regEmail.toLowerCase() === "admin@bomsamaritano.org" ? "Premium" : "Teste Grátis 24 Horas";
    const success = await auth.register(regName, regEmail, regPassword, plan, "");
    if (success) {
      navigate("/app/dashboard");
    } else {
      setFormError(auth.error || "Erro ao realizar cadastro.");
    }
  };

  const handleRecoveryStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!recoveryEmail) {
      setFormError("Por favor, insira o e-mail cadastrado.");
      return;
    }

    const success = await auth.recoverPassword(recoveryEmail);
    if (success) {
      setRecoverStep(2);
    } else {
      setFormError(auth.error || "Erro ao enviar o e-mail de recuperação.");
    }
  };

  const handleBackToLogin = () => {
    setAuthMode("email");
    setRecoverStep(1);
    setRecoveryEmail("");
    setFormError(null);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden font-sans select-none">
      {/* Back to Landing Page */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 text-zinc-400 hover:text-purple-400 text-xs font-semibold transition-all active:scale-95"
      >
        <ArrowLeft size={14} />
        <span>Voltar ao Início</span>
      </Link>

      {/* Animated Sleek Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md glass-card border border-white/10 p-8 shadow-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 backdrop-blur-xl rounded-2xl flex flex-col justify-between">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <img
            src="/logo.png"
            alt="Bom Samaritano Logo"
            className="w-24 h-24 object-contain rounded-3xl border border-purple-500/20 mb-4 shadow-lg shadow-purple-500/10"
          />
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Bom Samaritano
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
            Gestão Pastoral Integrada
          </p>
        </div>

        {/* Global Error Alert */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}

        {/* 1. Traditional Email Login View */}
        {authMode === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  placeholder="pastor@bomsamaritano.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</label>
                <button
                  type="button"
                  onClick={() => setAuthMode("recover")}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 mt-4 hover:shadow-purple-600/20 disabled:opacity-50"
            >
              {auth.loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-white/5 mt-4">
              <span className="text-xs text-zinc-500">Não tem uma conta? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setFormError(null);
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Cadastre-se e Teste Grátis 24h
              </button>
            </div>
          </form>
        )}

        {/* 1.5. User Registration View */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Escolha uma Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 mt-4 hover:shadow-purple-600/20 disabled:opacity-50"
            >
              {auth.loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Criar Conta & Teste 24h 🚀
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-white/5 mt-4">
              <span className="text-xs text-zinc-500">Já tem uma conta? </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("email");
                  setFormError(null);
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Faça login
              </button>
            </div>
          </form>
        )}

        {/* 2. Password Recovery View */}
        {authMode === "recover" && (
          <div className="space-y-5">
            {recoverStep === 1 ? (
              <form onSubmit={handleRecoveryStep1} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Confirme seu E-mail
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Enviaremos um link de redefinição para seu e-mail.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={auth.loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {auth.loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Enviar Link de Recuperação
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-2"
                >
                  Voltar para o Login
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">E-mail enviado!</h3>
                  <p className="text-sm text-zinc-400 mt-2">
                    Verifique sua caixa de entrada. O link para redefinir sua senha foi enviado para <strong>{recoveryEmail}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all"
                >
                  Voltar para o Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
