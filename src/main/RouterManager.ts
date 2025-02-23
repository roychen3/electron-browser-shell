export class RouterManager {
  private _url: string = '';

  constructor() {}

  setUrl(url: string) {
    this._url = url;
  }

  get url() {
    return this._url;
  }
}

export const routerManager = new RouterManager();
