import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deadlinesAPI } from "@/services/api";

export interface Deadline {
  id: string;
  title: string;
  date: string;
  projectId?: string;
}

// Default mock deadlines
const mockDeadlines: Deadline[] = [
  { id: "dl1", title: "Milestone 2 Submission", date: "2026-02-14" },
  { id: "dl2", title: "Progress Report", date: "2026-02-20" },
  { id: "dl3", title: "Final Presentation", date: "2026-03-15" },
];

export function useDeadlines() {
  return useQuery<Deadline[]>({
    queryKey: ["deadlines"],
    queryFn: async () => {
      try {
        const res = await deadlinesAPI.getAll();
        return res.data;
      } catch {
        return mockDeadlines;
      }
    },
  });
}

export function useCreateDeadline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; date: string; projectId?: string }) => {
      try {
        const res = await deadlinesAPI.create(data);
        return res.data;
      } catch {
        return { id: "dl-" + Date.now(), ...data };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deadlines"] }),
  });
}
