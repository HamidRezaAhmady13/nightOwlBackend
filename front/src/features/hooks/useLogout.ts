import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logoutUser } from "../lib/auth";

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
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
