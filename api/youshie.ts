import type { IncomingMessage, ServerResponse } from 'node:http'
import { YOUSHIE_PROMPT } from '../shared/youshiePrompt.js'

export const maxDuration = 120
const ALLOWED_ORIGINS = new Set(['https://kiwikoru.co.nz', 'https://www.kiwikoru.co.nz'])
const isKiwiKoruPreview = (origin?: string) => Boolean(origin && /^https:\/\/kiwikoru-funciona-[a-z0-9-]+-kiwi-koru3d\.vercel\.app$/.test(origin))

type RequestBody = { image?: string; styleReference?: string; faceReference?: string; mimeType?: string }
type GeminiResult = {
  error?: { message?: string }
  candidates?: Array<{
    finishReason?: string
    finishMessage?: string
    content?: { parts?: Array<{ text?: string; inlineData?: { data?: string; mimeType?: string }; thought?: boolean }> }
  }>
}

function send(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

async function readJson(request: IncomingMessage): Promise<RequestBody> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as RequestBody
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed' })

  const origin = request.headers.origin
  const isLocal = origin?.startsWith('http://localhost:') || origin?.startsWith('http://127.0.0.1:')
  if (origin && !isLocal && !isKiwiKoruPreview(origin) && !ALLOWED_ORIGINS.has(origin)) return send(response, 403, { error: 'Request origin not allowed.' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return send(response, 503, { error: 'Youshie generation is not configured yet.' })

  try {
    const { image, styleReference, faceReference, mimeType } = await readJson(request)
    if (!image || !mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return send(response, 400, { error: 'Please upload a JPG, PNG, or WebP photo.' })
    }
    if (image.length > 6_000_000) return send(response, 413, { error: 'The photo is too large. Please choose a smaller image.' })

    let result: GeminiResult = {}
    let generatedSuccessfully = false
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: `${YOUSHIE_PROMPT}\n\nIMAGE ORDER: The FIRST image is an authentic USHI FULL-BODY STYLE REFERENCE. Study its extremely short legs, tiny mitten hands, compact proportions, chunky printable construction, and handmade FDM character. The SECOND image is an authentic USHI FACE REFERENCE. Study its plump solid-black eyes and especially its mouth construction: the smile is a short cavity sculpted into the skin-colour face, with skin-colour lips and only a restrained glimpse of thick simplified teeth. Do not copy either reference character's identity, costume, or copyrighted design. The FINAL image is the PERSON TO TRANSFORM. Preserve only the final image's identity, hair, expression, clothing, and recognizable traits.` },
            ...(styleReference ? [{ inlineData: { mimeType: 'image/jpeg', data: styleReference } }] : []),
            ...(faceReference ? [{ inlineData: { mimeType: 'image/jpeg', data: faceReference } }] : []),
            { inlineData: { mimeType, data: image } },
          ] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
            thinkingConfig: { thinkingLevel: 'HIGH', includeThoughts: false },
          },
        }),
      })

      result = await geminiResponse.json() as GeminiResult
      if (geminiResponse.ok) { generatedSuccessfully = true; break }
      const retryable = geminiResponse.status === 429 || geminiResponse.status === 503 || /high demand|temporar/i.test(result.error?.message || '')
      if (!retryable || attempt === 2) throw new Error(result.error?.message || 'Gemini could not generate the image.')
      await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)))
    }
    if (!generatedSuccessfully) throw new Error('Gemini could not generate the image.')

    const generated = result.candidates?.flatMap(candidate => candidate.content?.parts || [])
      .find(part => !part.thought && part.inlineData?.data)?.inlineData
    if (!generated?.data) {
      const candidate = result.candidates?.[0]
      const explanation = candidate?.content?.parts?.find(part => part.text && !part.thought)?.text
      throw new Error(candidate?.finishMessage || explanation || `Gemini returned no image${candidate?.finishReason ? ` (${candidate.finishReason})` : ''}. Try a clearer front-facing photo.`)
    }

    return send(response, 200, { image: generated.data, mimeType: generated.mimeType || 'image/png' })
  } catch (error) {
    console.error('Youshie generation failed', error)
    return send(response, 500, { error: error instanceof Error ? error.message : 'Could not create this Youshie.' })
  }
}
