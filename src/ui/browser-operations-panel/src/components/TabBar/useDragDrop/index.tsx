import { useRef, useState, useEffect } from 'react';

import { moveItem } from './utils';

const TARGET_INDEX_ATTRIBUTE = 'data-drag-drop-index';
const TARGET_DRAGGABLE_ATTRIBUTE = 'data-drag-drop-draggable';

const deepCheckDraggable = (
  target: HTMLElement,
  currentTarget: HTMLElement
) => {
  if (target.getAttribute(TARGET_DRAGGABLE_ATTRIBUTE) === 'false') {
    return false;
  }

  const parent = target.parentNode;
  if (parent && currentTarget !== parent) {
    return deepCheckDraggable(parent as HTMLElement, currentTarget);
  }
  return true;
};

export const useDragDrop = <T,>({ data }: { data: T[] }) => {
  const [dragDropData, setDragDropData] = useState(data);

  const startMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef<HTMLElement>(null);
  const draggingRef = useRef<HTMLElement>(null);

  const swapItem = (event: MouseEvent) => {
    if (!draggingRef.current || !targetRef.current) {
      return;
    }

    const hoveredElement = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    const draggingIdx = draggingRef.current.getAttribute(
      TARGET_INDEX_ATTRIBUTE
    );

    if (!hoveredElement || !draggingIdx) {
      return;
    }

    const itemIdx = parseInt(draggingIdx, 10);
    const draggingTagName = draggingRef.current.tagName.toLowerCase();
    const hoveredTargetNode = hoveredElement.closest(
      `${draggingTagName}[${TARGET_INDEX_ATTRIBUTE}]`
    ) as HTMLElement;
    if (!hoveredTargetNode) {
      return;
    }
    const hoveredTargetIdx = hoveredTargetNode.getAttribute(
      TARGET_INDEX_ATTRIBUTE
    );
    if (!hoveredTargetIdx) {
      return;
    }
    const toIdx = parseInt(hoveredTargetIdx, 10);

    const draggingRect = draggingRef.current.getBoundingClientRect();
    const draggingMiddleX = draggingRect.left + draggingRect.width / 2;
    const hoveredTargetRect = hoveredTargetNode.getBoundingClientRect();
    const hoveredTargetMiddleX =
      hoveredTargetRect.left + hoveredTargetRect.width / 2;
    if (
      draggingRect.left < hoveredTargetMiddleX &&
      draggingMiddleX > hoveredTargetMiddleX
    ) {
      hoveredTargetNode.style.transform = `translateX(+${hoveredTargetRect.width}px)`;
      targetRef.current.style.transform = `translateX(-${hoveredTargetRect.width}px)`;
    } else if (
      draggingRect.right > hoveredTargetMiddleX &&
      draggingMiddleX < hoveredTargetMiddleX
    ) {
      hoveredTargetNode.style.transform = `translateX(-${hoveredTargetRect.width}px)`;
      targetRef.current.style.transform = `translateX(+${hoveredTargetRect.width}px)`;
    }

    if (itemIdx !== toIdx) {
      draggingRef.current.setAttribute(TARGET_INDEX_ATTRIBUTE, `${toIdx}`);
      // setDragDropData((preValues) => moveItem(preValues, itemIdx, toIdx));
    }
  };

  const move = (
    event: MouseEvent,
    options: {
      fixHorizontal?: boolean;
      fixVertical?: boolean;
    } = {}
  ) => {
    if (draggingRef.current) {
      if (event.cancelable) {
        event.preventDefault();
      }

      const newX = event.clientX - startMousePositionRef.current.x;
      const newY = event.clientY - startMousePositionRef.current.y;
      if (options.fixVertical) {
        draggingRef.current.style.transform = `translateY(${newY}px)`;
      }

      if (options.fixHorizontal) {
        draggingRef.current.style.transform = `translateX(${newX}px)`;
      }

      if (!options.fixHorizontal && !options.fixVertical) {
        draggingRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }

      swapItem(event);
    }
  };

  const drop = (event: MouseEvent) => {
    if (!draggingRef.current || !targetRef.current) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    targetRef.current.style.opacity = '';
    targetRef.current.style.pointerEvents = '';
    targetRef.current = null;

    const draggingTagName = draggingRef.current.tagName.toLowerCase();
    document.body
      .querySelector(`${draggingTagName}[drop-pre-container="true"]`)
      ?.remove();
    draggingRef.current.style.pointerEvents = '';
    draggingRef.current = null;
    startMousePositionRef.current = { x: 0, y: 0 };

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', drop);
  };

  const drag =
    (
      options: {
        opacity?: string;
        fixHorizontal?: boolean;
        fixVertical?: boolean;
      } = {}
    ) =>
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const target = event.currentTarget;
      if (
        !deepCheckDraggable(
          event.target as HTMLElement,
          event.currentTarget as HTMLElement
        )
      ) {
        return;
      }
      event.preventDefault();

      const draggingNode = target.cloneNode(true) as HTMLElement;
      draggingNode.style.pointerEvents = 'none';
      draggingNode.setAttribute('drop-pre-container', 'true');
      draggingNode.style.width = `${target.offsetWidth}px`;
      draggingNode.style.position = 'fixed';
      draggingNode.style.touchAction = 'none';
      const targetRect = target.getBoundingClientRect();

      draggingNode.style.left = `${
        event.clientX - (event.clientX - targetRect.left)
      }px`;
      draggingNode.style.top = `${
        event.clientY - (event.clientY - targetRect.top)
      }px`;

      document.body.appendChild(draggingNode);
      draggingRef.current = draggingNode;

      startMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      target.style.opacity = options.opacity || '25%';
      target.style.pointerEvents = 'none';
      targetRef.current = target;

      document.addEventListener('mousemove', (event) =>
        move(event, {
          fixHorizontal: options.fixHorizontal,
          fixVertical: options.fixVertical,
        })
      );
      document.addEventListener('mouseup', drop);
    };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDragDropData(data);
    }, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [data]);

  return {
    drag,
    dragDropData,
  };
};
