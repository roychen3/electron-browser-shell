import {
  app,
  BrowserWindow,
  WebContentsView,
  protocol,
  net,
  session,
} from 'electron';
import punycode from 'node:punycode';

import {
  AUTHENTICATOR_DEV_URL,
  BROWSER_SHELL_DEV_URL,
  BROWSER_SHELL_HEIGHT,
} from './constants';
import { isMac, isFilenameWithExtension } from './is';
import { createApplicationMenu } from './menu';
import {
  getAppUiPath,
  getBrowserOperatorPreloadPath,
  getBrowserOperationsPanelPath,
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

function createWindow(
  browserContentViewsMap: Map<string, WebContentsView>
): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // frame: false,
    // titleBarStyle: 'hidden',
    ...(isMac()
      ? {}
      : {
          titleBarOverlay: {
            color: '#262626',
            symbolColor: '#fff',
            height: 38,
          },
        }),
    trafficLightPosition: { x: 14, y: 12 },
  });

  const browserOperationsPanelView = new WebContentsView({
    webPreferences: {
      preload: getBrowserOperatorPreloadPath(),
    },
  });

  if (app.isPackaged) {
    browserOperationsPanelView.webContents.loadFile(
      getBrowserOperationsPanelPath()
    );
  } else {
    browserOperationsPanelView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
  }

  const updateShellViewBounds = () => {
    const winBounds = mainWindow.getContentBounds();
    browserOperationsPanelView.setBounds({
      x: 0,
      y: 0,
      width: winBounds.width,
      height: BROWSER_SHELL_HEIGHT,
    });
  };
  // Init shell view bounds
  updateShellViewBounds();

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
    browserOperationsPanelView,
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
      tabManager.setTabById(tab.id, { url });
    };
    // Subscribe to browser content view's navigation events
    newBrowserContentView.webContents.on('did-navigate', (_event, url) => {
      console.log('-- did-navigate ----');
      onUpdateUrl(url);
    });
    newBrowserContentView.webContents.on(
      'did-navigate-in-page',
      (_event, url) => {
        console.log('-- did-navigate-in-page ----');
        onUpdateUrl(url);
      }
    );
    newBrowserContentView.webContents.on(
      'page-title-updated',
      (_event, title) => {
        console.log('-- page-title-updated ----');
        tabManager.setTabById(tab.id, { title });
      }
    );
    newBrowserContentView.webContents.on(
      'page-favicon-updated',
      (_event, favicon) => {
        console.log('-- page-favicon-updated ----');
        tabManager.setTabById(tab.id, { favicon: favicon[0] });
      }
    );

    newBrowserContentView.webContents.loadURL(tab.url);
    newBrowserContentView.setVisible(false);
    mainWindow.contentView.addChildView(newBrowserContentView);
    updateBrowserContentViewBounds(newBrowserContentView);
    browserContentViewsMap.set(tab.id, newBrowserContentView);
  });

  tabManager.onSetTabById((args) => {
    console.log('-- tabManager.onSetTabById ----');
    console.log('---- newValue.url:', args.newValue.url);
    console.log('---- oldValue.url:', args.oldValue?.url);
    const browserContentView = browserContentViewsMap.get(args.newValue.id);
    if (!browserContentView) {
      throw new Error('browser content view not found');
    }
    browserContentView.webContents.send('set-tab-by-id', args);
    browserOperationsPanelView.webContents.send('set-tab-by-id', args);
  });

  tabManager.onDeleteTabById((id) => {
    console.log('-- tabManager.onDeleteTabById ----');
    const browserContentView = browserContentViewsMap.get(id);
    if (browserContentView) {
      mainWindow.contentView.removeChildView(browserContentView);
      browserContentView.webContents.close();
      browserContentViewsMap.delete(id);
      if (browserContentViewsMap.size === 0) {
        mainWindow.close();
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
      browserOperationsPanelView.webContents.send('set-active-tab-id', newId);
    }
  });

  tabManager.onSetTabs((tabs) => {
    console.log('-- tabManager.onSetTabs ----');
    browserOperationsPanelView.webContents.send('set-tabs', tabs);
  });

  // create default tab first
  const DEFAULT_TAB_ID = 'default-open-tab-id';
  const DEFAULT_URL = app.isPackaged
    ? 'app://authenticator/sign-in'
    : `${AUTHENTICATOR_DEV_URL}/sign-in`;
  tabManager.createTab({ id: DEFAULT_TAB_ID, url: DEFAULT_URL });
  tabManager.setActiveTabId(DEFAULT_TAB_ID);

  mainWindow.on('resize', () => {
    updateShellViewBounds();
    updateBrowserContentViewBounds(getActiveBrowserContentView());
  });
  mainWindow.once('close', () => {
    browserOperationsPanelView.webContents.close();
    browserContentViewsMap.forEach((browserContentView) => {
      browserContentView.webContents.close();
    });
    browserContentViewsMap.clear();
  });

  mainWindow.contentView.addChildView(browserOperationsPanelView);

  createApplicationMenu({
    onNewTab: () => {
      tabManager.createTab({
        url: DEFAULT_URL,
      });
    },
    onToggleDeveloperTools: () => {
      const currentBrowserContentView = getActiveBrowserContentView();
      currentBrowserContentView.webContents.toggleDevTools();
    },
    onToggleBrowserOperationsPanelDevTools: () => {
      browserOperationsPanelView.webContents.toggleDevTools();
    },
  });
}

app.whenReady().then(() => {
  const browserContentViewsMap = new Map<string, WebContentsView>();

  protocol.handle('app', async (req) => {
    console.log('-- handle protocol: app ----');
    console.log('---- req.url:', req.url);
    const uUrl = new URL(req.url);
    const appName = uUrl.host;
    try {
      const pathnameSlices = uUrl.pathname.split('/');
      const lastPathnameSlice = pathnameSlices[pathnameSlices.length - 1];
      const pathname = isFilenameWithExtension(lastPathnameSlice)
        ? uUrl.pathname
        : 'index.html';
      const appPath = getAppUiPath(`${appName}/${pathname}`);
      return await net.fetch(`file://${appPath}`);
    } catch (error) {
      console.error(`Failed to load URL: ${req.url}`, error);
      return new Response('File not found', { status: 404 });
    }
  });

  session.defaultSession.webRequest.onErrorOccurred(
    ({ url, webContents, error }) => {
      console.error(
        '-- session.defaultSession.webRequest.onErrorOccurred ----'
      );

      const webContentIndex = Array.from(
        browserContentViewsMap.values()
      ).findIndex((c) => c.webContents === webContents);
      if (
        error === 'net::ERR_NAME_NOT_RESOLVED' &&
        webContents &&
        webContentIndex !== -1
      ) {
        try {
          const uUrl = new URL(url);
          const query =
            punycode.toUnicode(uUrl.host) +
            (uUrl.pathname === '/' ? '' : uUrl.pathname) +
            uUrl.search;

          const googleSearchUrl = new URL('https://www.google.com/search');
          googleSearchUrl.searchParams.set('q', query);
          webContents.loadURL(googleSearchUrl.toString());
        } catch (error) {
          console.error('Failed to redirect to Google Search.');
        }
      }
    }
  );

  createWindow(browserContentViewsMap);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(browserContentViewsMap);
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac()) {
    app.quit();
  }
});
