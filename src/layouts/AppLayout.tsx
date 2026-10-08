import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload File',
  '/files': 'Files',
  '/measurements': 'Measurements',
  '/features': 'Features',
  '/api-docs': 'API Documentation',
  '/settings': 'Settings',
}

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.includes('/measurements')) return 'Measurements'
  if (pathname.includes('/features')) return 'Features'
  if (pathname.includes('/files/')) return 'File Details'
  return 'GeoMeasure'
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        marginLeft: 'var(--sidebar-width)', overflow: 'hidden',
      }} className="main-content">
        <Header title={getTitle(pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
      <style>{`@media (max-width: 768px) { .main-content { margin-left: 0 !important; } }`}</style>
    </div>
  )
}
