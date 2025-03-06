import type { Rectangle, Placement } from './interface';

type Position = Pick<Rectangle, 'x' | 'y'>;
type Size = Pick<Rectangle, 'width' | 'height'>;
export const calculatePopupPosition = ({
  parentPosition,
  popupSize,
  anchorRect,
  placement,
}: {
  parentPosition: Position;
  popupSize: Size;
  anchorRect: Rectangle;
  placement: Placement;
}): Position => {
  const parentX = parentPosition.x;
  const parentY = parentPosition.y;

  const popupWidth = popupSize.width;
  const popupHeight = popupSize.height;

  const anchorX = anchorRect.x;
  const anchorY = anchorRect.y;
  const anchorWidth = anchorRect.width;
  const anchorHeight = anchorRect.height;

  const leftX = parentX + anchorX - popupWidth;
  const rightX = parentX + anchorX + anchorWidth;

  const startX = parentX + anchorX;
  const middleX = parentX + anchorX + anchorWidth / 2 - popupWidth / 2;
  const endX = parentX + anchorX + anchorWidth - popupWidth;

  const topY = parentY + anchorY - popupHeight;
  const bottomY = parentY + anchorY + anchorHeight;

  const startY = parentY + anchorY;
  const middleY = parentY + anchorY + anchorHeight / 2 - popupHeight / 2;
  const endY = parentY + anchorY + anchorHeight - popupHeight;

  switch (placement) {
    case 'leftTop':
      return {
        x: leftX,
        y: startY,
      };
    case 'left':
      return {
        x: leftX,
        y: middleY,
      };
    case 'leftBottom':
      return {
        x: leftX,
        y: endY,
      };

    case 'rightTop':
      return {
        x: rightX,
        y: startY,
      };
    case 'right':
      return {
        x: rightX,
        y: middleY,
      };
    case 'rightBottom':
      return {
        x: rightX,
        y: endY,
      };

    case 'topLeft':
      return {
        x: startX,
        y: topY,
      };
    case 'top':
      return {
        x: middleX,
        y: topY,
      };
    case 'topRight':
      return {
        x: endX,
        y: topY,
      };

    case 'bottomLeft':
      return {
        x: startX,
        y: bottomY,
      };
    case 'bottom':
      return {
        x: middleX,
        y: bottomY,
      };
    case 'bottomRight':
      return {
        x: endX,
        y: bottomY,
      };
  }
};
