import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import apiClient from '../../api/client';
import { rememberPostLoginRedirect } from '../../lib/post-login-redirect';

interface PrivateRouteProps {
  children: React.ReactNode;
}

interface UserStatus {
  banned?: boolean;
  provider?: string;
  emailVerified?: boolean;
  teamStatus?: string;
}

// These paths are only accessible during onboarding — status-based redirects
// must NOT fire here or they create infinite redirect loops.
const ONBOARDING_PATHS = ['/verify-email', '/join-team', '/pending-approval', '/rejected', '/banned'];

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        fetchUserStatus();
      } else {
        // No user — skip status fetch so the login redirect fires correctly.
        setStatusLoading(false);
      }
    }
  }, [user, loading]);

  const fetchUserStatus = async () => {
    try {
      console.log('PrivateRoute: Fetching user status...');
      const res = await apiClient.get('/auth/me');
      console.log('PrivateRoute: User status:', res.data);
      setUserStatus(res.data);
    } catch (err) {
      console.error('PrivateRoute: Error fetching user status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    rememberPostLoginRedirect(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // Onboarding pages only need the user to be authenticated.
  // Applying status-based redirects here would loop infinitely (e.g. redirecting
  // to /verify-email while already rendering /verify-email).
  const isOnboardingPath = ONBOARDING_PATHS.includes(location.pathname);
  if (isOnboardingPath) {
    return <>{children}</>;
  }

  if (userStatus?.banned) {
    return <Navigate to="/banned" replace />;
  }

  // Solo para usuarios de email: verificar correo
  if (userStatus?.provider === 'password' && !userStatus?.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (userStatus?.teamStatus === 'NONE' || userStatus?.teamStatus === 'REJECTED') {
    return <Navigate to="/join-team" replace />;
  }

  if (userStatus?.teamStatus === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (userStatus?.teamStatus === 'APPROVED') {
    return <>{children}</>;
  }

  // Fallback: si no hay team status claro, ir a unirse al equipo
  return <Navigate to="/join-team" replace />;
};

export default PrivateRoute;
