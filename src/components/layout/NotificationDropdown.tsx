import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeStyles: Record<string, string> = {
  success: "bg-[hsl(var(--status-approved))]/10 text-[hsl(var(--status-approved))]",
  info: "bg-[hsl(var(--status-submitted))]/10 text-[hsl(var(--status-submitted))]",
  warning: "bg-[hsl(var(--status-review))]/10 text-[hsl(var(--status-review))]",
  error: "bg-[hsl(var(--status-rejected))]/10 text-[hsl(var(--status-rejected))]",
};

export function NotificationDropdown() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] font-bold">
              {unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {(!notifications || notifications.length === 0) ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", !n.read ? "bg-primary" : "bg-transparent")} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium", typeStyles[n.type] || typeStyles.info)}>
                        {n.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
