import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderTop: '1px solid var(--border)',
      color: 'var(--text-secondary)', fontSize: 13,
    }}>
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: '5px 8px', borderRadius: 6, color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: '5px 8px', borderRadius: 6,
            color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
