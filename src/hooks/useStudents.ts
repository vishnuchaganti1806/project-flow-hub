import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Student } from "@/data/mockData";

async function mapStudent(row: any): Promise<Student> {
  const { data: profile } = await supabase.from("profiles").select("name, email, avatar").eq("user_id", row.user_id).maybeSingle();
  let guideName: string | undefined;
  if (row.guide_id) {
    const { data: guideProfile } = await supabase.from("profiles").select("name").eq("user_id", row.guide_id).maybeSingle();
    guideName = guideProfile?.name || undefined;
  }
  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name || "",
    email: profile?.email || "",
    avatar: profile?.avatar || (profile?.name || "").split(" ").map((n: string) => n[0]).join(""),
    skills: row.skills || [],
    languages: row.languages || [],
    rollNumber: row.roll_number || undefined,
    branch: row.branch || undefined,
    year: row.year || undefined,
    teamId: row.team_id || undefined,
    guideId: row.guide_id || undefined,
    guideName,
    progress: row.progress || 0,
    rating: row.rating ? Number(row.rating) : undefined,
  };
}

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      return Promise.all((data || []).map(mapStudent));
    },
    staleTime: 30_000,
  });
}

export function useStudentProfile() {
  const { user } = useAuth();
  return useQuery<Student | null>({
    queryKey: ["student-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapStudent(data);
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("students")
        .update(data)
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["student-profile"] }); toast.success("Profile updated"); },
    onError: () => toast.error("Failed to update profile"),
  });
}
