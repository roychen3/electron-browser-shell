import { RxAvatar } from 'react-icons/rx';


export default function Avatar() {

  const toggleMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    window.electronAPI.openPopup('avatar-menu', {
      position: { x: rect.left, y: rect.bottom + rect.height },
    });
  };

  return (
    <button
      onClick={toggleMenu}
      className="p-1 rounded-full hover:bg-neutral-600 text-white"
    >
      <RxAvatar className="w-6 h-6" />
    </button>
  );
}
