import { WebContentsView } from 'electron';
import { getAuthenticatorPath } from './pathResolver';

export class RouterManager {
  private readonly URL_PREFIX = 'app:///authenticator';
  private _wevContentsView: WebContentsView | null = null;
  private _url: string = '';

  constructor() {}

  setWevContentsView(newValue: WebContentsView) {
    this._wevContentsView = newValue;
  }
  private get wevContentsView() {
    if (!this._wevContentsView) {
      throw new Error('wevContentsView is not set');
    }
    return this._wevContentsView;
  }

  set url(newValue: string) {
    const currentTitle = this.wevContentsView.webContents.getTitle();
    if (newValue.includes(getAuthenticatorPath())) {
      const uUrl = new URL(newValue);
      const pathname = uUrl.searchParams.get('pathname') || '/';
      this._url = `${this.URL_PREFIX}?pathname=${pathname}`;
    } else if (
      currentTitle === this.URL_PREFIX &&
      newValue.startsWith('file:///') &&
      newValue.includes('authenticator') &&
      newValue.includes('index.html')
    ) {
      const uUrl = new URL(newValue);
      const pathname = uUrl.searchParams.get('pathname') || '/';
      this._url = `${this.URL_PREFIX}?pathname=${pathname}`;
    } else if (
      currentTitle === this.URL_PREFIX &&
      newValue.startsWith('file:///')
    ) {
      const uUrl = new URL(newValue);
      const pathname = uUrl.pathname.replace('C:/', '') || '/';
      this._url = `${this.URL_PREFIX}?pathname=${pathname}`;
    } else if (
      currentTitle === this.URL_PREFIX &&
      newValue.startsWith(this.URL_PREFIX)
    ) {
      const uUrl = new URL(newValue);
      const pathname = uUrl.searchParams.get('pathname') || '/';
      this._url = `${this.URL_PREFIX}?pathname=${pathname}`;
    } else {
      this._url = newValue;
    }
  }

  get url() {
    return this._url;
  }

  get loadUrl() {
    const uUrl = new URL(this.url);
    const pathname = uUrl.searchParams.get('pathname') || '/';
    return `file:///${getAuthenticatorPath()}?pathname=${pathname}`;
  }
}

export const routerManager = new RouterManager();
