import { ipcMain } from 'electron';
import { WebContentsView } from 'electron';

export function setupAppRouterIPC(browserContentView: WebContentsView) {
  // Handle URL navigation
  ipcMain.handle('navigate-url', async (_, url: string) => {
    try {
      await browserContentView.webContents.loadURL(url);
      return { success: true };
    } catch (error) {
      console.error('Navigation error:', error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Navigation error' };
    }
  });

  // Handle browser navigation controls
  ipcMain.handle('browser-back', () => {
    if (browserContentView.webContents.navigationHistory.canGoBack()) {
      browserContentView.webContents.navigationHistory.goBack();
      return true;
    }
    return false;
  });

  ipcMain.handle('browser-forward', () => {
    if (browserContentView.webContents.navigationHistory.canGoForward()) {
      browserContentView.webContents.navigationHistory.goForward();
      return true;
    }
    return false;
  });

  ipcMain.handle('browser-reload', () => {
    browserContentView.webContents.reload();
    return true;
  });

  // Get current URL
  ipcMain.handle('get-current-url', () => {
    return browserContentView.webContents.getURL();
  });
}