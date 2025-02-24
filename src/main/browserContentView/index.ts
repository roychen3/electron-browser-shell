import { WebContentsView } from "electron";
import { getBrowserOperatorPreloadPath } from "../pathResolver";
import { setupAppRouterIPC } from "../ipc";
import { RouterManager } from "../RouterManager";

export const createBrowserContentView = ({
  routerManager,
  browserShellView,
}: {
  routerManager: RouterManager;
  browserShellView: WebContentsView;
}): WebContentsView => {
  const instance = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getBrowserOperatorPreloadPath(),
    },
  });

  setupAppRouterIPC(instance);


  const handleUpdateUrl = async (url: string) => {
    const prevUrl = routerManager.url;
    routerManager.setUrl(url);
    const sendUrl = routerManager.url;
    if (prevUrl !== sendUrl) {
      browserShellView.webContents.send('update-url', url);
      instance.webContents.send('update-url', url);
    }
  };
  // Subscribe to browser content view's navigation events
  instance.webContents.on('did-navigate', (_event, url) => {
    console.log(('------ did-navigate ------'))
    handleUpdateUrl(url);
  });

  instance.webContents.on('did-navigate-in-page', (_event, url) => {
    console.log(('------ did-navigate-in-page ------'))
    handleUpdateUrl(url);
  });

  return instance;
}