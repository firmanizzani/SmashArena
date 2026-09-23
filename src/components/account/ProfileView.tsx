import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
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
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  CircleCheck,
  LayoutDashboard,
  LogOut,
  Save,
  Ticket,
  User,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileView() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  if (!mounted) {
    return <div className="min-h-[24rem] animate-pulse rounded-3xl border border-border bg-card/60" />;
  }

  if (!user) {
    return null;
  }

  const handleSave = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (form.name.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (form.phone.trim().length < 8) {
      setError("Nomor WhatsApp minimal 8 digit.");
      return;
    }

    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Akun Saya</span>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-white">
          Profil <span className="text-primary">Pemain</span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-b from-card to-card/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 size-40 rounded-full bg-primary/15 blur-3xl"
          />
          <CardHeader className="relative items-center pb-3 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-3 text-xl md:text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Badge variant="limeSoft">
                <User aria-hidden="true" />
                {user.role === "ADMIN" ? "Administrator" : "Customer"}
              </Badge>
              <Badge variant="outline">Member Smash Arena</Badge>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-4">
            <Separator />
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-semibold">{user.phone}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="truncate font-mono text-xs text-muted-foreground">{user.id}</dd>
              </div>
            </dl>

            <div className="grid gap-2 pt-1">
              <Button variant="glass" onClick={() => (window.location.href = "/my-bookings")}>
                <Ticket aria-hidden="true" />
                Booking Saya
              </Button>
              {user.role === "ADMIN" && (
                <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
                  <LayoutDashboard aria-hidden="true" />
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                className="text-red-400 hover:border-red-400/50 hover:text-red-400"
                disabled={loggingOut}
                onClick={() => void handleLogout()}
              >
                <LogOut aria-hidden="true" />
                {loggingOut ? "Keluar…" : "Keluar dari Akun"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/70">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">Ubah Data Diri</CardTitle>
            <CardDescription>Perbarui kontak yang dipakai untuk konfirmasi booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nama Lengkap</Label>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => {
                    setError(null);
                    setForm((prev) => ({ ...prev, name: event.target.value }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => {
                    setError(null);
                    setForm((prev) => ({ ...prev, email: event.target.value }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">No. WhatsApp</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => {
                    setError(null);
                    setForm((prev) => ({ ...prev, phone: event.target.value }));
                  }}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
                >
                  {error}
                </p>
              )}
              {saved && (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary"
                >
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  Profil berhasil disimpan.
                </p>
              )}

              <Button type="submit" size="lg" className="w-full">
                <Save aria-hidden="true" />
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
