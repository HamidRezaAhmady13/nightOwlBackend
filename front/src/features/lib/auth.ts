import toast from "react-hot-toast";
import { startRefreshInterval } from "../utils/startRefreshInterval";
import { api, API_URL } from "./api";

// lib/auth.ts
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/signin", { email, password });

  const access = res.data.access_token;
  if (access) {
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    window.dispatchEvent(new Event("token-changed"));
  }
  startRefreshInterval();
}

export async function logoutUser() {
  window.dispatchEvent(new Event("token-changed"));
  delete api.defaults.headers.common["Authorization"];

  return api.post("/auth/logout", {}, { withCredentials: true });
}

export function redirectToGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`;
}

export const requireAuth = (actionName: string, currentUser: boolean) => {
  if (!currentUser) {
    toast.error(`Please log in to ${actionName}!`);
    return false;
  }
  return true;
};
