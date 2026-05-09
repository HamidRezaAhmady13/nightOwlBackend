import { useEffect, useState } from "react";
import { UpdateUserFormData, UpdateUserFormErrors, User } from "../types";
import { api } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { validateUpdateForm } from "../utils/validateUpdateForm";
import { useCurrentUser } from "../components/AuthContext";
import { queryKeys } from "../utils/queryKeys";

type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: {
    message: string;
  };
};

export function useEditProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [formData, setFormData] = useState<UpdateUserFormData>({
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatarUrl: null,
  });
  const [errors, setErrors] = useState<UpdateUserFormErrors>({});

  useEffect(() => {
    if (!currentUser) return;
    setFormData({
      username: currentUser.username,
      bio: currentUser.bio || "",
      email: currentUser.email || "",
      location: currentUser.location || "",
      website: currentUser.website || "",
      avatarUrl: null,
    });
  }, [currentUser]);

  const updateMutation = useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    FormData
  >({
    mutationFn: async (fd) => updateUser(fd),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.current(undefined),
      });
      toast.success("Profile updated!");
      router.push(`/users/${currentUser!.username}`);
    },

    onError: (err) => {
      const data = err.response?.data;
      const msg =
        data?.error?.message ??
        (Array.isArray(data?.message) ? data.message[0] : data?.message) ??
        "Failed to update profile";
      toast.error(msg);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, avatarUrl: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrors(errors);
    const {
      isValid,
      errors: clientErrors,
      message,
    } = validateUpdateForm(formData);
    if (!isValid) {
      setErrors(clientErrors);
      console.log(clientErrors);

      toast.error(message || "Please fix the highlighted fields");
      return;
    }

    const payload = new FormData();
    const original = currentUser!;

    if (formData.username !== original.username) {
      payload.append("username", formData.username);
    }
    if (formData.bio !== original.bio) {
      payload.append("bio", formData.bio || "");
    }
    if (formData.location !== original.location) {
      payload.append("location", formData.location || "");
    }
    if (formData.website !== original.website) {
      payload.append("website", formData.website || "");
    }
    if (formData.email !== original.email) {
      payload.append("email", formData.email || "");
    }
    if (formData.avatarUrl) {
      payload.append("avatar", formData.avatarUrl);
    }

    if (payload.keys().next().done) {
      toast("No changes to save");
      return;
    }

    updateMutation.mutate(payload);
  };

  async function updateUser(fd: FormData): Promise<User> {
    const res = await api.patch<User>("/users/me", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  return {
    formData,
    setFormData,
    errors,
    isLoading: updateMutation.isPending,
    handleChange,
    handleSubmit,
    handleFileChange,
  };
}
