import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtsAPI } from "@/services/api";
import { mockDoubts, type DoubtThread } from "@/data/mockData";

export function useDoubts() {
  return useQuery<DoubtThread[]>({
    queryKey: ["doubts"],
    queryFn: async () => {
      try {
        const res = await doubtsAPI.getAll();
        return res.data;
      } catch {
        return mockDoubts;
      }
    },
  });
}

export function useCreateDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { subject: string; guideId: string; message: string }) => {
      try {
        const res = await doubtsAPI.create(data);
        return res.data;
      } catch {
        return { id: "d-" + Date.now(), ...data };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doubts"] }),
  });
}

export function useReplyToDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ doubtId, text }: { doubtId: string; text: string }) => {
      try {
        const res = await doubtsAPI.reply(doubtId, text);
        return res.data;
      } catch {
        return { doubtId, text };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doubts"] }),
  });
}
