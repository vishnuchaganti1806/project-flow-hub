import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsAPI } from "@/services/api";
import { mockTeams, type Team } from "@/data/mockData";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
