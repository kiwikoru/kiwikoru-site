import { describe, expect, it } from 'vitest'
import { isStlFile, MAX_MODEL_SIZE, safeModelName, signPrintPreparation, verifyPrintPreparation } from '../server/print-order.js'
import type { PrintPreparation } from '../server/print-order.js'

const preparation: PrintPreparation = {
  orderId: 'order-123',
  expiresAt: 10_000,
  destination: 'north',
  rural: false,
  customer: { name: 'Test Customer', email: 'test@example.com', phone: '0210000000', address: '1 Test Street', city: 'Whangārei', region: 'Northland', postalCode: '0110' },
  items: [{ pathname: 'print-orders/order-123/1-part.stl', fileName: 'part.stl', fileSize: 1234, amount: 1200, quantity: 1, material: 'PLA', colour: 'White', infill: '20', layerHeight: '0.2', estimatedVolume: '10' }],
}

describe('print-order preparation tokens', () => {
  it('round-trips an unexpired signed preparation', () => {
    const token = signPrintPreparation(preparation, 'test-secret')
    expect(verifyPrintPreparation(token, 'test-secret', 9_999)).toEqual(preparation)
  })

  it('rejects tampering, a wrong secret, and expiry', () => {
    const token = signPrintPreparation(preparation, 'test-secret')
    expect(() => verifyPrintPreparation(`${token.slice(0, -1)}x`, 'test-secret', 9_999)).toThrow(/invalid/i)
    expect(() => verifyPrintPreparation(token, 'wrong-secret', 9_999)).toThrow(/invalid/i)
    expect(() => verifyPrintPreparation(token, 'test-secret', 10_001)).toThrow(/expired/i)
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
