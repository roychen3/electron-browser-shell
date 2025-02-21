import { ipcMain } from 'electron';
import { WebContentsView } from 'electron';
import { getAuthenticatorPath } from './pathResolver';
import { authenticatorRouter } from './AuthenticatorRouterManager'


export function setupAppRouterIPC(browserContentView: WebContentsView) {

  // Handle URL navigation
  ipcMain.removeHandler('navigate-url')
  ipcMain.handle('navigate-url', async (_, url: string) => {
    try {
      console.log('------ handle navigate-url ------')
      console.log('url:', url)
      authenticatorRouter.url = url
      console.log('url:', authenticatorRouter.url)
      console.log('loadUrl:', authenticatorRouter.loadUrl)
      if (authenticatorRouter.loadUrl) {
        // Note! this using `loadURL` not `loadFile`.
        await browserContentView.webContents.loadURL(authenticatorRouter.loadUrl)
      } else {
        await browserContentView.webContents.loadURL(url);
      }
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
  ipcMain.removeHandler('get-current-url')
  ipcMain.handle('get-current-url', () => {
    console.log('------ handle get-current-url ------')
    console.log('url:', authenticatorRouter.url)
    console.log('loadUrl:', authenticatorRouter.loadUrl)
    if (authenticatorRouter.url) {
      return authenticatorRouter.url
    } else {
      return browserContentView.webContents.getURL();
    }
  });

  // Handle browser navigation controls
  ipcMain.removeHandler('browser-back')
  ipcMain.handle('browser-back', () => {
    if (browserContentView.webContents.navigationHistory.canGoBack()) {
      browserContentView.webContents.navigationHistory.goBack();
      return true;
    }
    return false;
  });

  ipcMain.removeHandler('browser-forward')
  ipcMain.handle('browser-forward', () => {
    if (browserContentView.webContents.navigationHistory.canGoForward()) {
      browserContentView.webContents.navigationHistory.goForward();
      return true;
    }
    return false;
  });


  ipcMain.removeHandler('browser-reload')
  ipcMain.handle('browser-reload', () => {
    if (authenticatorRouter.loadUrl) {
      browserContentView.webContents.loadURL(authenticatorRouter.loadUrl);
      return true
    }
    browserContentView.webContents.reload();
    return true;
  });
}