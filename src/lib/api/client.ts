/** Klien API terpusat — semua akses data melewati layer ini. */

export const API_BASE: string = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = 15000, headers, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
    });

    let body: Envelope<T> | null = null;
    try {
      body = (await response.json()) as Envelope<T>;
    } catch {
      body = null;
    }

    if (!response.ok || !body || body.success === false) {
      const message = body?.message ?? `Request failed (${response.status})`;
      const code = body?.code ?? "ERROR";
      throw new ApiError(message, response.status, code);
    }

    return body.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408, "TIMEOUT");
    }
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0, "NETWORK");
  } finally {
    clearTimeout(timer);
  }
}
