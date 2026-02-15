import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Guide } from "@/data/mockData";

async function mapGuide(row: any): Promise<Guide> {
  const { data: profile } = await supabase.from("profiles").select("name, email, avatar").eq("user_id", row.user_id).maybeSingle();
  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name || "",
    email: profile?.email || "",
    avatar: profile?.avatar || (profile?.name || "").split(" ").map((n: string) => n[0]).join(""),
    department: row.department || "",
    specialization: row.specialization ? [row.specialization] : [],
    assignedStudents: row.assigned_teams?.length || 0,
  };
}

export function useGuides() {
  return useQuery<Guide[]>({
    queryKey: ["guides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guides").select("*");
      if (error) throw error;
      return Promise.all((data || []).map(mapGuide));
    },
    staleTime: 30_000,
  });
}
