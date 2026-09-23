import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  Coins,
  TrendingUp,
} from "lucide-react";

import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { getDashboard, type DashboardData } from "../../lib/api/bookings";
import {
  BOOKING_STATUS_LABEL,
  bookingStatusTone,
  rp,
  slotRange,
} from "../../lib/format";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-border bg-card/70">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-white">{value}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat data dashboard");
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400"
      >
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { stats, recent } = data;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
            Dashboard <span className="text-primary">Admin</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ringkasan operasional Smash Arena hari ini.
          </p>
        </div>
        <Badge variant="limeSoft">
          <CalendarDays aria-hidden="true" />
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Booking Hari Ini"
          value={String(stats.todaysBookings)}
          hint="Jadwal aktif hari ini"
        />
        <StatCard
          icon={Coins}
          label="Total Pendapatan"
          value={rp(stats.revenue)}
          hint="Dari pembayaran berstatus lunas"
        />
        <StatCard
          icon={TrendingUp}
          label="Pembayaran Pending"
          value={String(stats.pendingPayments)}
          hint="Menunggu konfirmasi pelanggan"
        />
        <StatCard
          icon={CalendarDays}
          label="Lapangan Aktif"
          value={`${stats.activeCourts}/${stats.totalCourts}`}
          hint="Lapangan siap digunakan"
        />
      </div>

      <Card className="border-border bg-card/70">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Booking Terbaru</CardTitle>
              <CardDescription>Enam transaksi terakhir masuk ke sistem.</CardDescription>
            </div>
            <a
              href="/admin/bookings"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/75 outline-none transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              Lihat Semua
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length ? (
                recent.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs tracking-wider text-muted-foreground">
                      {booking.id}
                    </TableCell>
                    <TableCell className="font-semibold">{booking.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(`${booking.booking_date}T00:00:00`), "d MMM yyyy", {
                        locale: idLocale,
                      })}{" "}
                      · {slotRange(booking.start_time, booking.duration)}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {rp(booking.total_price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bookingStatusTone(booking.status)}>
                        {BOOKING_STATUS_LABEL[booking.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Belum ada booking masuk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
