// In-memory cache for preview data (short-lived, server restart clears it)
const previewCache = new Map<string, { data: any; expiresAt: number }>()
const TTL_MS = 10 * 60 * 1000 // 10 minutes

export function generatePreviewToken(): string {
  return `preview_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

export function setPreviewData(token: string, data: any): void {
  previewCache.set(token, {
    data,
    expiresAt: Date.now() + TTL_MS
  })
  // Cleanup expired entries
  Array.from(previewCache.entries()).forEach(([k, v]) => {
    if (v.expiresAt < Date.now()) previewCache.delete(k)
  })
}

export function getPreviewData(token: string): any | null {
  const entry = previewCache.get(token)
  if (!entry || entry.expiresAt < Date.now()) return null
  return entry.data
}
