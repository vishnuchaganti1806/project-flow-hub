import { Users, BookOpen, Lightbulb, CheckCircle2, FolderKanban, UsersRound, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminStats, mockIdeas, mockGuides } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { month: "Oct", ideas: 3 },
  { month: "Nov", ideas: 5 },
  { month: "Dec", ideas: 4 },
  { month: "Jan", ideas: 8 },
  { month: "Feb", ideas: 6 },
];

const pieData = [
  { name: "Approved", value: adminStats.approvedIdeas, color: "hsl(142,71%,45%)" },
  { name: "Pending", value: adminStats.pendingReviews, color: "hsl(38,92%,50%)" },
  { name: "Rejected", value: adminStats.rejectedIdeas, color: "hsl(0,72%,51%)" },
  { name: "Draft", value: 1, color: "hsl(220,10%,70%)" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the entire allocation system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Students" value={adminStats.totalStudents} icon={Users} />
        <StatCard title="Guides" value={adminStats.totalGuides} icon={BookOpen} />
        <StatCard title="Teams" value={adminStats.totalTeams} icon={UsersRound} />
        <StatCard title="Ideas" value={adminStats.totalIdeas} icon={Lightbulb} />
        <StatCard title="Approved" value={adminStats.approvedIdeas} icon={CheckCircle2} />
        <StatCard title="Active Projects" value={adminStats.activeProjects} icon={FolderKanban} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Idea Submission Trends */}
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

        {/* Approval Distribution */}
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
          <div className="space-y-3">
            {mockIdeas.slice(0, 5).map((idea) => (
              <div key={idea.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{idea.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">by {idea.studentName} · {idea.submittedAt}</p>
                </div>
                <StatusBadge status={idea.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
