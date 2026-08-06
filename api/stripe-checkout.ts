import { put } from '@vercel/blob'
import Stripe from 'stripe'
import { Resend } from 'resend'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const maxDuration = 60

type Destination = 'north' | 'south' | 'australia'
type CustomerDetails = { name: string; email: string; phone: string; address: string; address2?: string; city: string; region: string; postalCode: string }

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

function readCustomer(value: unknown): CustomerDetails {
  if (!value || typeof value !== 'object') throw new Error('Please complete your delivery details.')
  const source = value as Record<string, unknown>
  const required = ['name', 'email', 'phone', 'address', 'city', 'region', 'postalCode'] as const
  for (const key of required) if (typeof source[key] !== 'string' || !source[key].trim()) throw new Error('Please complete all required delivery details.')
  const email = String(source.email).trim()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.')
  return { name: String(source.name).trim(), email, phone: String(source.phone).trim(), address: String(source.address).trim(), address2: typeof source.address2 === 'string' ? source.address2.trim() : '', city: String(source.city).trim(), region: String(source.region).trim(), postalCode: String(source.postalCode).trim() }
}

function addressMetadata(customer: CustomerDetails) {
  return { customer_name: customer.name, customer_email: customer.email, customer_phone: customer.phone, delivery_address: [customer.address, customer.address2].filter(Boolean).join(', '), delivery_city: customer.city, delivery_region: customer.region, delivery_postcode: customer.postalCode }
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

export async function createYoushieCheckout(request: Request, testPurchase = false) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return Response.json({ error: 'Secure checkout is being connected. Please try again shortly.' }, { status: 503 })
  }

  try {
    const body = await request.json() as { destination?: unknown; rural?: unknown; generatedPhoto?: unknown; customer?: unknown }
    if (!isDestination(body.destination)) {
      return Response.json({ error: 'Please choose a delivery destination.' }, { status: 400 })
    }

    const rural = body.destination !== 'australia' && body.rural === true
    const customer = readCustomer(body.customer)
    if (typeof body.generatedPhoto !== 'string') {
      return Response.json({ error: 'Please create your Youshie before ordering.' }, { status: 400 })
    }

    const image = decodeImage(body.generatedPhoto)
    const extension = image.contentType === 'image/jpeg' ? 'jpg' : image.contentType.split('/')[1]
    const imageBlob = await put(`youshie-orders/${crypto.randomUUID()}.${extension}`, image.bytes, {
      access: 'private',
      contentType: image.contentType,
      addRandomSuffix: false,
    })

    const origin = new URL(request.url).origin
    const shippingAmount = shippingByDestination[body.destination] + (rural ? 600 : 0)
    const stripe = new Stripe(secretKey)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = testPurchase ? [{
      quantity: 1,
      price_data: {
        currency: 'nzd',
        unit_amount: 50,
        product_data: {
          name: 'KiwiKoru checkout system test',
          description: 'Payment-flow test only — no physical product or delivery is included.',
        },
      },
    }] : [
      { quantity: 1, price_data: { currency: 'nzd', unit_amount: 3000, product_data: { name: 'Personalised 10 cm Youshie', description: 'Custom four-colour collectible figure made from your generated Youshie image.' } } },
      { quantity: 1, price_data: { currency: 'nzd', unit_amount: shippingAmount, product_data: { name: `Delivery — ${destinationLabels[body.destination]}${rural ? ' (rural)' : ''}` } } },
    ]
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      customer_email: customer.email,
      billing_address_collection: 'required',
      line_items: lineItems,
      metadata: {
        order_type: testPurchase ? 'youshie_test' : 'youshie',
        test_purchase: String(testPurchase),
        ...addressMetadata(customer),
        youshie_image_url: imageBlob.url,
        destination: body.destination,
        rural: String(rural),
      },
      payment_intent_data: {
        receipt_email: customer.email,
        shipping: { name: customer.name, phone: customer.phone, address: { line1: customer.address, line2: customer.address2 || undefined, city: customer.city, state: customer.region, postal_code: customer.postalCode, country: body.destination === 'australia' ? 'AU' : 'NZ' } },
        metadata: {
          order_type: testPurchase ? 'youshie_test' : 'youshie',
          test_purchase: String(testPurchase),
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

export async function createPrintCheckout(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return Response.json({ error: 'Secure checkout is unavailable.' }, { status: 503 })
  try {
    const form = await request.formData()
    const destination = form.get('destination')
    if (!isDestination(destination)) return Response.json({ error: 'Please choose a delivery destination.' }, { status: 400 })
    const rural = destination !== 'australia' && form.get('rural') === 'true'
    const customer = readCustomer(JSON.parse(String(form.get('customer') || '{}')))
    const quote = JSON.parse(String(form.get('quote') || '{}')) as Record<string, unknown>
    const amount = Math.max(100, Math.round(Number(quote.price) * 100))
    if (!Number.isFinite(amount)) throw new Error('The quoted price is invalid.')
    const model = form.get('model')
    let modelUrl = ''
    let modelName = String(quote.fileName || '3D model')
    if (model instanceof File && model.size) {
      if (model.size > 20 * 1024 * 1024) throw new Error('The model file must be smaller than 20 MB.')
      modelName = model.name
      const blob = await put(`print-orders/${crypto.randomUUID()}-${model.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`, Buffer.from(await model.arrayBuffer()), { access: 'private', contentType: model.type || 'application/octet-stream', addRandomSuffix: false })
      modelUrl = blob.url
    }
    const shippingAmount = shippingByDestination[destination] + (rural ? 600 : 0)
    const origin = new URL(request.url).origin
    const stripe = new Stripe(secretKey)
    const metadata = { order_type: '3d_print', ...addressMetadata(customer), destination, rural: String(rural), model_name: modelName.slice(0, 450), model_url: modelUrl, material: String(quote.material || ''), colour: String(quote.color || ''), infill: String(quote.infill || ''), layer_height: String(quote.quality || '') }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', customer_creation: 'always', customer_email: customer.email, billing_address_collection: 'required',
      line_items: [
        { quantity: 1, price_data: { currency: 'nzd', unit_amount: amount, product_data: { name: 'Custom 3D print', description: `${modelName} · ${metadata.material} · ${metadata.colour}`.slice(0, 500) } } },
        { quantity: 1, price_data: { currency: 'nzd', unit_amount: shippingAmount, product_data: { name: `Delivery — ${destinationLabels[destination]}${rural ? ' (rural)' : ''}` } } },
      ],
      metadata,
      payment_intent_data: { receipt_email: customer.email, shipping: { name: customer.name, phone: customer.phone, address: { line1: customer.address, line2: customer.address2 || undefined, city: customer.city, state: customer.region, postal_code: customer.postalCode, country: destination === 'australia' ? 'AU' : 'NZ' } }, metadata },
      success_url: `${origin}/print-order?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/print-order?payment=cancelled`,
    })
    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Unable to create print checkout', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to start secure checkout.' }, { status: 500 })
  }
}

function safe(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)) }

export async function confirmCheckout(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return Response.json({ error: 'Confirmation unavailable.' }, { status: 503 })
  try {
    const { sessionId } = await request.json() as { sessionId?: string }
    if (!sessionId?.startsWith('cs_')) return Response.json({ error: 'Invalid payment session.' }, { status: 400 })
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return Response.json({ error: 'Payment has not been completed.' }, { status: 409 })
    const m = session.metadata || {}
    const email = m.customer_email || session.customer_details?.email
    if (!email) throw new Error('Customer email is missing.')
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const typeName = m.order_type === 'youshie_test' ? 'NZ$0.50 checkout system test (no product)' : m.order_type === 'youshie' ? 'personalised Youshie' : 'custom 3D print'
      const details = `<p><strong>Order:</strong> ${safe(typeName)}</p><p><strong>Total paid:</strong> NZ$${((session.amount_total || 0) / 100).toFixed(2)}</p><p><strong>Delivery:</strong> ${safe(m.delivery_address)}, ${safe(m.delivery_city)}, ${safe(m.delivery_region)} ${safe(m.delivery_postcode)}</p><p><strong>Phone:</strong> ${safe(m.customer_phone)}</p>`
      const sender = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'onboarding@resend.dev'
      const owner = process.env.RESEND_TO || process.env.EMAIL_TO || 'kiwikoru3d@gmail.com'
      const customerMessage = await resend.emails.send(
        { from: `KiwiKoru 3D <${sender}>`, to: email, subject: 'Your KiwiKoru 3D order is confirmed', html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#24453b"><h1>Thank you, ${safe(m.customer_name)}!</h1><p>Your payment has been received and your order is now with KiwiKoru 3D.</p>${details}<p>We’ll contact you by email when your product is ready to dispatch. If anything needs changing, reply to this email or call <strong>027 436 5339</strong>.</p></div>` },
        { headers: { 'Idempotency-Key': `order-customer-${session.id}` } },
      )
      if (customerMessage.error || !customerMessage.data?.id) {
        console.error('[order-confirmation] customer email rejected', { sessionId: session.id, error: customerMessage.error })
        throw new Error(`Customer confirmation rejected: ${customerMessage.error?.message || 'No delivery ID returned.'}`)
      }

      const ownerMessage = await resend.emails.send(
        { from: `KiwiKoru 3D Orders <${sender}>`, to: owner, subject: `Paid order — ${safe(m.customer_name)} — ${safe(typeName)}`, html: `<div style="font-family:Arial,sans-serif;max-width:650px"><h1>New paid order</h1>${details}<p><strong>Email:</strong> ${safe(email)}</p><p><strong>Model:</strong> ${safe(m.model_name || 'Youshie image attached to Stripe metadata')}</p><p><strong>Material / colour:</strong> ${safe(m.material)} ${safe(m.colour)}</p><p><strong>Stripe session:</strong> ${safe(session.id)}</p></div>` },
        { headers: { 'Idempotency-Key': `order-owner-${session.id}` } },
      )
      if (ownerMessage.error || !ownerMessage.data?.id) {
        console.error('[order-confirmation] owner email rejected', { sessionId: session.id, error: ownerMessage.error })
        throw new Error(`Owner notification rejected: ${ownerMessage.error?.message || 'No delivery ID returned.'}`)
      }
      console.log('[order-confirmation] both emails accepted', { sessionId: session.id, customerMessageId: customerMessage.data.id, ownerMessageId: ownerMessage.data.id })
    } else {
      console.error('[order-confirmation] RESEND_API_KEY is missing', { sessionId: session.id })
      throw new Error('Email service is not configured.')
    }
    return Response.json({ success: true, email })
  } catch (error) {
    console.error('Unable to confirm checkout', error)
    return Response.json({ error: 'Your payment is complete, but the confirmation email could not be sent yet.' }, { status: 500 })
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
    const requestUrl = `${protocol}://${host}${request.url || '/api/stripe-checkout'}`
    const webRequest = new Request(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': request.headers['content-type'] || 'application/json' },
      body,
    })
    const action = new URL(requestUrl).searchParams.get('action')
    const checkoutResponse = action === 'print' ? await createPrintCheckout(webRequest) : action === 'confirm' ? await confirmCheckout(webRequest) : await createYoushieCheckout(webRequest, action === 'youshie-test')
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
