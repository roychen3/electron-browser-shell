import { useState } from 'react';
import { IoArrowBack, IoArrowForward, IoReload } from 'react-icons/io5';

export interface NavigationBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onSubmit'> {
  value?: string;
  onUrlChange?: (url: string) => void;
  onSubmit?: (url: string) => void;
}
export default function NavigationBar({
  value,
  onUrlChange: onUrlChangeProps,
  onSubmit: onSubmitProps,
  ...props
}: NavigationBarProps) {
  const [innerUrl, setInnerUrl] = useState(value || '');
  const url = value || innerUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProps?.(url);
  };
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInnerUrl?.(newValue);
    onUrlChangeProps?.(newValue);
  };

  return (
    <div {...props} className={`p-2 ${props.className}`}>
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
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Search Google or type a URL"
            className="w-full px-4 py-2 bg-neutral-800 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-neutral-700"
          />
        </form>
      </div>
    </div>
  );
}
