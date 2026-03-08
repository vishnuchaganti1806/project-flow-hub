import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";

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
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
