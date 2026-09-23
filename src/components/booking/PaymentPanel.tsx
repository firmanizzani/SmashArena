import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getBooking } from "../../lib/api/bookings";
import { createPayment } from "../../lib/api/payments";
import { PAYMENT_METHOD_LABEL, rp, slotRange } from "../../lib/format";
import type { BookingRecord, PaymentMethod } from "../../types/database";
import { useBookingsStore } from "../../stores/bookingsStore";
import { todayISO } from "../../lib/api/availability";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}

const methods: { value: PaymentMethod; hint: string; icon: typeof QrCode }[] = [
  { value: "QRIS", hint: "Scan kode QR dari aplikasi bank / e-wallet apa pun", icon: QrCode },
  { value: "BANK_TRANSFER", hint: "Transfer manual ke rekening BCA / Mandiri Smash Arena", icon: Banknote },
  { value: "EWALLET", hint: "GoPay, OVO, DANA, dan ShopeePay", icon: Smartphone },
];

export function PaymentPanel() {
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [reference, setReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastBookingId = useBookingsStore((state) => state.lastBookingId);
  const setLastPaymentMethod = useBookingsStore((state) => state.setLastPaymentMethod);

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

  const courtLabel = useMemo(() => {
    if (!booking) return "";
    return booking.court_name
      ? `${booking.court_name}${booking.court_tier ? ` · ${booking.court_tier}` : ""}`
      : booking.court_id;
  }, [booking]);

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="min-h-[24rem] rounded-2xl" />
        <Skeleton className="min-h-[20rem] rounded-2xl" />
      </div>
    );
  }

  if (!lastBookingId || loadError || !booking) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-extrabold text-white">
          {loadError ? "Booking tidak ditemukan" : "Belum ada tagihan"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {loadError ?? "Selesaikan checkout terlebih dahulu untuk melihat halaman pembayaran."}
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/booking")}>
          Mulai Booking
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const alreadyPaid =
    booking.payment?.status === "PAID" || booking.status === "CONFIRMED";

  const bookingDate = new Date(`${booking.booking_date}T00:00:00`);
  const bookingDateLabel = format(bookingDate, "EEEE, d MMMM yyyy", { locale: idLocale });

  const handlePay = async () => {
    if (paying || alreadyPaid) return;
    setPaying(true);
    setError(null);
    try {
      await createPayment({
        bookingId: booking.id,
        method,
        reference: reference.trim() || undefined,
      });
      setLastPaymentMethod(method);
      window.location.href = "/booking/success";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pembayaran gagal. Coba lagi.");
      setPaying(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-border bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="limeSoft">
              <CreditCard /> Langkah 3 dari 3
            </Badge>
            <Badge variant="muted" className="max-w-full break-all font-mono tracking-wider">
              {booking.id}
            </Badge>
          </div>
          <CardTitle className="text-xl md:text-2xl">Metode Pembayaran</CardTitle>
          <CardDescription>
            {alreadyPaid
              ? "Pembayaran sudah diterima untuk booking ini."
              : "Pilih metode favoritmu untuk mengunci jadwal bermain."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3" role="radiogroup" aria-label="Metode pembayaran">
          {methods.map((item) => {
            const active = method === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={alreadyPaid}
                onClick={() => setMethod(item.value)}
                className={[
                  "flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary/60 bg-primary/10 shadow-[0_10px_28px_-14px_rgba(163,230,53,0.7)]"
                    : "border-white/10 bg-black/25 hover:border-white/25 hover:bg-white/[0.04]",
                  alreadyPaid ? "opacity-60" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">
                    {PAYMENT_METHOD_LABEL[item.value]}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {item.hint}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={[
                    "ml-auto mt-1 size-4 shrink-0 rounded-full border-2",
                    active ? "border-primary bg-primary" : "border-white/25",
                  ].join(" ")}
                />
              </button>
            );
          })}

          {!alreadyPaid && (
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Referensi transfer (opsional)</Label>
              <Input
                id="payment-reference"
                placeholder="cth. nomor referensi bank"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                maxLength={120}
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
            >
              {error}
            </p>
          )}

          {!alreadyPaid && (
            <Button size="lg" className="mt-2 w-full" onClick={() => void handlePay()} disabled={paying}>
              {paying ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Memproses Pembayaran…
                </>
              ) : (
                <>
                  Bayar {rp(booking.total_price)}
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </Button>
          )}

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Pembayaran dicatat di sistem Smash Arena — status dapat dikonfirmasi oleh admin.
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-b from-card to-card/60 lg:sticky lg:top-24 lg:self-start">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Tagihan</CardTitle>
            <Badge variant={alreadyPaid ? "limeSoft" : "outline"}>
              {alreadyPaid ? "Lunas" : "Belum dibayar"}
            </Badge>
          </div>
          <CardDescription>{bookingDateLabel}</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-1">
          <dl className="divide-y divide-white/5">
            <SummaryRow label="Lapangan" value={courtLabel} />
            <SummaryRow label="Kode Booking" value={booking.id} />
            <SummaryRow
              label="Jam"
              value={slotRange(booking.start_time, booking.duration)}
            />
            <SummaryRow label="Durasi" value={`${booking.duration} jam`} />
            <SummaryRow label="Pemesan" value={booking.customer_name} />
          </dl>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
                Total Tagihan
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Terpilih: {PAYMENT_METHOD_LABEL[method]}
              </p>
            </div>
            <p className="font-display text-2xl font-extrabold text-primary">
              {rp(booking.total_price)}
            </p>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Pembayaran hari ini ({todayISO()}) langsung mengunci jadwal. Kode booking dikirim
            setelah pembayaran berhasil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
