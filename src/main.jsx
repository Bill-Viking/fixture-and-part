import { COMPANY, loadCompanyStyle } from './lib/company.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// Vite removes this entire road, including its CSS chunk, from consumer builds.
if (COMPANY) {
  document.documentElement.dataset.look = 'company'
  await loadCompanyStyle()

  // Give the house face a bounded head start; a silent font host cannot
  // hold the essay. The stylesheet keeps loading and swaps the face later.
  const fontWait = new Promise((resolve) => {
    const font = document.createElement('link')
    font.rel = 'stylesheet'
    font.href = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,600;0,800;1,300&display=swap'
    font.onload = font.onerror = resolve
    document.head.append(font)
  }).then(() => Promise.all(
    ['300', '400', '600', '800', 'italic 300'].map((weight) =>
      document.fonts.load(`${weight} 18px "Barlow"`),
    ),
  )).catch(() => undefined)
  await Promise.race([fontWait, new Promise((resolve) => setTimeout(resolve, 2500))])
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
