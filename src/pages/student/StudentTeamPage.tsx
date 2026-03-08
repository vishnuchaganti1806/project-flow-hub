import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/useTeams";
import { useStudents, useStudentProfile } from "@/hooks/useStudents";
import { Users, Crown } from "lucide-react";

export default function StudentTeamPage() {
  const { data: student } = useStudentProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allStudents } = useStudents();

  const myTeam = teams?.find((t) => t.members.includes(student?.userId ?? ""));
  const teamMembers = allStudents?.filter((s) => myTeam?.members.includes(s.userId)) ?? [];

  if (teamsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">View your project team and members.</p>
      </div>

      {myTeam ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {myTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{m.name}</p>
                      {m.id === student?.id && <Crown className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.skills.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
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
      ) : (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">You're not in a team yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Your admin will assign you to a team.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
