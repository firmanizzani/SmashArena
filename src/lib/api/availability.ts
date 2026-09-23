import { apiFetch } from "./client";

export type SlotStatus = "AVAILABLE" | "BOOKED";

export interface TimeSlot {
  start: string;
  end: string;
  status: SlotStatus;
  price: number | null;
}

export const SLOT_START_HOUR = 6;
export const SLOT_END_HOUR = 23;

export async function getAvailability(dateISO: string, courtId: string): Promise<TimeSlot[]> {
  return apiFetch<TimeSlot[]>(
    `/availability?date=${encodeURIComponent(dateISO)}&courtId=${encodeURIComponent(courtId)}`,
  );
}

export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
