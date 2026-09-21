import Stripe from 'stripe'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { confirmCheckout } from './stripe-checkout.js'

export const maxDuration = 60

async function readRawBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks)
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.end('Method not allowed.')
    return
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers['stripe-signature']
  if (!secretKey || !webhookSecret || typeof signature !== 'string') {
    response.statusCode = 400
    response.end('Webhook configuration is missing.')
    return
  }

  try {
    const stripe = new Stripe(secretKey)
    const event = stripe.webhooks.constructEvent(await readRawBody(request), signature, webhookSecret)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status === 'paid') {
        const confirmation = await confirmCheckout(new Request('https://www.kiwikoru.co.nz/api/checkout-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id }),
        }))
        if (!confirmation.ok) throw new Error('Order confirmation email failed.')
      }
    }
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ received: true }))
  } catch (error) {
    console.error('[stripe-webhook] failed', error)
    response.statusCode = 400
    response.end('Webhook processing failed.')
  }
}
