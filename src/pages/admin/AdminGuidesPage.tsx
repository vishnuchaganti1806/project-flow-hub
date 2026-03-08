import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGuides } from "@/hooks/useGuides";
import { useStudents } from "@/hooks/useStudents";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, UserCheck, Mail, Building2, Award, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Guide } from "@/data/mockData";

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
      toast.success("Student assigned to guide");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to assign"),
  });
}

export default function AdminGuidesPage() {
  const { data: guides, isLoading } = useGuides();
  const { data: students } = useStudents();
  const [viewGuide, setViewGuide] = useState<Guide | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const assignMutation = useAssignStudentToGuide();

  // Students assigned to the viewed guide
  const assignedStudents = viewGuide
    ? (students ?? []).filter(s => s.guideId === viewGuide.userId)
    : [];

  // Unassigned students (no guide) for the assign dropdown
  const unassignedStudents = (students ?? []).filter(s => !s.guideId);

  const handleAssignStudent = () => {
    if (!selectedStudent || !viewGuide) return;
    assignMutation.mutate(
      { studentId: selectedStudent, guideId: viewGuide.userId },
      { onSuccess: () => { setSelectedStudent(""); setAssignOpen(false); } }
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Management</h1>
        <p className="text-muted-foreground">Click on a guide to view details and assign students.</p>
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
          {guides.map((g) => (
            <Card key={g.id} className="animate-fade-in cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setViewGuide(g)}>
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
                  <p className="text-sm font-medium">{g.department || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Specialization</p>
                  <div className="flex flex-wrap gap-1">
                    {g.specialization.length > 0 ? g.specialization.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>) : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{g.assignedStudents} students assigned</span>
                  {g.assignedStudents > 0 ? (
                    <Badge variant="default" className="text-[10px] ml-auto">Active</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] ml-auto">No Students</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Guide Profile Dialog */}
      <Dialog open={!!viewGuide} onOpenChange={(open) => !open && setViewGuide(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Guide Profile</DialogTitle></DialogHeader>
          {viewGuide && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{viewGuide.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewGuide.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {viewGuide.email}</p>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1"><Building2 className="h-3 w-3" /> Department</p>
                  <p className="text-sm font-medium">{viewGuide.department || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1"><Users className="h-3 w-3" /> Students</p>
                  <p className="text-sm font-medium">{viewGuide.assignedStudents} assigned</p>
                </div>
              </div>

              {viewGuide.specialization.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Award className="h-3 w-3" /> Specialization</p>
                  <div className="flex flex-wrap gap-1">
                    {viewGuide.specialization.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              )}

              <Separator />

              {/* Assigned Students List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Assigned Students</p>
                  <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
                    <UserCheck className="mr-1 h-3.5 w-3.5" /> Assign Student
                  </Button>
                </div>
                {assignedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students assigned yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {assignedStudents.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">{s.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{s.progress}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Student to Guide Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Student to {viewGuide?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
              <SelectContent>
                {unassignedStudents.length === 0 ? (
                  <SelectItem value="none" disabled>All students are assigned</SelectItem>
                ) : (
                  unassignedStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — {s.email}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignStudent} className="w-full" disabled={!selectedStudent || assignMutation.isPending}>
              <UserCheck className="mr-2 h-4 w-4" /> {assignMutation.isPending ? "Assigning..." : "Assign Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
