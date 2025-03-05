import { authStore } from '../core';

export const initialAuthWithElectron = async () => {
  const token = await window.electronAPI.getToken();
  authStore.setToken(token);
};
