import { useEffect, useRef, useState, forwardRef } from 'react';
import { IoClose } from 'react-icons/io5';

import type { Tab } from './types';

export interface TabProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onClick' | 'onDragStart' | 'onDrop'
  > {
  tab: Tab;
  isActive: boolean;
  onClick?: (id: string) => void;
  onClose?: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDrop?: (id: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const TabComponent = forwardRef<HTMLDivElement, TabProps>(
  (
    {
      tab,
      isActive,
      onClick,
      onClose,
      onDragStart,
      onDrop,
      className,
      ...props
    },
    ref
  ) => {
    const colorClasses = isActive
      ? 'bg-neutral-700 text-white after:hidden'
      : 'text-gray-400 hover:bg-neutral-900';

    const innerRef = useRef<HTMLDivElement>(null);
    const [showCloseWithSize, setShowCloseWithSize] = useState(false);

    const handleDragStart = () => {
      if (!innerRef.current) {
        return;
      }
      onDragStart?.(tab.id);
      setTimeout(() => {
        innerRef.current!.style.visibility = 'hidden';
      });
    };
    const handleDragEnd = () => {
      if (!innerRef.current) {
        return;
      }
      innerRef.current.style.visibility = 'visible';
    };
    const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
    };
    const handleDragDrop = (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      onDrop?.(tab.id);
    };

    useEffect(() => {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width < 70) {
            setShowCloseWithSize(false);
          } else {
            setShowCloseWithSize(true);
          }
        }
      });

      if (innerRef.current) {
        observer.observe(innerRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        onClick={() => onClick?.(tab.id)}
        className={[
          'group relative min-w-[34px] max-w-[200px] w-[200px] px-2 py-1.5 rounded-t-lg select-none',
          colorClasses,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDragDrop}
        {...props}
      >
        <div className={`flex items-center overflow-hidden`}>
          <div className={`flex-1 flex items-center gap-2 overflow-hidden`}>
            <div className="shrink-0">
              <img className="size-[18px]" src={tab.favicon} />
            </div>
            <span className={`text-sm text-nowrap`}>
              {tab.title || 'New Tab'}
            </span>
          </div>

          {(isActive || showCloseWithSize) && (
            <button
              draggable={false}
              onMouseDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onClose?.(tab.id);
              }}
              className="p-0.5 rounded-full hover:bg-neutral-600"
            >
              <IoClose size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default TabComponent;
