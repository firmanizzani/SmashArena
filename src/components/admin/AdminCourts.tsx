import { useEffect, useState } from "react";
import { CircleCheck, Construction, Grid3x3, Loader2, Power } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import {
  createCourt,
  deleteCourt,
  listAdminCourts,
  updateCourt,
  type AdminCourtRecord,
} from "../../lib/api/courts";
import { COURT_STATUS_LABEL, rp } from "../../lib/format";
import type { CourtStatus, CourtType } from "../../types/database";

const STATUS_META: Record<
  CourtStatus,
  { icon: typeof CircleCheck; tone: "limeSoft" | "outline" | "danger" }
> = {
  AVAILABLE: { icon: CircleCheck, tone: "limeSoft" },
  MAINTENANCE: { icon: Construction, tone: "outline" },
  INACTIVE: { icon: Power, tone: "danger" },
};

const ACTIONS: { from: CourtStatus; to: CourtStatus; label: string }[] = [
  { from: "AVAILABLE", to: "MAINTENANCE", label: "Tandai Perawatan" },
  { from: "AVAILABLE", to: "INACTIVE", label: "Nonaktifkan" },
  { from: "MAINTENANCE", to: "AVAILABLE", label: "Aktifkan Kembali" },
  { from: "INACTIVE", to: "AVAILABLE", label: "Aktifkan Kembali" },
];

interface CreateForm {
  name: string;
  type: CourtType;
  price: string;
  description: string;
}

const emptyForm: CreateForm = { name: "", type: "REGULAR", price: "50000", description: "" };

export function AdminCourts() {
  const [courts, setCourts] = useState<AdminCourtRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminCourtRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = async () => {
    try {
      const list = await listAdminCourts();
      setCourts(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat lapangan");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const flashSaved = (id: string) => {
    setSavedId(id);
    setTimeout(() => setSavedId((current) => (current === id ? null : current)), 1600);
  };

  const changeStatus = async (court: AdminCourtRecord, next: CourtStatus) => {
    setBusyId(court.id);
    try {
      const updated = await updateCourt(court.id, { status: next });
      setCourts((prev) => (prev ?? []).map((item) => (item.id === court.id ? updated : item)));
      flashSaved(court.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (creating || !form.name.trim() || !form.price) return;
    setCreating(true);
    setError(null);
    try {
      await createCourt({
        name: form.name.trim(),
        type: form.type,
        price: Number(form.price),
        description: form.description.trim() || undefined,
      });
      setForm(emptyForm);
      setCreateOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat lapangan");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCourt(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus lapangan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Manajemen</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
            Status <span className="text-primary">Lapangan</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atur ketersediaan lapangan Smash Arena.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="limeSoft">
            <Grid3x3 aria-hidden="true" />
            {courts?.length ?? 0} lapangan
          </Badge>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Tambah Lapangan
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400"
        >
          {error}
        </p>
      )}

      {!courts ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courts.map((court) => {
            const meta = STATUS_META[court.status];
            const StatusIcon = meta.icon;
            const actions = ACTIONS.filter((action) => action.from === court.status);
            const activeSchedules = court.schedules.filter((row) => row.is_active);

            return (
              <Card key={court.id} className="border-border bg-card/70">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{court.name}</CardTitle>
                      <CardDescription className="mt-1">{court.label}</CardDescription>
                    </div>
                    <Badge variant={meta.tone}>
                      <StatusIcon aria-hidden="true" />
                      {COURT_STATUS_LABEL[court.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="space-y-2 rounded-2xl border border-white/8 bg-black/25 p-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Harga / jam</dt>
                      <dd className="font-semibold text-primary">{rp(court.price)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Fasilitas</dt>
                      <dd className="text-right font-medium">{court.facilities.length} unggulan</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Jadwal aktif</dt>
                      <dd className="font-medium">{activeSchedules.length} slot</dd>
                    </div>
                  </dl>

                  {savedId === court.id && (
                    <p
                      role="status"
                      className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary"
                    >
                      <CircleCheck className="size-3.5" aria-hidden="true" />
                      Status diperbarui.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <Button
                        key={action.to}
                        size="sm"
                        variant={action.to === "INACTIVE" ? "outline" : "secondary"}
                        className={action.to === "INACTIVE" ? "text-red-400" : undefined}
                        disabled={busyId === court.id}
                        onClick={() => void changeStatus(court, action.to)}
                      >
                        {busyId === court.id ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                        ) : null}
                        {action.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-400"
                      disabled={busyId === court.id}
                      onClick={() => setDeleteTarget(court)}
                    >
                      Hapus
                    </Button>
                    {actions.length === 0 && (
                      <p className="text-xs text-muted-foreground">Semua aksi sudah diterapkan.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Lapangan</DialogTitle>
            <DialogDescription>Lapangan baru dibuat langsung di database.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="court-name">Nama</Label>
              <Input
                id="court-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="cth. Court 07"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="court-type">Tipe</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value as CourtType }))
                  }
                >
                  <SelectTrigger id="court-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="court-price">Harga / jam (Rp)</Label>
                <Input
                  id="court-price"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="court-desc">Deskripsi</Label>
              <Input
                id="court-desc"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Opsional"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus lapangan?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} akan dihapus permanen beserta jadwalnya. Tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting ? "Menghapus…" : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
