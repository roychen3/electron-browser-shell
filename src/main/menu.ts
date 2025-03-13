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
  const TOGGLE_BROWSER_OPERATIONS_PANEL_DEVTOOLS_LABEL =
    'Toggle Browser Operations Panel DevTools';
  if (!localDeveloperMenu) {
    template = Menu.buildFromTemplate([
      ...menu.items,
      {
        visible: !app.isPackaged,
        label: 'Local Developer',
        submenu: [
          {
            click: () =>
              browserOperationsPanelView.webContents.toggleDevTools(),
            label: TOGGLE_BROWSER_OPERATIONS_PANEL_DEVTOOLS_LABEL,
            accelerator: 'CmdOrCtrl+Shift+p',
          },
        ],
      },
    ]);
  } else if (localDeveloperMenu.submenu) {
    const toggleBrowserOperationsPanelDevToolsItem =
      localDeveloperMenu.submenu.items.find(
        (item) => item.label === TOGGLE_BROWSER_OPERATIONS_PANEL_DEVTOOLS_LABEL
      );
    if (toggleBrowserOperationsPanelDevToolsItem) {
      toggleBrowserOperationsPanelDevToolsItem.click = () =>
        browserOperationsPanelView.webContents.toggleDevTools();
    }
  }
  Menu.setApplicationMenu(template);
}
