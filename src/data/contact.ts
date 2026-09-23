import type { ContactInfo } from "./types";

export const contact: ContactInfo = {
  brand: "SMASH ARENA",
  tagline: "Premium Badminton Experience",
  address: ["Jl. Slamet Riyadi No. 88", "Kebayoran Baru, Jakarta Selatan 12160"],
  addressFull: "Jl. Slamet Riyadi No. 88, Kebayoran Baru, Jakarta Selatan 12160",
  phoneLabel: "+62 812-1000-4567",
  phoneHref: "tel:+6281210004567",
  whatsapp: "https://wa.me/6281210004567?text=Halo%20Smash%20Arena%2C%20saya%20ingin%20booking%20lapangan.",
  instagram: "https://www.instagram.com/smasharena.id",
  email: "halo@smasharena.id",
  emailHref: "mailto:halo@smasharena.id",
  hoursLabel: "Open Daily",
  hours: "06:00 — 23:00",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Kebayoran%20Baru%2C%20Jakarta%20Selatan&z=14&output=embed",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Jl.+Slamet+Riyadi+No.+88,+Kebayoran+Baru,+Jakarta+Selatan",
};

export const seo = {
  title: "SMASH ARENA — Premium Badminton Court",
  description:
    "Book premium badminton courts with ease. Play better, play longer, and enjoy the ultimate badminton experience at Smash Arena.",
  canonical: "https://smasharena.example.com/",
  image:
    "https://images.pexels.com/photos/11053297/pexels-photo-11053297.jpeg?auto=compress&cs=tinysrgb&w=1920",
  locale: "id_ID",
  type: "website" as const,
};
