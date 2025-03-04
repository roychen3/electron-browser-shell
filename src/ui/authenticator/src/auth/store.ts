export class AuthStore {
  private _token = '';

  getToken() {
    return this._token;
  }

  setToken(token: string) {
    this._token = token;
  }
}

export const authStore = new AuthStore();