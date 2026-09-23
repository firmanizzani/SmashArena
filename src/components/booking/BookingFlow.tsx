import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  LayoutGrid,
  Loader2,
  Minus,
  Plus,
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { listCourts, type CourtSummary } from "../../lib/api/courts";
import { getAvailability, todayISO, type TimeSlot } from "../../lib/api/availability";
import { rp, slotRange } from "../../lib/format";
import { useBookingStore } from "../../stores/bookingStore";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function BookingFlow() {
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<TimeSlot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [courts, setCourts] = useState<CourtSummary[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const selectedCourtId = useBookingStore((state) => state.selectedCourtId);
  const duration = useBookingStore((state) => state.duration);
  const price = useBookingStore((state) => state.price);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const setSelectedTime = useBookingStore((state) => state.setSelectedTime);
  const setSelectedCourt = useBookingStore((state) => state.setSelectedCourt);
  const setDuration = useBookingStore((state) => state.setDuration);
  const setPrice = useBookingStore((state) => state.setPrice);
  const totalLabel = useBookingStore((state) => state.totalLabel);

  const court = useMemo(
    () => courts.find((item) => item.id === selectedCourtId) ?? courts[0] ?? null,
    [courts, selectedCourtId],
  );
  const courtLabel = court ? `${court.name} · ${court.label}` : selectedCourtId;
  const dateISO = selectedDate ? todayISO(selectedDate) : todayISO();

  useEffect(() => {
    const store = useBookingStore.getState();
    if (!store.selectedDate) {
      const today = new Date();
      store.setSelectedDate(today);
      setMonth(today);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setCourtsLoading(true);
    listCourts()
      .then((list) => {
        if (cancelled) return;
        setCourts(list);
        const store = useBookingStore.getState();
        if (list.length && !list.some((item) => item.id === store.selectedCourtId)) {
          store.setSelectedCourt(list[0].id);
        }
        const active = list.find((item) => item.id === store.selectedCourtId) ?? list[0];
        if (active) setPrice(active.price);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat lapangan");
      })
      .finally(() => {
        if (!cancelled) setCourtsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, setPrice]);

  const refreshSlots = useCallback(async () => {
    setSlotsLoading(true);
    setError(null);
    try {
      const result = await getAvailability(dateISO, selectedCourtId);
      setSlots(result);
      const bookable = result.find((item) => item.status === "AVAILABLE" && item.price != null);
      if (bookable?.price != null) setPrice(bookable.price);
      else if (court) setPrice(court.price);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat ketersediaan slot");
      setSlots(null);
    } finally {
      setSlotsLoading(false);
    }
  }, [dateISO, selectedCourtId, court, setPrice]);

  useEffect(() => {
    if (!mounted || !selectedCourtId) return;
    void refreshSlots();
  }, [mounted, selectedCourtId, refreshSlots]);

  const isPastSlot = useCallback(
    (slot: TimeSlot) => {
      const now = new Date();
      const todayStr = todayISO(now);
      if (dateISO !== todayStr) return false;
      const nowHH = now.getHours() * 60 + now.getMinutes();
      const [h, m] = slot.start.split(":").map(Number);
      return h * 60 + m <= nowHH;
    },
    [dateISO],
  );

  const slotHasRange = useCallback(
    (slot: TimeSlot) => {
      const startHour = Number(slot.start.slice(0, 2));
      if (startHour + duration > 23) return false;
      if (isPastSlot(slot)) return false;
      if (!slots) return false;
      for (let i = 0; i < duration; i += 1) {
        const hour = String(startHour + i).padStart(2, "0");
        const next = slots.find((item) => item.start.startsWith(hour));
        if (!next || next.status !== "AVAILABLE") return false;
      }
      return true;
    },
    [duration, slots, isPastSlot],
  );

  const selectableSlots = useMemo(
    () => (slots ?? []).filter((slot) => Number(slot.start.slice(0, 2)) + duration <= 23),
    [slots, duration],
  );

  const selectedSlotBookable =
    slots && selectableSlots.some((slot) => slot.start === selectedTime && slotHasRange(slot));

  useEffect(() => {
    if (!slots || !selectableSlots.length) return;
    const current = selectableSlots.find((slot) => slot.start === selectedTime);
    if (current && slotHasRange(current)) return;
    const fallback = selectableSlots.find((slot) => slotHasRange(slot));
    if (fallback) setSelectedTime(fallback.start);
  }, [slots, selectableSlots, selectedTime, slotHasRange, setSelectedTime]);

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="min-h-[34rem] rounded-2xl" />
        <Skeleton className="min-h-[22rem] rounded-2xl" />
      </div>
    );
  }

  const canContinue = Boolean(selectedDate) && Boolean(selectedSlotBookable);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card className="border-border bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="limeSoft">
                <Zap /> Langkah 1 dari 3
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl">Pilih Jadwal Bermain</CardTitle>
            <CardDescription>
              Atur tanggal, durasi, lapangan, dan jam mulai sesuai ketersediaan.
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
                <Label className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" aria-hidden="true" />
                  Durasi
                </Label>
                <div className="flex h-11 items-center justify-between rounded-xl border border-input bg-black/25 px-3">
                  <button
                    type="button"
                    aria-label="Kurangi durasi"
                    onClick={() => setDuration(duration - 1)}
                    disabled={duration <= 1}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-sm font-bold text-foreground" aria-live="polite">
                    {duration} jam
                  </span>
                  <button
                    type="button"
                    aria-label="Tambah durasi"
                    onClick={() => setDuration(duration + 1)}
                    disabled={duration >= 3}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-white/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-court" className="flex items-center gap-2">
                  <LayoutGrid className="size-4 text-primary" aria-hidden="true" />
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
                    <SelectValue
                      placeholder={courtsLoading ? "Memuat lapangan…" : "Pilih lapangan"}
                    />
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

        <Card className="border-border bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">Jam Mulai</CardTitle>
              <Badge variant={slotsLoading ? "outline" : "limeSoft"}>
                {slotsLoading ? "Memuat…" : "Ketersediaan live"}
              </Badge>
            </div>
            <CardDescription>
              Slot tersedia untuk {format(selectedDate ?? new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })} ·{" "}
              {court?.name ?? selectedCourtId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400"
              >
                {error}
                <button
                  type="button"
                  onClick={() => void refreshSlots()}
                  className="ml-2 underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Coba lagi
                </button>
              </p>
            )}

            {slotsLoading && !slots ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
                role="listbox"
                aria-label="Pilih jam mulai"
              >
                {selectableSlots.map((slot) => {
                  const bookable = slotHasRange(slot);
                  const active = slot.start === selectedTime && bookable;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      role="option"
                      aria-selected={active}
                      disabled={!bookable || slotsLoading}
                      onClick={() => setSelectedTime(slot.start)}
                      className={[
                        "flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-transparent bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(163,230,53,0.8)]"
                          : bookable
                            ? "border-white/12 bg-white/5 text-white/85 hover:border-primary/45 hover:text-primary"
                            : "cursor-not-allowed border-white/8 bg-black/30 text-muted-foreground/40 line-through",
                      ].join(" ")}
                    >
                      <span>{slot.start}</span>
                      <span className="text-[0.65rem] font-medium opacity-75">
                        {bookable ? `${duration} jam` : "Terisi"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
          <CardDescription>Periksa detail sebelum lanjut ke data diri.</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-1">
          <dl className="divide-y divide-white/5">
            <SummaryRow label="Lapangan" value={courtLabel} />
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
              value={selectedSlotBookable ? slotRange(selectedTime, duration) : "—"}
            />
            <SummaryRow label="Durasi" value={`${duration} jam`} />
            <SummaryRow label="Harga / jam" value={rp(price)} />
          </dl>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
                Total Bayar
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">Termasuk pajak & biaya layanan</p>
            </div>
            <p className="font-display text-2xl font-extrabold text-primary">{totalLabel()}</p>
          </div>

          {!selectedSlotBookable && !slotsLoading && (
            <p
              role="status"
              className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-300"
            >
              Pilih slot jam yang masih tersedia untuk melanjutkan.
            </p>
          )}

          <Button
            size="lg"
            className="mt-4 w-full"
            disabled={!canContinue}
            onClick={() => {
              window.location.href = "/checkout";
            }}
          >
            Lanjut ke Checkout
            <ArrowRight aria-hidden="true" />
          </Button>

          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            Slot ditahan sementara saat checkout. Bayar untuk mengunci jadwal bermainmu.
          </p>

          {slotsLoading && (
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />
              Memperbarui ketersediaan…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
