import { startRefreshInterval } from "../utils/startRefreshInterval";
import { api, API_URL } from "./api";

// lib/auth.ts
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/signin", { email, password });

  console.log("logged");

  const access = res.data.access_token;
  if (access) {
    localStorage.setItem("token", access);
  }
  console.log(access);
  console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);
  startRefreshInterval();
}

export async function logoutUser() {
  return api.post("/auth/logout", {}, { withCredentials: true });
}

export function redirectToGoogleAuth() {
  window.location.href = `${API_URL}/auth/google`;
}
