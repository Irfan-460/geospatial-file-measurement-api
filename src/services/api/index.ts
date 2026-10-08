import type {
  FileRecord,
  MeasurementsResponse,
  UploadResponse,
  FeaturesResponse,
  PaginationParams,
} from '../../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : path
  let res: Response
  try {
    res = await fetch(url, options)
  } catch {
    throw new Error('Cannot reach the API. Is the backend running?')
  }
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`
    try {
      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        const body = await res.json()
        errMsg = body.detail ?? body.message ?? body.error ?? errMsg
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('API returned non-JSON response. Check VITE_API_BASE_URL in your .env file.')
  }
  return res.json() as Promise<T>
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  return request<UploadResponse>('/api/files/', {
    method: 'POST',
    body: form,
  })
}

export async function getFile(id: string): Promise<FileRecord> {
  return request<FileRecord>(`/api/files/${id}/`)
}

export async function listFiles(): Promise<FileRecord[]> {
  return request<FileRecord[]>('/api/files/')
}

export async function getMeasurements(id: string): Promise<MeasurementsResponse> {
  return request<MeasurementsResponse>(`/api/files/${id}/measurements/`)
}

export async function getFeatures(
  id: string,
  params?: PaginationParams
): Promise<FeaturesResponse> {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : ''
  return request<FeaturesResponse>(`/api/files/${id}/features/${qs}`)
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/files/`, { method: 'HEAD' })
    return res.ok || res.status === 405
  } catch {
    return false
  }
}
