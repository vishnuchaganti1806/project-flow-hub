import { useState } from "react";
import { Lightbulb, Users, Clock, Star, TrendingUp, Trash2, MessageSquare, Plus, Send, CheckCircle2, Pencil, MoreVertical, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useStudents, useStudentProfile } from "@/hooks/useStudents";
import { useIdeas } from "@/hooks/useIdeas";
import { useNotifications } from "@/hooks/useNotifications";
import { useDeadlines, useDeleteDeadline } from "@/hooks/useDeadlines";
import { useTeams } from "@/hooks/useTeams";
import { useReviews } from "@/hooks/useReviews";
import { useDoubts, useCreateDoubt, useReplyToDoubt, useResolveDoubt, useUpdateDoubt, useDeleteDoubt, useEditReply, useDeleteReply } from "@/hooks/useDoubts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { differenceInDays, parseISO, format, isPast } from "date-fns";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { data: student, isLoading: studentLoading } = useStudentProfile();
  const { data: allIdeas, isLoading: ideasLoading } = useIdeas();
  const { data: notifications, isLoading: notifLoading } = useNotifications();
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines();
  const { data: teams } = useTeams();
  const { data: allStudents } = useStudents();
  const { data: reviews } = useReviews();
  const deleteDeadline = useDeleteDeadline();
  const { data: doubts, isLoading: doubtsLoading } = useDoubts();
  const createDoubt = useCreateDoubt();
  const replyToDoubt = useReplyToDoubt();
  const resolveDoubt = useResolveDoubt();
  const updateDoubt = useUpdateDoubt();
  const deleteDoubtMut = useDeleteDoubt();
  const editReply = useEditReply();
  const deleteReply = useDeleteReply();

  // Doubt CRUD state
  const [doubtDialogOpen, setDoubtDialogOpen] = useState(false);
  const [newDoubtSubject, setNewDoubtSubject] = useState("");
  const [newDoubtMessage, setNewDoubtMessage] = useState("");
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [editingSubject, setEditingSubject] = useState<{ doubtId: string; subject: string } | null>(null);
  const [deleteDoubtConfirm, setDeleteDoubtConfirm] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<{ doubtId: string; index: number } | null>(null);
  const [editText, setEditText] = useState("");

  const myIdeas = allIdeas?.filter((i) => i.studentId === student?.userId) ?? [];
  const myTeam = teams?.find((t) => t.members.includes(student?.userId ?? ""));
  const teamMembers = allStudents?.filter((s) => myTeam?.members.includes(s.userId)) ?? [];

  // My average rating from reviews
  const myReviews = (reviews ?? []).filter((r) => r.studentId === student?.userId);
  const myAvgRating = myReviews.length > 0
    ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
    : 0;

  // Team average rating
  const getStudentAvgRating = (userId: string) => {
    const sr = (reviews ?? []).filter((r) => r.studentId === userId);
    return sr.length ? sr.reduce((s, r) => s + r.rating, 0) / sr.length : 0;
  };
  const teamRatings = teamMembers.map((m) => getStudentAvgRating(m.userId)).filter((r) => r > 0);
  const teamAvgRating = teamRatings.length ? teamRatings.reduce((s, r) => s + r, 0) / teamRatings.length : 0;

  // Upcoming deadlines only (not past)
  const upcomingDeadlines = (deadlines ?? [])
    .filter((d) => !isPast(parseISO(d.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Past deadlines
  const pastDeadlines = (deadlines ?? []).filter((d) => isPast(parseISO(d.date)));

  // My doubts
  const myDoubts = doubts?.filter((d) => d.studentId === student?.userId) ?? [];

  const handlePostDoubt = () => {
    if (!newDoubtSubject.trim() || !newDoubtMessage.trim()) return;
    createDoubt.mutate({ subject: newDoubtSubject, guideId: student?.guideId ?? "", message: newDoubtMessage }, {
      onSuccess: () => { setDoubtDialogOpen(false); setNewDoubtSubject(""); setNewDoubtMessage(""); },
    });
  };
  const handleReply = (doubtId: string) => {
    const text = replyText[doubtId];
    if (!text?.trim()) return;
    replyToDoubt.mutate({ doubtId, text }, { onSuccess: () => setReplyText({ ...replyText, [doubtId]: "" }) });
  };
  const handleSaveSubject = () => {
    if (!editingSubject || !editingSubject.subject.trim()) return;
    updateDoubt.mutate({ doubtId: editingSubject.doubtId, subject: editingSubject.subject.trim() }, { onSuccess: () => setEditingSubject(null) });
  };
  const handleDeleteDoubt = () => {
    if (!deleteDoubtConfirm) return;
    deleteDoubtMut.mutate(deleteDoubtConfirm, { onSuccess: () => { setDeleteDoubtConfirm(null); if (expandedDoubtId === deleteDoubtConfirm) setExpandedDoubtId(null); } });
  };
  const handleSaveEdit = () => {
    if (!editingMsg || !editText.trim()) return;
    editReply.mutate({ doubtId: editingMsg.doubtId, replyIndex: editingMsg.index, newText: editText.trim() }, { onSuccess: () => setEditingMsg(null) });
  };
  const handleDeleteReply = (doubtId: string, index: number) => { deleteReply.mutate({ doubtId, replyIndex: index }); };

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

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="My Ideas" value={myIdeas.length} icon={Lightbulb} description={`${myIdeas.filter(i => i.status === "approved").length} approved`} />
        <StatCard title="Team Members" value={teamMembers.length} icon={Users} description={myTeam?.name || "No team"} />
        <StatCard title="Progress" value={`${student.progress}%`} icon={TrendingUp} />
        <StatCard title="My Rating" value={myAvgRating > 0 ? myAvgRating.toFixed(1) : "—"} icon={Star} description={myReviews.length > 0 ? `${myReviews.length} review${myReviews.length > 1 ? "s" : ""}` : "Not rated"} />
        <StatCard title="Team Rating" value={teamAvgRating > 0 ? teamAvgRating.toFixed(1) : "—"} icon={Users} description={teamAvgRating > 0 ? "Team average" : "Not rated"} />
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
            {myAvgRating > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">My Rating</p>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={myAvgRating} />
                  <span className="text-sm font-medium">{myAvgRating.toFixed(1)}/5</span>
                </div>
              </div>
            )}
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
              <p className="text-sm">{student.guideName || "Not assigned"}</p>
            </div>
            {myTeam && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Team</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{myTeam.name}</p>
                  <Badge variant="outline" className="text-[10px]">{teamMembers.length} members</Badge>
                </div>
                {teamAvgRating > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarDisplay rating={teamAvgRating} />
                    <span className="text-xs text-muted-foreground">Team avg</span>
                  </div>
                )}
              </div>
            )}
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {idea.submittedAt ? format(parseISO(idea.submittedAt), "MMM dd, yyyy") : "Draft"}
                      </p>
                    </div>
                    <StatusBadge status={idea.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members Preview */}
      {myTeam && teamMembers.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {myTeam.name} — Team Members</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link to="/student/team">View Team</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((m) => {
                const avg = getStudentAvgRating(m.userId);
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{m.progress}%</Badge>
                        {avg > 0 && <StarDisplay rating={avg} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications & Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link to="/notifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {notifLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : !notifications?.length ? (
              <p className="text-sm text-muted-foreground">No notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 rounded-lg border p-3 ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    </div>
                    {!n.read && <Badge variant="default" className="text-[10px] shrink-0">New</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Upcoming Deadlines
            </CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link to="/student/deadlines">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((d) => {
                  const daysLeft = differenceInDays(parseISO(d.date), new Date());
                  const urgent = daysLeft <= 3;
                  return (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(d.date), "MMM dd, yyyy")}</p>
                      </div>
                      <Badge variant={urgent ? "destructive" : "secondary"} className="text-xs">
                        {daysLeft} days left
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past deadlines with delete option */}
            {pastDeadlines.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Past Deadlines</p>
                <div className="space-y-2">
                  {pastDeadlines.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-2.5 opacity-60">
                      <div>
                        <p className="text-sm font-medium line-through">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(d.date), "MMM dd, yyyy")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">Past</Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteDeadline.mutate(d.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
