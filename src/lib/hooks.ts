import { useEffect, useState } from "react";

/** Gate untuk menghindari hydration mismatch pada state yang di-persist. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/** Aman dipakai di environment tanpa window (SSR). */
export function useIsAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/** Validasi redirect internal (cegah open redirect). */
export function safeRedirect(target: string | null | undefined, fallback = "/"): string {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}

export function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}
