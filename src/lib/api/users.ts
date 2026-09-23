import { ApiError, apiFetch } from "./client";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpending: number;
  joinedAt: string;
  status: string;
}

export async function listCustomers(): Promise<CustomerRecord[]> {
  return apiFetch<CustomerRecord[]>("/admin/customers");
}

export async function getUser(id: string): Promise<PublicUser> {
  return apiFetch<PublicUser>(`/users/${id}`);
}

export function assertAuth(error: unknown): void {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    throw error;
  }
}
