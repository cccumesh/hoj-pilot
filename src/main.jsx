import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import { isDashboardRoute } from './dashboardRoute.js'
import { initAkxeraiMobileShell } from './mobileShell.js'
import { unlockMobileSpeechAudio } from './elevenLabsTts.js'
import { bootAkxeraiDebugConsole } from './akxeraiDebugConsole.js'

bootAkxeraiDebugConsole()

const isDashboard = isDashboardRoute()

if (!isDashboard) {
  initAkxeraiMobileShell()
  // No extra "Tap for sound" UI — unlock on the first real touch/click (camera allow, etc.).
  const unlockOnce = () => {
    unlockMobileSpeechAudio({ force: true, speechPing: true })
  }
  document.addEventListener('pointerdown', unlockOnce, { capture: true, passive: true })
  document.addEventListener('touchstart', unlockOnce, { capture: true, passive: true })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{isDashboard ? <AdminDashboard /> : <App />}</StrictMode>,
)
