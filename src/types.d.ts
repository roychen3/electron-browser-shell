import { type Tab, type ITabManager } from './main/TabManager';

type Result<T> = Promise<{ success: boolean; data?: T; error?: string }>;

declare global {
  interface Window {
    electronAPI: {
      onUrlUpdate: (callback: (url: string) => void) => () => void;
      browserNavigateTo: (url: string) => Result<void>;
      browserBack: () => Result<boolean>;
      browserForward: () => Result<boolean>;
      browserReload: () => Result<boolean>;

      getTabs: () => Result<ReturnType<ITabManager['getTabs']>>;
      getTabById: (id: string) => Result<ReturnType<ITabManager['getTabById']>>;
      createTab: (value?: Partial<Tab>) => Result<ReturnType<ITabManager['createTab']>>;
      updateTabById: (value: {
        id: string;
        value: Partial<Tab>;
      }) => Result<ReturnType<ITabManager['updateTabById']>>;
      deleteTabById: (id: string) => Result<ReturnType<ITabManager['deleteTabById']>>;
      getActiveTabId: () => Result<ReturnType<ITabManager['getActiveTabId']>>;
      setActiveTabId: (id: string) => Result<ReturnType<ITabManager['setActiveTabId']>>;
      getActiveTab: () => Result<ReturnType<ITabManager['getActiveTab']>>;

      getOwnTabId: () => Result<string>;
    };
  }
}

export {};
