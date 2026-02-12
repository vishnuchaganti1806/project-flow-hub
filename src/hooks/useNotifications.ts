import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";
import { mockNotifications, type Notification } from "@/data/mockData";

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await notificationsAPI.getAll();
        return res.data;
      } catch {
        return mockNotifications;
      }
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await notificationsAPI.markRead(id);
      } catch {
        // mock no-op
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
