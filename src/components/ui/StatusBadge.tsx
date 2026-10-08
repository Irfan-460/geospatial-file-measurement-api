import type { FileRecord } from '../../types'

const STATUS_CONFIG = {
  COMPLETED: { color: 'var(--success)', bg: 'var(--success-dim)', label: 'Completed' },
  PROCESSING: { color: 'var(--warning)', bg: 'var(--warning-dim)', label: 'Processing' },
  FAILED: { color: 'var(--danger)', bg: 'var(--danger-dim)', label: 'Failed' },
} as const

type Status = FileRecord['status']

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as Status] ?? {
    color: 'var(--text-secondary)', bg: 'var(--bg-elevated)', label: status,
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      color: cfg.color, background: cfg.bg,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.color,
        ...(status === 'PROCESSING' ? { animation: 'pulse 1.2s infinite' } : {}),
      }} />
      {cfg.label}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </span>
  )
}
