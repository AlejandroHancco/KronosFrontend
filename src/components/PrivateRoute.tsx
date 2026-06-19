import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userStatus = user as any;

  console.log('[PrivateRoute] loading:', loading, 'isAuthenticated:', isAuthenticated);
  console.log('teamStatus:', userStatus?.teamStatus);
  console.log('emailVerified:', userStatus?.emailVerified);
  console.log('provider:', userStatus?.provider);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;

  return <Navigate to="/join-team" />;
};
export default PrivateRoute;