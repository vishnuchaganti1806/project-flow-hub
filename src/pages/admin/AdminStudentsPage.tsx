import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useStudents } from "@/hooks/useStudents";
import { useGuides } from "@/hooks/useGuides";
import { Search, Users, UserCheck, UserX, GraduationCap, BookOpen, Code, Globe, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Student } from "@/data/mockData";

function useAssignStudentToGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, guideId }: { studentId: string; guideId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "assign_student", studentId, guideId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["guides"] });
      toast.success("Student assigned to guide successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to assign student"),
  });
}

function useUnassignStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "unassign_student", studentId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["guides"] });
      toast.success("Student unassigned from guide");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to unassign student"),
  });
}

export default function AdminStudentsPage() {
  const { data: students, isLoading } = useStudents();
  const { data: guides } = useGuides();
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [assignDialogStudent, setAssignDialogStudent] = useState<Student | null>(null);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const assignMutation = useAssignStudentToGuide();
  const unassignMutation = useUnassignStudent();

  const allSkills = [...new Set((students ?? []).flatMap((s) => s.skills))];
  const filtered = (students ?? [])
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => !skillFilter || s.skills.includes(skillFilter));

  const handleAssign = () => {
    if (!selectedGuide || !assignDialogStudent) return;
    const guide = guides?.find(g => g.id === selectedGuide);
    if (!guide) return;
    assignMutation.mutate(
      { studentId: assignDialogStudent.id, guideId: guide.userId },
      { onSuccess: () => { setAssignDialogStudent(null); setSelectedGuide(""); } }
    );
  };

  const handleUnassign = (student: Student) => {
    unassignMutation.mutate(student.id);
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">Click on a student to view details. Assign or reassign guides.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={skillFilter || "all"} onValueChange={(v) => setSkillFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter by skill" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="animate-fade-in cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setViewStudent(s)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{s.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.skills.slice(0, 3).map((sk) => <Badge key={sk} variant="secondary" className="text-[10px]">{sk}</Badge>)}
                      {s.skills.length > 3 && <Badge variant="outline" className="text-[10px]">+{s.skills.length - 3}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Guide</p>
                    {s.guideName ? (
                      <Badge variant="default" className="text-xs">{s.guideName}</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Not Assigned</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setAssignDialogStudent(s)}>
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> {s.guideName ? "Reassign" : "Assign"}
                    </Button>
                    {s.guideName && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleUnassign(s)}>
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Profile Dialog */}
      <Dialog open={!!viewStudent} onOpenChange={(open) => !open && setViewStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Student Profile</DialogTitle></DialogHeader>
          {viewStudent && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{viewStudent.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewStudent.email}</p>
                  {viewStudent.rollNumber && <p className="text-xs text-muted-foreground">Roll: {viewStudent.rollNumber}</p>}
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {viewStudent.branch && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Branch</p>
                    <p className="text-sm font-medium">{viewStudent.branch}</p>
                  </div>
                )}
                {viewStudent.year && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Year</p>
                    <p className="text-sm font-medium">{viewStudent.year}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Progress</p>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    <p className="text-sm font-medium">{viewStudent.progress}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Guide</p>
                  {viewStudent.guideName ? (
                    <Badge variant="default" className="text-xs">{viewStudent.guideName}</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Not Assigned</Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              {viewStudent.bio && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm">{viewStudent.bio}</p>
                </div>
              )}

              {/* Skills */}
              {viewStudent.skills.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Code className="h-3 w-3" /> Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {viewStudent.skills.map((sk) => <Badge key={sk} variant="secondary" className="text-xs">{sk}</Badge>)}
                  </div>
                </div>
              )}

              {/* Languages */}
              {viewStudent.languages && viewStudent.languages.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> Programming Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {viewStudent.languages.map((l) => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setViewStudent(null); setAssignDialogStudent(viewStudent); }}>
                  <UserCheck className="mr-2 h-4 w-4" /> {viewStudent.guideName ? "Reassign Guide" : "Assign Guide"}
                </Button>
                {viewStudent.guideName && (
                  <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { handleUnassign(viewStudent); setViewStudent(null); }}>
                    <UserX className="mr-2 h-4 w-4" /> Unassign
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Guide Dialog */}
      <Dialog open={!!assignDialogStudent} onOpenChange={(open) => !open && setAssignDialogStudent(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Guide to {assignDialogStudent?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedGuide} onValueChange={setSelectedGuide}>
              <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
              <SelectContent>
                {guides?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} — {g.department || "No dept"}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} className="w-full" disabled={!selectedGuide || assignMutation.isPending}>
              <UserCheck className="mr-2 h-4 w-4" /> {assignMutation.isPending ? "Assigning..." : "Assign Guide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
