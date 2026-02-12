import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useIdeas } from "@/hooks/useIdeas";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Sep", ideas: 2, approved: 1 },
  { month: "Oct", ideas: 3, approved: 2 },
  { month: "Nov", ideas: 5, approved: 3 },
  { month: "Dec", ideas: 4, approved: 2 },
  { month: "Jan", ideas: 8, approved: 5 },
  { month: "Feb", ideas: 6, approved: 3 },
];

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ideas, isLoading: ideasLoading } = useIdeas();

  if (statsLoading || ideasLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const s = stats ?? { totalStudents: 0, totalGuides: 0, totalTeams: 0, totalIdeas: 0, approvedIdeas: 0, activeProjects: 0, pendingReviews: 0, rejectedIdeas: 0 };

  const statusData = [
    { name: "Approved", value: s.approvedIdeas, color: "hsl(142,71%,45%)" },
    { name: "Pending", value: s.pendingReviews, color: "hsl(38,92%,50%)" },
    { name: "Rejected", value: s.rejectedIdeas, color: "hsl(0,72%,51%)" },
    { name: "Draft", value: s.totalIdeas - s.approvedIdeas - s.pendingReviews - s.rejectedIdeas, color: "hsl(220,10%,70%)" },
  ];

  const projectData = [
    { name: "Active", value: s.activeProjects, color: "hsl(var(--primary))" },
    { name: "Completed", value: 1, color: "hsl(142,71%,45%)" },
    { name: "Inactive", value: s.totalIdeas - s.activeProjects - 1, color: "hsl(220,10%,70%)" },
  ];

  const approvalRate = s.totalIdeas > 0 ? Math.round((s.approvedIdeas / s.totalIdeas) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground">Detailed analytics and insights across the platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{approvalRate}%</p><p className="text-xs text-muted-foreground">Approval Rate</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.totalIdeas}</p><p className="text-xs text-muted-foreground">Total Submissions</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.activeProjects}</p><p className="text-xs text-muted-foreground">Active Projects</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.totalStudents}/{s.totalGuides}</p><p className="text-xs text-muted-foreground">Student:Guide Ratio</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submissions per Month */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Idea Submissions per Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="ideas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Submitted" />
                <Bar dataKey="approved" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Rate Trend */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Approval Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData.map((d) => ({ ...d, rate: d.ideas > 0 ? Math.round((d.approved / d.ideas) * 100) : 0 }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Approval %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Idea Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active vs Completed */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Project Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={projectData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {projectData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {projectData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
