import { apiFetch } from "./client";
import type {
  BookingRecord,
  BookingStatus,
  PaymentMethod,
} from "../../types/database";

export interface CreateBookingInput {
  courtId: string;
  bookingDate: string;
  startTime: string;
  duration: number;
  totalPrice?: number;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingRecord> {
  return apiFetch<BookingRecord>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listBookingsForCustomer(): Promise<BookingRecord[]> {
  return apiFetch<BookingRecord[]>("/bookings");
}

export async function getBooking(id: string): Promise<BookingRecord> {
  return apiFetch<BookingRecord>(`/bookings/${encodeURIComponent(id)}`);
}

export async function cancelBooking(id: string): Promise<BookingRecord> {
  return apiFetch<BookingRecord>(`/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
  });
}

export async function listAllBookings(): Promise<BookingRecord[]> {
  return apiFetch<BookingRecord[]>("/admin/bookings");
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<BookingRecord> {
  return apiFetch<BookingRecord>(`/admin/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export interface DashboardStats {
  todaysBookings: number;
  revenue: number;
  pendingPayments: number;
  activeCourts: number;
  totalCourts: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent: BookingRecord[];
}

export async function getDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>("/admin/dashboard");
}

export type { PaymentMethod };
