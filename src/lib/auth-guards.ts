import { useEffect, useState } from "react";
import type { PublicUser } from "../lib/api/users";
import { useAuthStore, type AuthState } from "../stores/authStore";

function useMountedFlag(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Baca state auth yang sudah ter-rehydrate + selesai init() /me. */
export function useAuthHydrated(): Pick<
  AuthState,
  "user" | "isAuthenticated" | "isLoading" | "error" | "initialized"
> & { mounted: boolean; ready: boolean } {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const initialized = useAuthStore((state) => state.initialized);
  const init = useAuthStore((state) => state.init);
  const mounted = useMountedFlag();

  useEffect(() => {
    if (mounted && !initialized) void init();
  }, [mounted, initialized, init]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    initialized,
    mounted,
    ready: mounted && initialized,
  };
}

export interface GuardResult {
  state: "loading" | "allowed" | "denied";
  user: PublicUser | null;
}

/** Proteksi route berbasis client-side (UX) — authorization final di backend. */
export function useRequireAuth(requireAdmin = false): GuardResult {
  const { user, isAuthenticated, ready } = useAuthHydrated();

  let state: GuardResult["state"] = "loading";
  if (ready) {
    if (!isAuthenticated || !user) state = "denied";
    else if (requireAdmin && user.role !== "ADMIN") state = "denied";
    else state = "allowed";
  }

  return { state, user };
}

export function useRedirectIfDenied(
  result: GuardResult,
  options: { loginPath?: string; admin?: boolean; delayMs?: number } = {},
): void {
  const { loginPath = "/login", admin = false, delayMs = 1400 } = options;

  useEffect(() => {
    if (result.state !== "denied") return;
    const params = new URLSearchParams();
    params.set("redirect", window.location.pathname + window.location.search);
    if (admin) params.set("admin", "1");
    const target = `${loginPath}?${params.toString()}`;
    const timer = setTimeout(() => {
      window.location.href = target;
    }, delayMs);
    return () => clearTimeout(timer);
  }, [result.state, loginPath, admin, delayMs]);
}
