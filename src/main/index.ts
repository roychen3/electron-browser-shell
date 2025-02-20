import { app, BrowserWindow, WebContentsView, Menu, MenuItemConstructorOptions } from 'electron';
import { BROWSER_SHELL_DEV_URL, AUTHENTICATOR_DEV_URL } from './constants';
import path from 'path';

function createApplicationMenu(browserContentView: WebContentsView) {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  const viewMenu = menu.items.find(item => item.label === 'View');
  if (!viewMenu?.submenu) return;

  // Find and replace the Toggle Developer Tools item
  const devToolsItem = viewMenu.submenu.items.find(item => item.label === 'Toggle Developer Tools');
  if (devToolsItem) {
    devToolsItem.click = () => browserContentView.webContents.toggleDevTools();
  }

  Menu.setApplicationMenu(menu);
}

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
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Create browser content view
  const browserContentView = new WebContentsView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Add views to the window
  win.contentView.addChildView(browserShellView);
  win.contentView.addChildView(browserContentView);

  // Function to update view bounds
  const winBounds = win.getBounds();
  const shellHeight = 56; // Height of the shell UI

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

  // Load content into views
  if (app.isPackaged) {
    browserShellView.webContents.loadFile(path.join(__dirname, '../../src/ui/browser-shell/index.html'));
    browserContentView.webContents.loadFile(path.join(__dirname, '../../src/ui/authenticator/index.html'));
  } else {
    browserShellView.webContents.loadURL(BROWSER_SHELL_DEV_URL);
    browserContentView.webContents.loadURL(AUTHENTICATOR_DEV_URL);
  }

  // Set up application menu
  createApplicationMenu(browserContentView);
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
