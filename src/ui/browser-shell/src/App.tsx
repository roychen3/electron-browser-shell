import { useState, useEffect } from 'react';

import { TabBar, NavigationBar } from './components';

interface Tab {
  id: string;
  url: string;
  title: string;
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [url, setUrl] = useState('');

  const addNewTab = async () => {
    const { data } = await window.electronAPI.createTab({
      url: import.meta.env.PROD
        ? 'app://authenticator/?pathname=/feature-one'
        : 'http://localhost:3010/feature-one',
    });
    if (!data) {
      throw new Error('New tab occurred error');
    }

    const [newTab, tabs] = data;
    await window.electronAPI.setActiveTabId(newTab.id);
    setTabs(tabs);
    setActiveTabId(newTab.id);
    setUrl(newTab.url);
  };

  const closeTab = async (tabId: string) => {
    const { data: newTabs } = await window.electronAPI.deleteTabById(tabId);
    if (!newTabs) {
      throw new Error('Close tabs occurred error');
    }
    setTabs(newTabs);

    if (tabId === activeTabId) {
      const newActiveTabId = newTabs[newTabs.length - 1].id;
      await window.electronAPI.setActiveTabId(newActiveTabId);
      setActiveTabId(newActiveTabId);

      const activeTab = tabs.find((tab) => tab.id === newActiveTabId);
      if (!activeTab) {
        throw new Error('Active tab not found');
      }
      setUrl(activeTab.url);
    }
  };

  const switchTab = async (tabId: string) => {
    await window.electronAPI.setActiveTabId(tabId);
    const { data: tab } = await window.electronAPI.getTabById(tabId);
    if (!tab) {
      throw new Error('Active tab not found');
    }
    setActiveTabId(tabId);
    setUrl(tab.url);
  };

  const handleUrlChange = (url: string) => {
    setUrl(url);
  };

  const handleUrlSubmit = async (submitUrl: string) => {
    try {
      // Ensure URL has protocol
      const formattedUrl = (str: string) => {
        if (str.startsWith('http')) return str;
        if (str.startsWith('file:')) return str;
        if (str.startsWith('app:')) return str;
        return `https://${str}`;
      };
      const urlToNavigate = formattedUrl(submitUrl);
      const [{ data: updateResultData }] = await Promise.all([
        window.electronAPI.updateTabById({
          id: activeTabId,
          value: {
            url: urlToNavigate,
          },
        }),
        window.electronAPI.browserNavigateTo(urlToNavigate),
      ]);
      if (!updateResultData) {
        throw new Error('Update tab URL occurred error');
      }

      const [, tabs] = updateResultData;
      setTabs(tabs);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    const setInitActiveId = async () => {
      console.log('-- setInitActiveId ----');
      const [{ data: tabs }, { data: activeTab }] = await Promise.all([
        window.electronAPI.getTabs(),
        window.electronAPI.getActiveTab(),
      ]);
      setTabs(tabs || []);
      setActiveTabId(activeTab?.id || '');
      setUrl(activeTab?.url || '');
    };
    setInitActiveId();

    const destroyOnUrlUpdate = window.electronAPI.onUrlUpdate((url) => {
      setUrl(url);
    });

    return () => {
      destroyOnUrlUpdate();
    };
  }, []);

  return (
    <div className="flex flex-col bg-neutral-700">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        switchTab={switchTab}
        closeTab={closeTab}
        addNewTab={addNewTab}
      />
      <NavigationBar
        value={url}
        onUrlChange={handleUrlChange}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
}

export default App;
