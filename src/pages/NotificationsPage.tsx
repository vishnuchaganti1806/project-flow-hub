import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const typeStyles: Record<string, string> = {
  success: "bg-[hsl(var(--status-approved))]/10 text-[hsl(var(--status-approved))]",
  info: "bg-[hsl(var(--status-submitted))]/10 text-[hsl(var(--status-submitted))]",
  warning: "bg-[hsl(var(--status-review))]/10 text-[hsl(var(--status-review))]",
  error: "bg-[hsl(var(--status-rejected))]/10 text-[hsl(var(--status-rejected))]",
};

const typeIcons: Record<string, string> = {
  success: "✅",
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const deleteAllRead = useDeleteAllReadNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = (notifications || []).filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const readCount = notifications?.filter((n) => n.read).length ?? 0;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((n) => n.id)));
    }
  };

  const handleBulkDelete = () => {
    selected.forEach((id) => deleteOne.mutate(id));
    toast.success(`Deleted ${selected.size} notification(s)`);
    setSelected(new Set());
  };

  const handleBulkMarkRead = () => {
    selected.forEach((id) => {
      const n = notifications?.find((x) => x.id === id);
      if (n && !n.read) markRead.mutate(id);
    });
    toast.success("Marked as read");
    setSelected(new Set());
  };

  const handleClearRead = () => {
    deleteAllRead.mutate();
    toast.success("Cleared all read notifications");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}{" "}
            · {notifications?.length ?? 0} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
            </Button>
          )}
          {readCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearRead} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear read
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as typeof filter); setSelected(new Set()); }}>
        <TabsList>
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px]">{notifications?.length ?? 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px]">{unreadCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="read">
            Read <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 text-[10px]">{readCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={handleBulkMarkRead}>
            <Check className="mr-1 h-3.5 w-3.5" /> Mark read
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Cancel
          </Button>
        </div>
      )}

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : filter === "read" ? "No read notifications" : "No notifications yet"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {filter === "all" ? "Notifications will appear here when there are updates." : "Try switching to a different filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-4 py-1">
            <Checkbox
              checked={selected.size === filtered.length && filtered.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-xs text-muted-foreground">Select all</span>
          </div>

          {filtered.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "transition-colors hover:bg-muted/30",
                !n.read && "border-primary/20 bg-primary/[0.02]"
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={selected.has(n.id)}
                  onCheckedChange={() => toggleSelect(n.id)}
                  className="mt-1"
                />
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", !n.read ? "bg-primary" : "bg-transparent")} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{typeIcons[n.type] || "ℹ️"}</span>
                    <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", typeStyles[n.type] || typeStyles.info)}>
                      {n.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-tight">{n.title}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground/50">
                    {format(new Date(n.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Mark as read" onClick={() => markRead.mutate(n.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={() => { deleteOne.mutate(n.id); toast.success("Notification deleted"); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
