import { WebContentsView, Menu, app } from 'electron';

export function createApplicationMenu(
  browserOperationsPanelView: WebContentsView,
  getCurrentBrowserContentView: () => WebContentsView
) {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  const viewMenu = menu.items.find((item) => item.label === 'View');
  if (!viewMenu?.submenu) return;

  // Find and replace the Toggle Developer Tools item
  const devToolsItem = viewMenu.submenu.items.find(
    (item) => item.label === 'Toggle Developer Tools'
  );
  if (devToolsItem) {
    devToolsItem.click = () => {
      const currentBrowserContentView = getCurrentBrowserContentView();
      currentBrowserContentView.webContents.toggleDevTools();
    };
  }

  let template = Menu.buildFromTemplate(menu.items);
  const localDeveloperMenu = menu.items.find(
    (item) => item.label === 'Local Developer'
  );
  if (!app.isPackaged &&!localDeveloperMenu) {
    template = Menu.buildFromTemplate([
      ...menu.items,
      {
        label: 'Local Developer',
        submenu: [
          {
            click: () => browserOperationsPanelView.webContents.toggleDevTools(),
            label: 'Toggle Browser Shell DevTools',
          },
        ],
      },
    ]);
  }
  Menu.setApplicationMenu(template);
}
