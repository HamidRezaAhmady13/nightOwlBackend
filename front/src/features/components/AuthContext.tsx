"use client";
import { createContext, useContext, useEffect } from "react";
import { useQuery, QueryClient, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryKeys";
import api from "../lib/api";
import { User } from "../types";

import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "../store/userStore";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const setUser = useUserStore((s) => s.setUser);
  const setLoading = useUserStore((s) => s.setLoading);
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      try {
        const res = await api.get<User>("/users/me");
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // mirror into Zustand
  useEffect(() => {
    if (user !== undefined) {
      setUser(user);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setUser(null);
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    const handleAuthChange = () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
    window.addEventListener("token-changed", handleAuthChange);
    return () => window.removeEventListener("token-changed", handleAuthChange);
  }, [queryClient]);

  useEffect(() => {
    const exactPublicPaths = [
      "/login",
      "/signup",
      "/auth/callback",
      "/about",
      "/feed",
    ];
    const isExactPublic = exactPublicPaths.includes(pathname);
    const segments = pathname.split("/").filter(Boolean);
    const isPublicProfile = segments.length === 2 && segments[0] === "users";
    const isPublicPost =
      (segments.length === 3 || segments.length === 2) &&
      segments[0] === "post";

    const isPublicPath =
      isExactPublic ||
      isPublicProfile ||
      isPublicPost ||
      pathname.split("/")[1] === "about-us" ||
      pathname.split("/")[1] === "feed";

    if (!isLoading && !user && !isPublicPath) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
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
