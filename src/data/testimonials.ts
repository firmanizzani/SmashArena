import type { Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Rizky Pratama",
    role: "Komunitas Badminton Jakarta",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    quote:
      "Lapangan bersih, lighting bagus, dan booking-nya gampang banget. Rutin tiap Kamis malam di sini, belum pernah kecewa.",
  },
  {
    id: "t-2",
    name: "Sinta Dewi",
    role: "Mahasiswa UI — Pemain Rekreasi",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    quote:
      "Harga ramah di kantong mahasiswa tapi fasilitasnya berasa premium. Locker dan shower room-nya juga selalu bersih.",
  },
  {
    id: "t-3",
    name: "Ahmad Fauzi",
    role: "Pekerja Kantoran",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    rating: 4.9,
    quote:
      "Booking online lewat website cepat, langsung dapat konfirmasi. Lokasi gampang dijangkau dan buka sampai jam 11 malam.",
  },
  {
    id: "t-4",
    name: "Bagas Setiawan",
    role: "Atlet Klub Daerah",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    quote:
      "Court VIP-nya juara. Lantinya empuk, net profesional, dan suhu ruangan stabil — pas buat latihan intensif sebelum turnamen.",
  },
];

export const stats = [
  { value: 6, decimals: 0, suffix: "+", label: "Premium Courts" },
  { value: 10, decimals: 0, suffix: "K+", label: "Happy Players" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Player Rating" },
  { value: 12, decimals: 0, suffix: "+", label: "Hours Daily" },
];
