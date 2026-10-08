import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileArchive, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useFileUpload } from '../hooks/useFileUpload'
import { validateFileType, formatFileSize } from '../utils'
import { useToast } from '../components/ui/Toast'

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { status, progress, result, error, upload, reset } = useFileUpload()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleFile = useCallback((file: File) => {
    setValidationError(null)
    if (!validateFileType(file)) {
      setValidationError('Only .zip (Shapefile) and .kml files are supported.')
      return
    }
    setSelectedFile(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUpload = async () => {
    if (!selectedFile) return
    await upload(selectedFile)
    toast('File uploaded successfully!', 'success')
  }

  const handleReset = () => {
    reset()
    setSelectedFile(null)
    setValidationError(null)
  }

  if (status === 'success' && result) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--success)',
          borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center',
        }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Upload Successful</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 }}>
            {result.filename} has been processed.
          </p>
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
            padding: 16, marginBottom: 24, textAlign: 'left',
          }}>
            {[
              ['File ID', result.id],
              ['Filename', result.filename],
              ['Features', result.feature_count],
              ['CRS', result.crs],
              ['Status', result.status],
              ...(result.file_type ? [['Type', result.file_type]] : []),
            ].map(([k, v]) => (
              <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{String(v)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/files/${result.id}`)}
              style={{
                padding: '9px 20px', borderRadius: 'var(--radius)',
                background: 'var(--accent)', color: '#fff', fontWeight: 500, fontSize: 13,
              }}
            >
              View File Details
            </button>
            <button
              onClick={() => navigate(`/files/${result.id}/measurements`)}
              style={{
                padding: '9px 20px', borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', fontWeight: 500, fontSize: 13,
              }}
            >
              View Measurements
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '9px 20px', borderRadius: 'var(--radius)',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', fontSize: 13,
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Upload Geospatial File</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Supported formats: .zip (Shapefile) and .kml
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : validationError ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '40px 24px',
          textAlign: 'center', cursor: selectedFile ? 'default' : 'pointer',
          background: dragOver ? 'var(--accent-dim)' : 'var(--bg-surface)',
          transition: 'all var(--transition)', marginBottom: 16,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.kml"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {selectedFile ? (
          <div>
            <FileArchive size={40} color="var(--accent)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedFile.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {formatFileSize(selectedFile.size)} · {selectedFile.name.split('.').pop()?.toUpperCase()}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset() }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: 'var(--text-muted)', padding: '4px 10px',
                borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              }}
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Drag & drop your file here</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>or</div>
            <button style={{
              padding: '8px 20px', borderRadius: 'var(--radius)',
              background: 'var(--accent)', color: '#fff', fontWeight: 500, fontSize: 13,
            }}>
              Browse Files
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              .zip (Shapefile) · .kml
            </div>
          </div>
        )}
      </div>

      {validationError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 'var(--radius)',
          background: 'var(--danger-dim)', border: '1px solid var(--danger)',
          color: 'var(--danger)', fontSize: 13, marginBottom: 16,
        }}>
          <AlertCircle size={14} /> {validationError}
        </div>
      )}

      {status === 'uploading' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Uploading & processing…</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'var(--accent)', borderRadius: 3,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 'var(--radius)',
          background: 'var(--danger-dim)', border: '1px solid var(--danger)',
          color: 'var(--danger)', fontSize: 13, marginBottom: 16,
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || status === 'uploading'}
        style={{
          width: '100%', padding: '11px', borderRadius: 'var(--radius)',
          background: !selectedFile || status === 'uploading' ? 'var(--bg-elevated)' : 'var(--accent)',
          color: !selectedFile || status === 'uploading' ? 'var(--text-muted)' : '#fff',
          fontWeight: 600, fontSize: 14, cursor: !selectedFile || status === 'uploading' ? 'not-allowed' : 'pointer',
          border: '1px solid var(--border)', transition: 'all var(--transition)',
        }}
      >
        {status === 'uploading' ? 'Processing…' : 'Upload File'}
      </button>
    </div>
  )
}
