import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { ServiceItem } from "../types";

const key = ["services"];

export function useServices() {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: key,
    initialData: [] as ServiceItem[],
    queryFn: async () => {
      const res = await api.get("/services");
      const payload = res.data;
      if (Array.isArray(payload)) return payload as ServiceItem[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as ServiceItem[];
      // eslint-disable-next-line no-console
      console.warn("Unexpected /services payload:", payload);
      return [] as ServiceItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const addToCart = useMutation({
    mutationFn: (serviceId: string) => api.post("/cart", { serviceId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return { servicesQuery, addToCart };
}


