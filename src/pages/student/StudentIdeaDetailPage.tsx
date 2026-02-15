import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useIdea } from "@/hooks/useIdeas";
import { ArrowLeft, Edit } from "lucide-react";
import type { IdeaStatus } from "@/hooks/useIdeas";

const STATUS_STEPS: { status: IdeaStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "submitted", label: "Submitted" },
  { status: "under-review", label: "Under Review" },
  { status: "approved", label: "Approved" },
];

export default function StudentIdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: idea, isLoading } = useIdea(id ?? "");

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;
  if (!idea) return <p className="text-muted-foreground p-6">Idea not found.</p>;

  const statusOrder: IdeaStatus[] = ["draft", "submitted", "under-review", "approved"];
  const currentIdx = statusOrder.indexOf(idea.status === "rejected" ? "submitted" : idea.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/student/ideas")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{idea.title}</h1>
            <StatusBadge status={idea.status} />
          </div>
          <p className="text-sm text-muted-foreground">Submitted {idea.submittedAt} · Updated {idea.updatedAt}</p>
        </div>
        {idea.status !== "approved" && (
          <Button asChild variant="outline">
            <Link to={`/student/ideas/${idea.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
          </Button>
        )}
      </div>

      {/* Status Timeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STATUS_STEPS.map((step, i) => {
          const stepIdx = statusOrder.indexOf(step.status);
          const active = stepIdx <= currentIdx;
          return (
            <div key={step.status} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${active ? "font-medium" : "text-muted-foreground"}`}>{step.label}</span>
              {i < STATUS_STEPS.length - 1 && <div className={`h-px w-8 ${active ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
        {idea.status === "rejected" && (
          <Badge variant="destructive" className="ml-2">Rejected</Badge>
        )}
      </div>

      {/* Guide Feedback */}
      {idea.guideFeedback && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-primary">Guide Feedback</p>
            <p className="text-sm mt-1">{idea.guideFeedback}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">Abstract</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed">{idea.abstract}</p></CardContent>
        </Card>
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">Problem Statement</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed">{idea.problemStatement}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">Technology Stack</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {idea.techStack.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">Expected Outcome</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed">{idea.expectedOutcome}</p></CardContent>
        </Card>
      </div>

      {idea.status === "rejected" && (
        <div className="flex justify-end">
          <Button asChild>
            <Link to={`/student/ideas/${idea.id}/edit`}>Modify & Resubmit</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
