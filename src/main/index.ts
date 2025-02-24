import { app, BrowserWindow, WebContentsView, protocol, net } from 'electron';
import { AUTHENTICATOR_DEV_URL, BROWSER_SHELL_DEV_URL } from './constants';
import path from 'path';

import { createApplicationMenu } from './menu';
import { getAppUiPath, getBrowserOperatorPreloadPath } from './pathResolver';
import { routerManager } from './RouterManager';
import { createBrowserContentView } from './browserContentView'

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
      preload: getBrowserOperatorPreloadPath(),
    },
  });

  // Create browser content view
  const browserContentView = createBrowserContentView({
    routerManager,
    browserShellView,
  })

  // Add views to the window
  win.contentView.addChildView(browserShellView);
  win.contentView.addChildView(browserContentView);

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
    // for dev
    // routerManager.setUrl('app://authenticator/?pathname=/feature-one');
    // browserContentView.webContents.loadURL(routerManager.url);
  }

  // Set up application menu
  createApplicationMenu(browserShellView, browserContentView);
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
        `${appName}/${pathname}${pathname === 'index.html' ? `?pathname=${pathnameParam}` : ''}`
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
