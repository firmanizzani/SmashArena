import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Coins, Loader2, Search } from "lucide-react";

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
import { Skeleton } from "../ui/skeleton";
import { listPayments, updatePaymentStatus } from "../../lib/api/payments";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  paymentStatusTone,
  rp,
} from "../../lib/format";
import type { PaymentRecord, PaymentStatus } from "../../types/database";

const FILTERS: { value: "ALL" | PaymentStatus; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "PAID", label: "Lunas" },
  { value: "PENDING", label: "Menunggu" },
  { value: "FAILED", label: "Gagal" },
  { value: "REFUNDED", label: "Refund" },
];

export function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | PaymentStatus>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listPayments()
      .then((data) => {
        if (active) setPayments(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat pembayaran");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!payments) return null;
    const q = query.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchStatus = status === "ALL" || payment.status === status;
      const matchQuery =
        !q ||
        payment.id.toLowerCase().includes(q) ||
        payment.booking_id.toLowerCase().includes(q) ||
        (payment.transaction_id ?? "").toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [payments, query, status]);

  const totalPaid = useMemo(
    () =>
      (payments ?? [])
        .filter((payment) => payment.status === "PAID")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const markPaid = async (payment: PaymentRecord) => {
    if (savingId) return;
    setSavingId(payment.id);
    try {
      const updated = await updatePaymentStatus(payment.id, "PAID");
      setPayments((prev) =>
        (prev ?? []).map((item) => (item.id === payment.id ? (updated ?? item) : item)),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui pembayaran");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Manajemen</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
            <span className="text-primary">Pembayaran</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pantau transaksi dan status pencairan booking.
          </p>
        </div>
        <Badge variant="limeSoft">
          <Coins aria-hidden="true" />
          Lunas: {rp(totalPaid)}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Cari pembayaran"
            placeholder="Cari kode booking / transaksi…"
            className="pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as "ALL" | PaymentStatus)}>
          <SelectTrigger className="sm:w-48" aria-label="Filter status pembayaran">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((item) => (
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
            <Table minWidth={960}>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Bayar</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs tracking-wider">
                        {payment.booking_id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {PAYMENT_METHOD_LABEL[payment.method]}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.transaction_id ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.paid_at || payment.created_at
                          ? format(
                              new Date(payment.paid_at ?? payment.created_at),
                              "d MMM yyyy, HH:mm",
                              { locale: idLocale },
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {rp(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusTone(payment.status)}>
                          {PAYMENT_STATUS_LABEL[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "PAID" ? (
                          <span className="text-xs text-muted-foreground">Selesai</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingId === payment.id}
                            onClick={() => void markPaid(payment)}
                            aria-label={`Tandai lunas ${payment.id}`}
                          >
                            {savingId === payment.id ? (
                              <Loader2 className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Coins aria-hidden="true" />
                            )}
                            Tandai Lunas
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <p className="font-display text-base font-bold text-white">
                        Pembayaran tidak ditemukan
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ubah filter status atau kata kunci.
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
