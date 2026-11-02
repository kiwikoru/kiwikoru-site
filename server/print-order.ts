import { createHmac, timingSafeEqual } from 'node:crypto'

export const MAX_PRINT_ITEMS = 10
export const MAX_MODEL_SIZE = 20 * 1024 * 1024
export const PREPARATION_TTL_MS = 15 * 60 * 1000

export type ModelDimensions = { x: number; y: number; z: number }

export type PrintDestination = 'pickup' | 'north' | 'south' | 'australia'
export type PreparedPrintItem = {
  pathname: string
  fileName: string
  fileSize: number
  amount: number
  quantity: number
  material: string
  colour: string
  infill: string
  layerHeight: string
  estimatedVolume: string
  scale: number
  originalDimensions: ModelDimensions
  finalDimensions: ModelDimensions
}
export type PrintPreparation = {
  orderId: string
  expiresAt: number
  destination: PrintDestination
  rural: boolean
  customer: { name: string; email: string; phone: string; address: string; address2?: string; city: string; region: string; postalCode: string }
  items: PreparedPrintItem[]
}

function encode(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

export function signPrintPreparation(payload: PrintPreparation, secret: string) {
  if (!secret) throw new Error('Print checkout signing is not configured.')
  const encoded = encode(JSON.stringify(payload))
  const signature = encode(createHmac('sha256', secret).update(encoded).digest())
  return `${encoded}.${signature}`
}

export function verifyPrintPreparation(token: string, secret: string, now = Date.now()): PrintPreparation {
  if (!secret) throw new Error('Print checkout signing is not configured.')
  const [encoded, supplied, extra] = token.split('.')
  if (!encoded || !supplied || extra) throw new Error('Your upload authorisation is invalid. Please try checkout again.')
  const expected = createHmac('sha256', secret).update(encoded).digest()
  let actual: Buffer
  try { actual = Buffer.from(supplied, 'base64url') } catch { throw new Error('Your upload authorisation is invalid. Please try checkout again.') }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Your upload authorisation is invalid. Please try checkout again.')

  let payload: PrintPreparation
  try { payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PrintPreparation } catch { throw new Error('Your upload authorisation is invalid. Please try checkout again.') }
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.items) || !payload.items.length || payload.items.length > MAX_PRINT_ITEMS || !payload.orderId || !Number.isFinite(payload.expiresAt)) throw new Error('Your upload authorisation is invalid. Please try checkout again.')
  if (payload.items.some(item => !isPreparedPrintItem(item))) throw new Error('Your upload authorisation is invalid. Please try checkout again.')
  if (payload.expiresAt < now) throw new Error('Your upload authorisation expired. Please try checkout again.')
  return payload
}

function isDimensions(value: unknown): value is ModelDimensions {
  if (!value || typeof value !== 'object') return false
  const dimensions = value as Record<string, unknown>
  return ['x', 'y', 'z'].every(axis => Number.isFinite(dimensions[axis]) && Number(dimensions[axis]) > 0 && Number(dimensions[axis]) <= 1_000_000)
}

function isPreparedPrintItem(value: unknown): value is PreparedPrintItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.pathname === 'string' && item.pathname.startsWith('print-orders/')
    && typeof item.fileName === 'string' && isStlFile(item.fileName, Number(item.fileSize))
    && Number.isInteger(item.amount) && Number(item.amount) >= 100 && Number(item.amount) <= 10_000_000
    && Number.isInteger(item.quantity) && Number(item.quantity) >= 1 && Number(item.quantity) <= 99
    && typeof item.material === 'string' && Boolean(item.material)
    && typeof item.colour === 'string' && Boolean(item.colour)
    && Number.isFinite(Number(item.infill)) && Number(item.infill) >= 0 && Number(item.infill) <= 100
    && Number.isFinite(Number(item.layerHeight)) && Number(item.layerHeight) > 0 && Number(item.layerHeight) <= 10
    && Number.isFinite(Number(item.estimatedVolume)) && Number(item.estimatedVolume) > 0
    && Number.isFinite(Number(item.scale)) && Number(item.scale) >= 0.05 && Number(item.scale) <= 10
    && isDimensions(item.originalDimensions) && isDimensions(item.finalDimensions)
    && dimensionsMatchScale(item.originalDimensions, item.finalDimensions, Number(item.scale))
}

function dimensionsMatchScale(original: ModelDimensions, final: ModelDimensions, scale: number) {
  return (['x', 'y', 'z'] as const).every(axis => Math.abs(final[axis] - original[axis] * scale) <= 0.2)
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))
}

function dimensionsText(dimensions: ModelDimensions) {
  return `X ${dimensions.x.toFixed(1)} × Y ${dimensions.y.toFixed(1)} × Z ${dimensions.z.toFixed(1)} mm`
}

export function renderScaleChangeAlert(item: PreparedPrintItem) {
  if (!Number.isFinite(item.scale) || !isDimensions(item.originalDimensions) || !isDimensions(item.finalDimensions) || Math.abs(item.scale - 1) < 0.0001) return ''
  const percentage = Math.round(item.scale * 100)
  return `<div role="alert" style="margin:0 0 18px;padding:18px;border:3px solid #b91c1c;border-radius:12px;background:#fee2e2;color:#7f1d1d"><strong style="display:block;font-size:18px">⚠ SCALE CHANGED — ${escapeHtml(percentage)}%</strong><p style="margin:8px 0 0;font-weight:700">${escapeHtml(item.fileName)}</p><p style="margin:6px 0 0">Original: ${escapeHtml(dimensionsText(item.originalDimensions))}<br>Final: ${escapeHtml(dimensionsText(item.finalDimensions))}</p></div>`
}

export function safeModelName(name: string) {
  const base = name.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
  return base || 'model.stl'
}

export function isStlFile(name: string, size: number) {
  return /\.stl$/i.test(name) && Number.isInteger(size) && size > 0 && size <= MAX_MODEL_SIZE
}
