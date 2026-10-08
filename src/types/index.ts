export interface FileRecord {
  id: string
  filename: string
  feature_count: number
  crs: string
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
  file_type?: string
  uploaded_at?: string
  processed_at?: string
  error_message?: string
}

export interface GeometryInfo {
  type: string
  coordinates: unknown
}

export interface FeatureProperties {
  [key: string]: unknown
}

export interface Feature {
  id: number | string
  geometry_type: string
  geometry: GeometryInfo | null
  crs: string
  properties: FeatureProperties
  measurement?: MeasurementResult
}

export interface MeasurementResult {
  feature_id: number | string
  geometry_type: string
  area?: number | null
  area_unit?: string
  length?: number | null
  length_unit?: string
  measurement_crs?: string
  error?: string | null
}

export interface MeasurementsResponse {
  file_id: string
  measurements: MeasurementResult[]
  measurement_crs?: string
}

export interface FeaturesResponse {
  file_id: string
  features: Feature[]
  total?: number
}

export interface UploadResponse {
  id: string
  filename: string
  feature_count: number
  crs: string
  status: string
  file_type?: string
}

export interface ApiError {
  detail?: string
  message?: string
  error?: string
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  geometry_type?: string
}
