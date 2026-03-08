import { Users, BookOpen, Lightbulb, CheckCircle2, FolderKanban, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useIdeas } from "@/hooks/useIdeas";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { month: "Oct", ideas: 3 },
  { month: "Nov", ideas: 5 },
  { month: "Dec", ideas: 4 },
  { month: "Jan", ideas: 8 },
  { month: "Feb", ideas: 6 },
];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ideas, isLoading: ideasLoading } = useIdeas();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const s = stats ?? { totalStudents: 0, totalGuides: 0, totalTeams: 0, totalIdeas: 0, approvedIdeas: 0, activeProjects: 0, pendingReviews: 0, rejectedIdeas: 0 };

  const pieData = [
    { name: "Approved", value: s.approvedIdeas, color: "hsl(142,71%,45%)" },
    { name: "Pending", value: s.pendingReviews, color: "hsl(38,92%,50%)" },
    { name: "Rejected", value: s.rejectedIdeas, color: "hsl(0,72%,51%)" },
    { name: "Draft", value: 1, color: "hsl(220,10%,70%)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the entire allocation system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Students" value={s.totalStudents} icon={Users} />
        <StatCard title="Guides" value={s.totalGuides} icon={BookOpen} />
        <StatCard title="Teams" value={s.totalTeams} icon={UsersRound} />
        <StatCard title="Ideas" value={s.totalIdeas} icon={Lightbulb} />
        <StatCard title="Approved" value={s.approvedIdeas} icon={CheckCircle2} />
        <StatCard title="Active Projects" value={s.approvedIdeas} icon={FolderKanban} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Idea Submission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="ideas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Idea Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ideas */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Project Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          {ideasLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !ideas?.length ? (
            <p className="text-sm text-muted-foreground">No ideas found.</p>
          ) : (
            <div className="space-y-3">
              {ideas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{idea.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">by {idea.studentName} · {idea.submittedAt}</p>
                  </div>
                  <StatusBadge status={idea.status as any} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
