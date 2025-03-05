import { app, BrowserWindow, WebContentsView, protocol, net } from 'electron';

import {
  AUTHENTICATOR_DEV_URL,
  BROWSER_SHELL_DEV_URL,
  BROWSER_SHELL_HEIGHT,
} from './constants';
import { createApplicationMenu } from './menu';
import {
  getAppUiPath,
  getBrowserOperatorPreloadPath,
  getBrowserShellPath,
} from './pathResolver';
import { TabManager } from './TabService';
import {
  setupAppRouterIPC,
  setupAppTabIPC,
  setupAppPopupIPC,
  setupAppAuthIPC,
} from './IPC';
import { PopupName } from './IPC/setupAppPopupIPC';

// 在應用啟動前註冊自訂協議
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true } },
]);

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  const browserShellView = new WebContentsView({
    webPreferences: {
      preload: getBrowserOperatorPreloadPath(),
    },
  });

  if (app.isPackaged) {
    browserShellView.webContents.loadFile(getBrowserShellPath());
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
  }

  const updateShellViewBounds = () => {
    const winBounds = mainWindow.getContentBounds();
    browserShellView.setBounds({
      x: 0,
      y: 0,
      width: winBounds.width,
      height: BROWSER_SHELL_HEIGHT,
    });
  };
  // Init shell view bounds
  updateShellViewBounds();

  const browserContentViewsMap = new Map<string, WebContentsView>();
  const tabManager = new TabManager();

  const getActiveBrowserContentView = () => {
    const activeTabId = tabManager.getActiveTabId();
    const currentBrowserContentView = browserContentViewsMap.get(activeTabId);
    if (!currentBrowserContentView) {
      throw new Error('Current browser content view not found');
    }
    return currentBrowserContentView;
  };

  const currentOpenPopupMaps = new Map<string, BrowserWindow>();

  setupAppTabIPC(tabManager);
  setupAppRouterIPC(getActiveBrowserContentView, (id) =>
    browserContentViewsMap.get(id)
  );
  setupAppPopupIPC(mainWindow, currentOpenPopupMaps);
  setupAppAuthIPC({
    browserShellView,
    getAvatarMenuWindow: () => currentOpenPopupMaps.get(PopupName.AvatarMenu),
    getAllBrowserContentView: () => Array.from(browserContentViewsMap.values()),
  });

  const updateBrowserContentViewBounds = (
    browserContentView: WebContentsView
  ) => {
    const winBounds = mainWindow.getContentBounds();

    browserContentView.setBounds({
      x: 0,
      y: BROWSER_SHELL_HEIGHT,
      width: winBounds.width,
      height: winBounds.height - BROWSER_SHELL_HEIGHT,
    });
  };

  tabManager.onCreateTab((tab) => {
    console.log('-- tabManager.onCreateTab ----');

    const newBrowserContentView = new WebContentsView({
      webPreferences: {
        preload: getBrowserOperatorPreloadPath(),
        additionalArguments: [`--tab-id=${tab.id}`],
      },
    });

    const onUpdateUrl = (url: string) => {
      const currentTab = tabManager.getTabById(tab.id);
      if (!currentTab) {
        throw new Error('Tab not found');
      }

      const prevUrl = currentTab.url;
      if (prevUrl !== url) {
        tabManager.updateTabById(tab.id, { url });
      }
    };
    // Subscribe to browser content view's navigation events
    newBrowserContentView.webContents.on('did-navigate', (_event, url) => {
      console.log('-- did-navigate ----');
      onUpdateUrl?.(url);
    });
    newBrowserContentView.webContents.on(
      'did-navigate-in-page',
      (_event, url) => {
        console.log('-- did-navigate-in-page ----');
        onUpdateUrl?.(url);
      }
    );

    newBrowserContentView.webContents.loadURL(tab.url);
    newBrowserContentView.setVisible(false);
    mainWindow.contentView.addChildView(newBrowserContentView);
    updateBrowserContentViewBounds(newBrowserContentView);
    browserContentViewsMap.set(tab.id, newBrowserContentView);
  });

  tabManager.onUpdateTabById(({ newValue, oldValue }) => {
    console.log('-- tabManager.onUpdateTabById ----');
    console.log('---- newValue.url:', newValue.url);
    console.log('---- oldValue.url:', oldValue?.url);
    const browserContentView = browserContentViewsMap.get(newValue.id);
    const urlEqual = oldValue?.url === newValue.url;
    if (!urlEqual && browserContentView) {
      console.log('------ send `update-url`');
      browserContentView.webContents.send('update-url', newValue.url);
      browserShellView.webContents.send('update-url', newValue.url);
    }
  });

  tabManager.onDeleteTabById((id) => {
    console.log('-- tabManager.onDeleteTabById ----');
    const browserContentView = browserContentViewsMap.get(id);
    if (browserContentView) {
      mainWindow.contentView.removeChildView(browserContentView);
      browserContentView.webContents.close();
      browserContentViewsMap.delete(id);
      if (browserContentViewsMap.size === 0) {
        app.quit();
      }
    }
  });

  tabManager.onSetActiveTabId(({ newId, prevId }) => {
    console.log('-- tabManager.onSetActiveTabId ----');
    const browserContentView = browserContentViewsMap.get(newId);
    if (!browserContentView) {
      throw new Error('Current browser content view not found');
    }

    if (newId !== prevId) {
      tabManager.getTabs().forEach((tab) => {
        const currentContentView = browserContentViewsMap.get(tab.id);
        if (currentContentView) {
          if (tab.id === newId) {
            currentContentView.setVisible(true);
            updateBrowserContentViewBounds(currentContentView);
          } else {
            currentContentView.setVisible(false);
          }
        }
      });
    }
  });

  // create default tab first
  const DEFAULT_TAB_ID = 'default-open-tab-id';
  const DEFAULT_URL = app.isPackaged
    ? 'app://authenticator/?pathname=/sign-in'
    : `${AUTHENTICATOR_DEV_URL}/sign-in`;
  tabManager.createTab({ id: DEFAULT_TAB_ID, url: DEFAULT_URL });
  tabManager.setActiveTabId(DEFAULT_TAB_ID);

  mainWindow.on('resize', () => {
    updateShellViewBounds();
    updateBrowserContentViewBounds(getActiveBrowserContentView());
  });

  mainWindow.contentView.addChildView(browserShellView);

  createApplicationMenu(browserShellView, getActiveBrowserContentView);
}

app.whenReady().then(() => {
  protocol.handle('app', async (req) => {
    console.log('-- handle protocol: app ----');
    console.log('---- req.url:', req.url);
    try {
      const uUrl = new URL(req.url);
      const appName = uUrl.host;
      const pathname = uUrl.pathname === '/' ? 'index.html' : uUrl.pathname;
      const pathnameParam = uUrl.searchParams.get('pathname') || '/';
      const appPath = getAppUiPath(
        `${appName}/${pathname}${
          pathname === 'index.html' ? `?pathname=${pathnameParam}` : ''
        }`
      );
      // [TODO]for windows
      // return net.fetch(appPath);

      // for mac
      return net.fetch(`file://${appPath}`);
    } catch (error) {
      console.error(`Failed to load URL: ${req.url}`, error);
      return new Response('File not found', { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
