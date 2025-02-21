import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onUrlUpdate: (callback: (url: string) => void) => {
    const listener = (_event: any, url: string) => callback(url);
    ipcRenderer.on('update-url', listener);
    return () => ipcRenderer.removeListener('update-url', listener);
  },
  navigateUrl: (url: string) => ipcRenderer.invoke('navigate-url', url),
  browserBack: () => ipcRenderer.invoke('browser-back'),
  browserForward: () => ipcRenderer.invoke('browser-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
});
