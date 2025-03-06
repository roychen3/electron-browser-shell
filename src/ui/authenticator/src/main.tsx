import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initialAuthWithElectron } from './auth/auth-react/index.tsx';
import { ElectronRouter, router, getElectronCurrentPathname } from './router';
import App from './App.tsx';

import './tailwind.css';

const main = async () => {
  let AppNode = <App />;

  if (window.electronAPI) {
    await initialAuthWithElectron();
    const initialPathname = await getElectronCurrentPathname();
    router.navigate(initialPathname);

    AppNode = <ElectronRouter router={router}>{AppNode}</ElectronRouter>;
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>{AppNode}</StrictMode>
  );
};

main();
