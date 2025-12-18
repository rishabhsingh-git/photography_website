import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Payment } from "../types";

export function usePayments(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["payments", filters],
    initialData: [] as Payment[],
    queryFn: async () => {
      const res = await api.get("/payments", { params: filters });
      const payload = res.data;
      if (Array.isArray(payload)) return payload as Payment[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as Payment[];
      // eslint-disable-next-line no-console
      console.warn("Unexpected /payments payload:", payload);
      return [] as Payment[];
    },
    staleTime: 60 * 1000,
  });
}


