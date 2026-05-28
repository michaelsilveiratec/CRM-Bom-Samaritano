import { apiFetch } from "./api";
import type { User } from "../hooks/useAuth";

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function loginRequest(email: string, password: string): Promise<AuthResult<{ user: User }>> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const data = await apiFetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
    });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
  plan: string,
  phone: string
): Promise<AuthResult<{ user: User }>> {
  try {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedPhone = phone.trim();

    const data = await apiFetch<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        plan,
        phone: normalizedPhone,
      }),
    });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function requestWhatsAppOTP(phone: string): Promise<AuthResult<null>> {
  try {
    await apiFetch<{ success: boolean }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyWhatsAppOTP(phone: string, code: string): Promise<AuthResult<{ user?: User }>> {
  try {
    const data = await apiFetch<{ user: User }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recoverPasswordRequest(email: string): Promise<AuthResult<null>> {
  try {
    await apiFetch<{ success: boolean }>("/api/auth/recover-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetPasswordRequest(email: string, token: string, password: string): Promise<AuthResult<null>> {
  try {
    await apiFetch<{ success: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, password }),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
