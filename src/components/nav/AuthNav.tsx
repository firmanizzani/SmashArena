import { useEffect, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
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

function navigateTo(href: string): void {
  window.location.href = href;
}

export function AuthNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    setMounted(true);
    void init();
  }, [init]);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={
          variant === "mobile"
            ? "h-11 w-full rounded-xl border border-white/10 bg-white/5"
            : "h-10 w-20 rounded-full border border-white/10 bg-white/5"
        }
      />
    );
  }

  if (!isAuthenticated || !user) {
    if (variant === "mobile") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={() => navigateTo("/login")}>
            <LogIn aria-hidden="true" />
            Masuk
          </Button>
          <Button className="w-full" onClick={() => navigateTo("/register")}>
            <UserPlus aria-hidden="true" />
            Daftar
          </Button>
        </div>
      );
    }

    return (
      <Button variant="outline" size="sm" onClick={() => navigateTo("/login")}>
        <LogIn aria-hidden="true" />
        Masuk
      </Button>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigateTo("/");
  };

  const menu =
    variant === "mobile" ? (
      <div className="grid gap-1.5">
        <button
          type="button"
          onClick={() => navigateTo("/my-bookings")}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/85 outline-none transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Ticket className="size-4" aria-hidden="true" />
          Booking Saya
        </button>
        <button
          type="button"
          onClick={() => navigateTo("/profile")}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/85 outline-none transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <User className="size-4" aria-hidden="true" />
          Profil
        </button>
        {user.role === "ADMIN" && (
          <button
            type="button"
            onClick={() => navigateTo("/admin")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/85 outline-none transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Admin Dashboard
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 outline-none transition-colors hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Keluar
        </button>
      </div>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Menu akun"
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 pl-1.5 pr-2.5 outline-none transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-7">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[7rem] truncate text-xs font-bold text-white sm:block">
              {user.name.split(" ")[0]}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-bold text-foreground">{user.name}</span>
            <span className="block truncate text-xs font-normal">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigateTo("/my-bookings")}>
            <Ticket />
            Booking Saya
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigateTo("/profile")}>
            <User />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigateTo("/booking")}>
            <PlusCircle />
            Booking Baru
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigateTo("/admin")}>
                <LayoutDashboard />
                Admin Dashboard
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleLogout()} className="text-red-400 focus:text-red-400">
            <LogOut />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

  if (variant === "mobile") {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">{menu}</div>;
  }

  return menu;
}
