import { User } from "../types";
import api from "./api";

export default function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export async function getUserbyId(id: string) {
  const res = await api.get<User>(`users/id/${id}`);

  return res.data;
}
