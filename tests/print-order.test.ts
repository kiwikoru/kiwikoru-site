import { describe, expect, it } from 'vitest'
import { isStlFile, MAX_MODEL_SIZE, renderScaleChangeAlert, safeModelName, signPrintPreparation, verifyPrintPreparation } from '../server/print-order.js'
import type { PrintPreparation } from '../server/print-order.js'

const preparation: PrintPreparation = {
  orderId: 'order-123',
  expiresAt: 10_000,
  destination: 'north',
  rural: false,
  customer: { name: 'Test Customer', email: 'test@example.com', phone: '0210000000', address: '1 Test Street', city: 'Whangārei', region: 'Northland', postalCode: '0110' },
  items: [{ pathname: 'print-orders/order-123/1-part.stl', fileName: 'part.stl', fileSize: 1234, amount: 1200, quantity: 1, material: 'PLA', colour: 'White', infill: '20', layerHeight: '0.2', estimatedVolume: '10', scale: 1.5, originalDimensions: { x: 10, y: 20, z: 30 }, finalDimensions: { x: 15, y: 30, z: 45 } }],
}

describe('print-order preparation tokens', () => {
  it('round-trips an unexpired signed preparation', () => {
    const token = signPrintPreparation(preparation, 'test-secret')
    expect(verifyPrintPreparation(token, 'test-secret', 9_999)).toEqual(preparation)
  })

  it('rejects tampering, a wrong secret, and expiry', () => {
    const token = signPrintPreparation(preparation, 'test-secret')
    const tampered = `${token[0] === 'a' ? 'b' : 'a'}${token.slice(1)}`
    expect(() => verifyPrintPreparation(tampered, 'test-secret', 9_999)).toThrow(/invalid/i)
    expect(() => verifyPrintPreparation(token, 'wrong-secret', 9_999)).toThrow(/invalid/i)
    expect(() => verifyPrintPreparation(token, 'test-secret', 10_001)).toThrow(/expired/i)
  })

  it('rejects correctly signed scale metadata with invalid values or inconsistent dimensions', () => {
    const invalidScale = { ...preparation, items: [{ ...preparation.items[0], scale: 10.1 }] }
    const inconsistentDimensions = { ...preparation, items: [{ ...preparation.items[0], finalDimensions: { x: 15, y: 30, z: 44 } }] }
    expect(() => verifyPrintPreparation(signPrintPreparation(invalidScale, 'test-secret'), 'test-secret', 9_999)).toThrow(/invalid/i)
    expect(() => verifyPrintPreparation(signPrintPreparation(inconsistentDimensions, 'test-secret'), 'test-secret', 9_999)).toThrow(/invalid/i)
  })
})

describe('owner email scale alert', () => {
  it('renders a conspicuous red alert with scale and original/final dimensions', () => {
    const html = renderScaleChangeAlert(preparation.items[0])
    expect(html).toContain('background:#fee2e2')
    expect(html).toContain('SCALE CHANGED — 150%')
    expect(html).toContain('Original: X 10.0 × Y 20.0 × Z 30.0 mm')
    expect(html).toContain('Final: X 15.0 × Y 30.0 × Z 45.0 mm')
  })

  it('does not render an alert when the model remains at original scale', () => {
    expect(renderScaleChangeAlert({ ...preparation.items[0], scale: 1, finalDimensions: preparation.items[0].originalDimensions })).toBe('')
  })
})

describe('model upload validation', () => {
  it('accepts only non-empty STL files within the 20 MB limit', () => {
    expect(isStlFile('part.stl', MAX_MODEL_SIZE)).toBe(true)
    expect(isStlFile('part.STL', 1)).toBe(true)
    expect(isStlFile('part.obj', 1)).toBe(false)
    expect(isStlFile('part.stl', 0)).toBe(false)
    expect(isStlFile('part.stl', MAX_MODEL_SIZE + 1)).toBe(false)
  })

  it('removes path traversal and unsafe filename characters', () => {
    expect(safeModelName('../customer part?.stl')).toBe('customer_part_.stl')
  })
})
