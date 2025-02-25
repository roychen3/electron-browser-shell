import { contextBridge, ipcRenderer } from 'electron';
import { Tab } from '../TabManager';

function getProcessArgvValue(key: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${key}=`));
  return arg ? arg.split('=')[1] : null;
}

contextBridge.exposeInMainWorld('electronAPI', {
  onUrlUpdate: (callback: (url: string) => void) => {
    const listener = (_event: any, url: string) => callback(url);
    ipcRenderer.on('update-url', listener);
    return () => ipcRenderer.removeListener('update-url', listener);
  },
  browserNavigateTo: (url: string) =>
    ipcRenderer.invoke('browser-navigate-to', url),
  browserBack: () => ipcRenderer.invoke('browser-back'),
  browserForward: () => ipcRenderer.invoke('browser-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),

  getTabs: () => ipcRenderer.invoke('get-tabs'),
  getTabById: (id: string) => ipcRenderer.invoke('get-tab-by-id', id),
  createTab: (value?: Partial<Tab>) => ipcRenderer.invoke('create-tab', value),
  updateTabById: (value: { id: string; value: Partial<Tab> }) =>
    ipcRenderer.invoke('update-tab-by-id', value),
  deleteTabById: (id: string) => ipcRenderer.invoke('delete-tab-by-id', id),
  getActiveTabId: () => ipcRenderer.invoke('get-active-tab-id'),
  setActiveTabId: (id: string) => ipcRenderer.invoke('set-active-tab-id', id),
  getActiveTab: () => {
    console.log('---- process.argv:', process.argv);
    return ipcRenderer.invoke('get-active-tab');
  },
  getOwnTabId: () => {
    return { success: true, data: getProcessArgvValue('tab-id') };
  },
});
