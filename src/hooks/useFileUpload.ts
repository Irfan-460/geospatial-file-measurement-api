import { useState, useCallback } from 'react'
import { uploadFile } from '../services/api'
import type { UploadResponse } from '../types'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export function useFileUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setStatus('uploading')
    setProgress(0)
    setError(null)
    setResult(null)

    // Simulate progress since fetch doesn't expose upload progress natively
    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 15 : p))
    }, 300)

    try {
      const data = await uploadFile(file)
      clearInterval(timer)
      setProgress(100)
      setResult(data)
      setStatus('success')
    } catch (err: unknown) {
      clearInterval(timer)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, upload, reset }
}
