import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Category } from "../types";

const key = ["categories"];

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: key,
    // Ensure query always returns an array to avoid runtime .map errors
    initialData: [] as Category[],
    queryFn: async () => {
      const res = await api.get("/categories");
      const payload = res.data;
      // Handle different payload shapes: array, or { data: array }
      if (Array.isArray(payload)) return payload as Category[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as Category[];
      // Log unexpected payload for debugging
      // eslint-disable-next-line no-console
      console.warn("Unexpected /categories payload:", payload);
      return [] as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createCategory = useMutation({
    mutationFn: (payload: Partial<Category>) =>
      api.post<Category>("/categories", payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const updateCategory = useMutation({
    mutationFn: (payload: Partial<Category> & { id: string }) =>
      api.patch<Category>(`/categories/${payload.id}`, payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return { categoriesQuery, createCategory, updateCategory, deleteCategory };
}


