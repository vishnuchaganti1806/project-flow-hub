import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TeamMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export function useTeamMessages(teamId: string) {
  return useQuery<TeamMessage[]>({
    queryKey: ["team-messages", teamId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("team_messages") as any)
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Fetch sender names
      const messages: TeamMessage[] = [];
      for (const row of data || []) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", row.sender_id).maybeSingle();
        messages.push({
          id: row.id,
          teamId: row.team_id,
          senderId: row.sender_id,
          senderName: profile?.name || "Unknown",
          message: row.message,
          createdAt: row.created_at,
        });
      }
      return messages;
    },
    enabled: !!teamId,
    staleTime: 10_000,
  });
}

export function useSendTeamMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ teamId, message }: { teamId: string; message: string }) => {
      const { error } = await (supabase.from("team_messages") as any).insert({
        team_id: teamId,
        sender_id: user!.id,
        message,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["team-messages", vars.teamId] });
      toast.success("Message sent");
    },
    onError: () => toast.error("Failed to send message"),
  });
}

export function useUpdateTeamMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, message, teamId }: { messageId: string; message: string; teamId: string }) => {
      const { error } = await (supabase.from("team_messages") as any)
        .update({ message })
        .eq("id", messageId);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["team-messages", vars.teamId] });
      toast.success("Message updated");
    },
    onError: () => toast.error("Failed to update message"),
  });
}

export function useDeleteTeamMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, teamId }: { messageId: string; teamId: string }) => {
      const { error } = await (supabase.from("team_messages") as any)
        .delete()
        .eq("id", messageId);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["team-messages", vars.teamId] });
      toast.success("Message deleted");
    },
    onError: () => toast.error("Failed to delete message"),
  });
}
