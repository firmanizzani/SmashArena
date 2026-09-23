import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  CircleCheck,
  Copy,
  MapPin,
  MessageCircle,
  Ticket,
} from "lucide-react";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { contact } from "../../data/contact";
import { getBooking } from "../../lib/api/bookings";
import {
  PAYMENT_METHOD_LABEL,
  BOOKING_STATUS_LABEL,
  bookingStatusTone,
  rp,
  slotRange,
} from "../../lib/format";
import type { BookingRecord } from "../../types/database";
import { useBookingsStore } from "../../stores/bookingsStore";
import { Badge as UiBadge } from "../ui/badge";

export function SuccessView() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const lastBookingId = useBookingsStore((state) => state.lastBookingId);
  const lastPaymentMethod = useBookingsStore((state) => state.lastPaymentMethod);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !lastBookingId) return;
    let cancelled = false;
    getBooking(lastBookingId)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Booking tidak ditemukan");
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, lastBookingId]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="min-h-[26rem] rounded-3xl" />
      </div>
    );
  }

  if (!booking || loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-extrabold text-white">
          {loadError ? "Booking tidak ditemukan" : "Belum ada booking"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {loadError ?? "Selesaikan checkout terlebih dahulu untuk melihat halaman ini."}
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/my-bookings")}>
          Lihat Booking Saya
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const paid = booking.payment?.status === "PAID" || booking.status === "CONFIRMED";

  const bookingDateLabel = format(
    new Date(`${booking.booking_date}T00:00:00`),
    "EEEE, d MMMM yyyy",
    { locale: idLocale },
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const courtLabel = booking.court_name
    ? `${booking.court_name}${booking.court_tier ? ` · ${booking.court_tier}` : ""}`
    : booking.court_id;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-b from-card to-card/60 p-6 text-center sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CircleCheck className="size-9" aria-hidden="true" />
        </div>

        <h1 className="relative mt-5 font-display text-3xl font-extrabold uppercase tracking-tight text-white">
          Booking Berhasil!
        </h1>
        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
          {paid
            ? "Pembayaran lunas diterima."
            : "Booking tercatat — selesaikan pembayaran saat tiba."}{" "}
          Simpan kode booking ini dan tunjukkan ke resepsionis saat tiba.
        </p>

        <button
          type="button"
          onClick={() => void copyCode()}
          className="relative mx-auto mt-6 flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 outline-none transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Salin kode booking"
        >
          <span className="font-mono text-lg font-extrabold tracking-[0.14em] text-primary">
            {booking.id}
          </span>
          <Copy className="size-4 text-primary/80" aria-hidden="true" />
          <span className="sr-only">{copied ? "Tersalin" : "Salin"}</span>
        </button>
        <p className="relative mt-2 text-xs text-muted-foreground" role="status">
          {copied ? "Kode booking tersalin!" : "Klik kode untuk menyalin"}
        </p>

        <dl className="relative mt-7 space-y-0 divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/30 px-5 py-2 text-left">
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="text-right font-semibold text-foreground">
              <UiBadge variant={bookingStatusTone(booking.status)}>
                {BOOKING_STATUS_LABEL[booking.status]}
              </UiBadge>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Lapangan</dt>
            <dd className="text-right font-semibold text-foreground">{courtLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Tanggal</dt>
            <dd className="text-right font-semibold text-foreground">{bookingDateLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Jam</dt>
            <dd className="text-right font-semibold text-foreground">
              {slotRange(booking.start_time, booking.duration)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Metode</dt>
            <dd className="text-right font-semibold text-foreground">
              {booking.payment
                ? PAYMENT_METHOD_LABEL[booking.payment.method]
                : lastPaymentMethod
                  ? PAYMENT_METHOD_LABEL[lastPaymentMethod]
                  : "Bayar di tempat"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">Total Dibayar</dt>
            <dd className="text-right font-display text-base font-extrabold text-primary">
              {rp(booking.total_price)}
            </dd>
          </div>
        </dl>

        <div className="relative mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => (window.location.href = "/my-bookings")}>
            <Ticket aria-hidden="true" />
            Lihat Booking Saya
          </Button>
          <Button
            variant="glass"
            onClick={() => (window.location.href = "/")}
          >
            <MapPin aria-hidden="true" />
            Rute ke Smash Arena
          </Button>
          <Button variant="outline" asChild>
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              WhatsApp
            </a>
          </Button>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="limeSoft">Reschedule gratis H-1</Badge>
          <Badge variant="outline">Datang 15 menit lebih awal</Badge>
        </div>
      </div>
    </div>
  );
}
