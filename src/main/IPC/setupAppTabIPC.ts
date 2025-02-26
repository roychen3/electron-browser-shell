import { ipcMain } from 'electron';

import { Tab, TabManager } from '../TabManager/index.js';

export function setupAppTabIPC(tabManager: TabManager) {
  ipcMain.removeHandler('get-tabs');
  ipcMain.handle('get-tabs', async () => {
    console.log('-- ipcMain.handle(get-tabs) ----');
    const result = tabManager.getTabs();
    return result;
  });

  ipcMain.removeHandler('get-tab-by-id');
  ipcMain.handle('get-tab-by-id', async (_, id: string) => {
    console.log('-- ipcMain.handle(get-tab-by-id) ----', id);
    const result = tabManager.getTabById(id);
    return result;
  });

  ipcMain.removeHandler('create-tab');
  ipcMain.handle('create-tab', (_, value: Tab) => {
    console.log('-- ipcMain.handle(create-tab) ----', value);
    const result = tabManager.createTab(value);
    return result;
  });

  ipcMain.removeHandler('update-tab-by-id');
  ipcMain.handle(
    'update-tab-by-id',
    async (_, data: { id: string; value: Partial<Tab> }) => {
      console.log('-- ipcMain.handle(update-tab-by-id) ----', data);
      const result = tabManager.updateTabById(data.id, data.value);
      return result;
    }
  );

  ipcMain.removeHandler('delete-tab-by-id');
  ipcMain.handle('delete-tab-by-id', async (_, id: string) => {
    console.log('-- ipcMain.handle(delete-tab-by-id) ----', id);
    const result = tabManager.deleteTabById(id);
    return result;
  });

  ipcMain.removeHandler('get-active-tab-id');
  ipcMain.handle('get-active-tab-id', async (_) => {
    console.log('-- ipcMain.handle(get-active-tab-id) ----');
    const result = tabManager.getActiveTabId();
    return result;
  });

  ipcMain.removeHandler('set-active-tab-id');
  ipcMain.handle('set-active-tab-id', async (_, id: string) => {
    console.log('-- ipcMain.handle(set-active-tab-id) ----', id);
    const result = tabManager.setActiveTabId(id);
    return result;
  });

  ipcMain.removeHandler('get-active-tab');
  ipcMain.handle('get-active-tab', async (_) => {
    console.log('-- ipcMain.handle(get-active-tab) ----');
    const result = tabManager.getActiveTab();
    return result;
  });
}
