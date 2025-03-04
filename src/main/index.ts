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
import { createBrowserContentView } from './browserContentView';
import { TabManager } from './TabManager';
import {
  setupAppRouterIPC,
  setupAppTabIPC,
  setupAppPopupIPC,
  setupAppAuthIPC,
} from './IPC';

// 在應用啟動前註冊自訂協議
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true } },
]);

function createWindow(): void {
  // Create the main window
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  // Create browser shell view
  const browserShellView = new WebContentsView({
    webPreferences: {
      preload: getBrowserOperatorPreloadPath(),
    },
  });

  // Load content into views
  if (app.isPackaged) {
    browserShellView.webContents.loadFile(getBrowserShellPath());
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
  }

  const updateShellViewBounds = () => {
    const winBounds = win.getContentBounds();
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
  setupAppTabIPC(tabManager);

  const getActiveBrowserContentView = () => {
    const activeTabId = tabManager.getActiveTabId();
    const currentBrowserContentView = browserContentViewsMap.get(activeTabId);
    if (!currentBrowserContentView) {
      throw new Error('Current browser content view not found');
    }
    return currentBrowserContentView;
  };

  const updateContentViewBounds = (contentView: WebContentsView) => {
    const winBounds = win.getContentBounds();

    const currentBrowserContentView = contentView;
    currentBrowserContentView.setBounds({
      x: 0,
      y: BROWSER_SHELL_HEIGHT,
      width: winBounds.width,
      height: winBounds.height - BROWSER_SHELL_HEIGHT,
    });
  };

  tabManager.onCreateTab((tab) => {
    console.log('-- tabManager.onCreateTab ----');

    const newBrowserContentView = createBrowserContentView({
      tabId: tab.id,
      tabManager,
      browserShellView,
    });

    newBrowserContentView.setVisible(false);
    win.contentView.addChildView(newBrowserContentView);
    updateContentViewBounds(newBrowserContentView);
    if (app.isPackaged) {
      newBrowserContentView.webContents.loadURL(DEFAULT_URL);
    } else {
      newBrowserContentView.webContents.loadURL(
        `${AUTHENTICATOR_DEV_URL}/feature-one`
      );
      // for dev
      // newBrowserContentView.webContents.loadURL(DEFAULT_URL);
    }
    browserContentViewsMap.set(tab.id, newBrowserContentView);
  });

  tabManager.onUpdateTabById(({ newValue, oldValue }) => {
    console.log('-- tabManager.onUpdateTabById ----');
    console.log('---- newValue.url:', newValue.url);
    console.log('---- oldValue.url:', oldValue?.url);
    const tabContentView = browserContentViewsMap.get(newValue.id);
    const urlEqual = oldValue?.url === newValue.url;
    if (!urlEqual && tabContentView) {
      console.log('------ send `update-url`');
      tabContentView.webContents.send('update-url', newValue.url);
    }
  });

  tabManager.onDeleteTabById((id) => {
    console.log('-- tabManager.onDeleteTabById ----');
    const tabContentView = browserContentViewsMap.get(id);
    if (tabContentView) {
      win.contentView.removeChildView(tabContentView);
      browserContentViewsMap.delete(id);
      if (browserContentViewsMap.size === 0) {
        app.quit();
      }
    }
  });

  tabManager.onSetActiveTabId(({ newId, prevId }) => {
    console.log('-- tabManager.onSetActiveTabId ----');
    const tabContentView = browserContentViewsMap.get(newId);
    if (newId !== prevId && tabContentView) {
      tabManager.getTabs().forEach((tab) => {
        const currentTabContentView = browserContentViewsMap.get(tab.id);
        if (currentTabContentView) {
          if (tab.id === newId) {
            currentTabContentView.setVisible(true);
            updateContentViewBounds(currentTabContentView);
          } else {
            currentTabContentView.setVisible(false);
          }
        }
      });
    }
  });

  // create default tab first
  const DEFAULT_TAB_ID = 'default-open-tab-id';
  const DEFAULT_URL = 'app://authenticator/?pathname=/feature-one';
  tabManager.createTab({ id: DEFAULT_TAB_ID, url: DEFAULT_URL });
  tabManager.setActiveTabId(DEFAULT_TAB_ID);

  const currentOpenPopupMaps = new Map<string, BrowserWindow>();

  setupAppPopupIPC(win, currentOpenPopupMaps);
  setupAppRouterIPC(getActiveBrowserContentView);
  setupAppAuthIPC({
    browserShellView,
    getAvatarMenuWindow: () => currentOpenPopupMaps.get('avatar-menu'),
    getCurrentBrowserContentView: getActiveBrowserContentView,
  });

  win.on('resize', () => {
    updateShellViewBounds();
    updateContentViewBounds(getActiveBrowserContentView());
  });

  // Add views to the window
  win.contentView.addChildView(browserShellView);

  // Set up application menu
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
