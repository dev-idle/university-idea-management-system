import { create } from "zustand";
import type { AuthUser } from "@/lib/schemas/auth.schema";

/**
 * Auth state: in-memory only (Zustand). Never localStorage or cookies for
 * access token or user. Refresh token is HttpOnly cookie (backend-set);
 * we never read or store it in JS. All API calls attach Bearer from here
 * and support silent refresh on 401 via Server Action.
 */

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setAccessToken: (accessToken) => set({ accessToken }),
}));
