import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PageLoader } from '../components/Spinner';

// Guards authenticated routes. While the session is being restored we show a
// loader; unauthenticated users are redirected to /login.
export function ProtectedRoute() {
  const { user, initializing } = useAuthStore();

  if (initializing) {
    return <PageLoader />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
