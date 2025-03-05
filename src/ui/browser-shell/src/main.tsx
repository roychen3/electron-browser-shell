import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './tailwind.css'


window.electronAPI.onTokenUpdate((token) => {
  console.log('-- onTokenUpdate ----', token);
  window.localStorage.setItem('token', token);
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
