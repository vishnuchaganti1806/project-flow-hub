import { cn } from "@/lib/utils";
import { IdeaStatus } from "@/data/mockData";

const config: Record<IdeaStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", className: "bg-primary/10 text-primary" },
  "under-review": { label: "Under Review", className: "bg-status-review/15 text-status-review" },
  approved: { label: "Approved", className: "bg-status-approved/15 text-status-approved" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status, className }: { status: IdeaStatus; className?: string }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", c.className, className)}>
      {c.label}
    </span>
  );
}
