import { useState, useEffect } from 'react';
import { IoArrowBack, IoArrowForward, IoReload } from 'react-icons/io5';

function App() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Get initial URL
    window.electronAPI.getCurrentUrl().then(setUrl);

    // Subscribe to URL updates
    window.electronAPI.onUrlUpdate(setUrl);
  }, []);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure URL has protocol
      const urlToNavigate = url.startsWith('http') ? url : `https://${url}`;
      const result = await window.electronAPI.navigateUrl(urlToNavigate);
      if (!result.success) {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="h-full bg-gray-100">
      <div className="p-2 bg-neutral-700">
        <div className="flex items-center gap-2">
          {/* Navigation buttons */}
          <button 
            className="p-2 rounded-full hover:bg-neutral-600 text-white"
            onClick={() => window.electronAPI.browserBack()}
          >
            <IoArrowBack size={20} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-neutral-600 text-white"
            onClick={() => window.electronAPI.browserForward()}
          >
            <IoArrowForward size={20} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-neutral-600 text-white"
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
              className="w-full px-4 py-2 bg-neutral-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-neutral-700"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
