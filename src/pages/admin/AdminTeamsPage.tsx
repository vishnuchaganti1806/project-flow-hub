import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTeams, useCreateTeam, useAssignGuideToTeam, useDeleteTeam } from "@/hooks/useTeams";
import { useStudents } from "@/hooks/useStudents";
import { useGuides } from "@/hooks/useGuides";
import { Users, Trash2, UserCheck, Plus, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Team } from "@/data/mockData";

export default function AdminTeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const { data: students } = useStudents();
  const { data: guides } = useGuides();
  const qc = useQueryClient();

  const [assignTeam, setAssignTeam] = useState<Team | null>(null);
  const [selectedGuide, setSelectedGuide] = useState("");
  const assignGuide = useAssignGuideToTeam();
  const deleteTeam = useDeleteTeam();
  const createTeam = useCreateTeam();

  // Create team dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Get user_ids already in a team
  const assignedUserIds = new Set(
    (teams || []).flatMap((t) => t.members || [])
  );

  // Students not in any team
  const unassignedStudents = students?.filter((s) => !assignedUserIds.has(s.userId)) ?? [];

  const getGuideName = (guideUserId?: string) => {
    if (!guideUserId) return null;
    const guide = guides?.find(g => g.userId === guideUserId);
    return guide?.name || null;
  };

  const handleAssignGuide = async () => {
    if (!selectedGuide || !assignTeam) return;
    const guide = guides?.find(g => g.id === selectedGuide);
    if (!guide) return;

    // Assign guide to team
    assignGuide.mutate(
      { teamId: assignTeam.id, guideId: guide.userId },
      {
        onSuccess: async () => {
          // Also update all team members' student records with this guide
          const team = teams?.find(t => t.id === assignTeam.id);
          if (team) {
            for (const memberId of team.members) {
              await supabase.from("students").update({ guide_id: guide.userId }).eq("user_id", memberId);
            }
            qc.invalidateQueries({ queryKey: ["students"] });
          }
          setAssignTeam(null);
          setSelectedGuide("");
        },
      }
    );
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || selectedMembers.length < 2) {
      toast.error("Team needs a name and at least 2 members");
      return;
    }
    if (selectedMembers.length > 3) {
      toast.error("A team can have at most 3 members");
      return;
    }

    createTeam.mutate(
      { name: newTeamName.trim(), members: selectedMembers },
      {
        onSuccess: async (result) => {
          // Update students' team_id
          for (const uid of selectedMembers) {
            await supabase.from("students").update({ team_id: result.id }).eq("user_id", uid);
          }
          qc.invalidateQueries({ queryKey: ["students"] });
          setCreateOpen(false);
          setNewTeamName("");
          setSelectedMembers([]);
        },
      }
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Create teams, assign members and guides. Only admin can manage teams.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      {!teams?.length ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No teams found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create a team to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {teams.map((team) => {
            const members = students?.filter((s) => team.members.includes(s.userId)) ?? [];
            const guideName = getGuideName(team.guide_id);
            return (
              <Card key={team.id} className="animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> {team.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {guideName ? (
                        <Badge variant="default" className="text-xs">Guide: {guideName}</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">No Guide</Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setAssignTeam(team)}>
                        <UserCheck className="mr-1 h-3.5 w-3.5" /> {guideName ? "Reassign" : "Assign"} Guide
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
                            <AlertDialogDescription>This will remove the team. Students will become unassigned.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
                              // Clear team_id and guide_id from students
                              for (const uid of team.members) {
                                await supabase.from("students").update({ team_id: null, guide_id: null }).eq("user_id", uid);
                              }
                              deleteTeam.mutate(team.id);
                              qc.invalidateQueries({ queryKey: ["students"] });
                            }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.avatar}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{m.progress}%</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assign Guide Dialog */}
      <Dialog open={!!assignTeam} onOpenChange={(open) => !open && setAssignTeam(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Guide to {assignTeam?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">All students in this team will be automatically assigned to the selected guide.</p>
          <div className="space-y-4 pt-2">
            <Select value={selectedGuide} onValueChange={setSelectedGuide}>
              <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
              <SelectContent>
                {guides?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} — {g.department || "No dept"}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignGuide} className="w-full" disabled={!selectedGuide || assignGuide.isPending}>
              <UserCheck className="mr-2 h-4 w-4" /> {assignGuide.isPending ? "Assigning..." : "Assign Guide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input placeholder="e.g. Team Alpha" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Select Members (2-3 students)</Label>
              {selectedMembers.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedMembers.length} selected</p>
              )}
              {unassignedStudents.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  All students are already assigned to teams.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto border rounded-lg p-2">
                  {unassignedStudents.map((s) => (
                    <label
                      key={s.userId}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMembers.includes(s.userId) ? "border-primary bg-primary/5" : ""
                      } ${selectedMembers.length >= 3 && !selectedMembers.includes(s.userId) ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(s.userId)}
                        onCheckedChange={() => toggleMember(s.userId)}
                        disabled={selectedMembers.length >= 3 && !selectedMembers.includes(s.userId)}
                      />
                      <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateTeam}
              className="w-full"
              disabled={createTeam.isPending || selectedMembers.length < 2 || !newTeamName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" /> {createTeam.isPending ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
