import { ipcMain, BrowserWindow, app } from 'electron';

import {
  BROWSER_SHELL_HEIGHT,
  BROWSER_AVATAR_MENU_DEV_URL,
} from '../constants';
import { getBrowserOperatorPreloadPath } from '../pathResolver';

type Placement =
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom'
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
const formatPosition = ({
  mainWinBounds,
  targetBounds,
  placement,
}: {
  mainWinBounds: Rectangle;
  targetBounds: Rectangle;
  placement: Placement;
}) => {
  const mainWinX = mainWinBounds.x;
  const mainWinY = mainWinBounds.y;
  const targetX = targetBounds.x;
  const targetY = targetBounds.y;
  const targetWidth = targetBounds.width;
  const targetHeight = targetBounds.height;

  switch (placement) {
    case 'leftTop':
      return {
        x: mainWinX + targetX - targetWidth,
        y: mainWinY + targetY,
      };
    case 'left':
      return {
        x: mainWinX + targetX - targetWidth,
        y: mainWinY + targetY - targetHeight / 2,
      };
    case 'leftBottom':
      return {
        x: mainWinX + targetX - targetWidth,
        y: mainWinY + targetY - targetHeight,
      };

    case 'topLeft':
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY - targetHeight,
      };
    case 'top':
      return {
        x: mainWinX + targetX - targetWidth / 2,
        y: mainWinY + targetY - targetHeight,
      };
    case 'topRight':
      return {
        x: mainWinX + targetX - targetWidth,
        y: mainWinY + targetY - targetHeight,
      };

    case 'rightTop':
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY,
      };
    case 'right':
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY - targetHeight / 2,
      };
    case 'rightBottom':
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY - targetHeight,
      };

    case 'bottomLeft':
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY,
      };
    case 'bottom':
      return {
        x: mainWinX + targetX - targetWidth / 2,
        y: mainWinY + targetY,
      };
    case 'bottomRight':
      return {
        x: mainWinX + targetX - targetWidth,
        y: mainWinY + targetY,
      };

    default:
      return {
        x: mainWinX + targetX,
        y: mainWinY + targetY,
      };
  }
};

export function setupAppPopupIPC(
  mainWindow: BrowserWindow,
  currentOpenPopupMaps: Map<string, BrowserWindow>
) {
  ipcMain.removeHandler('open-avatar-menu-popup');
  ipcMain.handle(
    'open-avatar-menu-popup',
    async (
      _event,
      ...args: Parameters<Window['electronAPI']['openAvatarMenuPopup']>
    ) => {
      console.log('-- ipcMain.handle(open-avatar-menu-popup) ----', args);
      const [options] = args;

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
      currentOpenPopupMaps.set('avatar-menu', popupWindow);

      popupWindow.webContents.once('did-finish-load', async () => {
        console.log('---- popupWindow once [did-finish-load] ------');

        const mainWinBounds = mainWindow.getBounds();
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
        console.log('---- width, height ----', width, height);

        const { x, y } = formatPosition({
          mainWinBounds: mainWinBounds,
          targetBounds: {
            x: options?.position?.x || 0,
            y: options?.position?.y || 0,
            width,
            height,
          },
          placement: options?.placement || 'left',
        });

        popupWindow.setBounds({
          x,
          y,
          width,
          height: Math.min(
            mainWinBounds.height - BROWSER_SHELL_HEIGHT - 50,
            height
          ),
        });

        // // If you want debug for popup, uncomment the following code
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
        console.log('---- popupWindow once [blur] ------');
        popupWindow.close();
        currentOpenPopupMaps.delete('avatar-menu');
      });

      if (app.isPackaged) {
        popupWindow.webContents.loadURL('app://browser-avatar-menu');
      } else {
        popupWindow.webContents.loadURL(BROWSER_AVATAR_MENU_DEV_URL);
      }
    }
  );

  ipcMain.removeHandler('close-avatar-menu-popup');
  ipcMain.handle(
    'close-avatar-menu-popup',
    async (
      _event,
      ...args: Parameters<Window['electronAPI']['closeAvatarMenuPopup']>
    ) => {
      console.log('-- ipcMain.handle(close-avatar-menu-popup) ----', args);
      if (currentOpenPopupMaps.has('avatar-menu')) {
        const popupWindow = currentOpenPopupMaps.get('avatar-menu')!;
        popupWindow.close();
        currentOpenPopupMaps.delete('avatar-menu');
      }
    }
  );
}
