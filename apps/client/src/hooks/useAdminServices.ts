import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { ServiceItem } from "../types";

const key = ["admin", "services"];

export interface CreateServiceDto {
  title: string;
  slogan?: string;
  description?: string;
  highlights?: string[];
  price: number;
  discountedPrice?: number;
  isActive?: boolean;
  imageUrl?: string;
  icon?: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export function useAdminServices() {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: key,
    initialData: [] as ServiceItem[],
    queryFn: async () => {
      const res = await api.get("/services/admin/all");
      const payload = res.data;
      if (Array.isArray(payload)) return payload as ServiceItem[];
      if (payload && Array.isArray((payload as any).data)) return (payload as any).data as ServiceItem[];
      // eslint-disable-next-line no-console
      console.warn("Unexpected /services/admin/all payload:", payload);
      return [] as ServiceItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createService = useMutation({
    mutationFn: (dto: CreateServiceDto) => api.post<ServiceItem>("/services", dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, ...dto }: UpdateServiceDto & { id: string }) =>
      api.patch<ServiceItem>(`/services/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteService = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return { servicesQuery, createService, updateService, deleteService };
}

