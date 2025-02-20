import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onUrlUpdate: (callback: (url: string) => void) => {
    ipcRenderer.on('update-url', (_event, url) => callback(url));
  },
  navigateUrl: (url: string) => ipcRenderer.invoke('navigate-url', url),
  browserBack: () => ipcRenderer.invoke('browser-back'),
  browserForward: () => ipcRenderer.invoke('browser-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
});
