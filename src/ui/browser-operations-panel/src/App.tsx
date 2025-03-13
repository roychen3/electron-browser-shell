import { useState, useEffect } from 'react';

import { TabBar, NavigationBar, Avatar } from './components';

interface Tab {
  id: string;
  url: string;
  title: string;
}

const moveItem = (arr: Tab[], itemIdx: number, toIdx: number) => {
  const startIdx = 0;
  const endIdx = arr.length - 1;
  const data = [...arr];
  const item = data.splice(itemIdx, 1)[0];

  if (itemIdx === 0 && itemIdx > toIdx) {
    data.splice(endIdx, 0, item);
    return data;
  } else if (itemIdx === endIdx && itemIdx < toIdx) {
    data.splice(startIdx, 0, item);
    return data;
  } else {
    data.splice(toIdx, 0, item);
    return data;
  }
};

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [url, setUrl] = useState('');

  const addNewTab = async () => {
    const data = await window.electronAPI.createTab({
      url: import.meta.env.PROD
        ? 'app://authenticator/sign-in'
        : 'http://localhost:3000/sign-in',
    });
    const [newTab, tabs] = data;
    await window.electronAPI.setActiveTabId(newTab.id);
    setTabs(tabs);
    setActiveTabId(newTab.id);
    setUrl(newTab.url);
  };

  const closeTab = async (tabId: string) => {
    const newTabs = await window.electronAPI.deleteTabById(tabId);

    if (tabId === activeTabId) {
      const newActiveTabId = newTabs[newTabs.length - 1].id;
      await window.electronAPI.setActiveTabId(newActiveTabId);

      const activeTab = tabs.find((tab) => tab.id === newActiveTabId);
      if (!activeTab) {
        throw new Error('Active tab not found');
      }
      setActiveTabId(newActiveTabId);
      setUrl(activeTab.url);
    }
    setTabs(newTabs);
  };

  const switchTab = async (tabId: string) => {
    await window.electronAPI.setActiveTabId(tabId);
    const tab = await window.electronAPI.getTabById(tabId);
    if (!tab) {
      throw new Error('Active tab not found');
    }
    setActiveTabId(tabId);
    setUrl(tab.url);
  };

  const onDrop = (draggingIdx: number, dropIdx: number) => {
    const newTabs = moveItem(tabs, draggingIdx, dropIdx)
    setTabs(newTabs)
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
      await window.electronAPI.browserNavigateTo(urlToNavigate);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    const setInitActiveId = async () => {
      console.log('-- setInitActiveId ----');
      const [tabs, activeTab] = await Promise.all([
        window.electronAPI.getTabs(),
        window.electronAPI.getActiveTab(),
      ]);
      setTabs(tabs || []);
      setActiveTabId(activeTab?.id || '');
      setUrl(activeTab?.url || '');
    };
    setInitActiveId();

    const destroyOnUpdateTabById = window.electronAPI.onUpdateTabById(
      ({ newValue }) => {
        console.log('-- onUpdateTabById ----');
        setTabs((prevTabs) => {
          return prevTabs.map((tab) =>
            tab.id === newValue.id ? newValue : tab
          );
        });
        setUrl(newValue.url);
      }
    );

    return () => {
      destroyOnUpdateTabById();
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
        onDrop={onDrop}
      />
      <div className="flex items-center pr-2">
        <NavigationBar
          className="flex-1"
          value={url}
          onUrlChange={handleUrlChange}
          onSubmit={handleUrlSubmit}
        />
        <Avatar />
      </div>
    </div>
  );
}

export default App;
