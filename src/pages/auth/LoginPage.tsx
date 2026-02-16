import { Navigate } from "react-router-dom";

/**
 * Legacy login page redirects to student login.
 */
export default function LoginPage() {
  return <Navigate to="/student/login" replace />;
}
