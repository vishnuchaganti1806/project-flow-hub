import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [students, guides, teams, ideas] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("guides").select("id", { count: "exact", head: true }),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("ideas").select("id, status"),
      ]);
      const ideasData = ideas.data || [];
      return {
        totalStudents: students.count || 0,
        totalGuides: guides.count || 0,
        totalTeams: teams.count || 0,
        totalIdeas: ideasData.length,
        approvedIdeas: ideasData.filter(i => i.status === "approved").length,
        rejectedIdeas: ideasData.filter(i => i.status === "rejected").length,
        pendingReviews: ideasData.filter(i => ["submitted", "under-review"].includes(i.status)).length,
        activeProjects: ideasData.filter(i => i.status === "approved").length,
      };
    },
    staleTime: 60_000,
  });
}
