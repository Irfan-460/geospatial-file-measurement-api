import { useState } from 'react'
import { useToast } from '../components/ui/Toast'
import { Card } from '../components/ui/Card'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL ?? '')
  const { toast } = useToast()

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Application configuration.</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>API Configuration</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            API Base URL
          </label>
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Set via <code style={{ fontFamily: 'monospace' }}>VITE_API_BASE_URL</code> environment variable.
            Changes here are session-only and do not persist.
          </p>
        </div>
        <button
          onClick={() => toast('To persist this change, update VITE_API_BASE_URL in your .env file and restart the dev server.', 'info')}
          style={{
            padding: '8px 18px', borderRadius: 'var(--radius)',
            background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500,
          }}
        >
          Save
        </button>
      </Card>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>About</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>Application:</strong> Geospatial File Measurement UI</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>Version:</strong> 1.0.0</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>Supported Formats:</strong> .zip (Shapefile), .kml</div>
          <div><strong style={{ color: 'var(--text-primary)' }}>Supported Measurements:</strong> Area (Polygon), Length (LineString)</div>
        </div>
      </Card>
    </div>
  )
}
