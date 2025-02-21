import {
  app,
  BrowserWindow,
  WebContentsView,
  session,
  protocol,
  net,
} from 'electron';
import { BROWSER_SHELL_DEV_URL, AUTHENTICATOR_DEV_URL } from './constants';
import path from 'path';
import { format } from 'url';

import { createApplicationMenu } from './menu';
import { setupAppRouterIPC } from './ipc';
import { getAuthenticatorPath } from './pathResolver';
import { routerManager } from './RouterManager';

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
  routerManager.setWevContentsView(browserContentView);

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    if (
      details.webContentsId === browserContentView.webContents.id &&
      details.webContents?.getTitle() === 'app:///authenticator' &&
      details.url.startsWith('file:///') &&
      !details.url.includes('authenticator')
    ) {
      console.log('------ webRequest.onBeforeRequest ------');
      routerManager.url = details.url;
      console.log('routerManager.url:', routerManager.url);
      callback({
        redirectURL: routerManager.loadUrl,
      });
    } else {
      callback({});
    }
  });

  // Setup IPC handlers
  setupAppRouterIPC(browserContentView);

  // Add views to the window
  win.contentView.addChildView(browserShellView);
  win.contentView.addChildView(browserContentView);

  const handleUpdateUrl = async (url: string) => {
    const prevUrl = routerManager.url;
    routerManager.url = url;
    const sendUrl = routerManager.url;
    if (prevUrl !== sendUrl) {
      browserShellView.webContents.send('update-url', sendUrl);
      browserContentView.webContents.send('update-url', sendUrl);
    }
  };
  // Subscribe to browser content view's navigation events
  browserContentView.webContents.on('did-navigate', (event, url) => {
    console.log('------ did-navigation ------');
    console.log('event:', event);
    console.log('url:', url);
    handleUpdateUrl(url);
  });

  browserContentView.webContents.on('did-navigate-in-page', (event, url) => {
    console.log('------ did-navigate-in-page ------');
    console.log('event:', event);
    console.log('url:', url);
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
    // browserContentView.webContents.loadURL(
    //   format({
    //     pathname: getAuthenticatorPath(),
    //     protocol: 'file:',
    //     slashes: true,
    //   })
    // );
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
    // browserContentView.webContents.loadURL(AUTHENTICATOR_DEV_URL);
  }
  browserContentView.webContents.loadURL(
    format({
      pathname: getAuthenticatorPath(),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Set up application menu
  createApplicationMenu(browserContentView, browserShellView);
}

app.whenReady().then(() => {
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
