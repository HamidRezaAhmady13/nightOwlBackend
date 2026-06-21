"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryKeys";
import api from "../lib/api";
import { User } from "../types";
import getToken from "../lib/getMeAndUsers";
import { usePathname, useRouter } from "next/navigation";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  isTokenValidated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(getToken());
  const [isTokenValidated, setIsTokenValidated] = useState(false);
  // const queryClient = useQueryClient();

  const syncToken = useCallback(() => {
    const newToken = getToken();
    setToken(newToken);
  }, []);

  useEffect(() => {
    // Listen for StorageEvent (e.g., from another tab)
    window.addEventListener("storage", syncToken);
    // Listen for our own custom event (dispatched after signup/login)
    window.addEventListener("token-changed", syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("token-changed", syncToken);
    };
  }, [syncToken]);

  useEffect(() => {
    const publicPaths = ["/login", "/signup", "/auth/callback"];
    if (!token && !publicPaths.some((p) => pathname.startsWith(p))) {
      router.replace("/login");
    }
  }, [token, pathname, router]);

  const { data, isLoading } = useQuery<User | null>({
    queryKey: queryKeys.user.current(token ?? ""),
    queryFn: async () => {
      if (!token) return null;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get<User>("/users/me", { headers });
      setIsTokenValidated(true);
      return res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  return (
    <AuthContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        token,
        isTokenValidated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useCurrentUser must be used inside <AuthProvider>");
  return ctx;
}
