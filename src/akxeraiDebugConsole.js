/** On-phone Safari console — enable with ?debug=1 or ?akxerai-debug=1 (no Mac required). */
const DEBUG_STORAGE_KEY = 'akxerai-debug'
const ERUDA_CDN = 'https://cdn.jsdelivr.net/npm/eruda@3.4.1/eruda.min.js'

export function shouldEnableAkxeraiDebugConsole() {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('debug') === '1' || params.get('akxerai-debug') === '1') {
      window.localStorage.setItem(DEBUG_STORAGE_KEY, '1')
      return true
    }
    if (params.get('debug') === '0' || params.get('akxerai-debug') === '0') {
      window.localStorage.removeItem(DEBUG_STORAGE_KEY)
      return false
    }
    if (window.location.hash === '#debug') return true
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function loadErudaScript() {
  return new Promise((resolve, reject) => {
    if (window.eruda) {
      resolve(window.eruda)
      return
    }
    const existing = document.querySelector('script[data-akxerai-eruda]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.eruda))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = ERUDA_CDN
    script.async = true
    script.dataset.akxeraiEruda = '1'
    script.onload = () => resolve(window.eruda)
    script.onerror = () => reject(new Error('Eruda CDN load failed'))
    document.head.appendChild(script)
  })
}

let booted = false

export function bootAkxeraiDebugConsole() {
  if (booted || !shouldEnableAkxeraiDebugConsole()) return
  booted = true

  void loadErudaScript()
    .then((eruda) => {
      eruda?.init?.()
      console.info(
        '[Akxerai debug] Eruda on — filter Logs: [Audio] [Jarvis] [Myra] [Ledger]. Off: ?akxerai-debug=0',
      )
    })
    .catch((error) => {
      console.warn('[Akxerai debug] Eruda failed:', error)
    })
}
