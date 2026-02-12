import { Users, ClipboardList, Lightbulb, Star, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/useStudents";
import { useIdeas } from "@/hooks/useIdeas";
import { useAuth } from "@/contexts/AuthContext";

export default function GuideDashboard() {
  const { user } = useAuth();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: ideas, isLoading: ideasLoading } = useIdeas();

  // Filter for this guide's students and their ideas
  const guideId = user?.id === "u2" ? "g1" : "g1"; // Map auth user to guide id
  const myStudents = students?.filter((s) => s.guideId === guideId) ?? [];
  const ideasForReview = ideas?.filter((i) => myStudents.some((s) => s.id === i.studentId)) ?? [];

  const guideName = user?.name ?? "Guide";

  if (studentsLoading || ideasLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {guideName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Students" value={myStudents.length} icon={Users} />
        <StatCard title="Pending Reviews" value={ideasForReview.filter(i => i.status === "submitted" || i.status === "under-review").length} icon={ClipboardList} trend="2 new this week" />
        <StatCard title="Approved Ideas" value={ideasForReview.filter(i => i.status === "approved").length} icon={CheckCircle2} />
        <StatCard title="Active Projects" value={ideasForReview.filter(i => i.status === "approved").length} icon={Lightbulb} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review Queue */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Idea Review Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {ideasForReview.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas to review.</p>
            ) : (
              <div className="space-y-3">
                {ideasForReview.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{idea.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">by {idea.studentName}</p>
                    </div>
                    <StatusBadge status={idea.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Overview */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            {myStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students assigned.</p>
            ) : (
              <div className="space-y-3">
                {myStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{s.progress}%</span>
                      </div>
                    </div>
                    {s.rating && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="h-3 w-3" /> {s.rating}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deadlines */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Milestone 2 Review", date: "Feb 15, 2026", count: "3 submissions" },
              { title: "Mid-term Evaluation", date: "Feb 28, 2026", count: "All students" },
              { title: "Final Project Review", date: "Mar 20, 2026", count: "All students" },
            ].map((d, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.date}</p>
                <Badge variant="secondary" className="mt-2 text-xs">{d.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
