import { User } from "../types";
import api from "./api";

export async function getUserbyId(id: string) {
  const res = await api.get<User>(`users/id/${id}`);

  return res.data;
}
