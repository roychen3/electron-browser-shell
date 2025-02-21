import { WebContentsView, Menu } from 'electron';
import { BROWSER_SHELL_DEV_URL, AUTHENTICATOR_DEV_URL } from './constants';
import path from 'path';

export function createApplicationMenu(browserContentView: WebContentsView, browserShellView: WebContentsView) {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  const viewMenu = menu.items.find(item => item.label === 'View');
  if (!viewMenu?.submenu) return;

  // Find and replace the Toggle Developer Tools item
  const devToolsItem = viewMenu.submenu.items.find(item => item.label === 'Toggle Developer Tools');
  if (devToolsItem) {
    devToolsItem.click = () => browserContentView.webContents.toggleDevTools();
  }

  let template = Menu.buildFromTemplate(menu.items)
  const localDeveloperMenu = menu.items.find(item => item.label === 'Local Developer');
  if (!localDeveloperMenu) {
    template = Menu.buildFromTemplate([...menu.items, {
      label: 'Local Developer',
      submenu: [{
        click: () => browserShellView.webContents.toggleDevTools(),
        label: 'Toggle Browser Shell DevTools',
      }],
    }]);
  }
  Menu.setApplicationMenu(template);
}
