import { ipcMain } from 'electron';

import { Tab, TabManager } from '../TabManager';

export function setupAppTabIPC(tabManager: TabManager) {
  ipcMain.removeHandler('get-tabs');
  ipcMain.handle('get-tabs', async () => {
    try {
      console.log('-- ipcMain.handle(get-tabs) ----');
      const result = tabManager.getTabs();
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Get tabs error' };
    }
  });

  ipcMain.removeHandler('get-tab-by-id');
  ipcMain.handle('get-tab-by-id', async (_, id: string) => {
    try {
      console.log('-- ipcMain.handle(get-tab-by-id) ----', id);
      const result = tabManager.getTabById(id);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Get tab by id error' };
    }
  });

  ipcMain.removeHandler('create-tab');
  ipcMain.handle('create-tab', (_, value: Tab) => {
    try {
      console.log('-- ipcMain.handle(create-tab) ----', value);
      const result = tabManager.createTab(value);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Create tab error' };
    }
  });

  ipcMain.removeHandler('update-tab-by-id');
  ipcMain.handle(
    'update-tab-by-id',
    async (_, data: { id: string; value: Partial<Tab> }) => {
      try {
        console.log('-- ipcMain.handle(update-tab-by-id) ----', data);
        const result = tabManager.updateTabById(data.id, data.value);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, error: error.message };
        }
        return { success: false, error: 'Update tab error' };
      }
    }
  );

  ipcMain.removeHandler('delete-tab-by-id');
  ipcMain.handle('delete-tab-by-id', async (_, id: string) => {
    try {
      console.log('-- ipcMain.handle(delete-tab-by-id) ----', id);
      const result = tabManager.deleteTabById(id);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Delete tab error' };
    }
  });

  ipcMain.removeHandler('get-active-tab-id');
  ipcMain.handle('get-active-tab-id', async (_) => {
    try {
      console.log('-- ipcMain.handle(get-active-tab-id) ----');
      const result = tabManager.getActiveTabId();
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Get active tab error' };
    }
  });

  ipcMain.removeHandler('set-active-tab-id');
  ipcMain.handle('set-active-tab-id', async (_, id: string) => {
    try {
      console.log('-- ipcMain.handle(set-active-tab-id) ----', id);
      const result = tabManager.setActiveTabId(id);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Set active tab error' };
    }
  });

  ipcMain.removeHandler('get-active-tab');
  ipcMain.handle('get-active-tab', async (_) => {
    try {
      console.log('-- ipcMain.handle(get-active-tab) ----');
      const result = tabManager.getActiveTab();
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Get active tab error' };
    }
  });
}
