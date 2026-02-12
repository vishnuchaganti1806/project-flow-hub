import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GuideDashboard from "./pages/guide/GuideDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

const queryClient = new QueryClient();

// Redirect to role-based dashboard
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RoleProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected dashboard routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<RoleRedirect />} />
                <Route element={<DashboardLayout />}>
                  {/* Student routes */}
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/ideas" element={<StudentDashboard />} />
                  <Route path="/student/ideas/new" element={<StudentDashboard />} />
                  <Route path="/student/team" element={<StudentDashboard />} />
                  <Route path="/student/doubts" element={<StudentDashboard />} />

                  {/* Guide routes */}
                  <Route path="/guide" element={<GuideDashboard />} />
                  <Route path="/guide/reviews" element={<GuideDashboard />} />
                  <Route path="/guide/students" element={<GuideDashboard />} />
                  <Route path="/guide/doubts" element={<GuideDashboard />} />
                  <Route path="/guide/ratings" element={<GuideDashboard />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/ideas" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<AdminDashboard />} />
                  <Route path="/admin/guides" element={<AdminDashboard />} />
                  <Route path="/admin/assignments" element={<AdminDashboard />} />
                  <Route path="/admin/analytics" element={<AdminDashboard />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
