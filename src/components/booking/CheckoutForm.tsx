import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getCourt } from "../../lib/api/courts";
import { createBooking } from "../../lib/api/bookings";
import { rp, slotRange } from "../../lib/format";
import { useBookingStore } from "../../stores/bookingStore";
import { useBookingsStore } from "../../stores/bookingsStore";
import { useAuthStore } from "../../stores/authStore";
import { todayISO } from "../../lib/api/availability";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function CheckoutForm() {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courtLabel, setCourtLabel] = useState<string>("");

  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId);
  const duration = useBookingStore((state) => state.duration);
  const price = useBookingStore((state) => state.price);
  const customer = useBookingStore((state) => state.customer);
  const setCustomer = useBookingStore((state) => state.setCustomer);
  const totalLabel = useBookingStore((state) => state.totalLabel);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const user = useAuthStore((state) => state.user);
  const setLastBookingId = useBookingsStore((state) => state.setLastBookingId);

  const dateISO = useMemo(
    () => (selectedDate ? todayISO(selectedDate) : todayISO()),
    [selectedDate],
  );

  useEffect(() => {
    setMounted(true);
    if (!user) return;
    const store = useBookingStore.getState();
    if (!store.customer.name) {
      store.setCustomer({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  useEffect(() => {
    if (!mounted || !selectedCourtId) return;
    let cancelled = false;
    getCourt(selectedCourtId)
      .then((court) => {
        if (cancelled) return;
        setCourtLabel(`${court.name} · ${court.label}`);
        useBookingStore.getState().setPrice(court.price);
      })
      .catch(() => {
        if (!cancelled) setCourtLabel(selectedCourtId);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, selectedCourtId]);

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-[24rem] animate-pulse rounded-2xl border border-border bg-card/60" />
        <div className="min-h-[20rem] animate-pulse rounded-2xl border border-border bg-card/60" />
      </div>
    );
  }

  const missingSelection = !selectedDate || !selectedCourtId;

  const valid =
    !missingSelection &&
    customer.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(customer.email) &&
    customer.phone.trim().length >= 8;

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!valid || !selectedDate || !selectedCourtId || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        courtId: selectedCourtId,
        bookingDate: dateISO,
        startTime: selectedTime,
        duration,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim(),
        customerPhone: customer.phone.trim(),
      });
      setLastBookingId(booking.id);
      resetBooking();
      window.location.href = "/payment";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat booking. Coba lagi.");
      setSubmitting(false);
    }
  };

  if (missingSelection) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-extrabold text-white">Pilih jadwal dulu</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tentukan lapangan, tanggal, dan jam bermain sebelum checkout.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/booking")}>
          Ke Halaman Booking
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card className="border-border bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="limeSoft">
                <UserRound /> Langkah 2 dari 3
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl">Data Pemesan</CardTitle>
            <CardDescription>
              Kami menghubungi kamu via WhatsApp untuk konfirmasi jadwal.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="checkout-name">Nama Lengkap</Label>
              <Input
                id="checkout-name"
                autoComplete="name"
                placeholder="cth. Rizky Pratama"
                value={customer.name}
                onChange={(event) => setCustomer({ name: event.target.value })}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={customer.email}
                  onChange={(event) => setCustomer({ email: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-phone">No. WhatsApp</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08xxxxxxxxxx"
                  value={customer.phone}
                  onChange={(event) => setCustomer({ phone: event.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
              >
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => (window.location.href = "/booking")}>
            <ArrowLeft aria-hidden="true" />
            Ubah Jadwal
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={!valid || submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Membuat Booking…
              </>
            ) : (
              <>
                Lanjut ke Pembayaran
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-b from-card to-card/60 lg:sticky lg:top-24 lg:self-start">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Review Pesanan</CardTitle>
            <Badge variant="limeSoft">Draft</Badge>
          </div>
          <CardDescription>Pastikan detail booking sudah benar.</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-1">
          <dl className="divide-y divide-white/5">
            <SummaryRow label="Lapangan" value={courtLabel || selectedCourtId} />
            <SummaryRow
              label="Tanggal"
              value={
                selectedDate
                  ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })
                  : "—"
              }
            />
            <SummaryRow label="Jam" value={slotRange(selectedTime, duration)} />
            <SummaryRow label="Durasi" value={`${duration} jam`} />
            <SummaryRow label="Harga / jam" value={rp(price)} />
            <SummaryRow label="Pemesan" value={customer.name || "—"} />
          </dl>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
                Total Bayar
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">Dibayar melalui halaman pembayaran</p>
            </div>
            <p className="font-display text-2xl font-extrabold text-primary">{totalLabel()}</p>
          </div>

          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Data kamu hanya digunakan untuk keperluan booking Smash Arena.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
