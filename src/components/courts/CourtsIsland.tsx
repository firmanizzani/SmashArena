import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, SearchX } from "lucide-react";

import { listCourts, type CourtSummary } from "../../lib/api/courts";
import { rp } from "../../lib/format";
import { useBookingStore } from "../../stores/bookingStore";

const filters = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

function tagOf(court: CourtSummary): string[] {
  const tier = court.type.toLowerCase();
  const status = court.available ? "available" : "booked";
  return [tier, status];
}

export function CourtsIsland() {
  const [courts, setCourts] = useState<CourtSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<FilterValue>("all");
  const rootRef = useState<{ current: HTMLElement | null }>(() => ({ current: null }))[0];

  useEffect(() => {
    listCourts()
      .then((list) => setCourts(list))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat lapangan"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const nodes = el.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [courts, loading, rootRef]);

  const visible = useMemo(() => {
    if (active === "all") return courts;
    return courts.filter((court) => tagOf(court).includes(active));
  }, [courts, active]);

  const handleBook = (courtId: string) => {
    useBookingStore.getState().setSelectedCourt(courtId);
    document.dispatchEvent(new CustomEvent("smash:select-court", { detail: courtId }));
  };

  return (
    <section id="courts" className="section-pad relative" aria-labelledby="courts-title" ref={rootRef}>
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow">Lapangan Kami</span>
            <h2
              id="courts-title"
              className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-white"
            >
              Choose Your <span className="text-primary">Court</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Lapangan indoor dengan standar berbeda — pilih sesuai gaya permainan dan budget kamu.
            </p>
          </div>

          <div
            className="reveal flex flex-wrap gap-2"
            role="group"
            aria-label="Filter lapangan"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                data-filter={filter.value}
                aria-pressed={active === filter.value}
                onClick={() => setActive(filter.value)}
                className={[
                  "rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/75 outline-none transition-all duration-200 hover:border-primary/45 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
                  active === filter.value
                    ? "border-transparent bg-primary text-primary-foreground shadow-[0_10px_26px_-12px_rgba(163,230,53,0.85)]"
                    : "",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-3xl border border-white/8 bg-card/60" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((court) => (
              <article
                key={court.id}
                data-court-card
                data-filter={tagOf(court).join(" ")}
                className="reveal group flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_36px_70px_-36px_rgba(163,230,53,0.4)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={court.image ?? undefined}
                    alt={court.alt ?? court.name}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] backdrop-blur-md",
                        court.available
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-amber-400/90 text-black/80",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "size-1.5 rounded-full",
                          court.available ? "animate-live-dot bg-black/70" : "bg-black/50",
                        ].join(" ")}
                      />
                      {court.available ? "Available" : "Booked"}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                      {court.label}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
                      Lapangan
                    </p>
                    <h3 className="font-display text-2xl font-extrabold text-white md:text-3xl">
                      {court.name}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">{court.description}</p>

                  <ul className="mt-4 space-y-2">
                    {court.facilities.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm font-medium text-white/85"
                      >
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-white/8 pt-5">
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Harga sewa
                      </p>
                      <p className="mt-1 font-display text-xl font-extrabold text-white">
                        {rp(court.price)}
                        <span className="text-sm font-semibold text-muted-foreground"> / hour</span>
                      </p>
                    </div>

                    <a
                      href="/booking"
                      onClick={() => handleBook(court.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_-12px_rgba(163,230,53,0.8)] outline-none transition-all duration-200 hover:bg-[#b5f04a] hover:shadow-[0_14px_28px_-10px_rgba(163,230,53,0.95)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]"
                    >
                      Book Court
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div
          className={[
            "mt-12 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center sm:p-12",
            loading || error || visible.length > 0 ? "hidden" : "flex",
          ].join(" ")}
          role="status"
        >
          <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-display text-lg font-bold text-white">Belum ada lapangan untuk filter ini</p>
          <p className="text-sm text-muted-foreground">Coba pilih filter lain untuk melihat ketersediaan.</p>
        </div>
      </div>
    </section>
  );
}
