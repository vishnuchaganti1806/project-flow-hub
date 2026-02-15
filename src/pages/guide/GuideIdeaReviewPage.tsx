import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useIdeas, useUpdateIdeaStatus } from "@/hooks/useIdeas";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle2, XCircle, MessageSquare, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IdeaStatus, ProjectIdea } from "@/data/mockData";

export default function GuideIdeaReviewPage() {
  const { user } = useAuth();
  const { data: ideas, isLoading } = useIdeas();
  const { data: students } = useStudents();
  const updateStatus = useUpdateIdeaStatus();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [feedback, setFeedback] = useState("");

  const myStudents = students?.filter((s) => s.guideId === user?.id) ?? [];
  const myIdeas = (ideas ?? []).filter((i) => myStudents.some((s) => s.userId === i.studentId));

  const filtered = myIdeas
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (id: string, status: IdeaStatus) => {
    updateStatus.mutate({ id, status, feedback: feedback || undefined }, {
      onSuccess: () => {
        toast({ title: status === "approved" ? "Idea Approved" : status === "rejected" ? "Idea Rejected" : "Status Updated" });
        setSelectedIdea(null);
        setFeedback("");
      },
    });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Idea Review Queue</h1>
        <p className="text-muted-foreground">Review, approve, or reject student project ideas.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No ideas to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="animate-fade-in transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{idea.title}</p>
                    <StatusBadge status={idea.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">by {idea.studentName} · {idea.submittedAt}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {idea.techStack.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedIdea(idea); setFeedback(idea.guideFeedback ?? ""); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(idea.status === "submitted" || idea.status === "under-review") && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-status-approved" onClick={() => handleAction(idea.id, "approved")}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedIdea(idea); setFeedback(""); }}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedIdea} onOpenChange={(open) => !open && setSelectedIdea(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedIdea && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedIdea.title}
                  <StatusBadge status={selectedIdea.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student</p>
                  <p className="text-sm">{selectedIdea.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Abstract</p>
                  <p className="text-sm">{selectedIdea.abstract}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Problem Statement</p>
                  <p className="text-sm">{selectedIdea.problemStatement}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Technology Stack</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedIdea.techStack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Outcome</p>
                  <p className="text-sm">{selectedIdea.expectedOutcome}</p>
                </div>

                {(selectedIdea.status === "submitted" || selectedIdea.status === "under-review") && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Feedback / Suggestions</p>
                      <Textarea placeholder="Add feedback for the student..." rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-status-approved hover:bg-status-approved/90 text-white" onClick={() => handleAction(selectedIdea.id, "approved")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => handleAction(selectedIdea.id, "under-review")}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Suggest Changes
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleAction(selectedIdea.id, "rejected")}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
