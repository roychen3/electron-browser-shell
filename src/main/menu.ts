import { Menu, app } from 'electron';

export function createApplicationMenu({
  onNewTab,
  onToggleDeveloperTools,
  onToggleBrowserOperationsPanelDevTools,
}: {
  onNewTab: () => void;
  onToggleDeveloperTools: () => void;
  onToggleBrowserOperationsPanelDevTools: () => void;
}) {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  const viewMenu = menu.items.find((item) => item.label === 'View');
  if (!viewMenu?.submenu) return;

  const devToolsItem = viewMenu.submenu.items.find(
    (item) => item.label === 'Toggle Developer Tools'
  );
  if (devToolsItem) {
    devToolsItem.click = onToggleDeveloperTools;
  }

  let template = Menu.buildFromTemplate(menu.items);

  const fileMenu = menu.items.find((item) => item.label === 'File');
  const NEW_TAB_LABEL = 'New tab';
  if (!fileMenu) {
    template = Menu.buildFromTemplate([
      ...menu.items,
      {
        label: 'File',
        submenu: [
          {
            click: onNewTab,
            label: NEW_TAB_LABEL,
            accelerator: 'CmdOrCtrl+N',
          },
        ],
      },
    ]);
  } else if (fileMenu.submenu) {
    const newTabItem = fileMenu.submenu.items.find(
      (item) => item.label === NEW_TAB_LABEL
    );
    if (newTabItem) {
      newTabItem.click = onNewTab;
    } else {
      template = Menu.buildFromTemplate([
        ...menu.items.filter((item) => item.label !== 'File'), // 先移除舊的 File 選單
        {
          label: 'File',
          submenu: Menu.buildFromTemplate([
            ...fileMenu.submenu.items,
            {
              click: onNewTab,
              label: NEW_TAB_LABEL,
              accelerator: 'CmdOrCtrl+N',
            },
          ]),
        },
      ]);
    }
  }

  // 處理 Local Developer 選單
  const localDeveloperMenu = menu.items.find(
    (item) => item.label === 'Local Developer'
  );
  const TOGGLE_BROWSER_OPERATIONS_PANEL_DEVTOOLS_LABEL =
    'Toggle Browser Operations Panel DevTools';

  if (!localDeveloperMenu) {
    template = Menu.buildFromTemplate([
      ...template.items,
      {
        visible: !app.isPackaged,
        label: 'Local Developer',
        submenu: [
          {
            click: onToggleBrowserOperationsPanelDevTools,
            label: TOGGLE_BROWSER_OPERATIONS_PANEL_DEVTOOLS_LABEL,
            accelerator: 'CmdOrCtrl+Shift+P',
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
      toggleBrowserOperationsPanelDevToolsItem.click =
        onToggleBrowserOperationsPanelDevTools;
    }
  }

  // 設定新的應用程式選單
  Menu.setApplicationMenu(template);
}
