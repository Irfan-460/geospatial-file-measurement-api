import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useAsync } from '../hooks/useAsync'
import { getFeatures, getFile } from '../services/api'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { SearchBar } from '../components/ui/SearchBar'
import { Pagination } from '../components/ui/Pagination'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import type { Feature } from '../types'

const PAGE_SIZE = 20

function GeometryTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Polygon: 'var(--success)', MultiPolygon: 'var(--success)',
    LineString: 'var(--info)', MultiLineString: 'var(--info)',
    Point: 'var(--warning)', MultiPoint: 'var(--warning)',
  }
  const color = colors[type] ?? 'var(--text-muted)'
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
      color, background: `color-mix(in srgb, ${color} 15%, transparent)`,
    }}>
      {type}
    </span>
  )
}

function FeatureRow({ feature }: { feature: Feature }) {
  const [expanded, setExpanded] = useState(false)
  const props = feature.properties ?? {}
  const propKeys = Object.keys(props)

  return (
    <>
      <tr
        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
      >
        <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {feature.id}
          </div>
        </td>
        <td style={{ padding: '10px 16px' }}>
          <GeometryTypeBadge type={feature.geometry_type} />
        </td>
        <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
          {feature.crs ?? '—'}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
          {propKeys.length > 0 ? `${propKeys.length} attribute${propKeys.length !== 1 ? 's' : ''}` : '—'}
        </td>
        <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
          {feature.measurement
            ? feature.measurement.area != null
              ? `Area: ${feature.measurement.area?.toFixed(2)} ${feature.measurement.area_unit ?? ''}`
              : feature.measurement.length != null
              ? `Length: ${feature.measurement.length?.toFixed(2)} ${feature.measurement.length_unit ?? ''}`
              : '—'
            : '—'}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--bg-elevated)' }}>
          <td colSpan={5} style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {propKeys.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</div>
                  {propKeys.map((k) => (
                    <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{String(props[k] ?? '—')}</span>
                    </div>
                  ))}
                </div>
              )}
              {feature.geometry && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Geometry</div>
                  <pre style={{
                    fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-surface)',
                    padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 120,
                    border: '1px solid var(--border)',
                  }}>
                    {JSON.stringify(feature.geometry, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function FeaturesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [geometryFilter, setGeometryFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: file } = useAsync(() => getFile(id!), [id])
  const { data, loading, error } = useAsync(
    () => getFeatures(id!, { page, page_size: PAGE_SIZE, search, geometry_type: geometryFilter || undefined }),
    [id, page, search, geometryFilter]
  )

  const features = data?.features ?? []
  const total = data?.total ?? features.length

  return (
    <div>
      <Breadcrumbs crumbs={[
        { label: 'Files', path: '/files' },
        { label: file?.filename ?? id!, path: `/files/${id}` },
        { label: 'Features' },
      ]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(`/files/${id}`)} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Features</h2>
            {total > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{total} feature{total !== 1 ? 's' : ''}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search features…" />
          <select
            value={geometryFilter}
            onChange={(e) => { setGeometryFilter(e.target.value); setPage(1) }}
            style={{ minWidth: 160 }}
          >
            <option value="">All geometry types</option>
            {['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : features.length === 0 ? (
          <EmptyState message="No features found." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Geometry Type', 'CRS', 'Properties', 'Measurement'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f: Feature) => (
                    <FeatureRow key={f.id} feature={f} />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
