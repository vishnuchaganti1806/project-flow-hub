import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface MonthlyIdea {
  month: string;
  ideas: number;
  approved: number;
}

interface AdminStats {
  totalStudents: number;
  totalGuides: number;
  totalTeams: number;
  totalIdeas: number;
  approvedIdeas: number;
  rejectedIdeas: number;
  pendingReviews: number;
  draftIdeas: number;
  monthlyData: MonthlyIdea[];
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [students, guides, teams, ideas] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("guides").select("id", { count: "exact", head: true }),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("ideas").select("id, status, submitted_at, updated_at"),
      ]);

      const ideasData = ideas.data || [];

      const approvedIdeas = ideasData.filter(i => i.status === "approved").length;
      const rejectedIdeas = ideasData.filter(i => i.status === "rejected").length;
      const pendingReviews = ideasData.filter(i => ["submitted", "under-review"].includes(i.status)).length;
      const draftIdeas = ideasData.filter(i => i.status === "draft").length;

      // Build monthly data from the last 6 months using real data
      const now = new Date();
      const monthlyData: MonthlyIdea[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const label = format(monthDate, "MMM");

        const monthIdeas = ideasData.filter(idea => {
          const date = idea.submitted_at || idea.updated_at;
          if (!date) return false;
          const d = new Date(date);
          return d >= monthStart && d <= monthEnd;
        });

        monthlyData.push({
          month: label,
          ideas: monthIdeas.length,
          approved: monthIdeas.filter(i => i.status === "approved").length,
        });
      }

      return {
        totalStudents: students.count || 0,
        totalGuides: guides.count || 0,
        totalTeams: teams.count || 0,
        totalIdeas: ideasData.length,
        approvedIdeas,
        rejectedIdeas,
        pendingReviews,
        draftIdeas,
        monthlyData,
      };
    },
    staleTime: 60_000,
  });
}
