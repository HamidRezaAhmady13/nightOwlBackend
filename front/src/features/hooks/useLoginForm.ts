import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  clearRefreshInterval,
  startRefreshInterval,
} from "../utils/startRefreshInterval";
import { loginUser } from "../lib/auth";

// hooks/useLoginForm.ts
export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  type AuthError = {
    message: string;
    code?: string;
    status?: number;
    details?: string[];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      await toast.promise(loginUser(email, password), {
        loading: "Logging you in...",
        success: "Welcome back!",
        error: "Login failed. Please check your credentials.",
      });

      router.push("/feed");
      router.refresh();
      clearRefreshInterval();
      startRefreshInterval();
    } catch (err: unknown) {
      const error = err as AuthError;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleLogin,
  };
}
