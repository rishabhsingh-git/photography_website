import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { ServiceItem } from "../types";
import { useAuth } from "./useAuth";

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
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const servicesQuery = useQuery({
    queryKey: key,
    initialData: [] as ServiceItem[],
    enabled: !authLoading && isAuthenticated && isAdmin, // Only fetch when auth is ready and user is admin
    queryFn: async () => {
      try {
        console.log('🔒 [useAdminServices] Fetching all services from /services/admin/all');
        const res = await api.get("/services/admin/all");
        console.log('🔒 [useAdminServices] Response status:', res.status);
        console.log('🔒 [useAdminServices] Response data:', res.data);
        console.log('🔒 [useAdminServices] Is array?', Array.isArray(res.data));
        const payload = res.data;
        if (Array.isArray(payload)) {
          console.log(`🔒 [useAdminServices] Found ${payload.length} services (array format)`);
          return payload as ServiceItem[];
        }
        if (payload && Array.isArray((payload as any).data)) {
          console.log(`🔒 [useAdminServices] Found ${(payload as any).data.length} services in data property`);
          return (payload as any).data as ServiceItem[];
        }
        console.warn("⚠️ [useAdminServices] Unexpected /services/admin/all payload:", payload);
        return [] as ServiceItem[];
      } catch (error: any) {
        console.error('❌ [useAdminServices] Error fetching services:', error);
        console.error('❌ [useAdminServices] Error response:', error.response?.data);
        console.error('❌ [useAdminServices] Error status:', error.response?.status);
        throw error;
      }
    },
    enabled: true, // Explicitly enable the query
    staleTime: 0, // Always fetch fresh data
    retry: 3,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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

