import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

// Vite removes this entire road, including its CSS chunk, from consumer builds.
if (import.meta.env.VITE_COMPANY === '1') {
  document.documentElement.dataset.look = 'company'
  await import('./company.css')

  // Load the house face before mounting so its arrival cannot reflow the essay.
  // A blocked font host still leaves a readable local fallback.
  await new Promise((resolve) => {
    const font = document.createElement('link')
    font.rel = 'stylesheet'
    font.href = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,600;0,800;1,300&display=swap'
    font.onload = font.onerror = resolve
    document.head.append(font)
  })
  await Promise.all(
    ['300', '400', '600', '800', 'italic 300'].map((weight) =>
      document.fonts.load(`${weight} 18px "Barlow"`),
    ),
  ).catch(() => undefined)
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
