import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarDays, Loader2, Search } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { listAllBookings, updateBookingStatus } from "../../lib/api/bookings";
import {
  BOOKING_STATUS_LABEL,
  bookingStatusTone,
  rp,
  slotRange,
} from "../../lib/format";
import type { BookingRecord, BookingStatus } from "../../types/database";

const STATUS_FILTERS: { value: "ALL" | BookingStatus; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: BOOKING_STATUS_LABEL.PENDING },
  { value: "CONFIRMED", label: BOOKING_STATUS_LABEL.CONFIRMED },
  { value: "COMPLETED", label: BOOKING_STATUS_LABEL.COMPLETED },
  { value: "CANCELLED", label: BOOKING_STATUS_LABEL.CANCELLED },
  { value: "EXPIRED", label: BOOKING_STATUS_LABEL.EXPIRED },
];

const NEXT_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

function courtLabelOf(booking: BookingRecord): string {
  return booking.court_name ?? booking.court_id;
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | BookingStatus>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAllBookings()
      .then((data) => {
        if (active) setBookings(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat booking");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!bookings) return null;
    const q = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchStatus = status === "ALL" || booking.status === status;
      const matchQuery =
        !q ||
        booking.id.toLowerCase().includes(q) ||
        booking.customer_name.toLowerCase().includes(q) ||
        booking.customer_email.toLowerCase().includes(q) ||
        booking.court_id.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [bookings, query, status]);

  const handleStatusChange = async (booking: BookingRecord, next: BookingStatus) => {
    if (next === booking.status || savingId) return;
    setSavingId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, next);
      setBookings((prev) =>
        (prev ?? []).map((item) => (item.id === booking.id ? updated : item)),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <span className="eyebrow">Manajemen</span>
        <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
          Semua <span className="text-primary">Booking</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cari, filter, dan perbarui status booking pelanggan.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Cari booking"
            placeholder="Cari kode, nama, atau email…"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "ALL" | BookingStatus)}
        >
          <SelectTrigger className="sm:w-52" aria-label="Filter status booking">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400"
        >
          {error}
        </p>
      )}

      <Card className="border-border bg-card/70">
        <CardContent className="p-0">
          {!filtered ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Lapangan</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs tracking-wider text-muted-foreground">
                        {booking.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{booking.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {courtLabelOf(booking)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(`${booking.booking_date}T00:00:00`), "d MMM yyyy", {
                          locale: idLocale,
                        })}
                        <br />
                        <span className="text-xs">{slotRange(booking.start_time, booking.duration)}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {rp(booking.total_price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={bookingStatusTone(booking.status)}>
                          {BOOKING_STATUS_LABEL[booking.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={savingId === booking.id}
                              aria-label={`Ubah status booking ${booking.id}`}
                            >
                              {savingId === booking.id ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                              ) : (
                                <CalendarDays aria-hidden="true" />
                              )}
                              Ubah
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Pindahkan status ke</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {NEXT_STATUSES.map((next) => (
                              <DropdownMenuItem
                                key={next}
                                disabled={next === booking.status}
                                onSelect={() => void handleStatusChange(booking, next)}
                              >
                                {BOOKING_STATUS_LABEL[next]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-14 text-center">
                      <p className="font-display text-base font-bold text-white">
                        Tidak ada booking cocok
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ubah kata kunci atau filter status.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
