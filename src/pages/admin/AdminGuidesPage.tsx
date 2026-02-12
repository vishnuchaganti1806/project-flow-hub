import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuides } from "@/hooks/useGuides";
import { useTeams } from "@/hooks/useTeams";
import { BookOpen, Users } from "lucide-react";

export default function AdminGuidesPage() {
  const { data: guides, isLoading } = useGuides();
  const { data: teams } = useTeams();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Management</h1>
        <p className="text-muted-foreground">View all guides, their specializations, and assigned teams.</p>
      </div>

      {!guides?.length ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No guides found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => {
            const guideTeams = teams?.filter((t) => t.members.some(() => true)) ?? []; // placeholder
            return (
              <Card key={g.id} className="animate-fade-in">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{g.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium">{g.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Specialization</p>
                    <div className="flex flex-wrap gap-1">
                      {g.specialization.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{g.assignedStudents} students assigned</span>
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
