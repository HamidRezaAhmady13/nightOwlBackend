import { User } from "../types";
import { api } from "./api";

type SearchResponse = {
  data: User[];
  total: number;
};

export async function searchUsers({
  q,
  page,
  limit,
}: {
  q: string;
  page: number;
  limit: number;
}): Promise<SearchResponse> {
  const res = await api.get<SearchResponse>("/users/search", {
    params: { q, page, limit },
  });
  return res.data;
}
