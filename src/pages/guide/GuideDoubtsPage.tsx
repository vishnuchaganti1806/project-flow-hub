import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDoubts, useReplyToDoubt, useEditReply, useDeleteReply, useUpdateDoubt, useDeleteDoubt, useResolveDoubt, useCreateDoubtAsGuide } from "@/hooks/useDoubts";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, CheckCircle2, Search, Pencil, Trash2, X, Check, MoreVertical, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

export default function GuideDoubtsPage() {
  const { user } = useAuth();
  const { data: doubts, isLoading } = useDoubts();
  const { data: students } = useStudents();
  const replyToDoubt = useReplyToDoubt();
  const editReply = useEditReply();
  const deleteReply = useDeleteReply();
  const updateDoubt = useUpdateDoubt();
  const deleteDoubt = useDeleteDoubt();
  const resolveDoubt = useResolveDoubt();
  const createDoubt = useCreateDoubtAsGuide();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<{ doubtId: string; index: number } | null>(null);
  const [editText, setEditText] = useState("");
  const [editingSubject, setEditingSubject] = useState<{ doubtId: string; subject: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const myDoubts = (doubts ?? []).filter((d) => d.guideId === user?.id);
  const filtered = myDoubts.filter((d) => d.subject.toLowerCase().includes(search.toLowerCase()) || d.studentName.toLowerCase().includes(search.toLowerCase()));

  // Students assigned to this guide
  const myStudents = (students ?? []).filter((s) => s.guideId === user?.id);

  const handlePostDoubt = () => {
    if (!newSubject.trim() || !newMessage.trim() || !selectedStudentId) return;
    createDoubt.mutate({ subject: newSubject, studentId: selectedStudentId, message: newMessage }, {
      onSuccess: () => {
        toast({ title: "Doubt Posted" });
        setDialogOpen(false);
        setNewSubject("");
        setNewMessage("");
        setSelectedStudentId("");
      },
    });
  };

  const handleReply = (doubtId: string) => {
    const text = replyText[doubtId];
    if (!text?.trim()) return;
    replyToDoubt.mutate({ doubtId, text }, {
      onSuccess: () => {
        toast({ title: "Reply Sent" });
        setReplyText({ ...replyText, [doubtId]: "" });
      },
    });
  };

  const handleEdit = (doubtId: string, index: number, currentText: string) => {
    setEditingMsg({ doubtId, index });
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (!editingMsg || !editText.trim()) return;
    editReply.mutate({ doubtId: editingMsg.doubtId, replyIndex: editingMsg.index, newText: editText.trim() }, {
      onSuccess: () => setEditingMsg(null),
    });
  };

  const handleDeleteReply = (doubtId: string, index: number) => {
    deleteReply.mutate({ doubtId, replyIndex: index });
  };

  const handleSaveSubject = () => {
    if (!editingSubject || !editingSubject.subject.trim()) return;
    updateDoubt.mutate({ doubtId: editingSubject.doubtId, subject: editingSubject.subject.trim() }, {
      onSuccess: () => setEditingSubject(null),
    });
  };

  const handleDeleteDoubt = () => {
    if (!deleteConfirm) return;
    deleteDoubt.mutate(deleteConfirm, {
      onSuccess: () => {
        setDeleteConfirm(null);
        if (expandedId === deleteConfirm) setExpandedId(null);
      },
    });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doubt Management</h1>
          <p className="text-muted-foreground">View and respond to student queries.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Doubt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post a Doubt to Student</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                  <SelectContent>
                    {myStudents.map((s) => (
                      <SelectItem key={s.userId} value={s.userId}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Brief subject..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Describe the doubt..." rows={4} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              </div>
              <Button onClick={handlePostDoubt} className="w-full" disabled={createDoubt.isPending || !selectedStudentId}>
                <Send className="mr-2 h-4 w-4" /> Post Doubt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search doubts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No doubts to resolve</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => (
            <Card key={d.id} className="animate-fade-in">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
                    {editingSubject?.doubtId === d.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editingSubject.subject}
                          onChange={(e) => setEditingSubject({ ...editingSubject, subject: e.target.value })}
                          className="h-8 text-sm w-48"
                          onKeyDown={(e) => e.key === "Enter" && handleSaveSubject()}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveSubject}><Check className="h-3 w-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSubject(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <CardTitle className="text-base">{d.subject}</CardTitle>
                    )}
                    {d.resolved ? (
                      <Badge className="bg-status-approved/15 text-status-approved gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>
                    ) : (
                      <Badge variant="secondary">Open</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{d.messages.length} messages</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSubject({ doubtId: d.id, subject: d.subject })}>
                          <Pencil className="h-3 w-3 mr-2" /> Edit Subject
                        </DropdownMenuItem>
                        {!d.resolved && (
                          <DropdownMenuItem onClick={() => resolveDoubt.mutate(d.id)}>
                            <CheckCircle2 className="h-3 w-3 mr-2" /> Mark Resolved
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(d.id)}>
                          <Trash2 className="h-3 w-3 mr-2" /> Delete Doubt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground cursor-pointer" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>from {d.studentName}</p>
              </CardHeader>
              {expandedId === d.id && (
                <CardContent className="space-y-3">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {d.messages.map((m, i) => {
                      const isMe = m.sender === user?.name;
                      const isEditing = editingMsg?.doubtId === d.id && editingMsg?.index === i;
                      return (
                        <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"} group relative`}>
                            <p className="text-xs font-medium mb-1">{m.sender}</p>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="text-sm bg-background text-foreground" onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()} />
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit} disabled={editReply.isPending}><Check className="h-3 w-3" /></Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingMsg(null)}><X className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm">{m.text}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <p className={`text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {m.timestamp ? format(parseISO(m.timestamp), "MMM dd, h:mm a") : ""}
                                    {(m as any).edited && " · edited"}
                                  </p>
                                  {isMe && !d.resolved && (
                                    <span className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleEdit(d.id, i, m.text); }}><Pencil className="h-3 w-3" /></Button>
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteReply(d.id, i); }}><Trash2 className="h-3 w-3" /></Button>
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!d.resolved && (
                    <div className="flex gap-2 pt-2">
                      <Input placeholder="Type your reply..." value={replyText[d.id] ?? ""} onChange={(e) => setReplyText({ ...replyText, [d.id]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleReply(d.id)} />
                      <Button size="icon" onClick={() => handleReply(d.id)}><Send className="h-4 w-4" /></Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doubt</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this doubt thread and all its messages. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoubt} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
