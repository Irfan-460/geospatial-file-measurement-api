import { Menu, Wifi, WifiOff } from 'lucide-react'
import { useApiHealth } from '../../hooks/useApiHealth'

interface Props {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: Props) {
  const online = useApiHealth()

  return (
    <header style={{
      height: 'var(--header-height)', background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', padding: '0 20px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <button
        onClick={onMenuClick}
        className="menu-btn"
        style={{ color: 'var(--text-secondary)', display: 'none', padding: 4 }}
      >
        <Menu size={20} />
      </button>

      <h1 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {online === null ? (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checking API…</span>
        ) : online ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--success)' }}>
            <Wifi size={14} /> API Connected
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--danger)' }}>
            <WifiOff size={14} /> API Offline
          </span>
        )}
      </div>

      <style>{`@media (max-width: 768px) { .menu-btn { display: flex !important; } }`}</style>
    </header>
  )
}
