import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  path?: string
}

interface Props {
  crumbs: Crumb[]
}

export function Breadcrumbs({ crumbs }: Props) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && <ChevronRight size={12} />}
          {c.path && i < crumbs.length - 1 ? (
            <Link to={c.path} style={{ color: 'var(--text-secondary)' }}>{c.label}</Link>
          ) : (
            <span style={{ color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
