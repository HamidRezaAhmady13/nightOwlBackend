import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logoutUser } from "../lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      queryClient.clear();
      await toast.promise(logoutUser(), {
        loading: "Logging out...",
        success: "Logged out",
        error: "Logout failed",
      });

      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { handleLogout };
}
