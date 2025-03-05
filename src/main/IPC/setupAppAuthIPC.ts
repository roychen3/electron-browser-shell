import { BrowserWindow, ipcMain, WebContentsView } from 'electron';

export function setupAppAuthIPC({
  browserShellView,
  getAvatarMenuWindow,
  getAllBrowserContentView: getCurrentBrowserContentView,
}: {
  browserShellView: WebContentsView;
  getAvatarMenuWindow: () => BrowserWindow | undefined;
  getAllBrowserContentView: () => WebContentsView[];
}) {
  ipcMain.removeHandler('get-token');
  ipcMain.handle('get-token', async () => {
    console.log('-- ipcMain.handle(get-token) ----');
    const token = await browserShellView.webContents.executeJavaScript(
      `(${() => {
        return window.localStorage.getItem('token');
      }})()`
    );
    return token;
  });

  ipcMain.removeHandler('set-token');
  ipcMain.handle('set-token', async (_, token: string) => {
    console.log('-- ipcMain.handle(set-token) ----', token);
    browserShellView.webContents.send('token-update', token);
    getCurrentBrowserContentView().forEach((browserContentView) => {
      browserContentView.webContents.send('token-update', token);
    });
    const avatarMenuWindow = getAvatarMenuWindow();
    if (avatarMenuWindow) {
      console.log('---- sending token to avatar menu ----', token);
      avatarMenuWindow.webContents.send('token-update', token);
    }
  });
}
