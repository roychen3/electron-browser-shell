import { format } from 'url';
import { getAppUiPathSection } from './pathResolver';

export class RouterManager {
  readonly appUrlPrefix = 'app:///';
  readonly fileUrlPrefix = 'file:///';
  readonly appUiUrlSection = getAppUiPathSection().replaceAll('\\', '/');
  private _url: string = '';

  constructor() {}

  setUrl(url: string, scope: string = '') {
    console.log('------ RouterManager.setUrl ------');
    console.log('1. this.appUiUrlSection: \n', this.appUiUrlSection, '\n');

    if (url.includes(this.appUiUrlSection)) {
      const uUrl = new URL(url);
      const pathname = uUrl.searchParams.get('pathname') || '/';
      const appName = uUrl.pathname
        .replace(this.appUiUrlSection, '')
        .split('/')[1];
      this._url = `${this.appUrlPrefix}${appName}?pathname=${pathname}`;
      console.log('1. this._url: \n', this._url, '\n');
    } else if (
      scope.startsWith(this.appUrlPrefix) &&
      url.startsWith(this.fileUrlPrefix) &&
      !url.includes(this.appUiUrlSection)
    ) {
      const uUrl = new URL(url);
      const pathname = uUrl.pathname.replace('C:/', '') || '/';
      this._url = `${scope}?pathname=${pathname}`;
      console.log('2. this._url: \n', this._url, '\n');
    } else {
      this._url = url;
      console.log('3. this._url: \n', this._url, '\n');
    }
  }

  get url() {
    return this._url;
  }

  get loadUrl() {
    console.log('------ RouterManager.loadUrl ------');
    console.log('this._url: \n', this._url, '\n');
    if (this.url.startsWith(this.appUrlPrefix)) {
      console.log('1. \n');
      const uUrl = new URL(this.url);
      const pathname = uUrl.searchParams.get('pathname') || '/';
      const appName = uUrl.pathname.replaceAll('/', '');

      return format({
        pathname: `${this.appUiUrlSection}${appName}/index.html`,
        protocol: 'file:',
        slashes: true,
        query: {
          pathname,
        },
      });
    }

    console.log('2. \n');
    return this.url;
  }
}

export const routerManager = new RouterManager();
