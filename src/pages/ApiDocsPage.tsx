import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE'
  path: string
  summary: string
  description: string
  requestBody?: string
  response: string
  errors: { code: number; description: string }[]
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/files/',
    summary: 'Upload a geospatial file',
    description: 'Accepts a .zip (Shapefile) or .kml file. Processes the file, extracts features, and calculates measurements. Returns file metadata including ID, feature count, CRS, and processing status.',
    requestBody: `Content-Type: multipart/form-data

file: <binary>   # .zip or .kml file`,
    response: `{
  "id": "abc123",
  "filename": "survey.kml",
  "feature_count": 120,
  "crs": "EPSG:4326",
  "status": "COMPLETED",
  "file_type": "kml"
}`,
    errors: [
      { code: 400, description: 'Invalid file type or malformed file' },
      { code: 422, description: 'Validation error' },
      { code: 500, description: 'Internal processing error' },
    ],
  },
  {
    method: 'GET',
    path: '/api/files/',
    summary: 'List all uploaded files',
    description: 'Returns a list of all uploaded files with their metadata.',
    response: `[
  {
    "id": "abc123",
    "filename": "survey.kml",
    "feature_count": 120,
    "crs": "EPSG:4326",
    "status": "COMPLETED"
  }
]`,
    errors: [
      { code: 500, description: 'Internal server error' },
    ],
  },
  {
    method: 'GET',
    path: '/api/files/{id}/',
    summary: 'Get file information',
    description: 'Returns detailed information about a specific uploaded file including its processing status, CRS, and feature count.',
    response: `{
  "id": "abc123",
  "filename": "survey.kml",
  "feature_count": 120,
  "crs": "EPSG:4326",
  "status": "COMPLETED",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:30:05Z"
}`,
    errors: [
      { code: 404, description: 'File not found' },
    ],
  },
  {
    method: 'GET',
    path: '/api/files/{id}/measurements/',
    summary: 'Get measurements for a file',
    description: 'Returns measurement results for all features in the file. Polygons return area, LineStrings return length, Points have no measurement. Geometries are transformed to an appropriate projected CRS before calculation.',
    response: `{
  "file_id": "abc123",
  "measurement_crs": "EPSG:32633",
  "measurements": [
    {
      "feature_id": 0,
      "geometry_type": "Polygon",
      "area": 12345.67,
      "area_unit": "m²",
      "measurement_crs": "EPSG:32633",
      "error": null
    },
    {
      "feature_id": 1,
      "geometry_type": "LineString",
      "length": 456.78,
      "length_unit": "m",
      "measurement_crs": "EPSG:32633",
      "error": null
    }
  ]
}`,
    errors: [
      { code: 404, description: 'File not found' },
      { code: 422, description: 'File not yet processed' },
    ],
  },
  {
    method: 'GET',
    path: '/api/files/{id}/features/',
    summary: 'Get features for a file',
    description: 'Returns all features extracted from the file including geometry type, geometry, CRS, and properties/attributes.',
    response: `{
  "file_id": "abc123",
  "total": 120,
  "features": [
    {
      "id": 0,
      "geometry_type": "Polygon",
      "geometry": { "type": "Polygon", "coordinates": [...] },
      "crs": "EPSG:4326",
      "properties": { "name": "Region A", "area_km2": 45.2 }
    }
  ]
}`,
    errors: [
      { code: 404, description: 'File not found' },
    ],
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'var(--success)',
  POST: 'var(--accent)',
  DELETE: 'var(--danger)',
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      overflow: 'hidden', marginBottom: 12,
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'var(--bg-surface)', textAlign: 'left',
        }}
      >
        {open ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          color: METHOD_COLORS[ep.method], background: `color-mix(in srgb, ${METHOD_COLORS[ep.method]} 15%, transparent)`,
          fontFamily: 'monospace', minWidth: 44, textAlign: 'center',
        }}>
          {ep.method}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{ep.path}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ep.summary}</span>
      </button>

      {open && (
        <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{ep.description}</p>

          {ep.requestBody && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Request Body</div>
              <pre style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 12, fontSize: 12,
                color: 'var(--text-secondary)', overflow: 'auto',
              }}>{ep.requestBody}</pre>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Response (200)</div>
            <pre style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 12, fontSize: 12,
              color: 'var(--success)', overflow: 'auto',
            }}>{ep.response}</pre>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Error Responses</div>
            {ep.errors.map((e) => (
              <div key={e.code} style={{ display: 'flex', gap: 10, fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--danger)', fontFamily: 'monospace', minWidth: 36 }}>{e.code}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{e.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApiDocsPage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>API Documentation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Available endpoints for the Geospatial File Measurement API.
        </p>
        <div style={{
          marginTop: 12, padding: '10px 14px', background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          Base URL: <code style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>
            {import.meta.env.VITE_API_BASE_URL || '<VITE_API_BASE_URL>'}
          </code>
        </div>
      </div>

      {ENDPOINTS.map((ep) => (
        <EndpointCard key={`${ep.method}-${ep.path}`} ep={ep} />
      ))}
    </div>
  )
}
