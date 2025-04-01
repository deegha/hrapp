import { create } from "zustand";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user: User, token: string) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isLoggedIn: () => {
    const token = localStorage.getItem("token");

    if (token) return true;

    return false;
  },
}));

// Restore auth state from localStorage
type AuthInitializer = () => void;
export const initializeAuthStore: AuthInitializer = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    useAuthStore.getState().login(JSON.parse(user), token);
  }
};
