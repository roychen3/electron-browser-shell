import { WebContentsView } from 'electron';
import { getBrowserOperatorPreloadPath } from '../pathResolver';
import { TabManager } from '../TabManager';

export const createBrowserContentView = ({
  tabId,
  tabManager,
  browserShellView,
}: {
  tabId: string;
  tabManager: TabManager;
  browserShellView: WebContentsView;
}): WebContentsView => {
  const instance = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getBrowserOperatorPreloadPath(),
      additionalArguments: [`--tab-id=${tabId}`],
    },
  });

  const handleUpdateUrl = async (url: string) => {
    const tab = tabManager.getTabs().find((tab) => tab.id === tabId);
    if (!tab) {
      throw new Error('Tab not found');
    }

    const prevUrl = tab.url;
    tabManager.updateTabById(tabId, { url });
    if (prevUrl !== url) {
      browserShellView.webContents.send('update-url', url);
      instance.webContents.send('update-url', url);
    }
  };
  // Subscribe to browser content view's navigation events
  instance.webContents.on('did-navigate', (_event, url) => {
    console.log('-- did-navigate ----');
    handleUpdateUrl(url);
  });

  instance.webContents.on('did-navigate-in-page', (_event, url) => {
    console.log('-- did-navigate-in-page ----');
    handleUpdateUrl(url);
  });

  return instance;
};
