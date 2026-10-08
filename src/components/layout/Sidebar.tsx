import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FolderOpen, Ruler, Layers,
  BookOpen, Settings, Map, X,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard },
  { label: 'Upload File', path: '/upload', Icon: Upload },
  { label: 'Files', path: '/files', Icon: FolderOpen },
  { label: 'Measurements', path: '/measurements', Icon: Ruler },
  { label: 'Features', path: '/features', Icon: Layers },
  { label: 'API Documentation', path: '/api-docs', Icon: BookOpen },
  { label: 'Settings', path: '/settings', Icon: Settings },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
          }}
          className="sidebar-overlay"
        />
      )}
      <aside style={{
        width: 'var(--sidebar-width)', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform var(--transition)',
      }} className="sidebar">
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Map size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>GeoMeasure</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>File API</div>
            </div>
          </div>
          <button onClick={onClose} className="sidebar-close" style={{ color: 'var(--text-muted)', display: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius)',
                marginBottom: 2, fontSize: 13, fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
          Geospatial File Measurement API
        </div>
      </aside>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .sidebar-close { display: flex !important; }
        }
      `}</style>
    </>
  )
}
