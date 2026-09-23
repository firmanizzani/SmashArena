import type { Facility } from "./types";

export const facilities: Facility[] = [
  {
    id: "premium-courts",
    title: "Premium Courts",
    description: "6 lapangan berstandar turnamen dengan lantai vinyl khusus badminton.",
    icon: "court",
  },
  {
    id: "led-lighting",
    title: "LED Lighting",
    description: "Pencahayaan LED anti-glare 500+ lux tanpa bayangan mengganggu.",
    icon: "light",
  },
  {
    id: "shower-room",
    title: "Shower Room",
    description: "Kamar mandi bersih dengan air panas dan perlengkapan mandi lengkap.",
    icon: "shower",
  },
  {
    id: "parking",
    title: "Parking Area",
    description: "Parkir mobil dan motor luas, aman, dan diawasi sepanjang jam operasional.",
    icon: "parking",
  },
  {
    id: "refreshment",
    title: "Refreshment Area",
    description: "Kafe mini dengan minuman, camilan, dan energi snack untuk memulihkan tenaga.",
    icon: "refreshment",
  },
  {
    id: "locker",
    title: "Locker",
    description: "Loker terkunci gratis untuk menyimpan barang berharga selama bermain.",
    icon: "locker",
  },
  {
    id: "air-conditioning",
    title: "Air Conditioning",
    description: "Suhu ruangan terjaga sejuk agar kamu tetap nyaman dari set hingga set terakhir.",
    icon: "ac",
  },
  {
    id: "free-wifi",
    title: "Free WiFi",
    description: "Koneksi cepat untuk streaming, share skor, dan koordinasi tim kamu.",
    icon: "wifi",
  },
];

export const aboutFeatures: { title: string; description: string; icon: string }[] = [
  {
    title: "Premium Court Flooring",
    description: "Lantai vinyl dengan cushioning untuk pergelangan kaki yang lebih aman.",
    icon: "layers",
  },
  {
    title: "Bright LED Lighting",
    description: "Cahaya merata tanpa silau, nyaman untuk permainan siang maupun malam.",
    icon: "light",
  },
  {
    title: "Professional Nets",
    description: "Net turnamen dengan tinggi dan tegangan sesuai standar resmi.",
    icon: "net",
  },
  {
    title: "Comfortable Waiting Area",
    description: "Area tunggu ber-AC dengan sofa empuk dan pemandangan langsung ke lapangan.",
    icon: "sofa",
  },
  {
    title: "Clean Locker Room",
    description: "Ruang ganti dan loker yang dirawat bersih setiap harinya.",
    icon: "locker",
  },
  {
    title: "Parking Area",
    description: "Parkir aman dan lega untuk mobil maupun motor pengunjung.",
    icon: "parking",
  },
];
