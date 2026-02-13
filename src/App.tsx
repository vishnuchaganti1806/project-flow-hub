import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Auth Pages (eager — small, critical path)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Lazy-loaded pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentProfilePage = lazy(() => import("./pages/student/StudentProfilePage"));
const StudentIdeasPage = lazy(() => import("./pages/student/StudentIdeasPage"));
const StudentIdeaFormPage = lazy(() => import("./pages/student/StudentIdeaFormPage"));
const StudentIdeaDetailPage = lazy(() => import("./pages/student/StudentIdeaDetailPage"));
const StudentTeamPage = lazy(() => import("./pages/student/StudentTeamPage"));
const StudentDoubtsPage = lazy(() => import("./pages/student/StudentDoubtsPage"));
const StudentDeadlinesPage = lazy(() => import("./pages/student/StudentDeadlinesPage"));
const StudentReviewsPage = lazy(() => import("./pages/student/StudentReviewsPage"));

const GuideDashboard = lazy(() => import("./pages/guide/GuideDashboard"));
const GuideIdeaReviewPage = lazy(() => import("./pages/guide/GuideIdeaReviewPage"));
const GuideStudentsPage = lazy(() => import("./pages/guide/GuideStudentsPage"));
const GuideTeamsPage = lazy(() => import("./pages/guide/GuideTeamsPage"));
const GuideDoubtsPage = lazy(() => import("./pages/guide/GuideDoubtsPage"));
const GuideDeadlinesPage = lazy(() => import("./pages/guide/GuideDeadlinesPage"));
const GuideRatingsPage = lazy(() => import("./pages/guide/GuideRatingsPage"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminStudentsPage = lazy(() => import("./pages/admin/AdminStudentsPage"));
const AdminGuidesPage = lazy(() => import("./pages/admin/AdminGuidesPage"));
const AdminTeamsPage = lazy(() => import("./pages/admin/AdminTeamsPage"));
const AdminIdeasPage = lazy(() => import("./pages/admin/AdminIdeasPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
