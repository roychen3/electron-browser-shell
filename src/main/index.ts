import { app, BrowserWindow, WebContentsView } from 'electron';
import { BROWSER_SHELL_DEV_URL, AUTHENTICATOR_DEV_URL } from './constants';
import path from 'path';
import { createApplicationMenu } from './menu';
import { setupAppRouterIPC } from './ipc';
import { getAuthenticatorPath, getBrowserShellPath } from './pathResolver';
import { authenticatorRouter } from './AuthenticatorRouterManager'

function createWindow(): void {
  // Create the main window
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Create browser shell view
  const browserShellView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Create browser content view
  const browserContentView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  authenticatorRouter.setWevContentsView(browserContentView)

  // Setup IPC handlers
  setupAppRouterIPC(browserContentView);

  // Add views to the window
  win.contentView.addChildView(browserShellView);
  win.contentView.addChildView(browserContentView);

  const updateUrl = () => {
    authenticatorRouter.url = browserContentView.webContents.getURL()
    console.log('url:', authenticatorRouter.url)
    console.log('loadUrl:', authenticatorRouter.loadUrl)
    if (authenticatorRouter.url) {
      const formattedUrl = authenticatorRouter.url
      browserShellView.webContents.send('update-url', formattedUrl);
      browserContentView.webContents.send('update-url', formattedUrl);
    } else {
      const currentUrl = browserContentView.webContents.getURL()
      browserShellView.webContents.send('update-url', currentUrl);
      browserContentView.webContents.send('update-url', currentUrl);
    }
  }

  // Subscribe to browser content view's navigation events
  browserContentView.webContents.on('did-navigate', () => {
    console.log('------ did-navigate ------')
    updateUrl();
  });

  browserContentView.webContents.on('did-navigate-in-page', () => {
    console.log('------ did-navigate-in-page ------')
    updateUrl();
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
      height: shellHeight
    });

    browserContentView.setBounds({
      x: 0,
      y: shellHeight,
      width: winBounds.width,
      height: winBounds.height - shellHeight
    });
  };

  // Initial bounds setup
  updateViewBounds();

  // Update bounds when window is resized
  win.on('resize', updateViewBounds);

  // Load content into views
  if (app.isPackaged) {
    browserShellView.webContents.loadFile(getBrowserShellPath());
    // browserContentView.webContents.loadFile(getAuthenticatorPath());
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
    // browserContentView.webContents.loadURL(AUTHENTICATOR_DEV_URL);
  }
  browserContentView.webContents.loadFile(getAuthenticatorPath());

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
