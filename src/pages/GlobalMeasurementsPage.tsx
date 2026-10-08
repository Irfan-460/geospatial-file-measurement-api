import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { listFiles } from '../services/api'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

export default function GlobalMeasurementsPage() {
  const { data, loading, error } = useAsync(() => listFiles())
  const [selectedId, setSelectedId] = useState('')
  const navigate = useNavigate()

  const completed = (data ?? []).filter((f) => f.status === 'COMPLETED')

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Measurements</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select a file to view its measurements.</p>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : completed.length === 0 ? (
        <EmptyState message="No completed files available. Upload and process a file first." />
      ) : (
        <div style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select a file
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Choose a file —</option>
              {completed.map((f) => (
                <option key={f.id} value={f.id}>{f.filename}</option>
              ))}
            </select>
          </div>
          <button
            disabled={!selectedId}
            onClick={() => navigate(`/files/${selectedId}/measurements`)}
            style={{
              padding: '9px 24px', borderRadius: 'var(--radius)',
              background: selectedId ? 'var(--accent)' : 'var(--bg-elevated)',
              color: selectedId ? '#fff' : 'var(--text-muted)',
              fontWeight: 500, fontSize: 13,
              border: '1px solid var(--border)',
              cursor: selectedId ? 'pointer' : 'not-allowed',
            }}
          >
            View Measurements
          </button>
        </div>
      )}
    </div>
  )
}
