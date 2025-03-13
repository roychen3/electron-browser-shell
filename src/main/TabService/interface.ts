export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

export interface TabService {
  getTabs(): Tab[];
  updateTabs(value: Tab[]): Tab[];
  onUpdateTabs(listener: (newTab: Tab[]) => void): () => void;
  getTabById(id: string): Tab | null;
  createTab(value?: Partial<Tab>): [Tab, Tab[]];
  onCreateTab(listener: (newTab: Tab) => void): () => void;
  updateTabById(id: string, value: Partial<Tab>): [Tab, Tab[]];
  onUpdateTabById(
    listener: (args: { newValue: Tab; oldValue: Tab | null }) => void
  ): () => void;
  deleteTabById(id: string): Tab[];
  onDeleteTabById(listener: (id: string) => void): () => void;
  getActiveTabId(): string;
  setActiveTabId(id: string): void;
  onSetActiveTabId(
    listener: (args: { newId: string; prevId: string }) => void
  ): () => void;
  getActiveTab(): Tab | null;
}
