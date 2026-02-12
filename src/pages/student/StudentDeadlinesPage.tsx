import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeadlines } from "@/hooks/useDeadlines";
import { differenceInDays, differenceInHours, parseISO, format, isPast } from "date-fns";
import { Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";

export default function StudentDeadlinesPage() {
  const { data: deadlines, isLoading } = useDeadlines();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const sorted = [...(deadlines ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter((d) => !isPast(parseISO(d.date)));
  const completed = sorted.filter((d) => isPast(parseISO(d.date)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
        <p className="text-muted-foreground">Track your project milestones and due dates.</p>
      </div>

      {/* Upcoming */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((d) => {
              const daysLeft = differenceInDays(parseISO(d.date), new Date());
              const hoursLeft = differenceInHours(parseISO(d.date), new Date());
              const urgent = daysLeft <= 3;
              return (
                <Card key={d.id} className={`animate-fade-in transition-colors ${urgent ? "border-destructive/50" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{d.title}</p>
                      {urgent && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{format(parseISO(d.date), "EEEE, MMM dd, yyyy")}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={urgent ? "destructive" : "secondary"}>
                        {daysLeft > 0 ? `${daysLeft} days left` : `${hoursLeft} hours left`}
                      </Badge>
                    </div>
                    {/* Countdown bar */}
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${urgent ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.max(5, 100 - daysLeft * 10)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-status-approved" /> Completed Milestones
          </h2>
          <div className="space-y-2">
            {completed.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                <CheckCircle2 className="h-4 w-4 text-status-approved shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium line-through">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(d.date), "MMM dd, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
