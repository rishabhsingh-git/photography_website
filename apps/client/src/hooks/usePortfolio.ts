import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Asset } from "../types";

export function usePortfolio(categoryId?: string, serviceId?: string) {
  return useQuery({
    queryKey: ["portfolio", categoryId, serviceId],
    initialData: [] as Asset[],
    queryFn: async () => {
      const params: any = {};
      if (categoryId) params.categoryId = categoryId;
      if (serviceId) params.serviceId = serviceId;
      const res = await api.get("/assets", { params });
      const payload = res.data;
      if (Array.isArray(payload)) return payload as Asset[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as Asset[];
      // eslint-disable-next-line no-console
      console.warn("Unexpected /assets payload:", payload);
      return [] as Asset[];
    },
    staleTime: 5 * 60 * 1000,
  });
}


