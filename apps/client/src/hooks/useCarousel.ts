import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Asset } from "../types";

export function useCarousel(count: number = 6) {
  return useQuery({
    queryKey: ["carousel", count],
    initialData: [] as Asset[],
    queryFn: async () => {
      console.log('🎠 [useCarousel] Fetching carousel images:', { count });
      const res = await api.get("/assets/carousel", { params: { count } });
      const payload = res.data;
      console.log('📦 [useCarousel] Received payload:', {
        isArray: Array.isArray(payload),
        length: Array.isArray(payload) ? payload.length : 'not array',
        sample: Array.isArray(payload) && payload.length > 0 ? payload[0] : null,
      });
      if (Array.isArray(payload)) {
        console.log('✅ [useCarousel] Returning array of', payload.length, 'images');
        return payload as Asset[];
      }
      console.warn("⚠️ [useCarousel] Unexpected /assets/carousel payload:", payload);
      return [] as Asset[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (carousel doesn't need to be super fresh)
    refetchOnMount: 'always',
    refetchOnWindowFocus: false, // Don't refetch on window focus for carousel
  });
}

