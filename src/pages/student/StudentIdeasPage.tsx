import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useIdeas, useDeleteIdea } from "@/hooks/useIdeas";
import { useStudentProfile } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, Edit, Eye, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { IdeaStatus } from "@/hooks/useIdeas";

export default function StudentIdeasPage() {
  const { data: student } = useStudentProfile();
  const { data: allIdeas, isLoading } = useIdeas();
  const deleteIdea = useDeleteIdea();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const myIdeas = (allIdeas ?? []).filter((i) => i.studentId === student?.userId);
  const filtered = myIdeas
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    deleteIdea.mutate(id, {
      onSuccess: () => toast({ title: "Idea Deleted", description: "Your draft idea has been removed." }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Project Ideas</h1>
          <p className="text-muted-foreground">Track and manage all your project submissions.</p>
        </div>
        <Button asChild>
          <Link to="/student/ideas/new"><Plus className="mr-2 h-4 w-4" /> Submit New Idea</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No ideas found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Submit your first project idea to get started.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/student/ideas/new">Submit Idea</Link>
            </Button>
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
                  <p className="text-sm text-muted-foreground line-clamp-1">{idea.abstract}</p>
                  <p className="text-xs text-muted-foreground">Submitted {idea.submittedAt} · Updated {idea.updatedAt}</p>
                  {idea.guideFeedback && (
                    <p className="text-xs text-primary italic mt-1">Guide: "{idea.guideFeedback}"</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link to={`/student/ideas/${idea.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  {idea.status !== "approved" && (
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link to={`/student/ideas/${idea.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                  )}
                  {idea.status === "draft" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The draft idea will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(idea.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
