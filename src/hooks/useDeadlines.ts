import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Deadline } from "@/data/mockData";

export type { Deadline } from "@/data/mockData";

export function useDeadlines() {
  return useQuery<Deadline[]>({
    queryKey: ["deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*").order("date", { ascending: true });
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        title: d.title,
        date: d.date,
        projectId: d.project_id || undefined,
        teamId: (d as any).team_id || undefined,
      }));
    },
    staleTime: 30_000,
  });
}

export function useCreateDeadline() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { title: string; date: string; projectId?: string }) => {
      const { data: result, error } = await supabase.from("deadlines").insert({
        title: data.title,
        date: data.date,
        project_id: data.projectId || null,
        created_by: user!.id,
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deadlines"] }); toast.success("Deadline created"); },
    onError: () => toast.error("Failed to create deadline"),
  });
}

export function useDeleteDeadline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deadlines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deadlines"] }); toast.success("Deadline deleted"); },
    onError: () => toast.error("Failed to delete deadline"),
  });
}
