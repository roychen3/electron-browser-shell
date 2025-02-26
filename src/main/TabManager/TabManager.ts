import { EventEmitter } from 'events';
import type { Tab, TabService } from './types.js';

export class TabManager implements TabService {
  private _emitter = new EventEmitter();
  private _tabs: Tab[] = [];
  private _activeTabId: string = '';

  constructor() {}

  getTabs() {
    return this._tabs;
  }

  getTabById(id: string) {
    return this._tabs.find((tab) => tab.id === id) || null;
  }

  createTab(value?: Partial<Tab>): ReturnType<TabService['createTab']> {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      ...value,
      url: value?.url ? new URL(value.url).href : '',
    };
    this._emitter.emit('onCreateTab', newTab);

    this._tabs.push(newTab);
    return [newTab, this._tabs];
  }

  onCreateTab(listener: (newTab: Tab) => void) {
    this._emitter.on('onCreateTab', listener);
    return () => this._emitter.removeListener('onCreateTab', listener);
  }

  updateTabById(
    id: string,
    value: Partial<Tab>
  ): ReturnType<TabService['updateTabById']> {
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
    this._emitter.emit('onUpdateTabById', {
      newValue: newTab,
      oldValue: oldTab,
    });

    this._tabs = newTabs;
    return [newTab, newTabs];
  }

  onUpdateTabById(
    listener: (args: { newValue: Tab; oldValue: Tab | null }) => void
  ) {
    this._emitter.on('onUpdateTabById', listener);
    return () => this._emitter.removeListener('onUpdateTabById', listener);
  }

  deleteTabById(id: string) {
    const newTabs = this._tabs.filter((tab) => tab.id !== id);
    this._emitter.emit('onDeleteTabById', id);

    this._tabs = newTabs;
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
    this._emitter.emit('onSetActiveTabId', { newId: id, prevId: prev });

    this._activeTabId = id;
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
