import { create, type StateCreator, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { formatIDR } from "../lib/utils";

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BookingState {
  selectedDate: Date | null;
  selectedTime: string;
  selectedCourtId: string;
  duration: number;
  price: number;
  customer: CustomerInfo;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  setSelectedCourt: (courtId: string) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setCourt: (courtId: string) => void;
  setDuration: (duration: number) => void;
  setPrice: (price: number) => void;
  setCustomer: (customer: Partial<CustomerInfo>) => void;
  calculateTotal: () => number;
  totalLabel: () => string;
  resetBooking: () => void;
}

type BookingStore = UseBoundStore<StoreApi<BookingState>>;

type PersistedBooking = Pick<
  BookingState,
  "selectedDate" | "selectedTime" | "selectedCourtId" | "duration" | "price" | "customer"
>;

declare global {
  var __smashBookingStore: BookingStore | undefined;
}

const DEFAULT_COURT_ID = "court-00001";
const DEFAULT_TIME = "19:00";

const creator: StateCreator<BookingState> = (set, get) => ({
  selectedDate: null,
  selectedTime: DEFAULT_TIME,
  selectedCourtId: DEFAULT_COURT_ID,
  duration: 1,
  price: 50000,
  customer: { name: "", email: "", phone: "" },
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setSelectedCourt: (courtId) => set({ selectedCourtId: courtId }),
  setDate: (date) => get().setSelectedDate(date),
  setTime: (time) => get().setSelectedTime(time),
  setCourt: (courtId) => get().setSelectedCourt(courtId),
  setDuration: (duration) => {
    const safe = Math.min(3, Math.max(1, Math.round(duration)));
    set({ duration: safe });
  },
  setPrice: (price) => set({ price }),
  setCustomer: (customer) => set({ customer: { ...get().customer, ...customer } }),
  calculateTotal: () => get().price * get().duration,
  totalLabel: () => `Rp${formatIDR(get().price * get().duration)}`,
  resetBooking: () =>
    set({
      selectedDate: null,
      selectedTime: DEFAULT_TIME,
      selectedCourtId: DEFAULT_COURT_ID,
      duration: 1,
      price: 50000,
    }),
});

const bookingStorage: PersistStorage<PersistedBooking> = {
  getItem: (name) => {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state: Partial<PersistedBooking>; version: number };
      if (parsed.state && typeof parsed.state.selectedDate === "string") {
        parsed.state.selectedDate = new Date(parsed.state.selectedDate);
      }
      return parsed as { state: PersistedBooking; version: number };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(name);
  },
};

function createBookingStore(): BookingStore {
  globalThis.__smashBookingStore ??= create<BookingState>()(
    persist(creator, {
      name: "smash-booking",
      version: 1,
      storage: bookingStorage,
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        selectedCourtId: state.selectedCourtId,
        duration: state.duration,
        price: state.price,
        customer: state.customer,
      }),
    }),
  );
  return globalThis.__smashBookingStore;
}

export const useBookingStore: BookingStore = createBookingStore();
