import { ipcMain } from 'electron';
import { WebContentsView } from 'electron';

import { routerManager } from './RouterManager';

export function setupAppRouterIPC(browserContentView: WebContentsView) {
  // Handle URL navigation
  ipcMain.removeHandler('navigate-url');
  ipcMain.handle('navigate-url', async (_, url: string) => {
    try {
      routerManager.setUrl(url);
      await browserContentView.webContents.loadURL(routerManager.url);
      return { success: true };
    } catch (error) {
      console.error('Navigation error:', error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Navigation error' };
    }
  });

  // Get current URL
  ipcMain.removeHandler('get-current-url');
  ipcMain.handle('get-current-url', () => {
    return routerManager.url;
  });

  // Handle browser navigation controls
  ipcMain.removeHandler('browser-back');
  ipcMain.handle('browser-back', () => {
    if (browserContentView.webContents.navigationHistory.canGoBack()) {
      browserContentView.webContents.navigationHistory.goBack();
      return true;
    }
    return false;
  });

  ipcMain.removeHandler('browser-forward');
  ipcMain.handle('browser-forward', () => {
    if (browserContentView.webContents.navigationHistory.canGoForward()) {
      browserContentView.webContents.navigationHistory.goForward();
      return true;
    }
    return false;
  });

  ipcMain.removeHandler('browser-reload');
  ipcMain.handle('browser-reload', () => {
    browserContentView.webContents.reload();
    return true;
  });
}
