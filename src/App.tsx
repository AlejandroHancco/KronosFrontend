import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Register from './features/auth/components/Register';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CalendarPage from './pages/calendar/CalendarPage';
import DevicesPage from './pages/DevicesPage';
import SensorsPage from './pages/SensorsPage';
import AuthCallback from './pages/AuthCallback';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import PrivateLayout from './components/PrivateLayout';
import LoadingSpinner from './components/LoadingSpinner';
import JoinTeamPage from './pages/onboarding/JoinTeamPage';
import PendingApprovalPage from './pages/onboarding/PendingApprovalPage';
import BannedPage from './pages/onboarding/BannedPage';
import VerifyEmailPage from './pages/onboarding/VerifyEmailPage';
import RejectedPage from './pages/onboarding/RejectedPage';
import OnboardingLayout from './components/OnboardingLayout';
import TeamRequestsPage from './pages/admin/TeamRequestsPage';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            
            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />
            
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Onboarding routes - require session but not PrivateLayout */}
            <Route element={
                <PrivateRoute>
                    <OnboardingLayout />
                </PrivateRoute>
            }>
                <Route path="/join-team" element={<JoinTeamPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
                <Route path="/rejected" element={<RejectedPage />} />
                <Route path="/banned" element={<BannedPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route element={
                <PrivateRoute>
                    <PrivateLayout />
                </PrivateRoute>
            }>
                <Route path="/dashboard"                                element={<DashboardPage />} />
                <Route path="/sensors"                                  element={<SensorsPage />} />
                <Route path="/calendar"                                 element={<CalendarPage />} />
                <Route path="/team/:teamId"                             element={<TeamDetailPage />} />
                <Route path="/admin/team-requests"                      element={<TeamRequestsPage />} />
                <Route path="/projects/:projectId"                      element={<ProjectDetailPage />} />
                <Route path="/projects/:projectId/devices"              element={<DevicesPage />} />
                <Route path="/projects/:projectId/tasks/:taskId"        element={<TaskDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;