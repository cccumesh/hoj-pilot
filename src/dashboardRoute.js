const DEFAULT_DASHBOARD_PATH = 'akxerai-insights-7k2m'

/** Paths that always open AdminDashboard (comma-separated env + known legacy URLs). */
export function getDashboardPaths() {
  const fromEnv = String(import.meta.env.VITE_DASHBOARD_PATH ?? DEFAULT_DASHBOARD_PATH)
    .split(',')
    .map((segment) => segment.trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)

  const merged = fromEnv.length ? [...fromEnv] : [DEFAULT_DASHBOARD_PATH]
  for (const legacy of [DEFAULT_DASHBOARD_PATH, 'axerai-insights-7k2m', 'axera-insights-7k2m']) {
    if (!merged.includes(legacy)) merged.push(legacy)
  }
  return merged
}

export function isDashboardRoute(location = window.location) {
  return getDashboardPaths().some(
    (path) => location.pathname.includes(`/${path}`) || location.hash === `#${path}`,
  )
}

export const PRIMARY_DASHBOARD_PATH = getDashboardPaths()[0]
