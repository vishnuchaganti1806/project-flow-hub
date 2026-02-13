import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ideasAPI } from "@/services/api";
import { mockIdeas, type ProjectIdea, type IdeaStatus } from "@/data/mockData";
import { toast } from "sonner";

export function useIdeas(filters?: Record<string, string>) {
  return useQuery<ProjectIdea[]>({
    queryKey: ["ideas", filters],
    queryFn: async () => {
      try {
        const res = await ideasAPI.getAll(filters);
        return res.data;
      } catch {
        return mockIdeas;
      }
    },
    staleTime: 30_000,
  });
}

export function useIdea(id: string) {
  return useQuery<ProjectIdea>({
    queryKey: ["ideas", id],
    queryFn: async () => {
      try {
        const res = await ideasAPI.getById(id);
        return res.data;
      } catch {
        const found = mockIdeas.find((i) => i.id === id);
        if (!found) throw new Error("Idea not found");
        return found;
      }
    },
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ProjectIdea>) => {
      try {
        const res = await ideasAPI.create(data as Record<string, unknown>);
        return res.data;
      } catch {
        return { ...data, id: "i-" + Date.now(), status: "draft" as IdeaStatus, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea saved successfully");
    },
    onError: () => toast.error("Failed to save idea"),
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProjectIdea> & { id: string }) => {
      try {
        const res = await ideasAPI.update(id, data as Record<string, unknown>);
        return res.data;
      } catch {
        return { id, ...data, updatedAt: new Date().toISOString() };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea updated");
    },
    onError: () => toast.error("Failed to update idea"),
  });
}

export function useUpdateIdeaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, feedback }: { id: string; status: IdeaStatus; feedback?: string }) => {
      try {
        const res = await ideasAPI.updateStatus(id, status, feedback);
        return res.data;
      } catch {
        return { id, status, feedback };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await ideasAPI.delete(id);
      } catch {
        // mock no-op
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea deleted");
    },
    onError: () => toast.error("Failed to delete idea"),
  });
}
