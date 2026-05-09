import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { queryKeys } from "../utils/queryKeys";
import getToken from "../lib/getMeAndUsers";
// import { token } from "../lib/getMe";

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: "light" | "dark") => {
      document.cookie = `theme=${theme}; path=/; SameSite=lax`;
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
      const res = await api.patch("/users/theme", { theme });

      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.user.current(getToken() ?? ""),
        (old: any) => ({
          ...old,
          settings: {
            ...old?.settings,
            theme: data.settings.theme,
          },
        })
      );
    },
  });
}
