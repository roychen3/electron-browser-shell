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
      updateTabs: (
        value: Tab[]
      ) => Promise<ReturnType<TabService['updateTabs']>>;
      onUpdateTabs: (callback: (value: Tab[]) => void) => () => void;
      getTabById: (id: string) => Promise<ReturnType<TabService['getTabById']>>;
      createTab: (
        value?: Partial<Tab>
      ) => Promise<ReturnType<TabService['createTab']>>;
      updateTabById: (value: {
        id: string;
        value: Partial<Tab>;
      }) => Promise<ReturnType<TabService['updateTabById']>>;
      onUpdateTabById: (
        callback: (args: { newValue: Tab; oldValue: Tab }) => void
      ) => () => void;
      deleteTabById: (
        id: string
      ) => Promise<ReturnType<TabService['deleteTabById']>>;
      getActiveTabId: () => Promise<ReturnType<TabService['getActiveTabId']>>;
      setActiveTabId: (
        id: string
      ) => Promise<ReturnType<TabService['setActiveTabId']>>;
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
