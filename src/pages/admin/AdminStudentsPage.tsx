import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/useStudents";
import { useGuides } from "@/hooks/useGuides";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Student } from "@/data/mockData";

export default function AdminStudentsPage() {
  const { data: students, isLoading } = useStudents();
  const { data: guides } = useGuides();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [assignDialogStudent, setAssignDialogStudent] = useState<Student | null>(null);
  const [selectedGuide, setSelectedGuide] = useState("");

  const allSkills = [...new Set((students ?? []).flatMap((s) => s.skills))];
  const filtered = (students ?? [])
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => !skillFilter || s.skills.includes(skillFilter));

  const handleAssign = () => {
    if (!selectedGuide) return;
    toast({ title: "Student Assigned", description: `Student assigned to guide successfully.` });
    setAssignDialogStudent(null);
    setSelectedGuide("");
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">View, search, and assign students to guides.</p>
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
            <Card key={s.id} className="animate-fade-in">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{s.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.skills.map((sk) => <Badge key={sk} variant="secondary" className="text-[10px]">{sk}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Guide</p>
                    <p className="text-sm font-medium">{s.guideName ?? "Unassigned"}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAssignDialogStudent(s)}>
                    <UserCheck className="mr-1 h-3.5 w-3.5" /> Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!assignDialogStudent} onOpenChange={(open) => !open && setAssignDialogStudent(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Guide to {assignDialogStudent?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selectedGuide} onValueChange={setSelectedGuide}>
              <SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger>
              <SelectContent>
                {guides?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} — {g.department}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign} className="w-full" disabled={!selectedGuide}>
              <UserCheck className="mr-2 h-4 w-4" /> Assign Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
