import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";

import { useRedirectIfDenied, useRequireAuth } from "../../lib/auth-guards";

interface RouteGuardProps {
  requireAdmin?: boolean;
  children: ReactNode;
}

/**
 * Proteksi client-side (UX). Authorization final tetap di backend.
 */
export function RouteGuard({ requireAdmin = false, children }: RouteGuardProps) {
  const result = useRequireAuth(requireAdmin);
  const [notice, setNotice] = useState<string | null>(null);
  useRedirectIfDenied(result, { admin: requireAdmin });

  useEffect(() => {
    if (result.state !== "denied") return;
    setNotice(
      requireAdmin
        ? "Halaman ini khusus admin. Mengalihkan ke halaman login…"
        : "Untuk menyelesaikan booking, login dulu ya — jadwal pilihanmu tetap tersimpan. Mengalihkan ke login…",
    );
    return;
  }, [result.state, requireAdmin]);

  if (result.state === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium">Memeriksa sesi…</p>
      </div>
    );
  }

  if (result.state === "denied") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-7" aria-hidden="true" />
        </div>
        <p className="font-display text-xl font-extrabold text-white">
          {requireAdmin ? "Login admin diperlukan" : "Login dulu untuk lanjut"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground" role="status">
          {notice}
        </p>
        <a
          href="/login"
          className="mt-2 inline-flex h-11 items-center rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground outline-none transition-colors hover:bg-[#b5f04a] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Login Sekarang
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
