// preload 是跑在 browser，不能 import 其他模組，只能 import `electron` & type
import { contextBridge, ipcRenderer } from 'electron';

import type { Tab } from '../TabService';

function getProcessArgvValue(key: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${key}=`));
  return arg ? arg.split('=')[1] : null;
}

contextBridge.exposeInMainWorld('electronAPI', {
  isMacOS: () => process.platform === 'darwin',
  browserNavigateTo: (url, tabId) =>
    ipcRenderer.invoke('browser-navigate-to', url, tabId),
  browserBack: () => ipcRenderer.invoke('browser-back'),
  browserForward: () => ipcRenderer.invoke('browser-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),

  getTabs: () => ipcRenderer.invoke('get-tabs'),
  updateTabs: (value) => ipcRenderer.invoke('update-tabs', value),
  onUpdateTabs: (callback) => {
    const listener = (
      _event: any,
      value: Tab[]
    ) => callback(value);
    ipcRenderer.on('update-tabs', listener);
    return () => ipcRenderer.removeListener('update-tabs', listener);
  },
  getTabById: (id) => ipcRenderer.invoke('get-tab-by-id', id),
  createTab: (value) => ipcRenderer.invoke('create-tab', value),
  updateTabById: (value) => ipcRenderer.invoke('update-tab-by-id', value),
  onUpdateTabById: (callback) => {
    const listener = (
      _event: any,
      arg: {
        newValue: Tab;
        oldValue: Tab;
      }
    ) => callback(arg);
    ipcRenderer.on('update-tab-by-id', listener);
    return () => ipcRenderer.removeListener('update-tab-by-id', listener);
  },
  deleteTabById: (id) => ipcRenderer.invoke('delete-tab-by-id', id),
  getActiveTabId: () => ipcRenderer.invoke('get-active-tab-id'),
  setActiveTabId: (id) => ipcRenderer.invoke('set-active-tab-id', id),
  getActiveTab: () => ipcRenderer.invoke('get-active-tab'),
  getOwnTabId: () => getProcessArgvValue('tab-id'),

  openAvatarMenuPopup: (options) =>
    ipcRenderer.invoke('open-avatar-menu-popup', options),
  closeAvatarMenuPopup: () => ipcRenderer.invoke('close-avatar-menu-popup'),

  getToken: () => ipcRenderer.invoke('get-token'),
  setToken: async (token: string) => ipcRenderer.invoke('set-token', token),
  onTokenUpdate: (callback) => {
    const listener = (_event: any, token: string) => callback(token);
    ipcRenderer.on('token-update', listener);
    return () => ipcRenderer.removeListener('token-update', listener);
  },
} satisfies Window['electronAPI']);
