import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Student } from "@/data/mockData";

function buildAvatar(name: string): string {
  return (name || "").split(" ").map((n: string) => n[0]).join("");
}

async function fetchProfileForUser(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("name, email, avatar, bio")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function mapStudentRow(row: any): Promise<Student> {
  const profile = await fetchProfileForUser(row.user_id);
  let guideName: string | undefined;
  if (row.guide_id) {
    const { data: guideProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", row.guide_id)
      .maybeSingle();
    guideName = guideProfile?.name || undefined;
  }
  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name || "",
    email: profile?.email || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || buildAvatar(profile?.name || ""),
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
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((data || []).map(mapStudentRow));
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
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapStudentRow(data);
    },
    enabled: !!user,
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      bio?: string;
      skills?: string[];
      languages?: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update profiles table (name, bio)
      const profileUpdate: Record<string, unknown> = {};
      if (payload.name !== undefined) profileUpdate.name = payload.name;
      if (payload.bio !== undefined) profileUpdate.bio = payload.bio;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileErr } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", user.id);
        if (profileErr) throw profileErr;
      }

      // Update students table (skills, languages)
      const studentUpdate: Record<string, unknown> = {};
      if (payload.skills !== undefined) studentUpdate.skills = payload.skills;
      if (payload.languages !== undefined) studentUpdate.languages = payload.languages;

      if (Object.keys(studentUpdate).length > 0) {
        const { error: studentErr } = await supabase
          .from("students")
          .update(studentUpdate)
          .eq("user_id", user.id);
        if (studentErr) throw studentErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student-profile"] });
      qc.invalidateQueries({ queryKey: ["guides"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });
}
