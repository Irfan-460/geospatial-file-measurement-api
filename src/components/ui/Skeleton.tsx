import type { CSSProperties } from 'react'

interface Props {
  rows?: number
  style?: CSSProperties
}

export function Skeleton({ rows = 1, style }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 16, borderRadius: 4,
          background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          opacity: 1 - i * 0.15,
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20,
    }}>
      <Skeleton rows={3} />
    </div>
  )
}
