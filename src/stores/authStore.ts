import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../lib/api/auth";
import type { PublicUser } from "../lib/api/users";
import type { UserRole } from "../types/database";

export interface AuthState {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true setelah init() /me selesai dipanggil (sukses atau gagal). */
  initialized: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
  setUser: (user: PublicUser) => void;
  clearUser: () => void;
  updateProfile: (patch: Partial<Pick<PublicUser, "name" | "phone" | "email">>) => void;
  hasRole: (role: UserRole) => boolean;
  clearError: () => void;
}

type AuthStore = UseBoundStore<StoreApi<AuthState>>;

declare global {
  var __smashAuthStore: AuthStore | undefined;
}

const creator = (
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,
  init: async () => {
    if (get().initialized) return;
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, initialized: true, error: null });
    } catch {
      set({ user: null, isAuthenticated: false, initialized: true });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false, initialized: true, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal";
      set({ isLoading: false, error: message, initialized: true });
      throw error;
    }
  },
  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.register(input);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
        error: null,
      });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Register gagal";
      set({ isLoading: false, error: message, initialized: true });
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        initialized: true,
      });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false, error: null }),
  updateProfile: (patch) => {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, ...patch } });
  },
  hasRole: (role) => get().user?.role === role,
  clearError: () => set({ error: null }),
});

function createAuthStore(): AuthStore {
  globalThis.__smashAuthStore ??= create<AuthState>()(
    persist(creator, {
      name: "smash-auth",
      version: 2,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state.isAuthenticated) {
          state.isAuthenticated = true;
        }
      },
    }),
  );
  return globalThis.__smashAuthStore;
}

export const useAuthStore: AuthStore = createAuthStore();
