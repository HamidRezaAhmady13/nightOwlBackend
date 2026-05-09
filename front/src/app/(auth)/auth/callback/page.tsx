"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/features/components/shared/Spinner";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const access = url.searchParams.get("access");

      // Clear previous user data (if any)
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // if you store user info
      sessionStorage.clear(); // if you use sessionStorage

      if (access) {
        localStorage.setItem("token", access);
      }

      try {
        if (access) localStorage.setItem("token", access);
        console.debug(
          "[auth-callback] saved token to localStorage preview:",
          access?.slice?.(0, 40)
        );
      } catch (e) {
        // ignore
      }

      try {
        console.debug("[auth-callback] exchange-token request completed");
      } catch (e) {
        console.debug("[auth-callback] exchange-token failed:", e);
      }

      router.push("/feed");
    })();
  }, []);

  return <Spinner />;
}
