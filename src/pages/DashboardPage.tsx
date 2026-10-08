import { useNavigate } from 'react-router-dom'
import { Files, Layers, CheckCircle, Clock, XCircle, Ruler } from 'lucide-react'
import { StatCard } from '../components/ui/Card'
import { useAsync } from '../hooks/useAsync'
import { listFiles } from '../services/api'
import type { FileRecord } from '../types'

function computeStats(files: FileRecord[]) {
  return {
    total: files.length,
    features: files.reduce((s, f) => s + (f.feature_count ?? 0), 0),
    completed: files.filter((f) => f.status === 'COMPLETED').length,
    processing: files.filter((f) => f.status === 'PROCESSING').length,
    failed: files.filter((f) => f.status === 'FAILED').length,
  }
}

export default function DashboardPage() {
  const { data, loading, error } = useAsync(() => listFiles())
  const navigate = useNavigate()

  const stats = data ? computeStats(data) : null

  const recentFiles = data?.slice(-5).reverse() ?? []

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Overview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Real-time statistics from the Geospatial File Measurement API
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20,
          background: 'var(--danger-dim)', border: '1px solid var(--danger)',
          color: 'var(--danger)', fontSize: 13,
        }}>
          Failed to load dashboard data: {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, marginBottom: 32,
      }}>
        <StatCard label="Total Files" value={stats?.total} icon={<Files size={20} />} loading={loading} />
        <StatCard label="Total Features" value={stats?.features} icon={<Layers size={20} />} color="var(--info)" loading={loading} />
        <StatCard label="Completed" value={stats?.completed} icon={<CheckCircle size={20} />} color="var(--success)" loading={loading} />
        <StatCard label="Processing" value={stats?.processing} icon={<Clock size={20} />} color="var(--warning)" loading={loading} />
        <StatCard label="Failed" value={stats?.failed} icon={<XCircle size={20} />} color="var(--danger)" loading={loading} />
        <StatCard label="Supported Measurements" value="Area · Length" icon={<Ruler size={20} />} color="var(--accent)" loading={false} />
      </div>

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Files</h3>
          <button
            onClick={() => navigate('/files')}
            style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: 40, marginBottom: 8, borderRadius: 6,
                background: 'var(--bg-elevated)', animation: 'shimmer 1.4s infinite',
                backgroundImage: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
                backgroundSize: '200% 100%',
              }} />
            ))}
          </div>
        ) : recentFiles.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No files uploaded yet.{' '}
            <button onClick={() => navigate('/upload')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Upload your first file →
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Filename', 'Features', 'CRS', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '8px 20px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentFiles.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/files/${f.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  <td style={{ padding: '12px 20px', fontSize: 13 }}>{f.filename}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.feature_count ?? '—'}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.crs ?? '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                      color: f.status === 'COMPLETED' ? 'var(--success)' : f.status === 'FAILED' ? 'var(--danger)' : 'var(--warning)',
                      background: f.status === 'COMPLETED' ? 'var(--success-dim)' : f.status === 'FAILED' ? 'var(--danger-dim)' : 'var(--warning-dim)',
                    }}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
