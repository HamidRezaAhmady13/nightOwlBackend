export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://127.0.0.1:3001";

export const BACKEND_BASE = API_URL.replace(/\/api$/, "");

import axios, { AxiosInstance, AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import {
  clearRefreshInterval,
  startRefreshInterval,
} from "../utils/startRefreshInterval";
import { User } from "../types";
type BackendErrorData = {
  code?: string;
  message?: string | string[];
  error?: string;
};
const isAuthEndpoint = (url?: string) =>
  !!url &&
  (url.includes("/auth/signin") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/refresh"));

export async function fetchUserById(userId: string): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
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

  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  clearRefreshInterval();
  startRefreshInterval();
  return access;
}
let refreshing: Promise<string> | null = null;
type QueueItem = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};
let requestQueue: QueueItem[] = [];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't refresh for auth endpoints
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(err);
    }

    // Only handle 401
    if (err.response?.status !== 401) {
      return Promise.reject(err);
    }

    // Already retried once? reject
    if (originalRequest._retry) {
      const method = originalRequest.method?.toLowerCase();
      if (["post", "patch", "put", "delete"].includes(method || "")) {
        window.dispatchEvent(new CustomEvent("require-login-prompt"));
      }
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    if (!refreshing) {
      refreshing = doRefresh()
        .then((token) => {
          requestQueue.forEach((item) => item.resolve(token));
          requestQueue = [];
          return token;
        })
        .catch((refreshErr) => {
          requestQueue.forEach((item) => item.reject(refreshErr));
          requestQueue = [];
          const method = originalRequest.method?.toLowerCase();
          if (["post", "patch", "put", "delete"].includes(method || "")) {
            window.dispatchEvent(new CustomEvent("require-login-prompt"));
          }
          throw refreshErr;
        })
        .finally(() => {
          refreshing = null;
        });
    }

    return new Promise<any>((resolve, reject) => {
      requestQueue.push({
        resolve: (token: string) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(originalRequest));
        },
        reject: (reason: any) => reject(reason),
      });
    });
  },
);
export default api;
