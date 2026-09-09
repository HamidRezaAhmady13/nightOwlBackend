import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logoutUser } from "../lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../store/userStore";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await toast.promise(logoutUser(), {
        loading: "Logging out...",
        success: "Logged out",
        error: "Logout failed",
      });

      queryClient.clear();
      useUserStore.getState().setUser(null);
      useUserStore.getState().setLoading(false);

      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return { handleLogout };
}
