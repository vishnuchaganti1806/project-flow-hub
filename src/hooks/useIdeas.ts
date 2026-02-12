import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ideasAPI } from "@/services/api";
import { mockIdeas, type ProjectIdea, type IdeaStatus } from "@/data/mockData";

// Fetches all ideas — falls back to mock data when API unavailable
export function useIdeas(filters?: Record<string, string>) {
  return useQuery<ProjectIdea[]>({
    queryKey: ["ideas", filters],
    queryFn: async () => {
      try {
        const res = await ideasAPI.getAll(filters);
        return res.data;
      } catch {
        // Fallback to mock data in dev
        return mockIdeas;
      }
    },
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
        // Mock: return the data with a generated id
        return { ...data, id: "i-" + Date.now(), status: "draft" as IdeaStatus, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await ideasAPI.delete(id);
      } catch {
        // mock: no-op
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
  });
}
