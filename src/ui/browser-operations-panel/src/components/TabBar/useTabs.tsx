import { useEffect, useState } from 'react';
import { Tab } from './types';

export function useTabs(): { tabs: Tab[]; activeTab: Tab } {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    const setInitActiveId = async () => {
      console.log('-- setInitActiveId ----');
      const [tabs, activeTab] = await Promise.all([
        window.electronAPI.getTabs(),
        window.electronAPI.getActiveTab(),
      ]);
      setTabs(tabs || []);
      setActiveTabId(activeTab?.id || '');
    };
    setInitActiveId();

    const destroyOnSetTabs = window.electronAPI.onSetTabs((newTabs) => {
      console.log('-- onSetTabs ----');
      setTabs(() => newTabs);
    });
    const destroyOnSetActiveTabId = window.electronAPI.onSetActiveTabId(
      (newId) => {
        console.log('-- onSetActiveTabId ----');
        setActiveTabId(() => newId);
      }
    );

    return () => {
      destroyOnSetTabs();
      destroyOnSetActiveTabId();
    };
  }, []);

  return {
    tabs,
    activeTab: activeTab || { id: 'error-no-active-tab', url: '', title: 'No active tab' },
  };
}
