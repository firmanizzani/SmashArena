import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Mail, Phone, Search, Users } from "lucide-react";

import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { listCustomers } from "../../lib/api/users";
import { rp } from "../../lib/format";
import type { CustomerRecord } from "../../lib/api/users";

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listCustomers()
      .then((data) => {
        if (active) setCustomers(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat pelanggan");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!customers) return null;
    const q = query.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        !q ||
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.phone.includes(q),
    );
  }, [customers, query]);

  return (
    <div className="space-y-7">
      <div>
        <span className="eyebrow">Manajemen</span>
        <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
          Data <span className="text-primary">Pelanggan</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Daftar member yang pernah bermain di Smash Arena.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="Cari pelanggan"
          placeholder="Cari nama, email, atau nomor…"
          className="pl-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <Table minWidth={860}>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Total Booking</TableHead>
                  <TableHead>Total Transaksi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                            {customer.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{customer.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{customer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3.5 text-primary" aria-hidden="true" />
                          {customer.email}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="size-3.5 text-primary" aria-hidden="true" />
                          {customer.phone}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(customer.joinedAt), "d MMM yyyy", { locale: idLocale })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Users className="size-3.5 text-primary" aria-hidden="true" />
                          {customer.totalBookings}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {rp(customer.totalSpending)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "ACTIVE" ? "limeSoft" : "muted"}>
                          {customer.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <p className="font-display text-base font-bold text-white">
                        Pelanggan tidak ditemukan
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Coba kata kunci pencarian lain.
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
