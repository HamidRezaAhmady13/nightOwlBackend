import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SignupFormData, SignupFormErrors } from "../types";
import { flushSync } from "react-dom";

import { buildFormData } from "@/features/utils/buildFormData";
import { api } from "../lib/api";

import {
  clearRefreshInterval,
  startRefreshInterval,
} from "../utils/startRefreshInterval";
import { validateSignupForm } from "../utils/validateSignupForm";

export function useSignupForm() {
  const router = useRouter();

  const [form, setForm] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    avatarUrl: null,
    bio: "",
    location: "",
    website: "",
  });

  const [errors, setErrors] = useState<SignupFormErrors>({
    username: "",
    email: "",
    password: "",
    avatarUrl: "",
    bio: "",
    location: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    flushSync(() => {
      setForm((prev) => ({ ...prev, [name]: value }));
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
    console.log(form);
    console.log(errors);
  };

  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, avatarUrl: file }));
    setErrors((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // client-side validation
    const { isValid, errors: clientErrors, message } = validateSignupForm(form);
    setErrors(clientErrors);
    if (!isValid) {
      toast.error(message || "Please fix the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", buildFormData(form));
      toast.success("Welcome aboard!");
      router.push("/feed");
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
    handleFileChange,
    handleSubmit,
  };
}
