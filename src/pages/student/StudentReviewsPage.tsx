import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/hooks/useReviews";
import { useStudentProfile } from "@/hooks/useStudents";
import { Star, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function StudentReviewsPage() {
  const { data: student } = useStudentProfile();
  const { data: reviews, isLoading } = useReviews(student?.id);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const myReviews = reviews ?? [];
  const avg = myReviews.length > 0 ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-muted-foreground">View feedback from your guide.</p>
      </div>

      {/* Average Rating */}
      <Card className="animate-fade-in">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <Star className="h-8 w-8 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold">{avg}</p>
            <p className="text-sm text-muted-foreground">Average Rating · {myReviews.length} reviews</p>
          </div>
        </CardContent>
      </Card>

      {/* Review History */}
      {myReviews.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Your guide will submit reviews as you progress.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myReviews.map((r) => (
            <Card key={r.id} className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-muted-foreground">{format(parseISO(r.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <p className="text-sm">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
