import { COMPANY, loadCompanyStyle } from './lib/company.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// Vite removes this entire road, including its CSS chunk, from consumer builds.
if (COMPANY) {
  document.documentElement.dataset.look = 'company'
  await loadCompanyStyle()

  // Both remote stylesheets and all their faces share one bounded head start.
  // A silent host cannot hold the essay; late faces still swap in afterwards.
  const loadFonts = (families, faces) => new Promise((resolve) => {
    const font = document.createElement('link')
    font.rel = 'stylesheet'
    font.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
    font.onload = font.onerror = resolve
    document.head.append(font)
  }).then(() => Promise.allSettled(
    faces.map((face) => document.fonts.load(face)),
  )).catch(() => undefined)
  const fontWait = Promise.all([
    loadFonts(
      'Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500',
      ['400 16px "IBM Plex Sans"', '400 14px "IBM Plex Mono"', '600 24px "Space Grotesk"'],
    ),
    loadFonts(
      'Barlow:ital,wght@0,300;0,400;0,600;0,800;1,300',
      ['300', '400', '600', '800', 'italic 300'].map((weight) => `${weight} 18px "Barlow"`),
    ),
  ])
  let timeout
  await Promise.race([fontWait, new Promise((resolve) => { timeout = setTimeout(resolve, 2500) })])
  clearTimeout(timeout)
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
