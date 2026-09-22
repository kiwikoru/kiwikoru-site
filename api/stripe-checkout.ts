import { put } from '@vercel/blob'
import Stripe from 'stripe'
import { Resend } from 'resend'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { brandedEmail, emailDetails, emailSafe } from './lib/branded-email.js'

export const maxDuration = 60

type Destination = 'pickup' | 'north' | 'south' | 'australia'
type CustomerDetails = { name: string; email: string; phone: string; address: string; address2?: string; city: string; region: string; postalCode: string }

const shippingByDestination: Record<Destination, number> = {
  pickup: 0,
  north: 1500,
  south: 1500,
  australia: 3000,
}

const destinationLabels: Record<Destination, string> = {
  pickup: 'Pick up in person — Morningside, Whangārei',
  north: 'New Zealand — North Island',
  south: 'New Zealand — South Island',
  australia: 'Australia',
}

function isDestination(value: unknown): value is Destination {
  return value === 'pickup' || value === 'north' || value === 'south' || value === 'australia'
}

function readCustomer(value: unknown, requiresAddress = true): CustomerDetails {
  if (!value || typeof value !== 'object') throw new Error('Please complete your delivery details.')
  const source = value as Record<string, unknown>
  const required = requiresAddress ? ['name', 'email', 'phone', 'address', 'city', 'region', 'postalCode'] as const : ['name', 'email', 'phone'] as const
  for (const key of required) if (typeof source[key] !== 'string' || !source[key].trim()) throw new Error('Please complete all required delivery details.')
  const email = String(source.email).trim()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.')
  return { name: String(source.name).trim(), email, phone: String(source.phone).trim(), address: typeof source.address === 'string' ? source.address.trim() : '', address2: typeof source.address2 === 'string' ? source.address2.trim() : '', city: typeof source.city === 'string' ? source.city.trim() : '', region: typeof source.region === 'string' ? source.region.trim() : '', postalCode: typeof source.postalCode === 'string' ? source.postalCode.trim() : '' }
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

export async function createYoushieCheckout(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return Response.json({ error: 'Secure checkout is being connected. Please try again shortly.' }, { status: 503 })
  }

  try {
    const body = await request.json() as { destination?: unknown; rural?: unknown; generatedPhoto?: unknown; originalPhoto?: unknown; customer?: unknown }
    if (!isDestination(body.destination)) {
      return Response.json({ error: 'Please choose a delivery destination.' }, { status: 400 })
    }

    const pickup = body.destination === 'pickup'
    const rural = !pickup && body.destination !== 'australia' && body.rural === true
    const customer = readCustomer(body.customer, !pickup)
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
    let originalImageUrl = ''
    if (typeof body.originalPhoto === 'string') {
      const original = decodeImage(body.originalPhoto)
      const originalExtension = original.contentType === 'image/jpeg' ? 'jpg' : original.contentType.split('/')[1]
      const originalBlob = await put(`youshie-orders/originals/${crypto.randomUUID()}.${originalExtension}`, original.bytes, {
        access: 'private', contentType: original.contentType, addRandomSuffix: false,
      })
      originalImageUrl = originalBlob.url
    }

    const origin = new URL(request.url).origin
    const shippingAmount = shippingByDestination[body.destination] + (rural ? 600 : 0)
    const stripe = new Stripe(secretKey)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { quantity: 1, price_data: { currency: 'nzd', unit_amount: 3000, product_data: { name: 'Personalised 10 cm Youshie', description: 'Custom four-colour collectible figure made from your generated Youshie image.' } } },
      ...(pickup ? [] : [{ quantity: 1, price_data: { currency: 'nzd', unit_amount: shippingAmount, product_data: { name: `Delivery — ${destinationLabels[body.destination]}${rural ? ' (rural)' : ''}` } } }] as Stripe.Checkout.SessionCreateParams.LineItem[]),
    ]
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      invoice_creation: { enabled: true },
      customer_creation: 'always',
      customer_email: customer.email,
      billing_address_collection: 'required',
      line_items: lineItems,
      metadata: {
        order_type: 'youshie',
        ...addressMetadata(customer),
        youshie_image_url: imageBlob.url,
        youshie_original_url: originalImageUrl,
        destination: body.destination,
        rural: String(rural),
      },
      payment_intent_data: {
        receipt_email: customer.email,
        ...(pickup ? {} : { shipping: { name: customer.name, phone: customer.phone, address: { line1: customer.address, line2: customer.address2 || undefined, city: customer.city, state: customer.region, postal_code: customer.postalCode, country: body.destination === 'australia' ? 'AU' : 'NZ' } } }),
        metadata: {
          order_type: 'youshie',
          youshie_image_url: imageBlob.url,
          youshie_original_url: originalImageUrl,
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
    const pickup = destination === 'pickup'
    const rural = !pickup && destination !== 'australia' && form.get('rural') === 'true'
    const customer = readCustomer(JSON.parse(String(form.get('customer') || '{}')), !pickup)
    const rawItems = JSON.parse(String(form.get('items') || '[]')) as Array<Record<string, unknown>>
    const models = form.getAll('models')
    if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 10 || models.length !== rawItems.length) throw new Error('Your cart could not be read. Please return to the cart and try again.')
    const orderId = crypto.randomUUID()
    const items = await Promise.all(rawItems.map(async (quote, index) => {
      const model = models[index]
      const amount = Math.max(100, Math.round(Number(quote.price) * 100))
      const quantity = Math.max(1, Math.min(99, Math.round(Number(quote.quantity) || 1)))
      if (!Number.isFinite(amount)) throw new Error('One of the quoted prices is invalid.')
      if (!(model instanceof File) || !model.size) throw new Error('One of the model files is missing.')
      if (model.size > 20 * 1024 * 1024) throw new Error(`${model.name} must be smaller than 20 MB.`)
      const modelName = model.name
      const blob = await put(`print-orders/${orderId}/${index + 1}-${model.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`, Buffer.from(await model.arrayBuffer()), { access: 'private', contentType: model.type || 'application/octet-stream', addRandomSuffix: false })
      return { modelName, modelUrl: blob.url, amount, quantity, material: String(quote.material || ''), colour: String(quote.color || ''), infill: String(quote.infill || ''), layerHeight: String(quote.quality || ''), estimatedVolume: String(quote.estimatedVolume || '') }
    }))
    const manifestBlob = await put(`print-orders/${orderId}/manifest.json`, JSON.stringify({ orderId, items }), { access: 'private', contentType: 'application/json', addRandomSuffix: false })
    const shippingAmount = shippingByDestination[destination] + (rural ? 600 : 0)
    const origin = new URL(request.url).origin
    const stripe = new Stripe(secretKey)
    const metadata = { order_type: '3d_print_cart', ...addressMetadata(customer), destination, rural: String(rural), print_manifest_url: manifestBlob.url, print_download_token: crypto.randomUUID(), item_count: String(items.length), unit_count: String(items.reduce((sum, item) => sum + item.quantity, 0)) }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', invoice_creation: { enabled: true }, customer_creation: 'always', customer_email: customer.email, billing_address_collection: 'required',
      line_items: [
        ...items.map(item => ({ quantity: item.quantity, price_data: { currency: 'nzd', unit_amount: item.amount, product_data: { name: `Custom 3D print — ${item.modelName}`.slice(0, 120), description: `${item.material} · ${item.colour} · ${item.infill}% infill · ${item.layerHeight} mm layers`.slice(0, 500) } } })),
        ...(pickup ? [] : [{ quantity: 1, price_data: { currency: 'nzd', unit_amount: shippingAmount, product_data: { name: `Delivery — ${destinationLabels[destination]}${rural ? ' (rural)' : ''}` } } }] as Stripe.Checkout.SessionCreateParams.LineItem[]),
      ],
      metadata,
      payment_intent_data: { receipt_email: customer.email, ...(pickup ? {} : { shipping: { name: customer.name, phone: customer.phone, address: { line1: customer.address, line2: customer.address2 || undefined, city: customer.city, state: customer.region, postal_code: customer.postalCode, country: destination === 'australia' ? 'AU' : 'NZ' } } }), metadata },
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

function fromAddress(sender: string) {
  const clean = sender.trim()
  return /<[^<>\s]+@[^<>\s]+>$/.test(clean) ? clean : `KiwiKoru 3D <${clean}>`
}

function orderDownloadUrl(sessionId: string, token: string, index: number) {
  const query = new URLSearchParams({ action: 'download', session_id: sessionId, token, file: String(index) })
  return `https://www.kiwikoru.co.nz/api/stripe-checkout?${query}`
}

async function privateAttachment(url: string, filename: string, contentId?: string) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return undefined
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } })
    if (!response.ok) throw new Error(`Blob download returned ${response.status}`)
    const content = Buffer.from(await response.arrayBuffer())
    if (!content.length || content.length > 25 * 1024 * 1024) return undefined
    return { filename, content, ...(contentId ? { contentId } : {}) }
  } catch (error) {
    console.error('[order-confirmation] unable to attach customer file', { error })
    return undefined
  }
}

type PrintManifest = { items: Array<{ modelUrl: string; modelName: string; amount: number; quantity: number; material: string; colour: string; infill: string; layerHeight: string }> }

async function readPrintManifest(metadata: Record<string, string>): Promise<PrintManifest | undefined> {
  if (!metadata.print_manifest_url || !process.env.BLOB_READ_WRITE_TOKEN) return undefined
  try {
    const response = await fetch(metadata.print_manifest_url, { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } })
    if (!response.ok) throw new Error(`Manifest download returned ${response.status}`)
    return await response.json() as PrintManifest
  } catch (error) {
    console.error('[order-confirmation] unable to read print manifest', { error })
    return undefined
  }
}

async function orderAttachments(metadata: Record<string, string>, manifest?: PrintManifest) {
  if (metadata.youshie_image_url) {
    const [generated, original] = await Promise.all([
      privateAttachment(metadata.youshie_image_url, 'generated-youshie.jpg', 'customer-youshie'),
      metadata.youshie_original_url ? privateAttachment(metadata.youshie_original_url, 'original-reference-photo.jpg', 'original-reference') : undefined,
    ])
    return [generated, original].filter(Boolean) as NonNullable<Awaited<ReturnType<typeof privateAttachment>>>[]
  }
  if (manifest?.items.length) {
    const attachments = await Promise.all(manifest.items.map(item => privateAttachment(item.modelUrl, item.modelName || 'customer-model.stl')))
    return attachments.filter(Boolean) as NonNullable<Awaited<ReturnType<typeof privateAttachment>>>[]
  }
  const model = await privateAttachment(metadata.model_url, metadata.model_name || 'customer-model.stl')
  return model ? [model] : []
}

export async function confirmCheckout(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return Response.json({ error: 'Confirmation unavailable.' }, { status: 503 })
  try {
    const { sessionId } = await request.json() as { sessionId?: string }
    if (!sessionId?.startsWith('cs_')) return Response.json({ error: 'Invalid payment session.' }, { status: 400 })
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['invoice'] })
    if (session.payment_status !== 'paid') return Response.json({ error: 'Payment has not been completed.' }, { status: 409 })
    const m = session.metadata || {}
    const email = m.customer_email || session.customer_details?.email
    if (!email) throw new Error('Customer email is missing.')
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const typeName = m.order_type === 'youshie' ? 'personalised Youshie' : m.order_type === '3d_print_cart' ? `${safe(m.unit_count)} custom 3D printed units` : 'custom 3D print'
      const fulfilment = m.destination === 'pickup' ? 'Free pick up in Morningside, Whangārei. We’ll email when it is ready.' : `${safe(m.delivery_address)}, ${safe(m.delivery_city)}, ${safe(m.delivery_region)} ${safe(m.delivery_postcode)}`
      const orderNumber = `KK-${new Date(session.created * 1000).toISOString().slice(0, 10).replaceAll('-', '')}-${session.id.slice(-6).toUpperCase()}`
      const invoiceNumber = typeof session.invoice === 'object' && session.invoice ? session.invoice.number : undefined
      const receiptReference = invoiceNumber || String(session.payment_intent || session.id)
      const details = `<p><strong>Order:</strong> ${safe(typeName)}</p><p><strong>Order number:</strong> ${safe(orderNumber)}</p><p><strong>Invoice / payment reference:</strong> ${safe(receiptReference)}</p><p><strong>Total paid:</strong> NZ${((session.amount_total || 0) / 100).toFixed(2)}</p><p><strong>${m.destination === 'pickup' ? 'Collection' : 'Delivery'}:</strong> ${fulfilment}</p><p><strong>Phone:</strong> ${safe(m.customer_phone)}</p>`
      const sender = fromAddress(process.env.RESEND_FROM || process.env.EMAIL_FROM || 'onboarding@resend.dev')
      const owner = [...new Set([process.env.RESEND_TO, process.env.EMAIL_TO, 'kiwikoru3d@gmail.com'].filter(Boolean) as string[])]
      const customerHtml = brandedEmail({ eyebrow: `Order confirmed · ${orderNumber}`, title: `Thank you, ${m.customer_name}!`, intro: 'Your payment has been received and your idea is now safely in the hands of the KiwiKoru team.', content: `<div style="margin:24px 0;padding:20px;border-radius:14px;background:#f7f5ef;border:1px solid #e3dfd5">${details}</div><h2 style="font-size:18px;color:#253126">What happens next?</h2><p style="line-height:1.65;color:#506056">We’ll prepare your order and contact you by email when it is ready ${m.destination === 'pickup' ? 'to collect' : 'to dispatch'}. If anything needs changing, simply reply to this message.</p>` })
      const customerMessage = await resend.emails.send(
        { from: sender, to: email, subject: `We’re making it real — order ${orderNumber} confirmed`, html: customerHtml },
        { headers: { 'Idempotency-Key': `order-customer-${session.id}` } },
      )
      if (customerMessage.error || !customerMessage.data?.id) {
        console.error('[order-confirmation] customer email rejected', { sessionId: session.id, error: customerMessage.error })
        throw new Error(`Customer confirmation rejected: ${customerMessage.error?.message || 'No delivery ID returned.'}`)
      }

      const manifest = await readPrintManifest(m)
      const attachments = await orderAttachments(m, manifest)
      const attachment = attachments[0]
      const downloadToken = m.print_download_token || ''
      const downloadLinks = manifest?.items.map((item, index) => downloadToken ? `<li style="margin:8px 0"><a href="${orderDownloadUrl(session.id, downloadToken, index)}" style="display:inline-block;padding:10px 14px;border-radius:9px;background:#e8c9a0;color:#253126;font-weight:800;text-decoration:none">Download ${safe(item.modelName)}</a> <span style="color:#687269;font-size:12px">available for 7 days</span></li>` : '').join('') || ''
      const isYoushie = m.order_type === 'youshie' || m.order_type === 'youshie_test'
      const fileName = isYoushie ? 'Youshie customer image' : (m.model_name || '3D model')
      const cartItemRows = manifest?.items.map(item => `<tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">${safe(item.quantity)}× ${safe(item.modelName)}</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${safe(item.material)} · ${safe(item.colour)} · ${safe(item.infill)}% infill · ${safe(item.layerHeight)} mm</td></tr>`).join('') || ''
      const ownerContent = `
        ${isYoushie && attachment ? '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:0 0 24px"><div style="text-align:center"><img src="cid:customer-youshie" alt="Generated Youshie" style="display:block;width:260px;max-width:100%;border-radius:16px"><small>Generated Youshie</small></div>' + (m.youshie_original_url ? '<div style="text-align:center"><img src="cid:original-reference" alt="Original reference" style="display:block;width:260px;max-width:100%;border-radius:16px"><small>Original reference photo</small></div>' : '') + '</div>' : ''}
        ${!isYoushie ? `<div style="margin:0 0 24px;padding:22px;border-radius:16px;background:#253126;color:#fff;text-align:center"><div style="font-size:38px">◫</div><strong style="display:block;margin-top:8px;font-size:18px">${safe(fileName)}</strong><span style="display:block;margin-top:6px;color:#e8c9a0;font-size:13px">STL production file ${attachment ? 'attached to this email' : 'stored with the paid order'}</span></div>${downloadLinks ? `<div style="margin:0 0 24px;padding:18px;border-radius:14px;background:#f2f4ea"><strong style="color:#253126">Production-file downloads</strong><p style="margin:6px 0 10px;color:#526158;font-size:13px">Use these private links if the attachment is blocked or too large. They expire 7 days after payment.</p><ul style="margin:0;padding-left:18px">${downloadLinks}</ul></div>` : ''}` : ''}
        <table role="presentation" style="width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden">
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Customer</td><td style="padding:12px 16px;border-bottom:1px solid #eee;font-weight:700">${safe(m.customer_name)}</td></tr>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Email</td><td style="padding:12px 16px;border-bottom:1px solid #eee"><a href="mailto:${safe(email)}">${safe(email)}</a></td></tr>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Phone</td><td style="padding:12px 16px;border-bottom:1px solid #eee"><a href="tel:${safe(m.customer_phone)}">${safe(m.customer_phone)}</a></td></tr>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Product</td><td style="padding:12px 16px;border-bottom:1px solid #eee;font-weight:700">${safe(typeName)}</td></tr>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Customer file${attachments.length === 1 ? '' : 's'}</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${manifest ? `${safe(manifest.items.length)} configured model${manifest.items.length === 1 ? '' : 's'}` : safe(fileName)}${attachment ? ` — ${attachments.length} file${attachments.length === 1 ? '' : 's'} attached` : ''}</td></tr>
        ${cartItemRows || (!isYoushie ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">Print settings</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${safe(m.material)} · ${safe(m.colour)} · ${safe(m.infill)}% infill · ${safe(m.layer_height)} mm</td></tr>` : '')}
        <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#687269">${m.destination === 'pickup' ? 'Collection' : 'Delivery'}</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${m.destination === 'pickup' ? 'Pick up in Morningside, Whangārei — exact address supplied when ready' : `${safe(m.delivery_address)}<br>${safe(m.delivery_city)}, ${safe(m.delivery_region)} ${safe(m.delivery_postcode)}<br>${safe(destinationLabels[m.destination as Destination] || m.destination)}${m.rural === 'true' ? ' — Rural delivery' : ''}`}</td></tr>
        <tr><td style="padding:12px 16px;color:#687269">Total paid</td><td style="padding:12px 16px;font-size:20px;font-weight:800">NZ$${((session.amount_total || 0) / 100).toFixed(2)}</td></tr></table>
        <p style="margin:22px 0 5px"><strong>KiwiKoru order number:</strong> ${safe(orderNumber)}</p><p style="margin:5px 0"><strong>Invoice / payment reference:</strong> ${safe(receiptReference)}</p><p style="margin:0;color:#687269;font-size:13px">Keep this email as the production and dispatch record for this order.</p>`
      const ownerHtml = brandedEmail({ internal: true, eyebrow: 'New paid order', title: orderNumber, intro: 'Payment is confirmed by Stripe. This project is ready to organise for production.', content: ownerContent })
      const ownerMessage = await resend.emails.send(
        { from: sender, to: owner, replyTo: email, subject: `PAID ${orderNumber} — ${safe(m.customer_name)} — ${safe(typeName)}`, html: ownerHtml, attachments: attachments.length ? attachments : undefined },
        { headers: { 'Idempotency-Key': `order-owner-v3-${session.id}` } },
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


async function downloadPrintFile(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return new Response('Download service is unavailable.', { status: 503 })
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id') || ''
  const token = url.searchParams.get('token') || ''
  const index = Number(url.searchParams.get('file') || '0')
  if (!sessionId.startsWith('cs_') || !token || !Number.isInteger(index) || index < 0) return new Response('Invalid download link.', { status: 400 })

  try {
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const metadata = session.metadata || {}
    const expired = Date.now() > (session.created * 1000) + 7 * 24 * 60 * 60 * 1000
    if (session.payment_status !== 'paid' || metadata.order_type !== '3d_print_cart' || metadata.print_download_token !== token || expired) {
      return new Response(expired ? 'This download link expired after 7 days.' : 'This download link is unavailable.', { status: 403 })
    }
    const manifest = await readPrintManifest(metadata)
    const item = manifest?.items[index]
    if (!item) return new Response('File not found.', { status: 404 })
    const file = await privateAttachment(item.modelUrl, item.modelName || 'customer-model.stl')
    if (!file) return new Response('The stored file could not be retrieved.', { status: 404 })
    return new Response(file.content, { headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${String(file.filename).replace(/["\\]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
    } })
  } catch (error) {
    console.error('[order-download] failed', { error })
    return new Response('The file could not be downloaded.', { status: 500 })
  }
}

async function sendContactEmails(request: Request) {
  const body = await request.json() as { name?: unknown; email?: unknown; subject?: unknown; message?: unknown }
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()
  if (!name || !subject || !message || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: 'Please complete your name, email, subject and message.' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  const sender = process.env.RESEND_FROM || process.env.EMAIL_FROM
  if (!apiKey || !sender) return Response.json({ error: 'Email service is not configured.' }, { status: 503 })

  const resend = new Resend(apiKey)
  const owner = [...new Set([process.env.RESEND_TO, process.env.EMAIL_TO, 'kiwikoru3d@gmail.com'].filter(Boolean) as string[])]
  const requestId = crypto.randomUUID()
  const ownerHtml = brandedEmail({
    internal: true,
    eyebrow: 'New website message',
    title: subject,
    intro: 'A customer has contacted KiwiKoru through the website.',
    content: emailDetails([['Name', emailSafe(name)], ['Email', '<a href="mailto:' + emailSafe(email) + '" style="color:#3f572d;font-weight:700">' + emailSafe(email) + '</a>'], ['Received', emailSafe(new Date().toLocaleString('en-NZ'))]]) + '<h2 style="margin:26px 0 10px;color:#253126;font-size:18px">Message</h2><div style="padding:17px;border-radius:12px;background:#f2f4ea;color:#334237;font-size:14px;line-height:1.65">' + emailSafe(message).replace(/\n/g, '<br>') + '</div>',
  })
  const customerHtml = brandedEmail({
    eyebrow: 'Message received',
    title: 'Thanks, ' + emailSafe(name) + '.',
    intro: 'Your message has arrived safely with the KiwiKoru team. We will reply as soon as we can.',
    content: emailDetails([['Subject', '<strong>' + emailSafe(subject) + '</strong>']]) + '<p style="margin:22px 0 0;color:#526158;font-size:14px;line-height:1.7">You can reply directly to this email if there is anything else we should know.</p>',
  })
  const [ownerResult, customerResult] = await Promise.all([
    resend.emails.send({ from: 'KiwiKoru 3D <' + sender + '>', to: owner, replyTo: email, subject: 'Website message — ' + subject, html: ownerHtml }, { headers: { 'Idempotency-Key': 'contact-owner-' + requestId } }),
    resend.emails.send({ from: 'KiwiKoru 3D <' + sender + '>', to: email, subject: 'We received your KiwiKoru message', html: customerHtml }, { headers: { 'Idempotency-Key': 'contact-customer-' + requestId } }),
  ])
  if (ownerResult.error || customerResult.error || !ownerResult.data?.id || !customerResult.data?.id) {
    console.error('[contact] email rejected', { owner: ownerResult.error, customer: customerResult.error })
    return Response.json({ error: 'Email service could not accept the message.' }, { status: 502 })
  }
  return Response.json({ success: true })
}

async function handleStripeWebhook(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secretKey || !webhookSecret || !signature) return Response.json({ error: 'Webhook configuration is missing.' }, { status: 400 })

  try {
    const stripe = new Stripe(secretKey)
    const event = stripe.webhooks.constructEvent(Buffer.from(await request.arrayBuffer()), signature, webhookSecret)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status === 'paid') {
        const confirmation = await confirmCheckout(new Request('https://www.kiwikoru.co.nz/api/checkout-confirmation', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id }),
        }))
        if (!confirmation.ok) throw new Error('Order confirmation email failed.')
      }
    }
    return Response.json({ received: true })
  } catch (error) {
    console.error('[stripe-webhook] failed', error)
    return Response.json({ error: 'Webhook processing failed.' }, { status: 400 })
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const requestAction = new URL(request.url || '/api/stripe-checkout', 'https://www.kiwikoru.co.nz').searchParams.get('action')
  if (request.method !== 'POST' && !(request.method === 'GET' && requestAction === 'download')) {
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
      headers: { 'Content-Type': request.headers['content-type'] || 'application/json', ...(typeof request.headers['stripe-signature'] === 'string' ? { 'stripe-signature': request.headers['stripe-signature'] } : {}) },
      ...(request.method === 'GET' ? {} : { body }),
    })
    const action = new URL(requestUrl).searchParams.get('action')
    const checkoutResponse = action === 'print' ? await createPrintCheckout(webRequest) : action === 'confirm' ? await confirmCheckout(webRequest) : action === 'contact' ? await sendContactEmails(webRequest) : action === 'webhook' ? await handleStripeWebhook(webRequest) : action === 'download' ? await downloadPrintFile(webRequest) : action === 'youshie' ? await createYoushieCheckout(webRequest) : Response.json({ error: 'Unknown checkout action.' }, { status: 404 })
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
