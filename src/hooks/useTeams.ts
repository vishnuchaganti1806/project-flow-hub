import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsAPI } from "@/services/api";
import { mockTeams, type Team } from "@/data/mockData";
import { toast } from "sonner";

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      try {
        const res = await teamsAPI.getAll();
        return res.data;
      } catch {
        return mockTeams;
      }
    },
    staleTime: 30_000,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; members: string[] }) => {
      try {
        const res = await teamsAPI.create(data);
        return res.data;
      } catch {
        return { id: "t-" + Date.now(), ...data };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created");
    },
    onError: () => toast.error("Failed to create team"),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await teamsAPI.delete(id);
      } catch {
        // mock no-op
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted");
    },
    onError: () => toast.error("Failed to delete team"),
  });
}

export function useAssignGuideToTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, guideId }: { teamId: string; guideId: string }) => {
      try {
        const res = await teamsAPI.assignGuide(teamId, guideId);
        return res.data;
      } catch {
        return { teamId, guideId };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Guide assigned");
    },
    onError: () => toast.error("Failed to assign guide"),
  });
}
