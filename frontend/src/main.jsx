import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Evita el destello de tema oscuro antes de que React monte el HeaderGlobal.
document.documentElement.setAttribute(
  'data-theme',
  localStorage.getItem('theme_lms') || 'dark',
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
