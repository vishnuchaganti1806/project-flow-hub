import { Navigate } from "react-router-dom";

/**
 * Public registration is disabled.
 * Redirect to student login.
 */
export default function RegisterPage() {
  return <Navigate to="/student/login" replace />;
}
