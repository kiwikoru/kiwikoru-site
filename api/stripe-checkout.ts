import { put } from '@vercel/blob'
import Stripe from 'stripe'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const maxDuration = 60

type Destination = 'north' | 'south' | 'australia'

const shippingByDestination: Record<Destination, number> = {
  north: 1500,
  south: 1500,
  australia: 3000,
}

const destinationLabels: Record<Destination, string> = {
  north: 'New Zealand — North Island',
  south: 'New Zealand — South Island',
  australia: 'Australia',
}

function isDestination(value: unknown): value is Destination {
  return value === 'north' || value === 'south' || value === 'australia'
}

function decodeImage(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) throw new Error('The Youshie image is missing or invalid.')

  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > 15 * 1024 * 1024) {
    throw new Error('The Youshie image is too large.')
  }

  return { bytes, contentType: match[1] }
}

export async function createYoushieCheckout(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return Response.json({ error: 'Secure checkout is being connected. Please try again shortly.' }, { status: 503 })
  }

  try {
    const body = await request.json() as { destination?: unknown; rural?: unknown; generatedPhoto?: unknown }
    if (!isDestination(body.destination)) {
      return Response.json({ error: 'Please choose a delivery destination.' }, { status: 400 })
    }

    const rural = body.destination !== 'australia' && body.rural === true
    if (typeof body.generatedPhoto !== 'string') {
      return Response.json({ error: 'Please create your Youshie before ordering.' }, { status: 400 })
    }

    const image = decodeImage(body.generatedPhoto)
    const extension = image.contentType === 'image/jpeg' ? 'jpg' : image.contentType.split('/')[1]
    const imageBlob = await put(`youshie-orders/${crypto.randomUUID()}.${extension}`, image.bytes, {
      access: 'public',
      contentType: image.contentType,
      addRandomSuffix: false,
    })

    const origin = new URL(request.url).origin
    const shippingAmount = shippingByDestination[body.destination] + (rural ? 600 : 0)
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: body.destination === 'australia' ? ['AU'] : ['NZ'],
      },
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'nzd',
            unit_amount: 3000,
            product_data: {
              name: 'Personalised 10 cm Youshie',
              description: 'Custom four-colour collectible figure made from your generated Youshie image.',
              images: [imageBlob.url],
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: 'nzd',
            unit_amount: shippingAmount,
            product_data: {
              name: `Delivery — ${destinationLabels[body.destination]}${rural ? ' (rural)' : ''}`,
            },
          },
        },
      ],
      metadata: {
        youshie_image_url: imageBlob.url,
        destination: body.destination,
        rural: String(rural),
      },
      payment_intent_data: {
        metadata: {
          youshie_image_url: imageBlob.url,
          destination: body.destination,
          rural: String(rural),
        },
      },
      success_url: `${origin}/youshie-order?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/youshie-order?payment=cancelled`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Unable to create Youshie checkout', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to start secure checkout.' }, { status: 500 })
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Method not allowed.' }))
    return
  }

  try {
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    const body = Buffer.concat(chunks)
    const protocol = request.headers['x-forwarded-proto'] || 'https'
    const host = request.headers.host || 'www.kiwikoru.co.nz'
    const webRequest = new Request(`${protocol}://${host}${request.url || '/api/youshie-checkout'}`, {
      method: 'POST',
      headers: { 'Content-Type': request.headers['content-type'] || 'application/json' },
      body,
    })
    const checkoutResponse = await createYoushieCheckout(webRequest)
    response.statusCode = checkoutResponse.status
    response.setHeader('Content-Type', checkoutResponse.headers.get('content-type') || 'application/json')
    response.end(await checkoutResponse.text())
  } catch (error) {
    console.error('Youshie checkout handler failed', error)
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Secure checkout could not open. Please try again.' }))
  }
}
