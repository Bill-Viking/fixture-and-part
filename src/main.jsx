import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './company.css'
import App from './App.jsx'

if (new URLSearchParams(window.location.search).get('look') === 'company') {
  document.documentElement.dataset.look = 'company'
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
