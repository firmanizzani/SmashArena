import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { listCourts, type CourtSummary } from "../../lib/api/courts";
import { getAvailability, todayISO, type TimeSlot } from "../../lib/api/availability";
import { useBookingStore } from "../../stores/bookingStore";
import { rp } from "../../lib/format";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="min-h-[34rem] animate-pulse rounded-2xl border border-border bg-card/60" />
      <div className="min-h-[20rem] animate-pulse rounded-2xl border border-border bg-card/60" />
    </div>
  );
}

export function BookingWidget() {
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [courts, setCourts] = useState<CourtSummary[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId);
  const price = useBookingStore((state) => state.price);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const setSelectedTime = useBookingStore((state) => state.setSelectedTime);
  const setSelectedCourt = useBookingStore((state) => state.setSelectedCourt);
  const setPrice = useBookingStore((state) => state.setPrice);

  const court = useMemo(
    () => courts.find((item) => item.id === selectedCourtId) ?? courts[0] ?? null,
    [courts, selectedCourtId],
  );

  const dateISO = selectedDate ? todayISO(selectedDate) : todayISO();

  useEffect(() => {
    const store = useBookingStore.getState();
    if (!store.selectedDate) {
      const today = new Date();
      store.setSelectedDate(today);
      setMonth(today);
    }

    const onCourtSelected = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) useBookingStore.getState().setSelectedCourt(detail);
    };

    document.addEventListener("smash:select-court", onCourtSelected);
    setMounted(true);

    return () => {
      document.removeEventListener("smash:select-court", onCourtSelected);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([listCourts(), getAvailability(dateISO, selectedCourtId)])
      .then(([courtList, availability]) => {
        if (cancelled) return;
        setCourts(courtList);
        setSlots(availability);
        const store = useBookingStore.getState();
        if (courtList.length && !courtList.some((item) => item.id === store.selectedCourtId)) {
          store.setSelectedCourt(courtList[0].id);
        }
        const active = courtList.find((item) => item.id === store.selectedCourtId) ?? courtList[0];
        if (active) setPrice(active.price);
        const bookable = availability.find((item) => item.status === "AVAILABLE");
        if (bookable?.start) setSelectedTime(bookable.start);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat data booking");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, dateISO, selectedCourtId, setPrice, setSelectedTime]);

  if (!mounted || loading) {
    return <FormSkeleton />;
  }

  if (error || !court) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-10 text-center">
        <p className="font-display text-xl font-extrabold text-white">Gagal memuat booking</p>
        <p className="mt-2 text-sm text-muted-foreground">{error ?? "Lapangan tidak ditemukan."}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Muat Ulang
        </Button>
      </div>
    );
  }

  const nextHour = (value: string) => {
    const [hour] = value.split(":");
    return `${String(Number(hour) + 1).padStart(2, "0")}:00`;
  };

  const availableSlots = slots.filter((slot) => slot.status === "AVAILABLE");
  const unavailable = !availableSlots.some((slot) => slot.start === selectedTime);
  const isBooked = !court.available;

  const handleConfirm = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="limeSoft">
                <Zap /> Langkah 1 dari 2
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl">Pilih Jadwal Bermain</CardTitle>
            <CardDescription>
              Atur tanggal, jam mulai, dan lapangan yang ingin kamu sewa.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="booking-date" className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                Tanggal
              </Label>
              <div className="rounded-2xl border border-border bg-black/25 p-2 sm:p-3">
                <Calendar
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setMonth(date);
                  }}
                  month={month}
                  onMonthChange={setMonth}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="booking-time" className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" aria-hidden="true" />
                  Jam Mulai
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger id="booking-time" aria-label="Pilih jam mulai">
                    <SelectValue placeholder="Pilih jam" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.start} value={slot.start}>
                        {slot.start} – {slot.end}
                      </SelectItem>
                    ))}
                    {availableSlots.length === 0 && (
                      <SelectItem value="none" disabled>
                        Tidak ada slot tersedia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-court" className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" aria-hidden="true" />
                  Lapangan
                </Label>
                <Select
                  value={selectedCourtId}
                  onValueChange={(value) => {
                    setSelectedCourt(value);
                    const next = courts.find((item) => item.id === value);
                    if (next) setPrice(next.price);
                  }}
                >
                  <SelectTrigger id="booking-court" aria-label="Pilih lapangan">
                    <SelectValue placeholder="Pilih lapangan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {courts.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} — {item.label}
                        {!item.available ? " (Nonaktif)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-b from-card to-card/60 lg:sticky lg:top-24 lg:self-start">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
          />
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Ringkasan Booking</CardTitle>
              <Badge variant="limeSoft">Realtime</Badge>
            </div>
            <CardDescription>Periksa detail sebelum konfirmasi.</CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-1">
            <dl className="divide-y divide-white/5">
              <SummaryRow label="Lapangan" value={`${court.name} · ${court.label}`} />
              <SummaryRow
                label="Tanggal"
                value={
                  selectedDate
                    ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })
                    : "—"
                }
              />
              <SummaryRow
                label="Jam"
                value={availableSlots.length ? `${selectedTime} – ${nextHour(selectedTime)}` : "—"}
              />
              <SummaryRow label="Durasi" value="1 jam" />
              <SummaryRow label="Harga / jam" value={rp(price)} />
            </dl>

            <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
                  Total Bayar
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">Termasuk pajak & biaya layanan</p>
              </div>
              <p className="font-display text-2xl font-extrabold text-primary">{rp(price)}</p>
            </div>

            {(isBooked || unavailable) && (
              <p
                role="status"
                className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-300"
              >
                {isBooked
                  ? `${court.name} sedang tidak tersedia — pilih lapangan lain.`
                  : "Pilih slot jam yang masih tersedia untuk melanjutkan."}
              </p>
            )}

            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={isBooked || unavailable}
              onClick={handleConfirm}
            >
              Lanjut ke Checkout
              <ArrowRight aria-hidden="true" />
            </Button>

            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              Bayar di tempat setelah konfirmasi. Reschedule gratis maksimal H-1 jadwal bermain.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CircleCheck className="size-8" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center">Lanjutkan Checkout?</DialogTitle>
            <DialogDescription className="text-center">
              Kamu akan diarahkan ke halaman checkout untuk melengkapi data pemesan.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border bg-black/30 p-4">
            <dl className="divide-y divide-white/5">
              <SummaryRow label="Lapangan" value={`${court.name} · ${court.label}`} />
              <SummaryRow
                label="Tanggal"
                value={
                  selectedDate
                    ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: idLocale })
                    : "—"
                }
              />
              <SummaryRow label="Jam" value={`${selectedTime} – ${nextHour(selectedTime)}`} />
              <SummaryRow label="Total" value={rp(price)} />
            </dl>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Tutup
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                window.location.href = "/checkout";
              }}
            >
              Ke Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
