import type { Auth } from './interface'


export class AuthStore implements Auth {
  private _token = '';

  getToken() {
    return this._token;
  }

  setToken(token: string) {
    this._token = token;
  }
}

export const authStore = new AuthStore();