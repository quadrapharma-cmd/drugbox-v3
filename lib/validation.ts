// ============================================================
// Input validation & sanitization helpers (security layer 4).
// Used by server actions before any data is written to the DB.
// ============================================================

export function sanitizeText(input: unknown, maxLen = 5000): string {
  if (typeof input !== 'string') return ''
  // Trim, cap length, strip null bytes and control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, maxLen)
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(pw: unknown): { ok: boolean; error?: string } {
  if (typeof pw !== 'string') return { ok: false, error: 'Password is required' }
  if (pw.length < 8) return { ok: false, error: 'Password must be at least 8 characters' }
  if (pw.length > 72) return { ok: false, error: 'Password is too long' }
  return { ok: true }
}

// Allowed values mirror the DB check constraints exactly
export const LISTING_CATEGORIES = [
  'supply', 'demand', 'cmo', 'equipment', 'license', 'service', 'job', 'training',
] as const

export const LISTING_ROLES = ['offering', 'seeking'] as const

export const PRODUCT_SUBTYPES = [
  'rawmaterial', 'pharma', 'cosmetic', 'supplement', 'device',
] as const

export const SENIORITY_LEVELS = ['exec', 'senior', 'mid', 'junior', 'entry'] as const

export const EMPLOYMENT_TYPES = ['fulltime', 'parttime', 'contract', 'remote'] as const

export const POST_CATEGORIES = ['general', 'regulatory', 'market', 'innovation', 'job'] as const

export function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T
): value is T[number] {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

// File upload validation (security layer 5)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_DOC_BYTES = 10 * 1024 * 1024 // 10 MB

export function validateImageUpload(file: { type: string; size: number }): {
  ok: boolean
  error?: string
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Only JPG, PNG, WEBP, or GIF images are allowed' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Image must be under 5 MB' }
  }
  return { ok: true }
}

export function validateDocUpload(file: { type: string; size: number }): {
  ok: boolean
  error?: string
} {
  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return { ok: false, error: 'Only PDF, Word, or Excel documents are allowed' }
  }
  if (file.size > MAX_DOC_BYTES) {
    return { ok: false, error: 'Document must be under 10 MB' }
  }
  return { ok: true }
}
