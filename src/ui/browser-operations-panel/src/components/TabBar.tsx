import { IoAdd, IoClose } from 'react-icons/io5';

export interface Tab {
  id: string;
  url: string;
  title: string;
}

export interface TabBarProps extends React.RefAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTabId: string;
  switchTab?: (id: string) => void;
  closeTab?: (id: string) => void;
  addNewTab?: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  switchTab,
  closeTab,
  addNewTab,
}: TabBarProps) {
  return (
    <div className="flex items-center px-1 pt-1 bg-neutral-800 max-w-full">
      <div className="flex flex-nowrap min-w-0 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => switchTab?.(tab.id)}
            className={`group flex items-center min-w-[100px] max-w-[200px] w-[200px] px-4 py-1 mr-1 rounded-t-lg cursor-pointer ${
              activeTabId === tab.id
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-900 text-gray-400 hover:bg-neutral-800'
            }`}
          >
            <span className="flex-1 truncate text-sm">
              {tab.title || 'New Tab'}
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                closeTab?.(tab.id);
              }}
              className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-600"
            >
              <IoClose size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addNewTab}
        className="p-1 text-white rounded-full hover:bg-neutral-600"
      >
        <IoAdd size={20} />
      </button>
    </div>
  );
}
