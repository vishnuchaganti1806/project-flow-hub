import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/useAdminStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const s = stats!;

  const statusData = [
    { name: "Approved", value: s.approvedIdeas, color: "hsl(142,71%,45%)" },
    { name: "Pending", value: s.pendingReviews, color: "hsl(38,92%,50%)" },
    { name: "Rejected", value: s.rejectedIdeas, color: "hsl(0,72%,51%)" },
    { name: "Draft", value: s.draftIdeas, color: "hsl(220,10%,70%)" },
  ].filter(d => d.value > 0);

  const approvalRate = s.totalIdeas > 0 ? Math.round((s.approvedIdeas / s.totalIdeas) * 100) : 0;
  const rejectionRate = s.totalIdeas > 0 ? Math.round((s.rejectedIdeas / s.totalIdeas) * 100) : 0;

  const trendData = s.monthlyData.map(d => ({
    ...d,
    rate: d.ideas > 0 ? Math.round((d.approved / d.ideas) * 100) : 0,
  }));

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
        <p className="text-muted-foreground">Real-time analytics and insights across the platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{approvalRate}%</p><p className="text-xs text-muted-foreground">Approval Rate</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.totalIdeas}</p><p className="text-xs text-muted-foreground">Total Submissions</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.totalTeams}</p><p className="text-xs text-muted-foreground">Total Teams</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{s.totalStudents} / {s.totalGuides}</p><p className="text-xs text-muted-foreground">Students / Guides</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submissions per Month - REAL DATA */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Idea Submissions (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={s.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="ideas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Submitted" />
                <Bar dataKey="approved" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Approval Rate Trend - REAL DATA */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Approval Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => `${val}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Approval %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution - REAL DATA */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Idea Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-16">No ideas submitted yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats Card */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3"><CardTitle className="text-base">Platform Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{s.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{s.totalGuides}</p>
                <p className="text-xs text-muted-foreground">Guides</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{s.totalTeams}</p>
                <p className="text-xs text-muted-foreground">Teams</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{s.approvedIdeas}</p>
                <p className="text-xs text-muted-foreground">Approved Ideas</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-medium">{approvalRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rejection Rate</span>
                <span className="font-medium">{rejectionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Reviews</span>
                <span className="font-medium">{s.pendingReviews}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
