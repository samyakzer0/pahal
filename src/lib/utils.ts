import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function generateDigiPin(lat: number, lng: number): string {
  // Simplified DigiPin-like format
  const latStr = Math.abs(lat).toFixed(4).replace('.', '')
  const lngStr = Math.abs(lng).toFixed(4).replace('.', '')
  return `${latStr.slice(0, 4)}-${lngStr.slice(0, 4)}-${latStr.slice(4, 6)}${lngStr.slice(4, 6)}`
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  }
  return colors[severity] || colors.medium
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    reported: 'text-red-600 bg-red-50',
    acknowledged: 'text-orange-600 bg-orange-50',
    dispatched: 'text-blue-600 bg-blue-50',
    en_route: 'text-indigo-600 bg-indigo-50',
    on_site: 'text-purple-600 bg-purple-50',
    resolved: 'text-green-600 bg-green-50',
  }
  return colors[status] || colors.reported
}
