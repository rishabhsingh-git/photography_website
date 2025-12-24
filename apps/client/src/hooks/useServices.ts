import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { ServiceItem } from "../types";

const key = ["services"];

export function useServices() {
  const queryClient = useQueryClient();

  console.log('🔧 [useServices] Hook called - initializing query');

  const servicesQuery = useQuery({
    queryKey: key,
    queryFn: async () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📡 [useServices] Fetching services from API...');
      console.log('📡 [useServices] API baseURL:', api.defaults.baseURL);
      console.log('📡 [useServices] Full URL will be:', `${api.defaults.baseURL}/services`);
      console.log('📡 [useServices] Making GET request now...');
      try {
        const res = await api.get("/services");
        console.log('✅ [useServices] Services API response status:', res.status);
        console.log('✅ [useServices] Services API response headers:', res.headers);
        console.log('✅ [useServices] Services API response data:', res.data);
        console.log('✅ [useServices] Response data type:', typeof res.data);
        console.log('✅ [useServices] Is array?', Array.isArray(res.data));
        const payload = res.data;
        if (Array.isArray(payload)) {
          console.log(`✅ [useServices] Found ${payload.length} services (array format)`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return payload as ServiceItem[];
        }
        if (payload && Array.isArray((payload as any).data)) {
          console.log(`✅ [useServices] Found ${(payload as any).data.length} services in data property`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return (payload as any).data as ServiceItem[];
        }
        console.warn("⚠️ [useServices] Unexpected /services payload:", payload);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return [] as ServiceItem[];
      } catch (error: any) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [useServices] Error fetching services:', error);
        console.error('❌ [useServices] Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          config: error?.config,
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
        });
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

  // Log query state changes
  React.useEffect(() => {
    console.log('🔧 [useServices] Query state changed:', {
      status: servicesQuery.status,
      fetchStatus: servicesQuery.fetchStatus,
      isLoading: servicesQuery.isLoading,
      isFetching: servicesQuery.isFetching,
      isError: servicesQuery.isError,
      isSuccess: servicesQuery.isSuccess,
      hasData: !!servicesQuery.data,
      dataLength: Array.isArray(servicesQuery.data) ? servicesQuery.data.length : 0,
    });
  }, [servicesQuery.status, servicesQuery.fetchStatus, servicesQuery.isLoading, servicesQuery.isFetching, servicesQuery.isError, servicesQuery.isSuccess, servicesQuery.data]);

  // Force query to run immediately when hook is called
  React.useEffect(() => {
    console.log('🔧 [useServices] Effect: Checking if query should run...');
    if (servicesQuery.fetchStatus === 'idle' && !servicesQuery.data && !servicesQuery.isLoading) {
      console.log('🔧 [useServices] Query is idle with no data - forcing fetch!');
      servicesQuery.refetch();
    }
  }, []);

  const addToCart = useMutation({
    mutationFn: (serviceId: string) => api.post("/cart", { serviceId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return { servicesQuery, addToCart };
}


