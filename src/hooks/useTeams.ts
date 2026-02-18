import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Team } from "@/data/mockData";

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*");
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        members: row.members || [],
        guide_id: row.guide_id || undefined,
        projectId: row.project_id || undefined,
      }));
    },
    staleTime: 30_000,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; members: string[] }) => {
      const { data: result, error } = await supabase.from("teams").insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); toast.success("Team created"); },
    onError: () => toast.error("Failed to create team"),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); toast.success("Team deleted"); },
    onError: () => toast.error("Failed to delete team"),
  });
}

export function useAssignGuideToTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, guideId }: { teamId: string; guideId: string }) => {
      // guideId here should be the guide's user_id
      const { data, error } = await supabase.from("teams").update({ guide_id: guideId }).eq("id", teamId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); toast.success("Guide assigned to team"); },
    onError: () => toast.error("Failed to assign guide"),
  });
}
