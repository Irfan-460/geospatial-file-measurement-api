import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Eye, Ruler, Layers, Upload } from 'lucide-react'
import { useAsync } from '../hooks/useAsync'
import { listFiles } from '../services/api'
import { StatusBadge } from '../components/ui/StatusBadge'
import { SearchBar } from '../components/ui/SearchBar'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { formatDate, getFileExtension, truncate } from '../utils'
import type { FileRecord } from '../types'

export default function FilesPage() {
  const { data, loading, error, refetch } = useAsync(() => listFiles())
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = (data ?? []).filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase()) ||
    f.crs?.toLowerCase().includes(search.toLowerCase()) ||
    f.status?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Files</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {data ? `${data.length} file${data.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search files…" />
          <button
            onClick={refetch}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/upload')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius)',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500,
            }}
          >
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message={search ? 'No files match your search.' : 'No files uploaded yet.'}>
            {!search && (
              <button
                onClick={() => navigate('/upload')}
                style={{
                  marginTop: 8, padding: '8px 20px', borderRadius: 'var(--radius)',
                  background: 'var(--accent)', color: '#fff', fontSize: 13,
                }}
              >
                Upload a file
              </button>
            )}
          </EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Filename', 'Type', 'Features', 'CRS', 'Status', 'Uploaded', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f: FileRecord) => (
                  <tr
                    key={f.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>
                      <button
                        onClick={() => navigate(`/files/${f.id}`)}
                        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                      >
                        {truncate(f.filename, 35)}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {f.file_type ?? getFileExtension(f.filename)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {f.feature_count ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {f.crs ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={f.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(f.uploaded_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[
                          { icon: <Eye size={13} />, label: 'View', action: () => navigate(`/files/${f.id}`) },
                          { icon: <Ruler size={13} />, label: 'Measurements', action: () => navigate(`/files/${f.id}/measurements`) },
                          { icon: <Layers size={13} />, label: 'Features', action: () => navigate(`/files/${f.id}/features`) },
                        ].map(({ icon, label, action }) => (
                          <button
                            key={label}
                            onClick={action}
                            title={label}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '4px 8px', borderRadius: 6, fontSize: 11,
                              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', cursor: 'pointer',
                            }}
                          >
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
