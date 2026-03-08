import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeadlines, useCreateDeadline, useUpdateDeadline, useDeleteDeadline } from "@/hooks/useDeadlines";
import { differenceInDays, parseISO, format, isPast } from "date-fns";
import { Clock, Plus, Trash2, Calendar, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GuideDeadlinesPage() {
  const { data: deadlines, isLoading } = useDeadlines();
  const createDeadline = useCreateDeadline();
  const updateDeadline = useUpdateDeadline();
  const deleteDeadline = useDeleteDeadline();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  const handleCreate = () => {
    if (!title.trim() || !date) return;
    createDeadline.mutate({ title, date: new Date(date).toISOString() }, {
      onSuccess: () => { setDialogOpen(false); setTitle(""); setDate(""); },
    });
  };

  const startEdit = (d: { id: string; title: string; date: string }) => {
    setEditingId(d.id);
    setEditTitle(d.title);
    setEditDate(format(parseISO(d.date), "yyyy-MM-dd"));
  };

  const saveEdit = () => {
    if (!editingId || !editTitle.trim() || !editDate) return;
    updateDeadline.mutate(
      { id: editingId, title: editTitle.trim(), date: new Date(editDate).toISOString() },
      { onSuccess: () => setEditingId(null) }
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  const sorted = [...(deadlines ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deadline Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage project deadlines.</p>
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
            const isEditing = editingId === d.id;

            return (
              <Card key={d.id} className={`animate-fade-in ${urgent ? "border-destructive/50" : ""} ${past ? "opacity-60" : ""}`}>
                <CardContent className="flex items-center justify-between p-4 gap-3">
                  {isEditing ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1" />
                      <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-44" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {urgent && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                      <div className="min-w-0">
                        <p className={`font-medium ${past ? "line-through" : ""}`}>{d.title}</p>
                        <p className="text-sm text-muted-foreground">{format(parseISO(d.date), "EEEE, MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit} disabled={updateDeadline.isPending}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant={past ? "secondary" : urgent ? "destructive" : "outline"}>
                          {past ? "Past" : `${daysLeft} days left`}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete deadline "{d.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteDeadline.mutate(d.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
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
