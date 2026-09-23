export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export type FacilityIcon =
  | "court"
  | "light"
  | "shower"
  | "parking"
  | "refreshment"
  | "locker"
  | "ac"
  | "wifi";

export interface Facility {
  id: string;
  icon: FacilityIcon;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface ContactInfo {
  brand: string;
  tagline: string;
  address: string[];
  addressFull: string;
  phoneLabel: string;
  phoneHref: string;
  whatsapp: string;
  instagram?: string;
  email: string;
  emailHref: string;
  hoursLabel: string;
  hours: string;
  mapEmbedUrl: string;
  directionsUrl: string;
}

export interface Court {
  id: string;
  name: string;
  tier: "regular" | "premium" | "vip";
  tierLabel: string;
  price: number;
  priceLabel: string;
  status: "available" | "booked";
  description: string;
  features: string[];
  image: string;
  alt: string;
}

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
