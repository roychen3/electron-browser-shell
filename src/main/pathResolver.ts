import path from 'path';

// 此檔案不要更改資料夾位置

export const getAppUiPathSection = () => path.join(__dirname, '../ui/');

export const getBrowserShellPath = () =>
  path.join(__dirname, '../ui/browser-shell/index.html');

export const getAuthenticatorPath = () =>
  path.join(__dirname, '../ui/authenticator/index.html');
