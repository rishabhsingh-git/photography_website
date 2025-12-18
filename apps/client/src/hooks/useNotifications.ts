import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { NotificationItem } from "../types";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get<NotificationItem[]>("/notifications");
      // Ensure we always return an array, even if the API returns something else
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30 * 1000,
  });
}


