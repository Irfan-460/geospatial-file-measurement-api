import { useParams, useNavigate } from 'react-router-dom'
import { Ruler, Layers, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAsync } from '../hooks/useAsync'
import { getFile } from '../services/api'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Card } from '../components/ui/Card'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { LoadingState, ErrorState } from '../components/ui/States'
import { formatDate } from '../utils'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 16,
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{value ?? '—'}</span>
    </div>
  )
}

export default function FileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: file, loading, error, refetch } = useAsync(() => getFile(id!), [id])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!file) return null

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Files', path: '/files' }, { label: file.filename }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/files')} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{file.filename}</h2>
            <div style={{ marginTop: 4 }}><StatusBadge status={file.status} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
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
            onClick={() => navigate(`/files/${id}/measurements`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius)',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500,
            }}
          >
            <Ruler size={14} /> Measurements
          </button>
          <button
            onClick={() => navigate(`/files/${id}/features`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13,
            }}
          >
            <Layers size={14} /> Features
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>File Information</h3>
          <InfoRow label="File ID" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>{file.id}</span>} />
          <InfoRow label="Filename" value={file.filename} />
          <InfoRow label="File Type" value={file.file_type ?? '—'} />
          <InfoRow label="Feature Count" value={file.feature_count} />
          <InfoRow label="Status" value={<StatusBadge status={file.status} />} />
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>CRS Information</h3>
          <InfoRow label="Coordinate Reference System" value={
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{file.crs ?? '—'}</span>
          } />
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)' }}>
            The backend transforms geographic coordinates to an appropriate projected CRS before calculating measurements.
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Processing Information</h3>
          <InfoRow label="Upload Time" value={formatDate(file.uploaded_at)} />
          <InfoRow label="Processed Time" value={formatDate(file.processed_at)} />
          {file.error_message && (
            <div style={{
              marginTop: 12, padding: 12, background: 'var(--danger-dim)',
              border: '1px solid var(--danger)', borderRadius: 'var(--radius)',
              fontSize: 12, color: 'var(--danger)',
            }}>
              {file.error_message}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
