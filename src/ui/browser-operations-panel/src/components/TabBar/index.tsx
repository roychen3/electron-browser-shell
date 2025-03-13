import { IoAdd } from 'react-icons/io5';

import TabComponent from './Tab';
import styles from './TabBar.module.css';

import type { Tab } from './types';
import { useState } from 'react';

export interface TabBarProps extends React.RefAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTabId: string;
  switchTab?: (id: string) => void;
  closeTab?: (id: string) => void;
  addNewTab?: () => void;
  onDrop?: (draggingIdx: number, dropIdx: number) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  switchTab,
  closeTab,
  addNewTab,
  onDrop,
}: TabBarProps) {
  const isMacOS = window.electronAPI.isMacOS();
  const barPadding = isMacOS ? 'pl-20 pr-10' : 'pl-10 pr-50';
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const [draggingId, setDraggingId] = useState(-1);

  return (
    <div
      className={`flex items-center px-1 pt-1.5 bg-neutral-800 max-w-full ${barPadding} ${styles['electron-draggable']}`}
    >
      <div
        className={`pr-[6px] flex flex-nowrap gap-[6px] min-w-0 overflow-x-hidden ${styles['electron-not-draggable']}`}
      >
        {tabs.map((tab, tabIndex) => {
          const isActive = activeTabId === tab.id;

          const isActivePrev = activeIndex - tabIndex === 1;
          const dividerClasses = isActivePrev
            ? ''
            : 'after:absolute after:right-[-4px] after:top-[50%] after:transform-[translateY(-50%)] after:w-[2px] after:h-[60%] after:bg-neutral-700';

          return (
            <TabComponent
              key={tab.id}
              className={dividerClasses}
              tab={tab}
              isActive={isActive}
              onClose={(id) => closeTab?.(id)}
              onDragStart={() => {
                setDraggingId(tabIndex);
              }}
              onDrop={() => onDrop?.(draggingId, tabIndex)}
              onMouseDown={() => {
                switchTab?.(tab.id);
              }}
            />
          );
        })}
      </div>

      <button
        onClick={addNewTab}
        className={`p-1.5 text-white rounded-full hover:bg-neutral-600 relative ${styles['electron-not-draggable']} `}
      >
        <IoAdd size={16} />
      </button>
    </div>
  );
}
