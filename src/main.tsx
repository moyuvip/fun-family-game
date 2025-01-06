import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (rootElement) {
  rootElement.style.width = '100%'
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
