export const ACCEPTED_FILE_TYPES = ['.zip', '.kml']
export const ACCEPTED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.google-earth.kml+xml',
  'application/octet-stream',
]

export const FILE_STATUS = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const

export const GEOMETRY_TYPES = {
  POLYGON: 'Polygon',
  MULTIPOLYGON: 'MultiPolygon',
  LINESTRING: 'LineString',
  MULTILINESTRING: 'MultiLineString',
  POINT: 'Point',
  MULTIPOINT: 'MultiPoint',
} as const

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Upload File', path: '/upload', icon: 'Upload' },
  { label: 'Files', path: '/files', icon: 'FolderOpen' },
  { label: 'Measurements', path: '/measurements', icon: 'Ruler' },
  { label: 'Features', path: '/features', icon: 'Layers' },
  { label: 'API Documentation', path: '/api-docs', icon: 'BookOpen' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const
