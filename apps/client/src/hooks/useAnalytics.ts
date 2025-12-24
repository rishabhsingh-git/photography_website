import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useFunnelData(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["analytics", "funnel", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const { data } = await api.get(`/analytics/funnel?${params.toString()}`);
      return data;
    },
  });
}

export function usePaymentsByCustomer() {
  return useQuery({
    queryKey: ["analytics", "payments-by-customer"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/payments-by-customer");
      return data;
    },
  });
}

export function useDailyStats(days = 30) {
  return useQuery({
    queryKey: ["analytics", "daily-stats", days],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/daily-stats?days=${days}`);
      return data;
    },
  });
}

