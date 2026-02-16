import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

async function fetchLogs(): Promise<ActivityLog[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("admin-manage-users", {
    body: { action: "get_activity_logs" },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  return res.data?.logs || [];
}

export default function AdminActivityLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: fetchLogs,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of all admin actions.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {!logs?.length ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-muted-foreground">No activity logs yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                      {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
