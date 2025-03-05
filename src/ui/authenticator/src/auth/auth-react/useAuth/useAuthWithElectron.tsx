import { useSyncExternalStore } from 'react';

import type { Auth } from '../interface';

import { authStore } from '../../core';

export function useAuth(): Auth {
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
  const setToken = (token: string) => authStore.setToken(token);

  return { token, setToken };
}
