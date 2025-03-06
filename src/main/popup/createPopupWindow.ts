import { BrowserWindow } from 'electron';

import { getBrowserOperatorPreloadPath } from '../pathResolver';

import { calculatePopupPosition } from './utils';
import type { Rectangle, Placement } from './interface';

export function createPopupWindow({
  parent,
  anchorRect,
  placement = 'left',
}: {
  parent: BrowserWindow;
  anchorRect: Rectangle;
  placement?: Placement;
}) {
  const popupWindow = new BrowserWindow({
    parent,
    show: false,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: getBrowserOperatorPreloadPath(),
      enablePreferredSizeMode: true,
    },
  });

  popupWindow.webContents.once('preferred-size-changed', async () => {
    console.log('---- popupWindow once [preferred-size-changed] ------');

    // NOTE! 如果要把視窗最上方做的跟 chrome 一樣的話，可能要改用 `getBounds`。
    const parentBounds = parent.getContentBounds();
    const popupSize = await popupWindow.webContents.executeJavaScript(
      `(${async () => {
        // wait for SPA page render
        await new Promise((resolve) => {
          setInterval(() => {
            const elementCount =
              document.body.querySelectorAll('*:not(script)').length;
            // If it is an SPA page, the number of elements should be at least more than the root.
            if (elementCount > 1) {
              resolve(null);
            }
          });
        });

        const body = document.body;
        return {
          width: body.scrollWidth,
          height: body.scrollHeight,
        };
      }})()`
    );

    const { x, y } = calculatePopupPosition({
      parentPosition: parentBounds,
      popupSize,
      anchorRect: anchorRect,
      placement: placement || 'left',
    });

    popupWindow.setBounds({
      x,
      y,
      width: popupSize.width,
      height: Math.min(parentBounds.height * 0.8, popupSize.height),
    });

    popupWindow.show();
  });

  popupWindow.once('blur', () => {
    console.log('---- popupWindow once [blur] ------');
    popupWindow.close();
  });

  return popupWindow;
}
