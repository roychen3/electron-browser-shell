import { useState, useEffect } from 'react';
import {
  IoArrowBack,
  IoArrowForward,
  IoReload,
} from 'react-icons/io5';

import { TabBar } from './components';

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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="flex flex-col bg-neutral-700">
      {/* Tabs bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        switchTab={switchTab}
        closeTab={closeTab}
        addNewTab={addNewTab}
      />
      {/* Navigation bar */}
      <div className="p-2">
        <div className="flex items-center gap-1">
          {/* Navigation buttons */}
          <button
            className="p-1 rounded-full hover:bg-neutral-600 text-white"
            onClick={() => window.electronAPI.browserBack()}
          >
            <IoArrowBack size={20} />
          </button>
          <button
            className="p-1 rounded-full hover:bg-neutral-600 text-white"
            onClick={() => window.electronAPI.browserForward()}
          >
            <IoArrowForward size={20} />
          </button>
          <button
            className="p-1 rounded-full hover:bg-neutral-600 text-white"
            onClick={() => window.electronAPI.browserReload()}
          >
            <IoReload size={20} />
          </button>

          {/* URL input bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search Google or type a URL"
              className="w-full px-4 py-2 bg-neutral-800 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-neutral-700"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
