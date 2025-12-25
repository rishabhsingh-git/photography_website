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
      console.log('🔍 [useAssets] Fetching assets with params:', params);
      const res = await api.get("/assets", { params });
      const payload = res.data;
      console.log('📦 [useAssets] Received payload:', {
        isArray: Array.isArray(payload),
        length: Array.isArray(payload) ? payload.length : 'not array',
        sample: Array.isArray(payload) && payload.length > 0 ? payload[0] : null,
      });
      if (Array.isArray(payload)) {
        console.log('✅ [useAssets] Returning array of', payload.length, 'assets');
        return payload as Asset[];
      }
      if (payload && Array.isArray((payload as any).data)) {
        console.log('✅ [useAssets] Returning data array of', (payload as any).data.length, 'assets');
        return (payload as any).data as Asset[];
      }
      // eslint-disable-next-line no-console
      console.warn("⚠️ [useAssets] Unexpected /assets payload:", payload);
      return [] as Asset[];
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["assets"] });
      queryClient.refetchQueries({ queryKey: ["portfolio"] });
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
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["assets"] });
      queryClient.refetchQueries({ queryKey: ["portfolio"] });
    },
  });

  const update = useMutation({
    mutationFn: (payload: Partial<Asset> & { id: string }) =>
      api.patch<Asset>(`/assets/${payload.id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteAsset = useMutation({
    mutationFn: (id: string) => {
      console.log('🗑️ [useAssets] Deleting asset:', id);
      return api.delete(`/assets/${id}`);
    },
    onSuccess: () => {
      console.log('✅ [useAssets] Delete successful');
      // Invalidate all asset queries
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["assets"] });
      queryClient.refetchQueries({ queryKey: ["portfolio"] });
    },
  });

  return { assetsQuery, upload, uploadMultiple, update, deleteAsset };
}


