import { EventEmitter } from 'events';
import type { Tab, TabService } from './interface';

export class TabManager implements TabService {
  private _emitter = new EventEmitter();
  private _tabs: Tab[] = [];
  private _activeTabId: string = '';

  constructor() {}

  getTabs() {
    return this._tabs;
  }

  setTabs(value: Tab[]) {
    this._tabs = value;
    this._emitter.emit('onSetTabs', value);
    return this._tabs;
  }

  onSetTabs(listener: (newTab: Tab[]) => void) {
    this._emitter.on('onSetTabs', listener);
    return () => this._emitter.removeListener('onSetTabs', listener);
  }

  getTabById(id: string) {
    return this._tabs.find((tab) => tab.id === id) || null;
  }

  setTabById(
    id: string,
    value: Partial<Tab>
  ): ReturnType<TabService['setTabById']> {
    let targetTab = this._tabs.find((tab) => tab.id === id);
    if (!targetTab) {
      throw new Error('Target tab not found');
    }
    const oldTab = targetTab;
    const newTab = {
      ...targetTab,
      ...value,
      url: value.url ? new URL(value.url).href : targetTab.url,
    };
    const newTabs = this._tabs.map((tab) => {
      if (tab.id === id) {
        return newTab;
      }
      return tab;
    });

    this.setTabs(newTabs);
    this._emitter.emit('onSetTabById', {
      newValue: newTab,
      oldValue: oldTab,
    });
    return [newTab, newTabs];
  }

  onSetTabById(
    listener: (args: { newValue: Tab; oldValue: Tab | null }) => void
  ) {
    this._emitter.on('onSetTabById', listener);
    return () => this._emitter.removeListener('onSetTabById', listener);
  }

  createTab(value?: Partial<Tab>): ReturnType<TabService['createTab']> {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      ...value,
      url: value?.url ? new URL(value.url).href : '',
    };
    this.setTabs([...this._tabs, newTab]);
    this._emitter.emit('onCreateTab', newTab);
    return [newTab, this._tabs];
  }

  onCreateTab(listener: (newTab: Tab) => void) {
    this._emitter.on('onCreateTab', listener);
    return () => this._emitter.removeListener('onCreateTab', listener);
  }

  deleteTabById(id: string) {
    const newTabs = this._tabs.filter((tab) => tab.id !== id);
    this.setTabs(newTabs);
    this._emitter.emit('onDeleteTabById', id);
    return newTabs;
  }

  onDeleteTabById(listener: (id: string) => void) {
    this._emitter.on('onDeleteTabById', listener);
    return () => this._emitter.removeListener('onDeleteTabById', listener);
  }

  getActiveTabId() {
    return this._activeTabId;
  }

  setActiveTabId(id: string) {
    const prev = this._activeTabId;
    this._activeTabId = id;
    this._emitter.emit('onSetActiveTabId', { newId: id, prevId: prev });
  }

  onSetActiveTabId(
    listener: (args: { newId: string; prevId: string }) => void
  ) {
    this._emitter.on('onSetActiveTabId', listener);
    return () => this._emitter.removeListener('onSetActiveTabId', listener);
  }

  getActiveTab() {
    return this._tabs.find((tab) => tab.id === this._activeTabId) || null;
  }
}
