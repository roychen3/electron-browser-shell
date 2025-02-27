import { useState } from 'react';
import { RxAvatar } from 'react-icons/rx';

export interface AvatarProps {
  onSignIn?: () => void;
  onSignOut?: () => void;
}
export default function Avatar({ onSignIn, onSignOut }: AvatarProps) {
  const [isOpen] = useState(false);

  const toggleMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    window.electronAPI.openPopup('avatar-menu', {
      position: { x: rect.left, y: rect.bottom + rect.height },
    });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-1 rounded-full hover:bg-neutral-600 text-white"
      >
        <RxAvatar className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={onSignIn}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign In
            </button>
            <button
              onClick={onSignOut}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
