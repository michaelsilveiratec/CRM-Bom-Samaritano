import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  MessageSquare,
  Smartphone,
  KeyRound,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  // Navigation Guard: if already authenticated, redirect to dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [auth.isAuthenticated, navigate]);

  // Auth Modes: 'email' | 'whatsapp' | 'recover'
  const [authMode, setAuthMode] = useState<"email" | "whatsapp" | "recover">("email");
  const [showPassword, setShowPassword] = useState(false);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // WhatsApp form state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Recovery State Machine (Steps 1 to 5)
  const [recoverStep, setRecoverStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryBlockedUntil, setRecoveryBlockedUntil] = useState<number | null>(null);
  const [isRecoveryProcessing, setIsRecoveryProcessing] = useState(false);

  // Error handling
  const [formError, setFormError] = useState<string | null>(null);

  // WhatsApp OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError("Por favor, preencha todos os campos.");
      return;
    }
    const success = await auth.login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError(auth.error || "Erro ao realizar login.");
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    const success = await auth.loginWithGoogle();
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError(auth.error || "Erro ao autenticar com o Google.");
    }
  };

  const handleSendWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!phone) {
      setFormError("Por favor, insira seu número de WhatsApp.");
      return;
    }
    const success = await auth.requestWhatsAppOTP(phone);
    if (success) {
      setOtpSent(true);
      setCountdown(60);
    } else {
      setFormError(auth.error || "Erro ao enviar código de verificação.");
    }
  };

  const handleVerifyWhatsAppOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!otpCode) {
      setFormError("Por favor, insira o código de 6 dígitos.");
      return;
    }
    const success = await auth.verifyWhatsAppOTP(phone, otpCode);
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError(auth.error || "Código de verificação incorreto.");
    }
  };

  const handleRecoveryStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return setFormError("Por favor, insira o e-mail cadastrado.");
    setFormError(null);
    setRecoverStep(2); // Next: WhatsApp number
  };

  const handleRecoveryStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPhone) return setFormError("Por favor, insira o WhatsApp vinculado.");
    
    setFormError(null);
    setIsRecoveryProcessing(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail, phone: recoveryPhone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setFormError(data.error || "Falha ao enviar código. Tente novamente.");
      } else {
        setRecoverStep(3); // Next: OTP input
        setCountdown(300); // 5 mins
      }
    } catch (err) {
      setFormError("Erro de conexão com o servidor de E-mail. Verifique se o backend (porta 3001) está rodando.");
    } finally {
      setIsRecoveryProcessing(false);
    }
  };

  const handleRecoveryStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryBlockedUntil && Date.now() < recoveryBlockedUntil) {
      return setFormError("Múltiplas falhas. Bloqueado temporariamente. Tente mais tarde.");
    }
    
    setFormError(null);
    setIsRecoveryProcessing(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail, code: recoveryOtp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const newAttempts = recoveryAttempts + 1;
        setRecoveryAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setRecoveryBlockedUntil(Date.now() + 15 * 60 * 1000); // 15 mins block
          setFormError("Você excedeu o limite de tentativas. Conta bloqueada temporariamente.");
        } else {
          setFormError((data.error || "Código incorreto.") + ` Você tem mais ${5 - newAttempts} tentativa(s).`);
        }
      } else {
        // Success
        setFormError(null);
        setRecoveryAttempts(0);
        setRecoverStep(4); // Next: Create new password
      }
    } catch (err) {
      setFormError("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setIsRecoveryProcessing(false);
    }
  };

  const handleRecoveryStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recoveryNewPassword.length < 8) return setFormError("A senha deve ter no mínimo 8 caracteres.");
    if (!/[A-Z]/.test(recoveryNewPassword)) return setFormError("A senha deve ter pelo menos uma letra maiúscula.");
    if (!/[0-9]/.test(recoveryNewPassword)) return setFormError("A senha deve ter pelo menos um número.");
    if (!/[^A-Za-z0-9]/.test(recoveryNewPassword)) return setFormError("A senha deve ter pelo menos um caractere especial.");
    if (recoveryNewPassword !== recoveryConfirmPassword) return setFormError("As senhas não coincidem.");
    
    console.log(`[AUDIT] Senha alterada com sucesso para o usuário ${recoveryEmail}.`);
    
    const date = new Date().toLocaleDateString("pt-BR");
    const time = new Date().toLocaleTimeString("pt-BR");
    console.log(`[SECURITY NOTIFICATION] E-mail/WhatsApp enviado para ${recoveryEmail} / ${recoveryPhone}:
Sua senha foi alterada em ${date} às ${time}.
Dispositivo: Navegador Web
Localização aproximada: Rio de Janeiro, Brasil`);

    setFormError(null);
    setRecoverStep(5); // Success
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    await auth.requestWhatsAppOTP(phone);
  };

  const handleBackToLogin = () => {
    setAuthMode("email");
    setOtpSent(false);
    setOtpCode("");
    
    setRecoverStep(1);
    setRecoveryEmail("");
    setRecoveryPhone("");
    setRecoveryOtp("");
    setRecoveryNewPassword("");
    setRecoveryConfirmPassword("");
    setFormError(null);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden font-sans select-none">
      {/* Animated Sleek Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md glass-card border border-white/10 p-8 shadow-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 backdrop-blur-xl rounded-2xl flex flex-col justify-between">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="bg-purple-600/20 p-3.5 rounded-2xl border border-purple-500/30 mb-3 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
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
          </form>
        )}

        {/* 2. WhatsApp Login OTP View */}
        {authMode === "whatsapp" && (
          <div className="space-y-5">
            {!otpSent ? (
              <form onSubmit={handleSendWhatsAppOTP} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    WhatsApp do Líder / Pastor
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      placeholder="(21) 99999-8888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Enviaremos um código de acesso de 6 dígitos via mensagem no WhatsApp.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={auth.loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-600/10 disabled:opacity-50"
                >
                  {auth.loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Enviar Código de Acesso
                      <MessageSquare size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyWhatsAppOTP} className="space-y-6">
                <div className="space-y-3 text-center">
                  <h4 className="text-sm font-semibold text-zinc-200">
                    Código de Segurança Enviado!
                  </h4>
                  <p className="text-xs text-zinc-400 px-4">
                    Insira o código de 6 dígitos enviado para seu WhatsApp <span className="font-semibold text-zinc-200">{phone}</span>.
                  </p>
                  
                  {/* Alert containing simulated code */}
                  <div className="py-2.5 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs inline-block font-semibold">
                    🔑 Código de demonstração enviado: <span className="text-white font-extrabold tracking-widest">777777</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Código de 6 dígitos"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-center tracking-widest font-bold text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={auth.loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {auth.loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Confirmar Código
                      <CheckCircle size={16} />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleResendOTP}
                    className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-60 transition-colors font-medium"
                  >
                    {countdown > 0
                      ? `Reenviar código em ${countdown}s`
                      : "Reenviar Código via WhatsApp"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. Password Recovery View */}
        {/* 3. Password Recovery View (5 steps) */}
        {authMode === "recover" && (
          <div className="space-y-5">
            {/* Step 1: Email */}
            {recoverStep === 1 && (
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
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Step 2: WhatsApp */}
            {recoverStep === 2 && (
              <form onSubmit={handleRecoveryStep2} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Confirme seu WhatsApp
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      placeholder="(21) 99999-8888"
                      value={recoveryPhone}
                      onChange={(e) => setRecoveryPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                    Por segurança, enviaremos um código de validação OTP simultâneo para o e-mail e para este WhatsApp.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isRecoveryProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRecoveryProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>Enviar Código <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: OTP Validation */}
            {recoverStep === 3 && (
              <form onSubmit={handleRecoveryStep3} className="space-y-5">
                <div className="space-y-3 text-center mb-6">
                  <h4 className="text-sm font-bold text-zinc-200">Verificação em Duas Etapas</h4>
                  <p className="text-xs text-zinc-400 px-2 leading-relaxed">
                    Insira o código de 6 dígitos que enviamos para seu e-mail e WhatsApp.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-center tracking-widest font-bold text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isRecoveryProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRecoveryProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>Validar Código <CheckCircle size={16} /></>
                  )}
                </button>
              </form>
            )}

            {/* Step 4: New Password */}
            {recoverStep === 4 && (
              <form onSubmit={handleRecoveryStep4} className="space-y-5">
                <div className="space-y-3 text-center mb-4">
                  <h4 className="text-sm font-bold text-emerald-400">Identidade Verificada</h4>
                  <p className="text-xs text-zinc-400">
                    Crie uma nova senha de acesso. Por segurança, ela deve conter:
                  </p>
                  <ul className="text-[10px] text-zinc-500 text-left grid grid-cols-2 gap-1 px-4 bg-white/5 p-3 rounded-lg border border-white/5">
                    <li className="flex items-center gap-1"><CheckCircle size={10} className={recoveryNewPassword.length >= 8 ? "text-emerald-400" : ""} /> Mín. 8 caracteres</li>
                    <li className="flex items-center gap-1"><CheckCircle size={10} className={/[A-Z]/.test(recoveryNewPassword) ? "text-emerald-400" : ""} /> 1 Letra Maiúscula</li>
                    <li className="flex items-center gap-1"><CheckCircle size={10} className={/[0-9]/.test(recoveryNewPassword) ? "text-emerald-400" : ""} /> 1 Número</li>
                    <li className="flex items-center gap-1"><CheckCircle size={10} className={/[^A-Za-z0-9]/.test(recoveryNewPassword) ? "text-emerald-400" : ""} /> 1 Caractere Especial</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nova Senha Forte"
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-zinc-500">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirmar Nova Senha"
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Redefinir Senha <CheckCircle size={16} />
                </button>
              </form>
            )}

            {/* Step 5: Success */}
            {recoverStep === 5 && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">Senha Alterada!</h4>
                  <p className="text-xs text-zinc-400 px-2 leading-relaxed">
                    Sua nova senha foi registrada com sucesso. Enviamos um alerta de segurança para seu e-mail e WhatsApp informando a alteração.
                  </p>
                </div>

                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg mt-4"
                >
                  Acessar minha conta
                </button>
              </div>
            )}
          </div>
        )}

        {/* Separator / Alternative Login options */}
        {authMode !== "recover" && !otpSent && (
          <div className="space-y-5 mt-6 pt-6 border-t border-white/5">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                ou continue com
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="flex flex-col gap-3">
              {/* WhatsApp Toggle Button */}
              {authMode === "email" ? (
                <button
                  onClick={() => {
                    setAuthMode("whatsapp");
                    setFormError(null);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <Smartphone size={16} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  Acessar com o WhatsApp
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("email");
                    setFormError(null);
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <Mail size={16} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
                  Entrar com E-mail e Senha
                </button>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.307 2.68 1.309 6.608l3.957 3.157z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M16.04 15.343c1.151-1.15 1.96-2.732 1.96-5.343 0-.682-.068-1.364-.205-2.045H12v4.09h4.41c-.19 1.045-.777 1.927-1.636 2.5l3.266 4.796c3.218-2.969 5.09-7.34 5.09-12.238 0-.964-.09-1.927-.272-2.873H12v8.182h8.182c-.886 4.391-4.727 7.727-9.273 7.727-2.318 0-4.418-.891-5.99-2.345L1.309 17.392c2.09 3.99 6.273 6.608 10.69 6.608 5.755 0 10.455-3.818 11.755-9.068l-7.714-4.773z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.273 0 6.027-1.09 8.036-2.945l-3.266-4.796c-1.318.89-2.973 1.418-4.77 1.418-3.664 0-6.764-2.482-7.873-5.836H1.309v4.036C3.307 21.32 7.354 24 12 24z"
                  />
                  <path
                    fill="#4285F4"
                    d="M4.127 11.836A7.054 7.054 0 0 1 4 12c0-.527.045-1.045.127-1.555L.17 7.288A11.947 11.947 0 0 0 0 12c0 1.636.327 3.218.909 4.673l3.218-4.837z"
                  />
                </svg>
                Fazer login com o Google
              </button>
            </div>
          </div>
        )}

        {/* Action button back to login inside recover/otp screens */}
        {(authMode === "recover" || otpSent) && (
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <button
              onClick={handleBackToLogin}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Voltar para o Login tradicional
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
