import { useState, useEffect } from "react";

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
  const [otpCode, setOtpCode] = useState<string | null>(null);

  // Traditional Login
  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation: accept any email with '123456' or 'pastor' password
        if (pass === "123456" || pass === "pastor") {
          const loggedUser: User = {
            email: email.toLowerCase(),
            name: "Pr. Anderson Silva",
            avatar: "AS",
            role: "Pastor Presidente",
            provider: "email",
          };
          localStorage.setItem("crm_user", JSON.stringify(loggedUser));
          setUser(loggedUser);
          setLoading(false);
          resolve(true);
        } else {
          setError("Credenciais inválidas. Use a senha '123456' para testar.");
          setLoading(false);
          resolve(false);
        }
      }, 800);
    });
  };

  // Google Login Simulation
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

  // WhatsApp Login Step 1: Request OTP
  const requestWhatsAppOTP = async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (phone.replace(/\D/g, "").length < 10) {
          setError("Por favor, insira um número de WhatsApp válido.");
          setLoading(false);
          resolve(false);
          return;
        }
        // Generate mock code (e.g. 777777 for testing ease)
        const generatedCode = "777777";
        setOtpCode(generatedCode);
        setLoading(false);
        resolve(true);
      }, 1200);
    });
  };

  // WhatsApp Login Step 2: Verify OTP
  const verifyWhatsAppOTP = async (phone: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code === otpCode || code === "777777") {
          const loggedUser: User = {
            email: "pr.anderson.whatsapp@bomsamaritano.org",
            name: "Pr. Anderson Silva",
            avatar: "W",
            role: "Pastor Presidente",
            provider: "whatsapp",
            phone: phone,
          };
          localStorage.setItem("crm_user", JSON.stringify(loggedUser));
          setUser(loggedUser);
          setOtpCode(null);
          setLoading(false);
          resolve(true);
        } else {
          setError("Código de verificação incorreto. Use o código '777777' recebido.");
          setLoading(false);
          resolve(false);
        }
      }, 800);
    });
  };

  // Password Recovery
  const recoverPassword = async (emailOrPhone: string, method: "email" | "whatsapp"): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve(true);
      }, 1500);
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("crm_user");
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    otpCode,
    login,
    loginWithGoogle,
    requestWhatsAppOTP,
    verifyWhatsAppOTP,
    recoverPassword,
    logout,
  };
}
