import { ipcMain, BrowserWindow } from 'electron';
import { BROWSER_SHELL_HEIGHT } from '../constants';

export function setupAppPopupIPC(mainWindow: BrowserWindow) {
  ipcMain.removeHandler('open-popup');
  ipcMain.handle(
    'open-popup',
    async (_event, ...args: Parameters<Window['electronAPI']['openPopup']>) => {
      console.log('-- ipcMain.handle(open-popup) ----', args);
      const [type, options] = args;

      const popupWindow = new BrowserWindow({
        parent: mainWindow,
        show: false,
        alwaysOnTop: true,
        frame: false,
        resizable: false,
      });

      if (type === 'avatar-menu') {
        popupWindow.webContents.loadURL('https://vite.dev/');
      }

      popupWindow.webContents.once('did-finish-load', async () => {
        console.log('---- popupWindow once [did-finish-load] ------');

        const { width, height } =
          await popupWindow.webContents.executeJavaScript(
            `(${() => {
              const body = document.body;
              return {
                width: body.scrollWidth,
                height: body.scrollHeight,
              };
            }})()`
          );

        const {
          x: mainWinX,
          y: mainWinY,
          height: mainWinHeight,
        } = mainWindow.getBounds();
        popupWindow.setBounds({
          x: mainWinX + (options?.position?.x || 0),
          y: mainWinY + (options?.position?.y || 0),
          width,
          height: Math.min(mainWinHeight - BROWSER_SHELL_HEIGHT - 50, height),
        });
        popupWindow.show();
      });

      popupWindow.once('blur', () => {
        console.log('---- popupWindow on [blur] ------');
        popupWindow.close();
      });
    }
  );
}
