import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTeams } from "@/hooks/useTeams";
import { useStudents } from "@/hooks/useStudents";
import { useIdeas } from "@/hooks/useIdeas";
import { useDeadlines, useCreateDeadline } from "@/hooks/useDeadlines";
import { useTeamMessages, useSendTeamMessage, useUpdateTeamMessage, useDeleteTeamMessage } from "@/hooks/useTeamMessages";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, FolderKanban, UserCheck, Calendar, Send,
  FileText, Clock, ChevronRight, MessageSquare, Plus, Star, Pencil, Trash2, Check, X,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import * as XLSX from "xlsx";

// Sub-component for team detail view
function TeamDetailView({ team, onClose }: { team: any; onClose: () => void }) {
  const { user } = useAuth();
  const { data: students } = useStudents();
  const { data: ideas } = useIdeas();
  const { data: allDeadlines } = useDeadlines();
  const { data: reviews } = useReviews();
  const createDeadline = useCreateDeadline();
  const { data: messages, isLoading: messagesLoading } = useTeamMessages(team.id);
  const sendMessage = useSendTeamMessage();
  const updateMessage = useUpdateTeamMessage();
  const deleteMessage = useDeleteTeamMessage();

  const [newDeadlineTitle, setNewDeadlineTitle] = useState("");
  const [newDeadlineDate, setNewDeadlineDate] = useState("");
  const [messageText, setMessageText] = useState("");
  const [dlDialogOpen, setDlDialogOpen] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgText, setEditMsgText] = useState("");
  const [deleteMsgConfirm, setDeleteMsgConfirm] = useState<string | null>(null);

  const members = students?.filter((s) => team.members.includes(s.userId)) ?? [];
  const teamIdeas = (ideas ?? []).filter(
    (i) => i.status !== "draft" && members.some((m) => m.userId === i.studentId)
  );
  const teamDeadlines = (allDeadlines ?? []).filter((d) => d.teamId === team.id);
  const avgProgress = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length)
    : 0;

  // Team rating from reviews
  const getStudentAvgRating = (userId: string) => {
    const sr = (reviews ?? []).filter((r) => r.studentId === userId);
    return sr.length ? sr.reduce((s, r) => s + r.rating, 0) / sr.length : 0;
  };
  const memberRatings = members.map((m) => getStudentAvgRating(m.userId)).filter((r) => r > 0);
  const teamAvgRating = memberRatings.length ? memberRatings.reduce((s, r) => s + r, 0) / memberRatings.length : 0;

  const handleCreateDeadline = () => {
    if (!newDeadlineTitle.trim() || !newDeadlineDate) return;
    createDeadline.mutate(
      { title: newDeadlineTitle.trim(), date: new Date(newDeadlineDate).toISOString(), teamId: team.id },
      {
        onSuccess: () => {
          setNewDeadlineTitle("");
          setNewDeadlineDate("");
          setDlDialogOpen(false);
        },
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage.mutate({ teamId: team.id, message: messageText.trim() }, {
      onSuccess: () => setMessageText(""),
    });
  };

  const handleExport = () => {
    const rows = members.map((m) => {
      const studentIdeas = teamIdeas.filter((i) => i.studentId === m.userId);
      return {
        Name: m.name,
        Email: m.email,
        "Roll Number": m.rollNumber || "-",
        Branch: m.branch || "-",
        Year: m.year || "-",
        Progress: `${m.progress}%`,
        Skills: m.skills.join(", "),
        "Submitted Ideas": studentIdeas.map((i) => i.title).join("; ") || "None",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, team.name);
    XLSX.writeFile(wb, `${team.name}_details.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onClose} className="mb-2 -ml-2">
            ← Back to Teams
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6" /> {team.name}
          </h1>
          <p className="text-muted-foreground">{members.length} members · {teamIdeas.length} submissions · {teamDeadlines.length} deadlines</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileText className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{members.length}</p><p className="text-xs text-muted-foreground">Members</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{avgProgress}%</p><p className="text-xs text-muted-foreground">Avg Progress</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{teamIdeas.length}</p><p className="text-xs text-muted-foreground">Submissions</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{teamDeadlines.length}</p><p className="text-xs text-muted-foreground">Deadlines</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="flex items-center justify-center gap-1"><Star className={`h-5 w-5 ${teamAvgRating > 0 ? "fill-primary text-primary" : "text-muted-foreground/30"}`} /><p className="text-2xl font-bold">{teamAvgRating > 0 ? teamAvgRating.toFixed(1) : "—"}</p></div><p className="text-xs text-muted-foreground">Team Rating</p></CardContent></Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members"><Users className="mr-1 h-3.5 w-3.5" /> Members</TabsTrigger>
          <TabsTrigger value="submissions"><FileText className="mr-1 h-3.5 w-3.5" /> Submissions</TabsTrigger>
          <TabsTrigger value="deadlines"><Calendar className="mr-1 h-3.5 w-3.5" /> Deadlines</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="mr-1 h-3.5 w-3.5" /> Messages</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-3">
          {members.map((m) => {
            const studentIdeas = teamIdeas.filter((i) => i.studentId === m.userId);
            return (
              <Card key={m.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">{m.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email} {m.rollNumber ? `· ${m.rollNumber}` : ""}</p>
                        </div>
                        <Badge variant="secondary">{m.progress}%</Badge>
                      </div>
                      {m.branch && <p className="text-xs text-muted-foreground">{m.branch} · {m.year}</p>}
                      <div className="flex flex-wrap gap-1">
                        {m.skills.slice(0, 4).map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                      <Progress value={m.progress} className="h-1.5" />
                      {studentIdeas.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Submitted Ideas:</p>
                          {studentIdeas.map((idea) => (
                            <div key={idea.id} className="flex items-center gap-2 text-xs">
                              <Badge variant={idea.status === "approved" ? "default" : idea.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{idea.status}</Badge>
                              <span className="truncate">{idea.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-3">
          {teamIdeas.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No submissions yet from this team.</CardContent></Card>
          ) : teamIdeas.map((idea) => (
            <Card key={idea.id} className="animate-fade-in">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{idea.title}</h3>
                  <Badge variant={idea.status === "approved" ? "default" : idea.status === "rejected" ? "destructive" : "secondary"}>{idea.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">By {idea.studentName}</p>
                {idea.abstract && <p className="text-sm line-clamp-2">{idea.abstract}</p>}
                <div className="flex flex-wrap gap-1">
                  {idea.techStack.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
                {idea.guideFeedback && (
                  <div className="rounded-md bg-muted p-2 text-xs">
                    <span className="font-medium">Feedback: </span>{idea.guideFeedback}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Submitted {idea.submittedAt ? format(new Date(idea.submittedAt), "MMM dd, yyyy") : "N/A"}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">Team Deadlines</h3>
            <Button size="sm" onClick={() => setDlDialogOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Deadline
            </Button>
          </div>
          {teamDeadlines.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No deadlines set for this team yet.</CardContent></Card>
          ) : teamDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((dl) => {
            const past = isPast(new Date(dl.date));
            const daysLeft = Math.ceil((new Date(dl.date).getTime() - Date.now()) / 86400000);
            return (
              <Card key={dl.id} className={`animate-fade-in ${past ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${past ? "text-muted-foreground" : daysLeft <= 3 ? "text-destructive" : "text-primary"}`} />
                    <div>
                      <p className="font-medium text-sm">{dl.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(dl.date), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <Badge variant={past ? "secondary" : daysLeft <= 3 ? "destructive" : "default"}>
                    {past ? "Past" : `${daysLeft}d left`}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}

          <Dialog open={dlDialogOpen} onOpenChange={setDlDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Deadline for {team.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g. Final Report Submission" value={newDeadlineTitle} onChange={(e) => setNewDeadlineTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={newDeadlineDate} onChange={(e) => setNewDeadlineDate(e.target.value)} />
                </div>
                <Button onClick={handleCreateDeadline} className="w-full" disabled={createDeadline.isPending || !newDeadlineTitle.trim() || !newDeadlineDate}>
                  {createDeadline.isPending ? "Creating..." : "Create Deadline"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Team Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-64 border rounded-lg p-3">
                {messagesLoading ? (
                  <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : !messages?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Send a message to your team.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? "items-end" : "items-start"}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <p className="text-xs font-medium mb-0.5">{msg.senderName}</p>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Send a message to this team..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-[60px]"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <Button size="icon" className="shrink-0 self-end" onClick={handleSendMessage} disabled={sendMessage.isPending || !messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main page
export default function GuideTeamsPage() {
  const { user } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: ideas } = useIdeas();
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  const myTeams = (teams ?? []).filter((t) => t.guide_id === user?.id);

  if (teamsLoading || studentsLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  if (selectedTeam) {
    return <TeamDetailView team={selectedTeam} onClose={() => setSelectedTeam(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Teams</h1>
          <p className="text-muted-foreground">Click on a team to view full details, submissions, deadlines, and communicate.</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <UserCheck className="mr-1 h-3.5 w-3.5" />
          {myTeams.length} Teams
        </Badge>
      </div>

      {!myTeams.length ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No teams assigned to you yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myTeams.map((team) => {
            const members = students?.filter((s) => team.members.includes(s.userId)) ?? [];
            const teamSubmissions = (ideas ?? []).filter(
              (i) => i.status !== "draft" && members.some((m) => m.userId === i.studentId)
            );
            const avgProgress = members.length > 0
              ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length)
              : 0;
            return (
              <Card
                key={team.id}
                className="animate-fade-in cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedTeam(team)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" /> {team.name}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {members.length} members
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" /> {teamSubmissions.length} submissions
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {members.slice(0, 4).map((m) => (
                      <Avatar key={m.id} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{m.avatar}</AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 4 && <span className="text-xs text-muted-foreground ml-2">+{members.length - 4}</span>}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span><span>{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
