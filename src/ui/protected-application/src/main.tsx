import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initialAuthWithElectron } from './auth/auth-react/initialAuthWithElectron.ts';

import App from './App.tsx';
import './tailwind.css';

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
