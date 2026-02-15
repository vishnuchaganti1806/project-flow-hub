import { Lightbulb, Users, Clock, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useStudentProfile } from "@/hooks/useStudents";
import { useIdeas } from "@/hooks/useIdeas";
import { useNotifications } from "@/hooks/useNotifications";
import { useDeadlines } from "@/hooks/useDeadlines";
import { differenceInDays, parseISO, format } from "date-fns";

export default function StudentDashboard() {
  const { data: student, isLoading: studentLoading } = useStudentProfile();
  const { data: allIdeas, isLoading: ideasLoading } = useIdeas();
  const { data: notifications, isLoading: notifLoading } = useNotifications();
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines();

  const myIdeas = allIdeas?.filter((i) => i.studentId === student?.userId) ?? [];

  if (studentLoading) {
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

  if (!student) {
    return <p className="text-muted-foreground p-6">Unable to load profile. Please try again.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {(student.name || "Student").split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your projects.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Ideas" value={myIdeas.length} icon={Lightbulb} description={`${myIdeas.filter(i => i.status === "approved").length} approved`} />
        <StatCard title="Team Members" value={2} icon={Users} description="Team Alpha" />
        <StatCard title="Progress" value={`${student.progress}%`} icon={TrendingUp} />
        <StatCard title="Rating" value={student.rating ?? "—"} icon={Star} description="From guide" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile & Skills */}
        <Card className="animate-fade-in lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{student.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Guide</p>
              <p className="text-sm">{student.guideName}</p>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-muted-foreground">Project Progress</p>
              <Progress value={student.progress} className="h-2" />
              <p className="mt-1 text-right text-xs text-muted-foreground">{student.progress}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Idea Submission Highlight */}
        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Project Ideas</CardTitle>
            <Button asChild size="sm">
              <Link to="/student/ideas/new">Submit New Idea</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ideasLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : myIdeas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {myIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{idea.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Submitted {idea.submittedAt}</p>
                    </div>
                    <StatusBadge status={idea.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications & Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : !notifications?.length ? (
              <p className="text-sm text-muted-foreground">No notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 rounded-lg border p-3 ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : !deadlines?.length ? (
              <p className="text-sm text-muted-foreground">No deadlines.</p>
            ) : (
              <div className="space-y-3">
                {deadlines.map((d) => {
                  const daysLeft = differenceInDays(parseISO(d.date), new Date());
                  const urgent = daysLeft <= 3;
                  return (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        {daysLeft > 0 && <p className="text-xs text-muted-foreground">{daysLeft} days left</p>}
                      </div>
                      <Badge variant={urgent ? "destructive" : "secondary"} className="text-xs">
                        {format(parseISO(d.date), "MMM dd, yyyy")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
