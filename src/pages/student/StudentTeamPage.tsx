import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTeams } from "@/hooks/useTeams";
import { useStudents, useStudentProfile } from "@/hooks/useStudents";
import { useReviews } from "@/hooks/useReviews";
import { useTeamMessages, useSendTeamMessage, useUpdateTeamMessage, useDeleteTeamMessage } from "@/hooks/useTeamMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Crown, Star, MessageSquare, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function StudentTeamPage() {
  const { user } = useAuth();
  const { data: student } = useStudentProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allStudents } = useStudents();
  const { data: reviews } = useReviews();

  const myTeam = teams?.find((t) => t.members.includes(student?.userId ?? ""));
  const teamMembers = allStudents?.filter((s) => myTeam?.members.includes(s.userId)) ?? [];

  const { data: messages, isLoading: messagesLoading } = useTeamMessages(myTeam?.id ?? "");
  const sendMessage = useSendTeamMessage();
  const updateMessage = useUpdateTeamMessage();
  const deleteMessage = useDeleteTeamMessage();

  const [messageText, setMessageText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; teamId: string } | null>(null);

  const getStudentAvgRating = (userId: string) => {
    const studentReviews = (reviews ?? []).filter((r) => r.studentId === userId);
    if (!studentReviews.length) return 0;
    return studentReviews.reduce((sum, r) => sum + r.rating, 0) / studentReviews.length;
  };

  const teamMemberRatings = teamMembers.map((m) => getStudentAvgRating(m.userId)).filter((r) => r > 0);
  const teamAvgRating = teamMemberRatings.length > 0
    ? teamMemberRatings.reduce((s, r) => s + r, 0) / teamMemberRatings.length
    : 0;

  const handleSend = () => {
    if (!messageText.trim() || !myTeam) return;
    sendMessage.mutate({ teamId: myTeam.id, message: messageText.trim() }, {
      onSuccess: () => setMessageText(""),
    });
  };

  const handleEdit = (msg: { id: string; message: string }) => {
    setEditingId(msg.id);
    setEditText(msg.message);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editText.trim() || !myTeam) return;
    updateMessage.mutate({ messageId: editingId, message: editText.trim(), teamId: myTeam.id }, {
      onSuccess: () => { setEditingId(null); setEditText(""); },
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteMessage.mutate({ messageId: deleteConfirm.id, teamId: deleteConfirm.teamId }, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  if (teamsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">View your project team, members, ratings, and communicate.</p>
      </div>

      {myTeam ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Members */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {myTeam.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamMembers.map((m) => {
                  const avg = getStudentAvgRating(m.userId);
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{m.name}</p>
                          {m.id === student?.id && <Crown className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                        {avg > 0 && <StarDisplay rating={avg} />}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex flex-wrap gap-1">
                          {m.skills.slice(0, 2).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                        <Badge variant="outline" className="text-[10px]">{m.progress}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Team Details & Rating */}
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Team Rating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamAvgRating > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{teamAvgRating.toFixed(1)}</span>
                        <StarDisplay rating={teamAvgRating} />
                      </div>
                      <Progress value={teamAvgRating * 20} className="h-2" />
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Individual Ratings</p>
                        {teamMembers.map((m) => {
                          const avg = getStudentAvgRating(m.userId);
                          return (
                            <div key={m.id} className="flex items-center justify-between text-sm">
                              <span>{m.name}</span>
                              {avg > 0 ? <StarDisplay rating={avg} /> : <span className="text-xs text-muted-foreground">Not rated</span>}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No ratings yet for your team.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-base">Team Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-sm font-medium">{myTeam.members.length} members</p>
                  </div>
                  {student?.guideName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Guide</p>
                      <p className="text-sm font-medium">{student.guideName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Chat */}
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Team Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-72 border rounded-lg p-3">
                {messagesLoading ? (
                  <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : !messages?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start a conversation with your team!</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      const isEditing = editingId === msg.id;
                      return (
                        <div key={msg.id} className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`rounded-lg px-3 py-2 max-w-[80%] ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <p className="text-xs font-medium mb-0.5">{msg.senderName}</p>
                            {isEditing ? (
                              <div className="flex items-center gap-1 mt-1">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[36px] text-sm bg-background text-foreground"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSaveEdit}>
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.message}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </p>
                            {isMe && !isEditing && (
                              <span className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleEdit(msg)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => setDeleteConfirm({ id: msg.id, teamId: myTeam.id })}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-[60px]"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button size="icon" className="shrink-0 self-end" onClick={handleSend} disabled={sendMessage.isPending || !messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">You're not in a team yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Your admin will assign you to a team.</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
