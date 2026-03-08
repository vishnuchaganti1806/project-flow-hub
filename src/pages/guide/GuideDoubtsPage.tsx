import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoubts, useReplyToDoubt, useEditReply, useDeleteReply } from "@/hooks/useDoubts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, CheckCircle2, Search, Pencil, Trash2, X, Check } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function GuideDoubtsPage() {
  const { user } = useAuth();
  const { data: doubts, isLoading } = useDoubts();
  const replyToDoubt = useReplyToDoubt();
  const editReply = useEditReply();
  const deleteReply = useDeleteReply();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<{ doubtId: string; index: number } | null>(null);
  const [editText, setEditText] = useState("");

  const myDoubts = (doubts ?? []).filter((d) => d.guideId === user?.id);
  const filtered = myDoubts.filter((d) => d.subject.toLowerCase().includes(search.toLowerCase()) || d.studentName.toLowerCase().includes(search.toLowerCase()));

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

  const handleDelete = (doubtId: string, index: number) => {
    deleteReply.mutate({ doubtId, replyIndex: index });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doubt Management</h1>
        <p className="text-muted-foreground">View and respond to student queries.</p>
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
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{d.subject}</CardTitle>
                    {d.resolved ? (
                      <Badge className="bg-status-approved/15 text-status-approved gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>
                    ) : (
                      <Badge variant="secondary">Open</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{d.messages.length} messages</span>
                </div>
                <p className="text-sm text-muted-foreground">from {d.studentName}</p>
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
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="text-sm bg-background text-foreground"
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                                />
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit} disabled={editReply.isPending}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingMsg(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
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
                                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleEdit(d.id, i, m.text); }}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(d.id, i); }}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
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
    </div>
  );
}
