import { useEffect } from 'react';
import { useAuth } from '../../auth/auth-react';

export interface AuthGuardProps {
  children: React.ReactNode;
}
export default function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      const tabId = window.electronAPI.getOwnTabId();
      const url = import.meta.env.PROD
        ? 'app://authenticator/sign-in'
        : 'http://localhost:3000/sign-in';
      window.electronAPI.browserNavigateTo(url, tabId || undefined);
    }
  }, [token]);

  if (!token) {
    return <div>Redirecting...</div>;
  }
  return <>{children}</>;
}
