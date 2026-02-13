import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtsAPI } from "@/services/api";
import { mockDoubts, type DoubtThread } from "@/data/mockData";
import { toast } from "sonner";

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
    staleTime: 30_000,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doubts"] });
      toast.success("Doubt posted");
    },
    onError: () => toast.error("Failed to post doubt"),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doubts"] });
      toast.success("Reply sent");
    },
    onError: () => toast.error("Failed to send reply"),
  });
}

export function useResolveDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doubtId: string) => {
      try {
        const res = await doubtsAPI.resolve(doubtId);
        return res.data;
      } catch {
        return { doubtId };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doubts"] });
      toast.success("Doubt resolved");
    },
    onError: () => toast.error("Failed to resolve doubt"),
  });
}
