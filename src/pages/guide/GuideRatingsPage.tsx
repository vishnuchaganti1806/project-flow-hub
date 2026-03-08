import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useStudents } from "@/hooks/useStudents";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition-colors">
          <Star className={`h-6 w-6 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"}`} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${cls} ${n <= Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function GuideRatingsPage() {
  const { user } = useAuth();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const { data: teams } = useTeams();
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const myStudents = (students ?? []).filter((s) => s.guideId === user?.id);
  const myTeams = (teams ?? []).filter((t) => t.guide_id === user?.id);
  const myReviews = (reviews ?? []).filter((r) => myStudents.some((s) => s.userId === r.studentId));

  // Compute per-student average rating
  const getStudentAvgRating = (userId: string) => {
    const studentReviews = myReviews.filter((r) => r.studentId === userId);
    if (!studentReviews.length) return 0;
    return studentReviews.reduce((sum, r) => sum + r.rating, 0) / studentReviews.length;
  };

  // Compute team average rating
  const getTeamAvgRating = (memberUserIds: string[]) => {
    const memberRatings = memberUserIds.map(getStudentAvgRating).filter((r) => r > 0);
    if (!memberRatings.length) return 0;
    return memberRatings.reduce((sum, r) => sum + r, 0) / memberRatings.length;
  };

  const handleSubmit = () => {
    if (!selectedStudent || rating === 0 || !comment.trim()) return;
    submitReview.mutate({ studentId: selectedStudent, rating, comment }, {
      onSuccess: () => {
        toast({ title: "Review Submitted" });
        setDialogOpen(false);
        setSelectedStudent("");
        setRating(0);
        setComment("");
      },
    });
  };

  if (studentsLoading || reviewsLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h1>
          <p className="text-muted-foreground">Rate students individually and view team ratings.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Star className="mr-2 h-4 w-4" /> Submit Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Student Review</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                  <SelectContent>
                    {myStudents.map((s) => <SelectItem key={s.id} value={s.userId}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea placeholder="Provide detailed feedback..." rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={submitReview.isPending}>
                <Send className="mr-2 h-4 w-4" /> Submit Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual"><Star className="mr-1 h-3.5 w-3.5" /> Individual Ratings</TabsTrigger>
          <TabsTrigger value="teams"><Users className="mr-1 h-3.5 w-3.5" /> Team Ratings</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>

        {/* Individual Student Ratings */}
        <TabsContent value="individual" className="space-y-3">
          {myStudents.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No students assigned to you.</CardContent></Card>
          ) : (
            myStudents.map((s) => {
              const avg = getStudentAvgRating(s.userId);
              const studentReviews = myReviews.filter((r) => r.studentId === s.userId);
              return (
                <Card key={s.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">{s.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                      <div className="text-right">
                        {avg > 0 ? (
                          <StarDisplay rating={avg} size="md" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Not rated</span>
                        )}
                        <p className="text-[10px] text-muted-foreground">{studentReviews.length} review{studentReviews.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {avg > 0 && (
                      <div className="mt-2">
                        <Progress value={avg * 20} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Team Ratings */}
        <TabsContent value="teams" className="space-y-3">
          {myTeams.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No teams assigned to you.</CardContent></Card>
          ) : (
            myTeams.map((team) => {
              const members = myStudents.filter((s) => team.members.includes(s.userId));
              const teamAvg = getTeamAvgRating(team.members);
              return (
                <Card key={team.id} className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" /> {team.name}
                      </CardTitle>
                      <div className="text-right">
                        {teamAvg > 0 ? (
                          <StarDisplay rating={teamAvg} size="md" />
                        ) : (
                          <Badge variant="secondary">Not rated</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {teamAvg > 0 && (
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Team Average</span>
                          <span>{teamAvg.toFixed(1)} / 5.0</span>
                        </div>
                        <Progress value={teamAvg * 20} className="h-2" />
                      </div>
                    )}
                    <Separator />
                    {members.map((m) => {
                      const avg = getStudentAvgRating(m.userId);
                      return (
                        <div key={m.id} className="flex items-center gap-3 py-1.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{m.avatar}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm flex-1">{m.name}</p>
                          {avg > 0 ? <StarDisplay rating={avg} /> : <span className="text-[10px] text-muted-foreground">—</span>}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Review History */}
        <TabsContent value="history" className="space-y-3">
          {!myReviews.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No reviews submitted yet.</CardContent></Card>
          ) : (
            myReviews.map((r) => (
              <Card key={r.id} className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{r.studentName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{r.studentName}</p>
                        <StarDisplay rating={r.rating} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(parseISO(r.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
