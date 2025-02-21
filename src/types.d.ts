declare global {
  interface Window {
    electronAPI: {
      onUrlUpdate: (callback: (url: string) => void) => () => void;
      navigateUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
      browserBack: () => Promise<boolean>;
      browserForward: () => Promise<boolean>;
      browserReload: () => Promise<boolean>;
      getCurrentUrl: () => Promise<string>;
    };
  }
}

export {}