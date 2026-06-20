import {create} from "zustand";

export type TOpsAdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userRole?: string;
};

interface AdminAuthState {
  user: TOpsAdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: TOpsAdminUser, token: string) => void;
  logout: () => void;
}

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    set({user, token, isAuthenticated: true});
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },

  logout: () => {
    set({user: null, token: null, isAuthenticated: false});
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
}));

export function initializeAdminAuthStore() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const user = localStorage.getItem(ADMIN_USER_KEY);
  if (token && user) {
    useAdminAuthStore.getState().login(JSON.parse(user), token);
  }
}
