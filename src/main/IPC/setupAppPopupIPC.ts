import { ipcMain, BrowserWindow, app } from 'electron';

import { BROWSER_AVATAR_MENU_DEV_URL } from '../constants';
import { createPopupWindow } from '../popup';

export enum PopupName {
  AvatarMenu = 'avatar-menu-popup',
}

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

      const popupWindow = createPopupWindow({
        parent: mainWindow,
        anchorRect: options.anchorRect,
        placement: options.placement,
      });
      currentOpenPopupMaps.set(PopupName.AvatarMenu, popupWindow);

      popupWindow.once('blur', () => {
        console.log('---- popupWindow once [blur] delete maps ------');
        currentOpenPopupMaps.delete(PopupName.AvatarMenu);
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
      if (currentOpenPopupMaps.has(PopupName.AvatarMenu)) {
        const popupWindow = currentOpenPopupMaps.get(PopupName.AvatarMenu)!;
        popupWindow.close();
        currentOpenPopupMaps.delete(PopupName.AvatarMenu);
      }
    }
  );
}
