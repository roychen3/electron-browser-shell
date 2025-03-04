import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './tailwind.css'
import './index.css'
import { authStore } from './auth'

const main = async () => {
  const token = await window.electronAPI.getToken();
  authStore.setToken(token);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

main();
