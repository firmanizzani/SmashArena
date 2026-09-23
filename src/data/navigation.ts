import type { NavLink } from "./types";

/** Anchor landing di-prefix "/" agar tetap berfungsi dari halaman lain. */
export const navigation: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Lapangan", href: "/#courts" },
  { label: "Harga", href: "/#pricing" },
  { label: "Fasilitas", href: "/#facilities" },
  { label: "Lokasi", href: "/#location" },
];

export const bookingHref = "/booking";
