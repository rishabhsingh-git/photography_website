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
      console.log('🔍 [usePortfolio] Fetching portfolio with params:', params);
      const res = await api.get("/assets", { params });
      const payload = res.data;
      console.log('📦 [usePortfolio] Received payload:', {
        isArray: Array.isArray(payload),
        length: Array.isArray(payload) ? payload.length : 'not array',
        sample: Array.isArray(payload) && payload.length > 0 ? payload[0] : null,
      });
      if (Array.isArray(payload)) {
        console.log('✅ [usePortfolio] Returning array of', payload.length, 'assets');
        return payload as Asset[];
      }
      if (payload && Array.isArray((payload as any).data)) {
        console.log('✅ [usePortfolio] Returning data array of', (payload as any).data.length, 'assets');
        return (payload as any).data as Asset[];
      }
      // eslint-disable-next-line no-console
      console.warn("⚠️ [usePortfolio] Unexpected /assets payload:", payload);
      return [] as Asset[];
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}


