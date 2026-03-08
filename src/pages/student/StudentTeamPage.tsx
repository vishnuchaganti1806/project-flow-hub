import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTeams } from "@/hooks/useTeams";
import { useStudents, useStudentProfile } from "@/hooks/useStudents";
import { useReviews } from "@/hooks/useReviews";
import { Users, Crown, Star } from "lucide-react";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function StudentTeamPage() {
  const { data: student } = useStudentProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allStudents } = useStudents();
  const { data: reviews } = useReviews();

  const myTeam = teams?.find((t) => t.members.includes(student?.userId ?? ""));
  const teamMembers = allStudents?.filter((s) => myTeam?.members.includes(s.userId)) ?? [];

  // Compute per-student average rating from reviews
  const getStudentAvgRating = (userId: string) => {
    const studentReviews = (reviews ?? []).filter((r) => r.studentId === userId);
    if (!studentReviews.length) return 0;
    return studentReviews.reduce((sum, r) => sum + r.rating, 0) / studentReviews.length;
  };

  // Compute team average
  const teamMemberRatings = teamMembers.map((m) => getStudentAvgRating(m.userId)).filter((r) => r > 0);
  const teamAvgRating = teamMemberRatings.length > 0
    ? teamMemberRatings.reduce((s, r) => s + r, 0) / teamMemberRatings.length
    : 0;

  if (teamsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">View your project team, members, and ratings.</p>
      </div>

      {myTeam ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Team Members */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {myTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((m) => {
                const avg = getStudentAvgRating(m.userId);
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{m.name}</p>
                        {m.id === student?.id && <Crown className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                      {avg > 0 && <StarDisplay rating={avg} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-wrap gap-1">
                        {m.skills.slice(0, 2).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{m.progress}%</Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Team Details & Rating */}
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Team Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamAvgRating > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{teamAvgRating.toFixed(1)}</span>
                      <StarDisplay rating={teamAvgRating} />
                    </div>
                    <Progress value={teamAvgRating * 20} className="h-2" />
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Individual Ratings</p>
                      {teamMembers.map((m) => {
                        const avg = getStudentAvgRating(m.userId);
                        return (
                          <div key={m.id} className="flex items-center justify-between text-sm">
                            <span>{m.name}</span>
                            {avg > 0 ? <StarDisplay rating={avg} /> : <span className="text-xs text-muted-foreground">Not rated</span>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No ratings yet for your team.</p>
                )}
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
