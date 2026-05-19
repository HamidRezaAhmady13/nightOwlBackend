import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SignupFormData, SignupFormErrors } from "../types";
import { flushSync } from "react-dom";

import { api } from "../lib/api";

import {
  clearRefreshInterval,
  startRefreshInterval,
} from "../utils/startRefreshInterval";
import { validateSignupForm } from "../utils/validateSignupForm";
import { useQueryClient } from "@tanstack/react-query";

export function useSignupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<SignupFormData>({
    email: "",
    password: "",
    passwordConfirm: "",
    username: "",
  });

  const [errors, setErrors] = useState<SignupFormErrors>({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(form.password !== form.passwordConfirm);
  }, [form.password, form.passwordConfirm]);

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    flushSync(() => {
      setForm((prev) => ({ ...prev, [name]: value }));
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const { isValid, errors: clientErrors, message } = validateSignupForm(form);
    setErrors(clientErrors);
    if (!isValid) {
      toast.error(message || "Please fix the highlighted fields");
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "Passwords do not match",
      }));
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/signup", {
        password: form.password,
        email: form.email,
        username: form.username,
      });
      queryClient.clear();

      const access = response.data.access_token;
      if (access) {
        localStorage.setItem("token", access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      }
      const username = response.data.username;
      window.dispatchEvent(new Event("token-changed"));

      toast.success("Welcome aboard!");

      router.push(`/users/${username}/edit`);
      clearRefreshInterval();
      startRefreshInterval();
    } catch (err: any) {
      const msgs = err.response?.data?.error?.message;
      const first = Array.isArray(msgs)
        ? msgs.find((m) => typeof m === "string")
        : typeof msgs === "string"
          ? msgs
          : null;

      const errorMsg = first || "Signup failed";
      // map Nest error -> field
      if (errorMsg.toLowerCase().includes("username")) {
        setErrors((e) => ({ ...e, username: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("email")) {
        setErrors((e) => ({ ...e, email: errorMsg }));
      } else {
        setErrors((e) => ({ ...e, password: errorMsg }));
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    handleChange,
    disabled,
    handleSubmit,
  };
}
