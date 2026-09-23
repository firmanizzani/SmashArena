import { useEffect, useState } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail, Phone, UserPlus } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { safeRedirect, getQueryParam } from "../../lib/hooks";
import { useAuthStore } from "../../stores/authStore";

interface AuthCardProps {
  mode: "login" | "register";
}

export function AuthCard({ mode }: AuthCardProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLogin = mode === "login";

  useEffect(() => {
    setMounted(true);
    clearError();
  }, [mode, clearError]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    const redirectParam = getQueryParam("redirect");
    const wantsAdmin = getQueryParam("admin");
    const role = useAuthStore.getState().user?.role;
    let target =
      wantsAdmin && role === "ADMIN"
        ? safeRedirect(redirectParam, "/admin")
        : safeRedirect(redirectParam, role === "ADMIN" ? "/admin" : "/");
    if (target.startsWith("/admin") && role !== "ADMIN") target = "/";
    window.location.href = target;
  }, [mounted, isAuthenticated]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-md">
        <div className="min-h-[30rem] animate-pulse rounded-3xl border border-border bg-card/60" />
      </div>
    );
  }

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    clearError();
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setLocalError(null);
    clearError();

    if (isLogin) {
      if (!form.email.trim() || !form.password) {
        setLocalError("Email dan password wajib diisi.");
        return;
      }
      try {
        const user = await login(form.email.trim(), form.password);
        const redirectParam = getQueryParam("redirect");
        const wantsAdmin = getQueryParam("admin");
        let target =
          wantsAdmin && user.role === "ADMIN"
            ? safeRedirect(redirectParam, "/admin")
            : safeRedirect(redirectParam, user.role === "ADMIN" ? "/admin" : "/");
        if (target.startsWith("/admin") && user.role !== "ADMIN") target = "/";
        window.location.href = target;
      } catch {
        /* error sudah di-set di store */
      }
      return;
    }

    if (form.name.trim().length < 2) {
      setLocalError("Nama minimal 2 karakter.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setLocalError("Format email tidak valid.");
      return;
    }
    if (form.phone.trim().length < 8) {
      setLocalError("Nomor WhatsApp minimal 8 digit.");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirm) {
      setLocalError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      const user = await login(form.email.trim(), form.password);
      let target = safeRedirect(getQueryParam("redirect"), "/");
      if (target.startsWith("/admin") && user.role !== "ADMIN") target = "/";
      window.location.href = target;
    } catch {
      /* error sudah di-set di store */
    }
  };

  const shownError = localError ?? error;

  return (
    <div className="mx-auto max-w-md">
      <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-b from-card to-card/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />

        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {isLogin ? <LockKeyhole className="size-5" /> : <UserPlus className="size-5" />}
            </span>
            <div>
              <CardTitle className="text-xl md:text-2xl">
                {isLogin ? "Selamat Datang" : "Buat Akun"}
              </CardTitle>
              <CardDescription className="mt-1">
                {isLogin
                  ? "Login untuk melanjutkan booking lapangan."
                  : "Daftar gratis — booking jadi jauh lebih cepat."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Nama Lengkap</Label>
                <Input
                  id="auth-name"
                  autoComplete="name"
                  placeholder="cth. Rizky Pratama"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-phone">No. WhatsApp</Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="auth-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="08xxxxxxxxxx"
                    className="pl-10"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "••••••••" : "Minimal 8 karakter"}
                  className="pl-10"
                  value={form.password}
                  onChange={set("password")}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm">Ulangi Password</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Masukkan lagi password"
                  value={form.confirm}
                  onChange={set("confirm")}
                />
              </div>
            )}

            {shownError && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
              >
                {shownError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {isLogin ? "Login…" : "Mendaftar…"}
                </>
              ) : (
                <>
                  {isLogin ? "Login" : "Daftar Sekarang"}
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="whitespace-nowrap text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.65rem]">
              {isLogin ? "Belum punya akun" : "Sudah punya akun"}
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="glass"
            className="w-full"
            onClick={() => {
              clearError();
              setLocalError(null);
              window.location.href = isLogin
                ? `/register${window.location.search}`
                : `/login${window.location.search}`;
            }}
          >
            {isLogin ? "Daftar Akun Baru" : "Sudah Punya Akun? Login"}
            <ArrowRight aria-hidden="true" />
          </Button>

          <p className="text-center text-[0.7rem] leading-relaxed text-muted-foreground">
            Akun dibuat dan diverifikasi oleh server Smash Arena.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
