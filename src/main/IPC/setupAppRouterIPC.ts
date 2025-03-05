import { ipcMain } from 'electron';
import { WebContentsView } from 'electron';

export function setupAppRouterIPC(
  getCurrentBrowserContentView: () => WebContentsView,
  getBrowserContentViewById: (id: string) => WebContentsView | undefined
) {
  ipcMain.removeHandler('browser-navigate-to');
  ipcMain.handle(
    'browser-navigate-to',
    async (_, url: string, tabId?: string) => {
      if (tabId) {
        const browserContentView = getBrowserContentViewById(tabId);
        if (!browserContentView) {
          throw new Error('Browser content view not found');
        }
        await browserContentView.webContents.loadURL(url);
      } else {
        const browserContentView = getCurrentBrowserContentView();
        await browserContentView.webContents.loadURL(url);
      }
    }
  );

  ipcMain.removeHandler('browser-back');
  ipcMain.handle('browser-back', () => {
    const browserContentView = getCurrentBrowserContentView();
    if (browserContentView.webContents.navigationHistory.canGoBack()) {
      browserContentView.webContents.navigationHistory.goBack();
    }
  });

  ipcMain.removeHandler('browser-forward');
  ipcMain.handle('browser-forward', () => {
    const browserContentView = getCurrentBrowserContentView();
    if (browserContentView.webContents.navigationHistory.canGoForward()) {
      browserContentView.webContents.navigationHistory.goForward();
    }
  });

  ipcMain.removeHandler('browser-reload');
  ipcMain.handle('browser-reload', () => {
    const browserContentView = getCurrentBrowserContentView();
    browserContentView.webContents.reload();
  });
}
