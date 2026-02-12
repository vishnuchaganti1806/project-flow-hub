import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { RoleSwitcher } from "./RoleSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopHeader() {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const name = user?.name ?? "User";
  const initials = user?.avatar ?? name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="h-8 w-8" />

      <div className="flex-1" />

      <RoleSwitcher />
      <ThemeToggle />

      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] font-bold">
            {unread}
          </Badge>
        )}
      </Button>

      <div className="flex items-center gap-2.5 pl-1">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:block">{name}</span>
      </div>

      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground" onClick={logout} title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
