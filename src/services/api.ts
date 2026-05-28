function isLocalHost(hostname: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function isLocalApiUrl(url: string) {
  try {
    return isLocalHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

function resolveApiBase() {
  const configuredApiBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();

  if (typeof window === "undefined") {
    return configuredApiBase || "http://localhost:3001";
  }

  const { protocol, hostname } = window.location;

  if (!isLocalHost(hostname) && (!configuredApiBase || isLocalApiUrl(configuredApiBase))) {
    return `${protocol}//${hostname}:3001`;
  }

  return configuredApiBase || "http://localhost:3001";
}

export const API_BASE = resolveApiBase();

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as HeadersInit),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError: any) {
    throw new Error(
      `Não foi possível conectar ao servidor de autenticação em ${API_BASE}. Verifique se o backend está rodando (porta 3001) e tente novamente.`
    );
  }

  const text = await response.text();

  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      if (!response.ok) {
        const preview = text.slice(0, 200).replace(/\s+/g, " ");
        throw new Error(`Resposta inválida do servidor (${response.status}): ${preview}`);
      }
      throw new Error("Resposta do servidor não pôde ser processada.");
    }
  }

  if (!response.ok) {
    throw new Error((data as any)?.error || response.statusText || "Erro na requisição");
  }

  return data as T;
}
