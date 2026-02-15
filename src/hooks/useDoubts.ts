import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { DoubtThread } from "@/data/mockData";
import type { Json } from "@/integrations/supabase/types";

async function mapDoubt(row: any): Promise<DoubtThread> {
  const [{ data: studentProfile }, { data: guideProfile }] = await Promise.all([
    supabase.from("profiles").select("name").eq("user_id", row.student_id).maybeSingle(),
    supabase.from("profiles").select("name").eq("user_id", row.guide_id).maybeSingle(),
  ]);
  const replies = Array.isArray(row.replies) ? row.replies : [];
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: studentProfile?.name || "",
    guideId: row.guide_id,
    guideName: guideProfile?.name || "",
    subject: row.subject,
    messages: replies.map((r: any) => ({ sender: r.sender || "", text: r.text || "", timestamp: r.timestamp || "" })),
    resolved: row.status === "resolved",
  };
}

export function useDoubts() {
  const { user } = useAuth();
  return useQuery<DoubtThread[]>({
    queryKey: ["doubts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("doubts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((data || []).map(mapDoubt));
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useCreateDoubt() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { subject: string; guideId: string; message: string }) => {
      const replies: Json = [{ sender: user!.name, text: data.message, timestamp: new Date().toISOString() }];
      const { data: result, error } = await supabase.from("doubts").insert({
        subject: data.subject,
        message: data.message,
        student_id: user!.id,
        guide_id: data.guideId,
        replies,
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doubts"] }); toast.success("Doubt posted"); },
    onError: () => toast.error("Failed to post doubt"),
  });
}

export function useReplyToDoubt() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ doubtId, text }: { doubtId: string; text: string }) => {
      const { data: doubt, error: fetchErr } = await supabase.from("doubts").select("replies").eq("id", doubtId).single();
      if (fetchErr) throw fetchErr;
      const currentReplies = Array.isArray(doubt?.replies) ? doubt.replies : [];
      const updatedReplies: Json = [...currentReplies, { sender: user!.name, text, timestamp: new Date().toISOString() }] as Json;
      const { error } = await supabase.from("doubts").update({ replies: updatedReplies }).eq("id", doubtId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doubts"] }); toast.success("Reply sent"); },
    onError: () => toast.error("Failed to send reply"),
  });
}

export function useResolveDoubt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doubtId: string) => {
      const { error } = await supabase.from("doubts").update({ status: "resolved" }).eq("id", doubtId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doubts"] }); toast.success("Doubt resolved"); },
    onError: () => toast.error("Failed to resolve doubt"),
  });
}
