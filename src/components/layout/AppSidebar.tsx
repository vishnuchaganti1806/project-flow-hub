import {
  LayoutDashboard, Lightbulb, Users, MessageSquare, BarChart3,
  UserCheck, ClipboardList, Star, Clock, BookOpen, User, FolderKanban, Shield, FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const studentMenu = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard, end: true },
  { title: "My Profile", url: "/student/profile", icon: User },
  { title: "My Ideas", url: "/student/ideas", icon: Lightbulb, end: true },
  { title: "Submit Idea", url: "/student/ideas/new", icon: ClipboardList },
  { title: "My Team", url: "/student/team", icon: Users },
  { title: "Doubts", url: "/student/doubts", icon: MessageSquare },
  { title: "Deadlines", url: "/student/deadlines", icon: Clock },
  { title: "Reviews", url: "/student/reviews", icon: Star },
];

const guideMenu = [
  { title: "Dashboard", url: "/guide", icon: LayoutDashboard, end: true },
  { title: "My Profile", url: "/guide/profile", icon: User },
  { title: "Review Queue", url: "/guide/reviews", icon: ClipboardList },
  { title: "My Students", url: "/guide/students", icon: Users },
  { title: "Teams", url: "/guide/teams", icon: FolderKanban },
  { title: "Doubts", url: "/guide/doubts", icon: MessageSquare },
  { title: "Deadlines", url: "/guide/deadlines", icon: Clock },
  { title: "Ratings", url: "/guide/ratings", icon: Star },
];

const adminMenu = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "My Profile", url: "/admin/profile", icon: User },
  { title: "User Management", url: "/admin/users", icon: Shield },
  { title: "All Ideas", url: "/admin/ideas", icon: Lightbulb },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Guides", url: "/admin/guides", icon: BookOpen },
  { title: "Teams", url: "/admin/teams", icon: FolderKanban },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Activity Logs", url: "/admin/activity-logs", icon: FileText },
];

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role || "student";

  const menu = role === "admin" ? adminMenu : role === "guide" ? guideMenu : studentMenu;
  const label = role === "admin" ? "Administration" : role === "guide" ? "Guide Portal" : "Student Portal";

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            SP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">SkillProject</span>
            <span className="text-[11px] text-sidebar-foreground/60">Academic Allocation</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">
            {label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={!!(item as any).end}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
