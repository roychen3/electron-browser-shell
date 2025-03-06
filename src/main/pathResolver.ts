import path from 'path';

// 此檔案不要更改資料夾位置

export const getAppUiPath = (restPath = '') =>
  path.join(__dirname, '../ui/', restPath);

export const getBrowserOperationsPanelPath = () =>
  path.join(__dirname, '../ui/browser-operations-panel/index.html');

export const getBrowserAvatarMenuPath = () =>
  path.join(__dirname, '../ui/browser-avatar-menu/index.html');

export const getAuthenticatorPath = () =>
  path.join(__dirname, '../ui/authenticator/index.html');

export const getProtectedApplicationPath = () =>
  path.join(__dirname, '../ui/protected-application/index.html');

export const getBrowserOperatorPreloadPath = () =>
  path.join(__dirname, './preload/browserOperator.js');
