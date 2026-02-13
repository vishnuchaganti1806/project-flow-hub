import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/services/api";
import { adminStats } from "@/data/mockData";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const res = await adminAPI.getStats();
        return res.data;
      } catch {
        return adminStats;
      }
    },
    staleTime: 60_000,
  });
}
