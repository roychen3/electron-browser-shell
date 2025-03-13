import { useEffect, useState } from 'react';

import { TabBar, NavigationBar, Avatar } from './components';
import { useTabs } from './components/TabBar/useTabs';
import { Tab } from './components/TabBar/types';

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
  const { tabs, activeTab } = useTabs();
  const [url, setUrl] = useState('');

  const addNewTab = async () => {
    const data = await window.electronAPI.createTab({
      url: import.meta.env.PROD
        ? 'app://authenticator/sign-in'
        : 'http://localhost:3000/sign-in',
    });
    const [newTab] = data;
    await window.electronAPI.setActiveTabId(newTab.id);
    setUrl(newTab.url);
  };

  const closeTab = async (tabId: string) => {
    const newTabs = await window.electronAPI.deleteTabById(tabId);

    if (tabId === activeTab.id) {
      const newActiveTabId = newTabs[newTabs.length - 1].id;
      await window.electronAPI.setActiveTabId(newActiveTabId);

      const activeTab = tabs.find((tab) => tab.id === newActiveTabId);
      if (!activeTab) {
        throw new Error('Active tab not found');
      }
      setUrl(activeTab.url);
    }
  };

  const switchTab = async (tabId: string) => {
    await window.electronAPI.setActiveTabId(tabId);
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      throw new Error('Active tab not found');
    }
    setUrl(tab.url);
  };

  const onDrop = async (draggingIdx: number, dropIdx: number) => {
    const newTabs = moveItem(tabs, draggingIdx, dropIdx);
    await window.electronAPI.setTabs(newTabs);
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
    const initUrl = async () => {
      const tab = await window.electronAPI.getActiveTab();
      setUrl(() => tab?.url || '');
    };
    initUrl();
  }, []);
  useEffect(() => {
    const destroyOnUpdateTabById = window.electronAPI.onSetTabById(
      ({ newValue }) => {
        console.log('-- onSetTabById ----');
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
        activeTabId={activeTab.id}
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
