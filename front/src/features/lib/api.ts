export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchUserById(userId: string): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
}

import axios, { AxiosInstance, AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import {
  clearRefreshInterval,
  startRefreshInterval,
} from "../utils/startRefreshInterval";
import getToken from "./getMeAndUsers";
import { User } from "../types";

function extractMessage(err: AxiosError): string {
  const data = err.response?.data as any;
  if (!data) return "";

  if (typeof data.message === "string") return data.message;
  if (data.error && typeof data.error.message === "string")
    return data.error.message;

  return "";
}

function isRefreshExpired(msg: string): boolean {
  return (
    msg === "REFRESH_TOKEN_EXPIRED" ||
    msg === "REFRESH_TOKEN_REVOKED" ||
    msg === "No auth token"
  );
}

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export async function doRefresh(): Promise<string> {
  const res = await api.post("/auth/refresh");

  if (res.status !== 200 && res.status !== 201)
    throw new Error("refresh-failed");

  const access = res.data?.access_token || res.data?.access || res.data?.token;
  if (!access) throw new Error("no-access-token");

  localStorage.setItem("token", access);
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  clearRefreshInterval();
  startRefreshInterval();

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "token",
      newValue: access,
    }),
  );

  return access;
}

// attach token for every outgoing request
api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  cfg.headers = cfg.headers ?? {};

  const freshToken = getToken();
  if (freshToken)
    (cfg.headers as Record<string, string>)["Authorization"] =
      `Bearer ${freshToken}`;
  return cfg;
});
// startRefreshInterval
let refreshing: Promise<string | undefined> | null = null;
let requestQueue: ((token?: string) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const msg = extractMessage(err);

    // Access expired → queue + single-flight refresh
    if (err.response?.status === 401 && msg === "ACCESS_TOKEN_EXPIRED") {
      // Start refresh once
      if (!refreshing) {
        refreshing = doRefresh()
          .then((token) => {
            requestQueue.forEach((resolve) => resolve(token));
            requestQueue = [];
            return token;
          })
          .catch((error) => {
            requestQueue.forEach((resolve) => resolve(undefined));
            requestQueue = [];
            throw error;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      // Enqueue this failed request; it will retry after refresh resolves
      return new Promise((resolve) => {
        requestQueue.push((token?: string) => {
          if (token) {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)[
                "Authorization"
              ] = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          } else {
            resolve(Promise.reject(err));
          }
        });
      });
    }

    // Refresh token gone → logout
    if (err.response?.status === 401 && isRefreshExpired(msg)) {
      try {
        // localStorage.removeItem("token");
      } finally {
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }

    return Promise.reject(err);
  },
);

export default api;
