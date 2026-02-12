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

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentIdeasPage from "./pages/student/StudentIdeasPage";
import StudentIdeaFormPage from "./pages/student/StudentIdeaFormPage";
import StudentIdeaDetailPage from "./pages/student/StudentIdeaDetailPage";
import StudentTeamPage from "./pages/student/StudentTeamPage";
import StudentDoubtsPage from "./pages/student/StudentDoubtsPage";
import StudentDeadlinesPage from "./pages/student/StudentDeadlinesPage";
import StudentReviewsPage from "./pages/student/StudentReviewsPage";

// Guide Pages
import GuideDashboard from "./pages/guide/GuideDashboard";
import GuideIdeaReviewPage from "./pages/guide/GuideIdeaReviewPage";
import GuideStudentsPage from "./pages/guide/GuideStudentsPage";
import GuideTeamsPage from "./pages/guide/GuideTeamsPage";
import GuideDoubtsPage from "./pages/guide/GuideDoubtsPage";
import GuideDeadlinesPage from "./pages/guide/GuideDeadlinesPage";
import GuideRatingsPage from "./pages/guide/GuideRatingsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminGuidesPage from "./pages/admin/AdminGuidesPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import AdminIdeasPage from "./pages/admin/AdminIdeasPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

const queryClient = new QueryClient();

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
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                  <Route path="/student/ideas" element={<StudentIdeasPage />} />
                  <Route path="/student/ideas/new" element={<StudentIdeaFormPage />} />
                  <Route path="/student/ideas/:id" element={<StudentIdeaDetailPage />} />
                  <Route path="/student/ideas/:id/edit" element={<StudentIdeaFormPage />} />
                  <Route path="/student/team" element={<StudentTeamPage />} />
                  <Route path="/student/doubts" element={<StudentDoubtsPage />} />
                  <Route path="/student/deadlines" element={<StudentDeadlinesPage />} />
                  <Route path="/student/reviews" element={<StudentReviewsPage />} />

                  {/* Guide routes */}
                  <Route path="/guide" element={<GuideDashboard />} />
                  <Route path="/guide/reviews" element={<GuideIdeaReviewPage />} />
                  <Route path="/guide/students" element={<GuideStudentsPage />} />
                  <Route path="/guide/teams" element={<GuideTeamsPage />} />
                  <Route path="/guide/doubts" element={<GuideDoubtsPage />} />
                  <Route path="/guide/deadlines" element={<GuideDeadlinesPage />} />
                  <Route path="/guide/ratings" element={<GuideRatingsPage />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/ideas" element={<AdminIdeasPage />} />
                  <Route path="/admin/students" element={<AdminStudentsPage />} />
                  <Route path="/admin/guides" element={<AdminGuidesPage />} />
                  <Route path="/admin/teams" element={<AdminTeamsPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
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
