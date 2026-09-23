export type UserRole = "USER" | "ADMIN";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

export type CourtStatus = "AVAILABLE" | "MAINTENANCE" | "INACTIVE";

export type PaymentMethod = "QRIS" | "BANK_TRANSFER" | "EWALLET";

export type CourtType = "REGULAR" | "PREMIUM" | "VIP";

/** users */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

/** courts */
export interface CourtRecord {
  id: string;
  name: string;
  type: CourtType;
  description: string;
  price: number;
  status: CourtStatus;
  facilities: string[];
  created_at: string;
  updated_at: string;
}

/** bookings */
export interface BookingRecord {
  id: string;
  user_id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_price: number;
  status: BookingStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  court_name?: string;
  court_tier?: CourtType;
  created_at: string;
  updated_at: string;
  payment?: PaymentRecord | null;
}

/** payments */
export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  reference?: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Relasi: User 1─N Booking, Court 1─N Booking, Booking 1─1 Payment */
export interface BookingWithRelations extends BookingRecord {
  court?: CourtRecord;
  payment?: PaymentRecord;
  user?: Pick<UserRecord, "id" | "name" | "email" | "phone">;
}
