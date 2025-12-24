import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Asset } from "../types";

export function useAssets(categoryId?: string, serviceId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["assets", categoryId, serviceId];

  const assetsQuery = useQuery({
    queryKey,
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
    staleTime: 2 * 60 * 1000,
  });

  const upload = useMutation({
    mutationFn: (payload: FormData) => {
      console.log('📤 [useAssets] Uploading single file with FormData');
      // Log FormData contents for debugging
      for (const [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      return api.post<Asset>("/assets/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (data) => {
      console.log('✅ [useAssets] Upload successful:', data);
      // Invalidate all asset queries, not just the current one
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  const uploadMultiple = useMutation({
    mutationFn: (payload: FormData) => {
      console.log('📤 [useAssets] Uploading multiple files with FormData');
      console.log('📤 [useAssets] API baseURL:', api.defaults.baseURL);
      // Log FormData contents for debugging
      for (const [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      const url = "/assets/upload-multiple";
      const fullURL = api.defaults.baseURL 
        ? `${api.defaults.baseURL}${url.startsWith('/') ? url : `/${url}`}`
        : url;
      console.log('📤 [useAssets] Full upload URL:', fullURL);
      return api.post<Asset[]>(url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (data) => {
      console.log('✅ [useAssets] Multiple upload successful:', data);
      // Invalidate all asset queries, not just the current one
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  const update = useMutation({
    mutationFn: (payload: Partial<Asset> & { id: string }) =>
      api.patch<Asset>(`/assets/${payload.id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { assetsQuery, upload, uploadMultiple, update };
}


