import { type Tab, type TabService } from './main/TabService';
import { type Rectangle, type Placement } from './main/popup';

declare global {
  interface Window {
    electronAPI: {
      isMacOS: () => boolean;

      browserNavigateTo: (url: string, tabId?: string) => Promise<void>;
      browserBack: () => Promise<void>;
      browserForward: () => Promise<void>;
      browserReload: () => Promise<void>;

      getTabs: () => Promise<ReturnType<TabService['getTabs']>>;
      setTabs: (value: Tab[]) => Promise<ReturnType<TabService['setTabs']>>;
      onSetTabs: (callback: (value: Tab[]) => void) => () => void;
      getTabById: (id: string) => Promise<ReturnType<TabService['getTabById']>>;
      setTabById: (value: {
        id: string;
        value: Partial<Tab>;
      }) => Promise<ReturnType<TabService['setTabById']>>;
      onSetTabById: (
        callback: (args: { newValue: Tab; oldValue: Tab }) => void
      ) => () => void;
      createTab: (
        value?: Partial<Tab>
      ) => Promise<ReturnType<TabService['createTab']>>;
      deleteTabById: (
        id: string
      ) => Promise<ReturnType<TabService['deleteTabById']>>;
      getActiveTabId: () => Promise<ReturnType<TabService['getActiveTabId']>>;
      setActiveTabId: (
        id: string
      ) => Promise<ReturnType<TabService['setActiveTabId']>>;
      onSetActiveTabId: (callback: (id: string) => void) => () => void;
      getActiveTab: () => Promise<ReturnType<TabService['getActiveTab']>>;
      getOwnTabId: () => string | null;

      openAvatarMenuPopup: (options: {
        anchorRect: Rectangle;
        placement?: Placement;
      }) => Promise<void>;
      closeAvatarMenuPopup: () => Promise<void>;

      getToken: () => Promise<string>;
      setToken: (token: string) => Promise<void>;
      onTokenUpdate: (callback: (token: string) => void) => () => void;
    };
  }
}

export {};
