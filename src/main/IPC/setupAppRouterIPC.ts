import { ipcMain } from 'electron';
import { WebContentsView } from 'electron';

export function setupAppRouterIPC(
  getCurrentBrowserContentView: () => WebContentsView
) {
  ipcMain.removeHandler('browser-navigate-to');
  ipcMain.handle('browser-navigate-to', async (_, url: string) => {
    try {
      const browserContentView = getCurrentBrowserContentView();
      await browserContentView.webContents.loadURL(url);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Navigation error' };
    }
  });

  ipcMain.removeHandler('browser-back');
  ipcMain.handle('browser-back', () => {
    const browserContentView = getCurrentBrowserContentView();
    if (browserContentView.webContents.navigationHistory.canGoBack()) {
      browserContentView.webContents.navigationHistory.goBack();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.removeHandler('browser-forward');
  ipcMain.handle('browser-forward', () => {
    const browserContentView = getCurrentBrowserContentView();
    if (browserContentView.webContents.navigationHistory.canGoForward()) {
      browserContentView.webContents.navigationHistory.goForward();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.removeHandler('browser-reload');
  ipcMain.handle('browser-reload', () => {
    const browserContentView = getCurrentBrowserContentView();
    browserContentView.webContents.reload();
    return { success: true };
  });
}
