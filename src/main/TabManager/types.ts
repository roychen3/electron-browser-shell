export interface Tab {
  id: string;
  url: string;
  title: string;
}

export interface ITabManager {
  getTabs(): Tab[];
  getTabById(id: string): Tab | null;
  createTab(value?: Partial<Tab>): [Tab, Tab[]];
  updateTabById(id: string, value: Partial<Tab>): [Tab, Tab[]];
  deleteTabById(id: string): Tab[];
  getActiveTabId(): string;
  setActiveTabId(id: string): void;
  getActiveTab(): Tab | null;
}