import { ipcMain, BrowserWindow, app } from 'electron';

import {
  BROWSER_SHELL_HEIGHT,
  BROWSER_AVATAR_MENU_DEV_URL,
} from '../constants';
import { getBrowserOperatorPreloadPath } from '../pathResolver';

export function setupAppPopupIPC(mainWindow: BrowserWindow) {
  const tempPopupWindow = new Map<string, BrowserWindow>();

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
        webPreferences: {
          preload: getBrowserOperatorPreloadPath(),
        },
      });

      tempPopupWindow.set(type, popupWindow);

      if (type === 'avatar-menu') {
        if (app.isPackaged) {
          popupWindow.webContents.loadURL('app://browser-avatar-menu');
        } else {
          popupWindow.webContents.loadURL(BROWSER_AVATAR_MENU_DEV_URL);
        }
      }

      popupWindow.webContents.once('did-finish-load', async () => {
        console.log('---- popupWindow once [did-finish-load] ------');
        const {
          x: mainWinX,
          y: mainWinY,
          height: mainWinHeight,
        } = mainWindow.getBounds();
        const { width, height } =
          await popupWindow.webContents.executeJavaScript(
            `(${async () => {
              // wait for SPA page render
              await Promise.resolve(null);

              const body = document.body;
              return {
                width: body.scrollWidth,
                height: body.scrollHeight,
              };
            }})()`
          );

        const formatPosition = () => {
          const placement = options?.placement || 'left';
          const targetX = options?.position?.x || 0;
          const targetY = options?.position?.y || 0;
          switch (placement) {
            case 'leftTop':
              return {
                x: mainWinX + targetX - width,
                y: mainWinY + targetY,
              };
            case 'left':
              return {
                x: mainWinX + targetX - width,
                y: mainWinY + targetY - height / 2,
              };
            case 'leftBottom':
              return {
                x: mainWinX + targetX - width,
                y: mainWinY + targetY - height,
              };

            case 'topLeft':
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY - height,
              };
            case 'top':
              return {
                x: mainWinX + targetX - width / 2,
                y: mainWinY + targetY - height,
              };
            case 'topRight':
              return {
                x: mainWinX + targetX - width,
                y: mainWinY + targetY - height,
              };

            case 'rightTop':
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY,
              };
            case 'right':
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY - height / 2,
              };
            case 'rightBottom':
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY - height,
              };

            case 'bottomLeft':
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY,
              };
            case 'bottom':
              return {
                x: mainWinX + targetX - width / 2,
                y: mainWinY + targetY,
              };
            case 'bottomRight':
              return {
                x: mainWinX + targetX - width,
                y: mainWinY + targetY,
              };

            default:
              return {
                x: mainWinX + targetX,
                y: mainWinY + targetY,
              };
          }
        };
        const { x, y } = formatPosition();

        popupWindow.setBounds({
          x,
          y,
          width,
          height: Math.min(mainWinHeight - BROWSER_SHELL_HEIGHT - 50, height),
        });

        // If you want debug for popup, uncomment the following code
        // popupWindow.setBounds({
        //   x,
        //   y,
        //   width: 600,
        //   height: 600,
        // });
        // popupWindow.webContents.toggleDevTools();

        popupWindow.show();
      });

      popupWindow.once('blur', () => {
        console.log('---- popupWindow on [blur] ------');
        tempPopupWindow.delete(type);
        popupWindow.close();
      });
    }
  );

  ipcMain.removeHandler('close-popup');
  ipcMain.handle(
    'close-popup',
    async (
      _event,
      ...args: Parameters<Window['electronAPI']['closePopup']>
    ) => {
      console.log('-- ipcMain.handle(close-popup) ----', args);
      const [type] = args;

      if (tempPopupWindow.has(type)) {
        const popupWindow = tempPopupWindow.get(type)!;
        popupWindow.close();
        tempPopupWindow.delete(type);
      } else {
        console.warn(`---- Popup window with type ${type} does not exist.`);
      }
    }
  );
}
