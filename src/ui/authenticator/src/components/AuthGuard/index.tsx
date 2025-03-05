import { useEffect } from 'react';
import { useAuth } from '../../auth/auth-react';

export interface AuthGuardProps {
  children: React.ReactNode;
}
export default function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      const url = import.meta.env.PROD
        ? 'app://protected-application'
        : 'http://localhost:3010';
      window.electronAPI.browserNavigateTo(url);
    }
  }, [token]);

  if (token) {
    return <div>Redirecting...</div>;
  }
  return <>{children}</>;
}
