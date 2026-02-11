import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import GuideDashboard from "./pages/guide/GuideDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />

            {/* Dashboard shell */}
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
