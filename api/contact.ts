import { Resend } from 'resend'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { brandedEmail, emailDetails, emailSafe } from './lib/branded-email.js'

type ContactInput = { name?: unknown; email?: unknown; subject?: unknown; message?: unknown }

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

async function readJson(request: IncomingMessage): Promise<ContactInput> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as ContactInput
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: 'Method not allowed.' }))
    return
  }

  try {
    const body = await readJson(request)
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const subject = String(body.subject || '').trim()
    const message = String(body.message || '').trim()
    if (!name || !subject || !message || !validEmail(email)) {
      throw new Error('Please complete your name, email, subject and message.')
    }

    const apiKey = process.env.RESEND_API_KEY
    const sender = process.env.RESEND_FROM || process.env.EMAIL_FROM
    if (!apiKey || !sender) {
      throw new Error('Email service is not configured.')
    }

    const resend = new Resend(apiKey)
    const owner = [...new Set([process.env.RESEND_TO, process.env.EMAIL_TO, 'kiwikoru3d@gmail.com'].filter(Boolean) as string[])]
    const requestId = crypto.randomUUID()
    const ownerHtml = brandedEmail({
      internal: true,
      eyebrow: 'New website message',
      title: subject,
      intro: 'A customer has contacted KiwiKoru through the website.',
      content: emailDetails([
        ['Name', emailSafe(name)],
        ['Email', '<a href="mailto:' + emailSafe(email) + '" style="color:#3f572d;font-weight:700">' + emailSafe(email) + '</a>'],
        ['Received', emailSafe(new Date().toLocaleString('en-NZ'))],
      ]) + '<h2 style="margin:26px 0 10px;color:#253126;font-size:18px">Message</h2><div style="padding:17px;border-radius:12px;background:#f2f4ea;color:#334237;font-size:14px;line-height:1.65">' + emailSafe(message).replace(/\n/g, '<br>') + '</div>',
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
      throw new Error('Email service could not accept the message.')
    }

    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ success: true }))
  } catch (error) {
    console.error('[contact] failed', error)
    response.statusCode = error instanceof Error && error.message.includes('complete') ? 400 : 503
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to send message.' }))
  }
}
