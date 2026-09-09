// src/store/userStore.ts
import { create } from "zustand";
import { User } from "@/features/types";

type UserState = {
  user: User | null;
  isLoading: boolean;
  setUser: (u: User | null) => void;
  setLoading: (l: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (u) => set({ user: u }),
  setLoading: (l) => set({ isLoading: l }),
}));
