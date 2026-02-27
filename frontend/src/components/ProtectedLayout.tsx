import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import Layout from './Layout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const { hasRouteAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.is_verified === false) {
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }
    if (user.is_first_login === true) {
      navigate('/change-password');
      return;
    }
  }, [user, isLoading, navigate]);

  // Permission check: redirect to access-denied if user lacks required permission for this route
  useEffect(() => {
    if (isLoading || !user) return;
    if (!hasRouteAccess(location.pathname)) {
      navigate('/access-denied', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate, hasRouteAccess]);

  if (isLoading || !user || user.is_verified === false || user.is_first_login === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!hasRouteAccess(location.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}
