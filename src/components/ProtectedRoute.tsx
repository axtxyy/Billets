import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warmwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-royalgold border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warmwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-royalgold border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/rooms" replace />;
  }

  return <>{children}</>;
}