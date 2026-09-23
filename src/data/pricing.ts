export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  courtId: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "regular",
    name: "Regular",
    price: 50000,
    priceLabel: "Rp50.000",
    period: "hour",
    courtId: "court-00001",
    description: "Cocok untuk latihan rutin dan permainan santai setelah aktivitas.",
    features: [
      "Sewa per 1 jam",
      "Lapangan vinyl standar",
      "LED lighting merata",
      "Ruang ganti & locker",
      "Area parkir luas",
      "WiFi gratis",
    ],
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 75000,
    priceLabel: "Rp75.000",
    period: "hour",
    courtId: "court-00003",
    description: "Flooring premium dan pencahayaan lebih terang untuk permainan intens.",
    features: [
      "Semua fitur Regular",
      "Premium vinyl flooring",
      "LED anti-glare lighting",
      "Professional net",
      "Prioritas jam peak",
      "Diskon 10% untuk member",
    ],
    highlighted: true,
    badge: "Paling Populer",
  },
  {
    id: "vip",
    name: "VIP",
    price: 100000,
    priceLabel: "Rp100.000",
    period: "hour",
    courtId: "court-00005",
    description: "Pengalaman terbaik dengan lapangan eksklusif dan fasilitas lengkap.",
    features: [
      "Semua fitur Premium",
      "Lapangan eksklusif",
      "Tournament-grade net",
      "Handuk & minuman gratis",
      "Akses VIP lounge",
      "Prioritas booking 7 hari",
    ],
    highlighted: false,
  },
];
