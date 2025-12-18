import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { User } from "../types";

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ["users", search],
    initialData: [] as User[],
    queryFn: async () => {
      const params = search ? { search } : undefined;
      const res = await api.get("/users", { params });
      const payload = res.data;
      if (Array.isArray(payload)) return payload as User[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as User[];
      // eslint-disable-next-line no-console
      console.warn("Unexpected /users payload:", payload);
      return [] as User[];
    },
    staleTime: 2 * 60 * 1000,
  });
}


