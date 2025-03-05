export interface Auth {
  getToken: () => string;
  setToken: (token: string) => void;
}
