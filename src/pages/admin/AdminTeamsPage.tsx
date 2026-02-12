import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/useTeams";
import { useStudents } from "@/hooks/useStudents";
import { useGuides } from "@/hooks/useGuides";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Team } from "@/data/mockData";

export default function AdminTeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const { data: students } = useStudents();
  const { data: guides } = useGuides();
  const { toast } = useToast();
  const [assignTeam, setAssignTeam] = useState<Team | null>(null);
  const [selectedGuide, setSelectedGuide] = useState("");

  const handleAssignGuide = () => {
    if (!selectedGuide) return;
    toast({ title: "Guide Assigned", description: `Guide assigned to team successfully.` });
    setAssignTeam(null);
    setSelectedGuide("");
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">View all teams, members, and assigned guides.</p>
      </div>

      {!teams?.length ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No teams found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {teams.map((team) => {
            const members = students?.filter((s) => team.members.includes(s.id)) ?? [];
            return (
              <Card key={team.id} className="animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {team.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAssignTeam(team)}>
                        <UserCheck className="mr-1 h-3.5 w-3.5" /> Assign Guide
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete team "{team.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => toast({ title: "Team Deleted" })}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{m.progress}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!assignTeam} onOpenChange={(open) => !open && setAssignTeam(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Guide to {assignTeam?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedGuide} onValueChange={setSelectedGuide}>
              <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
              <SelectContent>
                {guides?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} — {g.department}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignGuide} className="w-full" disabled={!selectedGuide}>
              <UserCheck className="mr-2 h-4 w-4" /> Assign Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
