"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/features/components/shared/Button";
import FormInput from "@/features/components/forms/FormInput";
import { api } from "@/features/lib/api";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password changed!");
      router.push("/feed");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to change password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-2xl">
      <h1 className="text-xl mb-lg">Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-md">
        <FormInput
          type="password"
          name="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Current password"
          required
        />
        <FormInput
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          required
        />
        <FormInput
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        {error && <p className="u-text-error text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
