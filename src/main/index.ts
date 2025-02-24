import { app, BrowserWindow, WebContentsView, protocol, net } from 'electron';
import { AUTHENTICATOR_DEV_URL, BROWSER_SHELL_DEV_URL } from './constants';
import path from 'path';

import { createApplicationMenu } from './menu';
import { setupAppRouterIPC } from './ipc';
import { getAppUiPath } from './pathResolver';
import { routerManager } from './RouterManager';

// 在應用啟動前註冊自訂協議
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true } },
]);

function createWindow(): void {
  // Create the main window
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Create browser shell view
  const browserShellView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Create browser content view
  const browserContentView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Setup IPC handlers
  setupAppRouterIPC(browserContentView);

  // Add views to the window
  win.contentView.addChildView(browserShellView);
  win.contentView.addChildView(browserContentView);

  const handleUpdateUrl = async (url: string) => {
    const prevUrl = routerManager.url;
    routerManager.setUrl(url);
    const sendUrl = routerManager.url;
    if (prevUrl !== sendUrl) {
      browserShellView.webContents.send('update-url', url);
      browserContentView.webContents.send('update-url', url);
    }
  };
  // Subscribe to browser content view's navigation events
  browserContentView.webContents.on('did-navigate', (_event, url) => {
    console.log(('------ did-navigate ------'))
    handleUpdateUrl(url);
  });

  browserContentView.webContents.on('did-navigate-in-page', (_event, url) => {
    console.log(('------ did-navigate-in-page ------'))
    handleUpdateUrl(url);
  });

  // Function to update view bounds
  const shellHeight = 56; // Height of the shell UI

  // Function to update view bounds on window resize
  const updateViewBounds = () => {
    const winBounds = win.getBounds();
    browserShellView.setBounds({
      x: 0,
      y: 0,
      width: winBounds.width,
      height: shellHeight,
    });

    browserContentView.setBounds({
      x: 0,
      y: shellHeight,
      width: winBounds.width,
      height: winBounds.height - shellHeight,
    });
  };

  // Initial bounds setup
  updateViewBounds();

  // Update bounds when window is resized
  win.on('resize', updateViewBounds);

  // Load content into views
  if (app.isPackaged) {
    browserShellView.webContents.loadFile(
      path.join(__dirname, '../ui/browser-shell/index.html')
    );
    routerManager.setUrl('app://authenticator/?pathname=/feature-one');
    browserContentView.webContents.loadURL(routerManager.url);
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
    browserContentView.webContents.loadURL(
      `${AUTHENTICATOR_DEV_URL}/feature-one`
    );
  }

  // Set up application menu
  createApplicationMenu(browserContentView, browserShellView);
}

app.whenReady().then(() => {
  protocol.handle('app', async (req) => {
    console.log(('------ handle protocol: app ------'))
    try {
      const uUrl = new URL(req.url);
      const appName = uUrl.host;
      const pathname = uUrl.pathname === '/' ? 'index.html' : uUrl.pathname;
      const pathnameParam = uUrl.searchParams.get('pathname') || '/';
      const appPath = getAppUiPath(
        `${appName}/${pathname}?pathname=${pathnameParam}`
      );
      return net.fetch(appPath);
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
