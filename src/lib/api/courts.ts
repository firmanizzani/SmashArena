import { apiFetch } from "./client";

export type CourtStatus = "AVAILABLE" | "MAINTENANCE" | "INACTIVE";
export type CourtType = "REGULAR" | "PREMIUM" | "VIP";

/** Bentuk ringkas untuk kebutuhan booking & admin. */
export interface CourtSummary {
  id: string;
  name: string;
  type: CourtType;
  label: string;
  price: number;
  description: string;
  facilities: string[];
  status: CourtStatus;
  available: boolean;
  image: string | null;
  alt: string | null;
}

export interface ScheduleRecord {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  price: number | null;
  is_active: boolean;
}

export interface AdminCourtRecord extends CourtSummary {
  schedules: ScheduleRecord[];
}

export async function listCourts(): Promise<CourtSummary[]> {
  return apiFetch<CourtSummary[]>("/courts");
}

export async function getCourt(id: string): Promise<CourtSummary> {
  return apiFetch<CourtSummary>(`/courts/${encodeURIComponent(id)}`);
}

export async function listCourtSchedules(courtId: string): Promise<ScheduleRecord[]> {
  return apiFetch<ScheduleRecord[]>(`/courts/${encodeURIComponent(courtId)}/schedules`);
}

export async function listAdminCourts(): Promise<AdminCourtRecord[]> {
  return apiFetch<AdminCourtRecord[]>("/admin/courts");
}

export interface CreateCourtInput {
  name: string;
  type: CourtType;
  description?: string;
  price: number;
  status?: CourtStatus;
  facilities?: string[];
  image?: string;
  alt?: string;
}

export async function createCourt(input: CreateCourtInput): Promise<AdminCourtRecord> {
  return apiFetch<AdminCourtRecord>("/admin/courts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCourt(
  id: string,
  input: Partial<CreateCourtInput>,
): Promise<AdminCourtRecord> {
  return apiFetch<AdminCourtRecord>(`/admin/courts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCourt(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/admin/courts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export interface CreateScheduleInput {
  startTime: string;
  endTime: string;
  price?: number | null;
  isActive?: boolean;
}

export async function createSchedule(
  courtId: string,
  input: CreateScheduleInput,
): Promise<ScheduleRecord> {
  return apiFetch<ScheduleRecord>(`/admin/courts/${encodeURIComponent(courtId)}/schedules`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSchedule(
  id: string,
  input: Partial<CreateScheduleInput>,
): Promise<ScheduleRecord> {
  return apiFetch<ScheduleRecord>(`/admin/schedules/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteSchedule(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/admin/schedules/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
