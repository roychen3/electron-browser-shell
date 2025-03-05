import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth-react';

export interface AuthGuardProps {
  children: React.ReactNode;
}
export default function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuth();
  const { pathname } = useLocation();

  if (pathname === '/sign-in' && token) {
    return <Navigate to="/feature-one" />;
  }
  return <>{children}</>;
}
