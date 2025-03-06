import { RxAvatar } from 'react-icons/rx';

export default function Avatar() {
  const toggleMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    window.electronAPI.openAvatarMenuPopup({
      anchorRect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      placement: 'bottomRight',
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
