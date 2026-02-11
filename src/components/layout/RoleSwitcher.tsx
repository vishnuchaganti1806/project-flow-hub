import { useRole } from "@/contexts/RoleContext";
import { UserRole } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, GraduationCap, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "guide", label: "Guide", icon: BookOpen },
  { value: "student", label: "Student", icon: GraduationCap },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const handleChange = (value: string) => {
    const newRole = value as UserRole;
    setRole(newRole);
    navigate(`/${newRole}`);
  };

  return (
    <Select value={role} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px] h-9 text-sm font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <div className="flex items-center gap-2">
              <r.icon className="h-3.5 w-3.5" />
              <span>{r.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
