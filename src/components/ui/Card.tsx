import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export function Card({ children, style }: Props) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number | null | undefined
  icon: ReactNode
  color?: string
  loading?: boolean
}

export function StatCard({ label, value, icon, color = 'var(--accent)', loading }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        {loading ? (
          <div style={{
            height: 24, width: 60, borderRadius: 4,
            background: 'var(--bg-elevated)', animation: 'shimmer 1.4s infinite',
            backgroundImage: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
            backgroundSize: '200% 100%',
          }} />
        ) : (
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {value ?? '—'}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
