import { useSyncExternalStore } from 'react';

import { authStore } from './store';

export function useAuth() {
  const token = useSyncExternalStore(
    (listener) => {
      const unSubscribe = window.electronAPI.onTokenUpdate((token) => {
        console.log('---- useAuth.onTokenUpdate ----');
        authStore.setToken(token);
        listener();
      });
      return unSubscribe;
    },
    () => authStore.getToken()
  );

  return { token };
}
