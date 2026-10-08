import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAsync } from '../hooks/useAsync'
import { getMeasurements, getFile } from '../services/api'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Card } from '../components/ui/Card'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { formatMeasurement } from '../utils'
import type { MeasurementResult } from '../types'

function MeasurementCard({ m }: { m: MeasurementResult }) {
  const isPolygon = m.geometry_type === 'Polygon' || m.geometry_type === 'MultiPolygon'
  const isLine = m.geometry_type === 'LineString' || m.geometry_type === 'MultiLineString'
  const isPoint = m.geometry_type === 'Point' || m.geometry_type === 'MultiPoint'

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Feature #{m.feature_id}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
          color: isPolygon ? 'var(--success)' : isLine ? 'var(--info)' : 'var(--warning)',
          background: isPolygon ? 'var(--success-dim)' : isLine ? 'var(--info-dim)' : 'var(--warning-dim)',
        }}>
          {m.geometry_type}
        </span>
      </div>

      {m.error ? (
        <div style={{ fontSize: 12, color: 'var(--danger)', padding: '6px 10px', background: 'var(--danger-dim)', borderRadius: 6 }}>
          {m.error}
        </div>
      ) : isPoint ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No measurement for Point geometry</div>
      ) : isPolygon ? (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Area</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>
            {formatMeasurement(m.area, m.area_unit)}
          </div>
        </div>
      ) : isLine ? (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Length</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--info)' }}>
            {formatMeasurement(m.length, m.length_unit)}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unsupported geometry type</div>
      )}
    </div>
  )
}

export default function MeasurementsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: file } = useAsync(() => getFile(id!), [id])
  const { data, loading, error } = useAsync(() => getMeasurements(id!), [id])

  const measurements = data?.measurements ?? []

  const polygons = measurements.filter((m) => m.geometry_type === 'Polygon' || m.geometry_type === 'MultiPolygon')
  const lines = measurements.filter((m) => m.geometry_type === 'LineString' || m.geometry_type === 'MultiLineString')
  const points = measurements.filter((m) => m.geometry_type === 'Point' || m.geometry_type === 'MultiPoint')
  const others = measurements.filter((m) =>
    !['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'Point', 'MultiPoint'].includes(m.geometry_type)
  )

  return (
    <div>
      <Breadcrumbs crumbs={[
        { label: 'Files', path: '/files' },
        { label: file?.filename ?? id!, path: `/files/${id}` },
        { label: 'Measurements' },
      ]} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={() => navigate(`/files/${id}`)} style={{ color: 'var(--text-muted)', padding: 4 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Measurements</h2>
          {data?.measurement_crs && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Measurement CRS: <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{data.measurement_crs}</span>
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : measurements.length === 0 ? (
        <EmptyState message="No measurements available for this file." />
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Polygons', count: polygons.length, color: 'var(--success)' },
              { label: 'LineStrings', count: lines.length, color: 'var(--info)' },
              { label: 'Points', count: points.length, color: 'var(--warning)' },
              { label: 'Other', count: others.length, color: 'var(--text-muted)' },
            ].map(({ label, count, color }) => (
              <Card key={label} style={{ textAlign: 'center', padding: '16px 12px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </Card>
            ))}
          </div>

          {polygons.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)', marginBottom: 12 }}>
                Polygon Measurements — Area
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {polygons.map((m) => <MeasurementCard key={m.feature_id} m={m} />)}
              </div>
            </section>
          )}

          {lines.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--info)', marginBottom: 12 }}>
                LineString Measurements — Length
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {lines.map((m) => <MeasurementCard key={m.feature_id} m={m} />)}
              </div>
            </section>
          )}

          {points.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)', marginBottom: 12 }}>
                Point Features — No Measurement Required
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {points.map((m) => <MeasurementCard key={m.feature_id} m={m} />)}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
                Other Geometry Types
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {others.map((m) => <MeasurementCard key={m.feature_id} m={m} />)}
              </div>
            </section>
          )}

          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>All Measurements</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Feature ID', 'Geometry Type', 'Area', 'Length', 'Measurement CRS', 'Error'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m: MeasurementResult) => (
                    <tr key={m.feature_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>{m.feature_id}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>{m.geometry_type}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--success)' }}>
                        {m.area != null ? formatMeasurement(m.area, m.area_unit) : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--info)' }}>
                        {m.length != null ? formatMeasurement(m.length, m.length_unit) : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {m.measurement_crs ?? data?.measurement_crs ?? '—'}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--danger)' }}>
                        {m.error ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
