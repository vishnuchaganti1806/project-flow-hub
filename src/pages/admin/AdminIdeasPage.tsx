import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useIdeas } from "@/hooks/useIdeas";
import { Search, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminIdeasPage() {
  const { data: ideas, isLoading } = useIdeas();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = (ideas ?? [])
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: ideas?.length ?? 0,
    approved: ideas?.filter((i) => i.status === "approved").length ?? 0,
    submitted: ideas?.filter((i) => i.status === "submitted").length ?? 0,
    rejected: ideas?.filter((i) => i.status === "rejected").length ?? 0,
  };
  const conversionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Idea Monitoring</h1>
        <p className="text-muted-foreground">Monitor all project ideas across the system.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Ideas</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-status-approved">{stats.approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{stats.submitted}</p><p className="text-xs text-muted-foreground">Pending Review</p></CardContent></Card>
        <Card className="animate-fade-in"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{conversionRate}%</p><p className="text-xs text-muted-foreground">Conversion Rate</p></CardContent></Card>
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
            <SelectItem value="draft">Draft</SelectItem>
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
            <Lightbulb className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No ideas found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="animate-fade-in">
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{idea.title}</p>
                    <StatusBadge status={idea.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">by {idea.studentName} · {idea.submittedAt}</p>
                  <div className="flex flex-wrap gap-1">
                    {idea.techStack?.slice(0, 4).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
