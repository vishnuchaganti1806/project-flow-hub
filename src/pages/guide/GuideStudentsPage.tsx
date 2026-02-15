import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Star, Eye, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Student } from "@/data/mockData";

export default function GuideStudentsPage() {
  const { user } = useAuth();
  const { data: students, isLoading } = useStudents();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const myStudents = (students ?? []).filter((s) => s.guideId === user?.id);
  const filtered = myStudents.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Students</h1>
        <p className="text-muted-foreground">View and manage your assigned students.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="animate-fade-in transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(s)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{s.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.skills.map((sk) => <Badge key={sk} variant="secondary" className="text-[10px]">{sk}</Badge>)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} className="h-1.5" />
                </div>
                {s.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-medium">{s.rating}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader><DialogTitle>Student Profile</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{selected.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">{selected.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
                  <Progress value={selected.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right mt-1">{selected.progress}%</p>
                </div>
                {selected.rating && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-5 w-5 ${n <= selected.rating! ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="ml-2 font-medium">{selected.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
