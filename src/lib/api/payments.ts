import { apiFetch } from "./client";
import type { PaymentMethod, PaymentRecord, PaymentStatus } from "../../types/database";

export interface CreatePaymentInput {
  bookingId: string;
  amount?: number;
  method: PaymentMethod;
  reference?: string;
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
  return apiFetch<PaymentRecord>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listPayments(): Promise<PaymentRecord[]> {
  return apiFetch<PaymentRecord[]>("/admin/payments");
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  extra?: { transactionId?: string; amount?: number },
): Promise<PaymentRecord> {
  return apiFetch<PaymentRecord>(`/admin/payments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...extra }),
  });
}
