import { IoAdd, IoClose } from 'react-icons/io5';

import styles from './TabBar.module.css';

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
  const isMacOS = window.electronAPI.isMacOS();
  const barPadding = isMacOS ? 'pl-20 pr-10' : 'pl-10 pr-50';
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

  return (
    <div
      className={`flex items-center px-1 pt-1 bg-neutral-800 max-w-full ${barPadding} ${styles['electron-draggable']}`}
    >
      <div className={`pr-[6px] flex flex-nowrap gap-[6px] min-w-0 overflow-x-hidden ${styles['electron-not-draggable']}`}>
        {tabs.map((tab, tabIndex) => {
          const isActive = activeTabId === tab.id;
          const colorClasses = isActive
            ? 'bg-neutral-700 text-white after:hidden'
            : 'text-gray-400 hover:bg-neutral-900';

          const titleOverflowClasses = isActive ? 'overflow-hidden' : '';

          const isActivePrev = activeIndex - tabIndex === 1;
          const dividerClasses = isActivePrev
            ? ''
            : 'after:absolute after:right-[-4px] after:top-[50%] after:transform-[translateY(-50%)] after:w-[2px] after:h-[60%] after:bg-neutral-700';

          return (
            <div
              key={tab.id}
              onClick={() => switchTab?.(tab.id)}
              className={`group relative min-w-[34px] max-w-[200px] w-[200px] px-2 py-1 rounded-t-lg select-none ${colorClasses} ${dividerClasses}`}
            >
              <div className={`flex items-center overflow-hidden`}>
                <span
                  className={`flex-1 text-sm text-nowrap ${titleOverflowClasses}`}
                >
                  {tab.title || 'New Tab'}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab?.(tab.id);
                  }}
                  className={`p-0.5 rounded-full hover:bg-neutral-600`}
                >
                  <IoClose size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addNewTab}
        className={`p-1 text-white rounded-full hover:bg-neutral-600 relative ${styles['electron-not-draggable']} `}
      >
        <IoAdd size={14} />
      </button>
    </div>
  );
}
