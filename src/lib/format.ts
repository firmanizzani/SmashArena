import { formatIDR } from "./utils";
import type { BookingStatus, PaymentMethod, PaymentStatus } from "../types/database";

export function rp(value: number): string {
  return `Rp${formatIDR(value)}`;
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
  EXPIRED: "Kedaluwarsa",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Refund",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  EWALLET: "E-Wallet",
};

export const COURT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Tersedia",
  MAINTENANCE: "Perawatan",
  INACTIVE: "Nonaktif",
};

export type BadgeTone = "default" | "secondary" | "outline" | "limeSoft" | "danger" | "muted";

export function bookingStatusTone(status: BookingStatus): BadgeTone {
  switch (status) {
    case "CONFIRMED":
      return "limeSoft";
    case "PENDING":
      return "outline";
    case "CANCELLED":
    case "EXPIRED":
      return "danger";
    case "COMPLETED":
      return "muted";
    default:
      return "secondary";
  }
}

export function paymentStatusTone(status: PaymentStatus): BadgeTone {
  if (status === "PAID") return "limeSoft";
  if (status === "PENDING") return "outline";
  if (status === "FAILED" || status === "EXPIRED") return "danger";
  return "muted";
}

export function slotRange(start: string, duration: number): string {
  const startHour = Number(start.slice(0, 2));
  const endHour = startHour + duration;
  return `${start} – ${String(endHour).padStart(2, "0")}:00`;
}

export function isPastBooking(bookingDate: string, endTime: string): boolean {
  const end = new Date(`${bookingDate}T${endTime}:00`);
  return end.getTime() < Date.now();
}
