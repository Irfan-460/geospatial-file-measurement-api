import { ACCEPTED_FILE_TYPES } from '../constants'

export function validateFileType(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPTED_FILE_TYPES.some((ext) => name.endsWith(ext))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}

export function formatMeasurement(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return '—'
  const formatted = value >= 1000
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value.toFixed(4)
  return unit ? `${formatted} ${unit}` : formatted
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() ?? '—'
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}
