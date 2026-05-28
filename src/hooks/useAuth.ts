import { useState } from "react";
import {
  loginRequest,
  registerRequest,
  requestWhatsAppOTP as requestWhatsAppOTPRequest,
  verifyWhatsAppOTP as verifyWhatsAppOTPRequest,
  recoverPasswordRequest,
  resetPasswordRequest,
} from "../services/auth.service";

export interface User {
  email: string;
  name: string;
  avatar: string;
  role: string;
  provider: "email" | "google" | "whatsapp";
  phone?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("crm_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = pass.trim();

    const response = await loginRequest(normalizedEmail, normalizedPassword);

    setLoading(false);

    if (response.success && response.data?.user) {
      localStorage.setItem("crm_user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      return true;
    }

    setError(response.error || "Credenciais inválidas.");
    return false;
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    plan: string,
    phone: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = pass.trim();
    const normalizedPhone = phone.trim();

    const response = await registerRequest(
      normalizedName,
      normalizedEmail,
      normalizedPassword,
      plan,
      normalizedPhone
    );

    setLoading(false);

    if (response.success && response.data?.user) {
      localStorage.setItem("crm_user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      return true;
    }

    setError(response.error || "Erro ao cadastrar usuário.");
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const loggedUser: User = {
          email: "pr.anderson.google@gmail.com",
          name: "Pr. Anderson Silva (Google)",
          avatar: "G",
          role: "Pastor Presidente",
          provider: "google",
        };

        localStorage.setItem("crm_user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const requestWhatsAppOTP = async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await requestWhatsAppOTPRequest(phone);

    setLoading(false);

    if (response.success) {
      return true;
    }

    setError(response.error || "Erro ao enviar código de verificação.");
    return false;
  };

  const verifyWhatsAppOTP = async (phone: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await verifyWhatsAppOTPRequest(phone, code);

    setLoading(false);

    if (response.success) {
      if (response.data?.user) {
        localStorage.setItem("crm_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return true;
    }

    setError(response.error || "Código de verificação incorreto.");
    return false;
  };

  const recoverPassword = async (emailOrPhone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await recoverPasswordRequest(emailOrPhone);

    setLoading(false);

    if (response.success) {
      return true;
    }

    setError(response.error || "Erro ao recuperar senha.");
    return false;
  };

  const resetPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await resetPasswordRequest(email, token, password);

    setLoading(false);

    if (response.success) {
      return true;
    }

    setError(response.error || "Erro ao redefinir senha.");
    return false;
  };

  const logout = () => {
    localStorage.removeItem("crm_user");
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    requestWhatsAppOTP,
    verifyWhatsAppOTP,
    recoverPassword,
    resetPassword,
    logout,
  };
}
