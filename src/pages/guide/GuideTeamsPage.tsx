import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useTeams } from "@/hooks/useTeams";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/contexts/AuthContext";
import { Users, FolderKanban, UserCheck } from "lucide-react";

export default function GuideTeamsPage() {
  const { user } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: students, isLoading: studentsLoading } = useStudents();

  // Only show teams assigned to this guide
  const myTeams = (teams ?? []).filter(t => t.guide_id === user?.id);

  if (teamsLoading || studentsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Teams</h1>
          <p className="text-muted-foreground">View teams assigned to you and track their progress.</p>
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
        <div className="grid gap-6 lg:grid-cols-2">
          {myTeams.map((team) => {
            const members = students?.filter((s) => team.members.includes(s.userId)) ?? [];
            const avgProgress = members.length > 0 ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length) : 0;
            return (
              <Card key={team.id} className="animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><FolderKanban className="h-4 w-4" /> {team.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">Assigned to you</Badge>
                      <Badge variant="secondary">{members.length} members</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {m.skills.slice(0, 2).map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{m.progress}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Team Progress</span>
                      <span>{avgProgress}%</span>
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
