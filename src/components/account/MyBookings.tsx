import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  PlusCircle,
  Ticket,
  XCircle,
} from "lucide-react";

import { Button } from "../ui/button";
import { Badge, type BadgeProps } from "../ui/badge";
import {
  Card,
  CardContent,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cancelBooking, listBookingsForCustomer } from "../../lib/api/bookings";
import {
  BOOKING_STATUS_LABEL,
  bookingStatusTone,
  isPastBooking,
  rp,
  slotRange,
} from "../../lib/format";
import type { BookingRecord } from "../../types/database";
import { useAuthHydrated } from "../../lib/auth-guards";
import { useBookingsStore } from "../../stores/bookingsStore";

function StatusBadge({ status }: { status: BookingRecord["status"] }) {
  return (
    <Badge variant={bookingStatusTone(status) as BadgeProps["variant"]}>
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  );
}

function courtLabelOf(booking: BookingRecord): string {
  return booking.court_name
    ? `${booking.court_name}${booking.court_tier ? ` · ${booking.court_tier}` : ""}`
    : booking.court_id;
}

function BookingCard({
  booking,
  onCancelRequest,
}: {
  booking: BookingRecord;
  onCancelRequest: (booking: BookingRecord) => void;
}) {
  const dateLabel = format(new Date(`${booking.booking_date}T00:00:00`), "EEEE, d MMMM yyyy", {
    locale: idLocale,
  });
  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);

  return (
    <Card className="border-border bg-card/70 transition-colors hover:border-primary/25">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="font-mono text-xs tracking-wider text-muted-foreground">
              {booking.id}
            </span>
          </div>

          <p className="mt-3 font-display text-lg font-extrabold text-white">
            {courtLabelOf(booking)}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              {slotRange(booking.start_time, booking.duration)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              Smash Arena
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <p className="font-display text-xl font-extrabold text-primary">
            {rp(booking.total_price)}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="glass" onClick={() => (window.location.href = "/booking")}>
              <PlusCircle aria-hidden="true" />
              Booking Lagi
            </Button>
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-400 hover:border-red-400/50 hover:text-red-400"
                onClick={() => onCancelRequest(booking)}
              >
                <XCircle aria-hidden="true" />
                Batalkan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyBookings() {
  const { ready } = useAuthHydrated();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<BookingRecord | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const clearLastBooking = useBookingsStore((state) => state.clearLastBooking);

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listBookingsForCustomer();
      setBookings(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready]);

  const mine = useMemo(
    () =>
      [...bookings].sort((a, b) => b.booking_date.localeCompare(a.booking_date)),
    [bookings],
  );

  const upcoming = mine.filter(
    (booking) =>
      booking.status !== "CANCELLED" &&
      booking.status !== "COMPLETED" &&
      booking.status !== "EXPIRED" &&
      !isPastBooking(booking.booking_date, booking.end_time),
  );
  const history = mine.filter((booking) => !upcoming.includes(booking));

  if (!ready || (loading && !bookings.length)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-11 w-64 rounded-full" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (loadError && !bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
        <Ticket className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-display text-lg font-bold text-white">Gagal memuat booking</p>
        <p className="max-w-sm text-sm text-muted-foreground">{loadError}</p>
        <Button className="mt-2" onClick={() => void refresh()}>
          <Loader2 className="size-4" aria-hidden="true" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      await cancelBooking(pendingCancel.id);
      clearLastBooking();
      setBookings((prev) =>
        prev.map((item) =>
          item.id === pendingCancel.id ? { ...item, status: "CANCELLED" } : item,
        ),
      );
      setPendingCancel(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal membatalkan booking");
    } finally {
      setCancelling(false);
    }
  };

  const renderList = (list: BookingRecord[], emptyTitle: string, emptyDesc: string) =>
    list.length ? (
      <div className="space-y-4">
        {list.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancelRequest={setPendingCancel} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
        <Ticket className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-display text-lg font-bold text-white">{emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyDesc}</p>
        <Button className="mt-2" onClick={() => (window.location.href = "/booking")}>
          Mulai Booking
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );

  return (
    <>
      <Tabs defaultValue="upcoming">
        <TabsList aria-label="Filter booking saya">
          <TabsTrigger value="upcoming">
            Mendatang
            <span className="rounded-full bg-black/25 px-1.5 text-[0.65rem]">
              {upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">
            Riwayat
            <span className="rounded-full bg-black/25 px-1.5 text-[0.65rem]">
              {history.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {renderList(
            upcoming,
            "Belum ada jadwal mendatang",
            "Amankan lapangan favoritmu — jadwal kosong bisa habis cepat.",
          )}
        </TabsContent>
        <TabsContent value="history">
          {renderList(
            history,
            "Riwayat masih kosong",
            "Booking yang selesai atau dibatalkan akan muncul di sini.",
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(pendingCancel)} onOpenChange={(open) => !open && setPendingCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Booking?</DialogTitle>
            <DialogDescription>
              Booking <span className="font-mono text-foreground">{pendingCancel?.id}</span> akan
              dibatalkan dan slot dibuka kembali. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
            {pendingCancel && (
              <dl className="space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Lapangan</dt>
                  <dd className="font-semibold">{courtLabelOf(pendingCancel)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Tanggal</dt>
                  <dd className="font-semibold">
                    {format(new Date(`${pendingCancel.booking_date}T00:00:00`), "d MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-semibold text-primary">{rp(pendingCancel.total_price)}</dd>
                </div>
              </dl>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingCancel(null)}>
              Kembali
            </Button>
            <Button variant="destructive" disabled={cancelling} onClick={() => void handleCancel()}>
              {cancelling ? "Membatalkan…" : "Ya, Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MyBookingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Akun Saya</span>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-white">
          Booking <span className="text-primary">Saya</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pantau jadwal mendatang, riwayat permainan, dan batalkan booking bila rencana berubah.
        </p>
      </div>

      <MyBookings />
    </div>
  );
}
