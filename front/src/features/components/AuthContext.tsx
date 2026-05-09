"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryKeys";
import api from "../lib/api";
import { User } from "../types";
import getToken from "../lib/getMeAndUsers";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  isTokenValidated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 👇 Use a function to read token directly (NO STATE for token!)
  const token = getToken();
  const [isTokenValidated, setIsTokenValidated] = useState(false);

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

  // Debug log

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
