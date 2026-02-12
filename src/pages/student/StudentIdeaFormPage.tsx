import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdea, useCreateIdea, useUpdateIdea, useUpdateIdeaStatus } from "@/hooks/useIdeas";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, Loader2, X, Plus, ArrowLeft } from "lucide-react";
import type { IdeaStatus } from "@/data/mockData";

const STATUS_STEPS: { status: IdeaStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "submitted", label: "Submitted" },
  { status: "under-review", label: "Under Review" },
  { status: "approved", label: "Approved" },
];

export default function StudentIdeaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id && id !== "new";
  const { data: existing, isLoading } = useIdea(isEdit ? id : "");

  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const updateStatus = useUpdateIdeaStatus();

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isEdit && isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;
  }

  if (isEdit && !initialized && existing) {
    setTitle(existing.title);
    setAbstract(existing.abstract);
    setProblemStatement(existing.problemStatement);
    setTechStack([...existing.techStack]);
    setExpectedOutcome(existing.expectedOutcome);
    setInitialized(true);
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!abstract.trim()) errs.abstract = "Abstract is required";
    if (!problemStatement.trim()) errs.problemStatement = "Problem statement is required";
    if (techStack.length === 0) errs.techStack = "At least one technology is required";
    if (!expectedOutcome.trim()) errs.expectedOutcome = "Expected outcome is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    const data = { title, abstract, problemStatement, techStack, expectedOutcome, status: "draft" as IdeaStatus, studentId: "s1", studentName: "Aarav Patel" };
    if (isEdit) {
      updateIdea.mutate({ id, ...data }, {
        onSuccess: () => { toast({ title: "Draft Saved" }); navigate("/student/ideas"); },
      });
    } else {
      createIdea.mutate(data, {
        onSuccess: () => { toast({ title: "Draft Saved" }); navigate("/student/ideas"); },
      });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const data = { title, abstract, problemStatement, techStack, expectedOutcome, status: "submitted" as IdeaStatus, studentId: "s1", studentName: "Aarav Patel" };
    if (isEdit) {
      updateIdea.mutate({ id, ...data }, {
        onSuccess: () => {
          updateStatus.mutate({ id, status: "submitted" });
          toast({ title: "Idea Submitted", description: "Your idea has been submitted for review." });
          navigate("/student/ideas");
        },
      });
    } else {
      createIdea.mutate(data, {
        onSuccess: () => { toast({ title: "Idea Submitted", description: "Your idea has been submitted for review." }); navigate("/student/ideas"); },
      });
    }
  };

  const isBusy = createIdea.isPending || updateIdea.isPending;
  const currentStatus = existing?.status ?? "draft";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/student/ideas")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Idea" : "Submit New Idea"}</h1>
          <p className="text-muted-foreground">Fill in all fields to submit your project idea for review.</p>
        </div>
      </div>

      {/* Status Timeline */}
      {isEdit && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, i) => {
            const statusOrder: IdeaStatus[] = ["draft", "submitted", "under-review", "approved"];
            const currentIdx = statusOrder.indexOf(currentStatus);
            const stepIdx = statusOrder.indexOf(step.status);
            const active = stepIdx <= currentIdx;
            return (
              <div key={step.status} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className={`text-sm whitespace-nowrap ${active ? "font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`h-px w-8 ${active ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Guide Feedback */}
      {existing?.guideFeedback && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-primary">Guide Feedback</p>
            <p className="text-sm text-foreground mt-1">{existing.guideFeedback}</p>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" placeholder="Enter a descriptive project title" value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract *</Label>
            <Textarea id="abstract" placeholder="Brief summary of your project..." rows={3} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
            {errors.abstract && <p className="text-sm text-destructive">{errors.abstract}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Problem Statement *</Label>
            <Textarea id="problem" placeholder="What problem does your project solve?" rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} />
            {errors.problemStatement && <p className="text-sm text-destructive">{errors.problemStatement}</p>}
          </div>

          <div className="space-y-2">
            <Label>Proposed Technology Stack *</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => setTechStack(techStack.filter((x) => x !== t))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g., React, Python, TensorFlow..." value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} className="max-w-xs" />
              <Button type="button" variant="outline" size="sm" onClick={addTech}><Plus className="h-4 w-4" /></Button>
            </div>
            {errors.techStack && <p className="text-sm text-destructive">{errors.techStack}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Expected Outcome *</Label>
            <Textarea id="outcome" placeholder="What will the final deliverable look like?" rows={3} value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} />
            {errors.expectedOutcome && <p className="text-sm text-destructive">{errors.expectedOutcome}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isBusy}>
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} disabled={isBusy}>
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
