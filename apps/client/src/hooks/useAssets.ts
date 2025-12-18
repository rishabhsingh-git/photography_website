import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Asset } from "../types";

export function useAssets(categoryId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["assets", categoryId];

  const assetsQuery = useQuery({
    queryKey,
    initialData: [] as Asset[],
    queryFn: async () => {
      const params = categoryId ? { categoryId } : undefined;
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
    mutationFn: (payload: FormData) =>
      api.post<Asset>("/assets/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: (payload: Partial<Asset> & { id: string }) =>
      api.patch<Asset>(`/assets/${payload.id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { assetsQuery, upload, update };
}


