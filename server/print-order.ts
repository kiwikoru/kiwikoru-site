import { createHmac, timingSafeEqual } from 'node:crypto'

export const MAX_PRINT_ITEMS = 10
export const MAX_MODEL_SIZE = 20 * 1024 * 1024
export const PREPARATION_TTL_MS = 15 * 60 * 1000

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
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.items) || !payload.orderId || !Number.isFinite(payload.expiresAt)) throw new Error('Your upload authorisation is invalid. Please try checkout again.')
  if (payload.expiresAt < now) throw new Error('Your upload authorisation expired. Please try checkout again.')
  return payload
}

export function safeModelName(name: string) {
  const base = name.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
  return base || 'model.stl'
}

export function isStlFile(name: string, size: number) {
  return /\.stl$/i.test(name) && Number.isInteger(size) && size > 0 && size <= MAX_MODEL_SIZE
}
