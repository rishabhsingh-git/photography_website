import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { CartItem } from "../types";

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<CartItem[]>("/cart");
      // Ensure we always return an array, even if the API returns something else
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const updateItem = useMutation({
    mutationFn: (payload: { id: string; quantity: number }) =>
      api.patch(`/cart/${payload.id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => api.delete(`/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return { cartQuery, updateItem, removeItem };
}


