import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStudents } from "@/hooks/useStudents";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function GuideRatingsPage() {
  const { user } = useAuth();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const submitReview = useSubmitReview();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const myStudents = (students ?? []).filter((s) => s.guideId === user?.id);

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
          <p className="text-muted-foreground">Rate student progress and provide feedback.</p>
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

      {!reviews?.length ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No reviews submitted yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{r.studentName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{r.studentName}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(parseISO(r.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
