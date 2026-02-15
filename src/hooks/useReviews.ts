import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Review } from "@/data/mockData";

export type { Review } from "@/data/mockData";

export function useReviews(studentId?: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", studentId],
    queryFn: async () => {
      let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (studentId) query = query.eq("student_id", studentId);
      const { data, error } = await query;
      if (error) throw error;
      // Map to frontend type with studentName
      const results: Review[] = [];
      for (const r of data || []) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", r.student_id).maybeSingle();
        results.push({
          id: r.id,
          studentId: r.student_id,
          studentName: profile?.name || "",
          rating: r.rating,
          comment: r.comment || "",
          createdAt: r.created_at,
        });
      }
      return results;
    },
    staleTime: 30_000,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { studentId: string; rating: number; comment: string }) => {
      const { data: result, error } = await supabase.from("reviews").insert({
        student_id: data.studentId,
        guide_id: user!.id,
        rating: data.rating,
        comment: data.comment,
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews"] }); toast.success("Review submitted"); },
    onError: () => toast.error("Failed to submit review"),
  });
}
