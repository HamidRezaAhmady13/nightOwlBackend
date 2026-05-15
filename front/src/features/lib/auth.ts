import { startRefreshInterval } from "../utils/startRefreshInterval";
import { api, API_URL } from "./api";

// lib/auth.ts
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/signin", { email, password });

  const access = res.data.access_token;
  if (access) {
    localStorage.setItem("token", access);
    window.dispatchEvent(new Event("token-changed"));
  }
  startRefreshInterval();
}

export async function logoutUser() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("token-changed"));
  delete api.defaults.headers.common["Authorization"];

  return api.post("/auth/logout", {}, { withCredentials: true });
}

export function redirectToGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`;
}
