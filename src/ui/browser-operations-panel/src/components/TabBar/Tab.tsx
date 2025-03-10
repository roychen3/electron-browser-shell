import { useEffect, useRef, useState, forwardRef } from 'react';
import { IoClose } from 'react-icons/io5';

export interface Tab {
  id: string;
  url: string;
  title: string;
}

export interface TabProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  tab: Tab;
  isActive: boolean;
  onClick?: (id: string) => void;
  onClose?: (id: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

const Tab = forwardRef<HTMLDivElement, TabProps>(
  ({ tab, isActive, onClick, onClose, className, ...props }, ref) => {
    const colorClasses = isActive
      ? 'bg-neutral-700 text-white after:hidden'
      : 'text-gray-400 hover:bg-neutral-900';

    const innerRef = useRef<HTMLDivElement>(null);
    const [showCloseWithSize, setShowCloseWithSize] = useState(false);

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
        {...props}
      >
        <div className={`flex items-center overflow-hidden`}>
          <span className={`flex-1 text-sm text-nowrap overflow-hidden`}>
            {tab.title || 'New Tab'}
          </span>
          {(isActive || showCloseWithSize) && (
            <button
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

export default Tab;
