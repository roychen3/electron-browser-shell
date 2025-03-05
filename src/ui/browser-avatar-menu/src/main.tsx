import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './tailwind.css';
import './index.css';
import { initialAuthWithElectron } from './auth/auth-react';

const main = async () => {
  if (window.electronAPI) {
    await initialAuthWithElectron();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

main();
