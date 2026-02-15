import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams, useCreateTeam } from "@/hooks/useTeams";
import { useStudents, useStudentProfile } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, UserPlus, LogOut, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function StudentTeamPage() {
  const { data: student } = useStudentProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allStudents } = useStudents();
  const createTeam = useCreateTeam();
  const { toast } = useToast();

  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const myTeam = teams?.find((t) => t.members.includes(student?.userId ?? ""));
  const teamMembers = allStudents?.filter((s) => myTeam?.members.includes(s.userId)) ?? [];

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    createTeam.mutate({ name: teamName, members: [student?.id ?? "", ...selectedMembers] }, {
      onSuccess: () => {
        toast({ title: "Team Created", description: `Team "${teamName}" has been created.` });
        setDialogOpen(false);
        setTeamName("");
        setSelectedMembers([]);
      },
    });
  };

  if (teamsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">Manage your project team and members.</p>
        </div>
        {!myTeam && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Team</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input placeholder="Enter team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Invite Members</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allStudents?.filter((s) => s.id !== student?.id).map((s) => (
                      <label key={s.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                        <Checkbox
                          checked={selectedMembers.includes(s.id)}
                          onCheckedChange={(checked) => {
                            setSelectedMembers(checked ? [...selectedMembers, s.id] : selectedMembers.filter((m) => m !== s.id));
                          }}
                        />
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback></Avatar>
                        <span className="text-sm">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateTeam} className="w-full" disabled={createTeam.isPending}>
                  <UserPlus className="mr-2 h-4 w-4" /> Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
                <p className="text-sm text-muted-foreground">Team ID</p>
                <p className="text-sm font-medium">{myTeam.id}</p>
              </div>
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
              <Button variant="outline" className="w-full text-destructive hover:text-destructive" size="sm">
                <LogOut className="mr-2 h-4 w-4" /> Leave Team
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">You're not in a team yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create a team or wait for an invitation.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
