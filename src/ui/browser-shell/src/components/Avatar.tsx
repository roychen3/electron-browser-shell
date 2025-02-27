import { RxAvatar } from 'react-icons/rx';

export default function Avatar() {
  const toggleMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    window.electronAPI.openPopup('avatar-menu', {
      // left
      // position: { x: rect.left, y: rect.top + rect.height },
      // placement: 'leftTop',
      // position: { x: rect.left, y: rect.top + rect.height + rect.height / 2 },
      // placement: 'left',
      // position: { x: rect.left, y: rect.top + rect.height + rect.height },
      // placement: 'leftBottom',

      // top
      // position: { x: rect.left, y: rect.top + rect.height },
      // placement: 'topLeft',
      // position: { x: rect.left + rect.width / 2, y: rect.top + rect.height },
      // placement: 'top',
      // position: { x: rect.left + rect.width, y: rect.top + rect.height },
      // placement: 'topRight',

      // right
      // position: { x: rect.right, y: rect.top + rect.height },
      // placement: 'rightTop',
      // position: { x: rect.right, y: rect.top + rect.height + rect.height / 2 },
      // placement: 'right',
      // position: { x: rect.right, y: rect.top + rect.height + rect.height },
      // placement: 'rightBottom',

      // bottom
      // position: { x: rect.left, y: rect.bottom + rect.height },
      // placement: 'bottomLeft',
      // position: { x: rect.left + rect.width / 2, y: rect.bottom + rect.height },
      // placement: 'bottom',
      position: { x: rect.left + rect.width, y: rect.bottom + rect.height },
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
