import { useQuery } from "@tanstack/react-query";
import { guidesAPI } from "@/services/api";
import { mockGuides, type Guide } from "@/data/mockData";

export function useGuides() {
  return useQuery<Guide[]>({
    queryKey: ["guides"],
    queryFn: async () => {
      try {
        const res = await guidesAPI.getAll();
        return res.data;
      } catch {
        return mockGuides;
      }
    },
  });
}
