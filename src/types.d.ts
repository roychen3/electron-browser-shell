import { type Tab, type TabService } from './main/TabManager';

declare global {
  interface Window {
    electronAPI: {
      onUrlUpdate: (callback: (url: string) => void) => () => void;
      browserNavigateTo: (url: string) => Promise<void>;
      browserBack: () => Promise<void>;
      browserForward: () => Promise<void>;
      browserReload: () => Promise<void>;

      getTabs: () => Promise<ReturnType<TabService['getTabs']>>;
      getTabById: (id: string) => Promise<ReturnType<TabService['getTabById']>>;
      createTab: (
        value?: Partial<Tab>
      ) => Promise<ReturnType<TabService['createTab']>>;
      updateTabById: (value: {
        id: string;
        value: Partial<Tab>;
      }) => Promise<ReturnType<TabService['updateTabById']>>;
      deleteTabById: (
        id: string
      ) => Promise<ReturnType<TabService['deleteTabById']>>;
      getActiveTabId: () => Promise<ReturnType<TabService['getActiveTabId']>>;
      setActiveTabId: (
        id: string
      ) => Promise<ReturnType<TabService['setActiveTabId']>>;
      getActiveTab: () => Promise<ReturnType<TabService['getActiveTab']>>;
      getOwnTabId: () => string | null;

      openPopup: (
        type: string,
        options?: Partial<{
          size: { width: number; height: number };
          position: { x: number; y: number };
          placement:
            | 'left'
            | 'leftTop'
            | 'leftBottom'
            | 'right'
            | 'rightTop'
            | 'rightBottom'
            | 'top'
            | 'topLeft'
            | 'topRight'
            | 'bottom'
            | 'bottomLeft'
            | 'bottomRight';
        }>
      ) => Promise<void>;
      closePopup: (type: string) => Promise<void>;
    };
  }
}

export {};
