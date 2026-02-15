import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ProjectIdea, IdeaStatus } from "@/data/mockData";

export type { IdeaStatus } from "@/data/mockData";
export type { ProjectIdea } from "@/data/mockData";

async function mapIdea(row: any): Promise<ProjectIdea> {
  // Try to get student name from profiles
  let studentName = "";
  if (row.student_id) {
    const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", row.student_id).maybeSingle();
    studentName = profile?.name || "";
  }
  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract || "",
    problemStatement: row.problem_statement || "",
    techStack: row.tech_stack || [],
    expectedOutcome: row.expected_outcome || "",
    status: row.status as IdeaStatus,
    studentId: row.student_id,
    studentName,
    guideFeedback: row.feedback || undefined,
    submittedAt: row.submitted_at || "",
    updatedAt: row.updated_at || "",
    attachments: row.attachments || [],
  };
}

export function useIdeas(filters?: { status?: string }) {
  return useQuery<ProjectIdea[]>({
    queryKey: ["ideas", filters],
    queryFn: async () => {
      let query = supabase.from("ideas").select("*").order("updated_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return Promise.all((data || []).map(mapIdea));
    },
    staleTime: 30_000,
  });
}

export function useIdea(id: string) {
  return useQuery<ProjectIdea>({
    queryKey: ["ideas", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single();
      if (error) throw error;
      return mapIdea(data);
    },
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Partial<ProjectIdea>) => {
      const { data: result, error } = await supabase.from("ideas").insert({
        title: data.title || "",
        abstract: data.abstract || null,
        problem_statement: data.problemStatement || null,
        tech_stack: data.techStack || [],
        expected_outcome: data.expectedOutcome || null,
        status: data.status || "draft",
        student_id: user!.id,
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ideas"] }); toast.success("Idea saved"); },
    onError: () => toast.error("Failed to save idea"),
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProjectIdea> & { id: string }) => {
      const update: Record<string, any> = {};
      if (data.title !== undefined) update.title = data.title;
      if (data.abstract !== undefined) update.abstract = data.abstract;
      if (data.problemStatement !== undefined) update.problem_statement = data.problemStatement;
      if (data.techStack !== undefined) update.tech_stack = data.techStack;
      if (data.expectedOutcome !== undefined) update.expected_outcome = data.expectedOutcome;
      if (data.status !== undefined) update.status = data.status;
      const { data: result, error } = await supabase.from("ideas").update(update).eq("id", id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ideas"] }); toast.success("Idea updated"); },
    onError: () => toast.error("Failed to update idea"),
  });
}

export function useUpdateIdeaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, feedback }: { id: string; status: IdeaStatus; feedback?: string }) => {
      const { data, error } = await supabase.from("ideas").update({ status, feedback: feedback || null }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ideas"] }); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ideas"] }); toast.success("Idea deleted"); },
    onError: () => toast.error("Failed to delete idea"),
  });
}
