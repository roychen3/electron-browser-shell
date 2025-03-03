import { contextBridge, ipcRenderer } from 'electron';

function getProcessArgvValue(key: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${key}=`));
  return arg ? arg.split('=')[1] : null;
}

contextBridge.exposeInMainWorld('electronAPI', {
  onUrlUpdate: (callback) => {
    const listener = (_event: any, url: string) => callback(url);
    ipcRenderer.on('update-url', listener);
    return () => ipcRenderer.removeListener('update-url', listener);
  },
  browserNavigateTo: (url) => ipcRenderer.invoke('browser-navigate-to', url),
  browserBack: () => ipcRenderer.invoke('browser-back'),
  browserForward: () => ipcRenderer.invoke('browser-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),

  getTabs: () => ipcRenderer.invoke('get-tabs'),
  getTabById: (id) => ipcRenderer.invoke('get-tab-by-id', id),
  createTab: (value) => ipcRenderer.invoke('create-tab', value),
  updateTabById: (value) => ipcRenderer.invoke('update-tab-by-id', value),
  deleteTabById: (id) => ipcRenderer.invoke('delete-tab-by-id', id),
  getActiveTabId: () => ipcRenderer.invoke('get-active-tab-id'),
  setActiveTabId: (id) => ipcRenderer.invoke('set-active-tab-id', id),
  getActiveTab: () => ipcRenderer.invoke('get-active-tab'),
  getOwnTabId: () => getProcessArgvValue('tab-id'),

  openPopup: (type, options) => ipcRenderer.invoke('open-popup', type, options),
  closePopup: (type) => ipcRenderer.invoke('close-popup', type),
} satisfies Window['electronAPI']);
