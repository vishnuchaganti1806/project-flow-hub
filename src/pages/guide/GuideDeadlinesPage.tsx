import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDeadlines, useCreateDeadline } from "@/hooks/useDeadlines";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO, format, isPast } from "date-fns";
import { Clock, Plus, Trash2, Calendar, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function GuideDeadlinesPage() {
  const { data: deadlines, isLoading } = useDeadlines();
  const createDeadline = useCreateDeadline();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const handleCreate = () => {
    if (!title.trim() || !date) return;
    createDeadline.mutate({ title, date }, {
      onSuccess: () => {
        toast({ title: "Deadline Created" });
        setDialogOpen(false);
        setTitle("");
        setDate("");
      },
    });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const sorted = [...(deadlines ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deadline Management</h1>
          <p className="text-muted-foreground">Create and manage project deadlines.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Deadline</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Deadline</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Deadline title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createDeadline.isPending}>
                <Calendar className="mr-2 h-4 w-4" /> Create Deadline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">No deadlines set</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => {
            const past = isPast(parseISO(d.date));
            const daysLeft = differenceInDays(parseISO(d.date), new Date());
            const urgent = !past && daysLeft <= 3;
            return (
              <Card key={d.id} className={`animate-fade-in ${urgent ? "border-destructive/50" : ""} ${past ? "opacity-60" : ""}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {urgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <div>
                      <p className={`font-medium ${past ? "line-through" : ""}`}>{d.title}</p>
                      <p className="text-sm text-muted-foreground">{format(parseISO(d.date), "EEEE, MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={past ? "secondary" : urgent ? "destructive" : "outline"}>
                      {past ? "Past" : `${daysLeft} days left`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
