import { useState, useEffect } from 'react';

import { TabBar, NavigationBar } from './components';

interface Tab {
  id: string;
  url: string;
  title: string;
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: '', title: 'New Tab' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [url, setUrl] = useState('');

  const addNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      url: '',
      title: 'New Tab',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrl('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      addNewTab();
    }
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setUrl(newTabs[newTabs.length - 1].url);
    }
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setUrl(tab.url);
    }
  };

  const handleUrlSubmit = async () => {
    try {
      // Ensure URL has protocol
      const formattedUrl = (str: string) => {
        if (str.startsWith('http')) return str;
        if (str.startsWith('file:')) return str;
        if (str.startsWith('app:')) return str;
        return `https://${str}`;
      };
      const urlToNavigate = formattedUrl(url);
      const result = await window.electronAPI.navigateUrl(urlToNavigate);
      if (result.success) {
        // Update the current tab's URL and title
        setTabs(
          tabs.map((tab) =>
            tab.id === activeTabId
              ? { ...tab, url: urlToNavigate, title: urlToNavigate }
              : tab
          )
        );
      } else {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useEffect(() => {
    // Get initial URL
    window.electronAPI.getCurrentUrl().then((url) => {
      setUrl(url);
    });

    // Subscribe to URL updates
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
        onUrlChange={setUrl}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
}

export default App;
