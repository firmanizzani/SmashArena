import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentMethod } from "../types/database";

/**
 * Penyimpanan ringkas antar halaman booking (bukan sumber data booking).
 * Data booking sendiri selalu diambil dari API.
 */
export interface BookingsState {
  lastBookingId: string | null;
  lastPaymentMethod: PaymentMethod | null;
  setLastBookingId: (id: string | null) => void;
  setLastPaymentMethod: (method: PaymentMethod | null) => void;
  clearLastBooking: () => void;
}

type BookingsStore = UseBoundStore<StoreApi<BookingsState>>;

declare global {
  var __smashBookingsStore: BookingsStore | undefined;
}

const creator = (
  set: (partial: Partial<BookingsState>) => void,
): BookingsState => ({
  lastBookingId: null,
  lastPaymentMethod: null,
  setLastBookingId: (id) => set({ lastBookingId: id }),
  setLastPaymentMethod: (method) => set({ lastPaymentMethod: method }),
  clearLastBooking: () => set({ lastBookingId: null, lastPaymentMethod: null }),
});

function createBookingsStore(): BookingsStore {
  globalThis.__smashBookingsStore ??= create<BookingsState>()(
    persist(creator, {
      name: "smash-my-bookings",
      version: 2,
      partialize: (state) => ({
        lastBookingId: state.lastBookingId,
        lastPaymentMethod: state.lastPaymentMethod,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        return {
          lastBookingId: (p.lastBookingId as string | null) ?? null,
          lastPaymentMethod: (p.lastPaymentMethod as PaymentMethod | null) ?? null,
        };
      },
    }),
  );
  return globalThis.__smashBookingsStore;
}

export const useBookingsStore: BookingsStore = createBookingsStore();
