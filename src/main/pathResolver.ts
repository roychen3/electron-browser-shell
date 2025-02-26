// 此檔案不要更改資料夾位置

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAppUiPath = (restPath = '') =>
  path.join(__dirname, '../ui/', restPath);

export const getBrowserShellPath = () =>
  path.join(__dirname, '../ui/browser-shell/index.html');

export const getAuthenticatorPath = () =>
  path.join(__dirname, '../ui/authenticator/index.html');

export const getBrowserOperatorPreloadPath = () =>
  path.join(__dirname, './preload/browserOperator.cjs');
