import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/data/mockData";

interface Props {
  allowedRoles: UserRole[];
}

/**
 * Restricts access to specific roles.
 * Must be nested inside ProtectedRoute.
 */
export function RoleProtectedRoute({ allowedRoles }: Props) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard
    const fallback = user ? `/${user.role}` : "/login";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
