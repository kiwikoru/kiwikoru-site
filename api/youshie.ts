import type { IncomingMessage, ServerResponse } from 'node:http'
import { YOUSHIE_PROMPT } from '../shared/youshiePrompt'

export const maxDuration = 120
const ALLOWED_ORIGINS = new Set(['https://kiwikoru.co.nz', 'https://www.kiwikoru.co.nz'])

type RequestBody = { image?: string; mimeType?: string }

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
  if (origin && !isLocal && !ALLOWED_ORIGINS.has(origin)) return send(response, 403, { error: 'Request origin not allowed.' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return send(response, 503, { error: 'Youshie generation is not configured yet.' })

  try {
    const { image, mimeType } = await readJson(request)
    if (!image || !mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return send(response, 400, { error: 'Please upload a JPG, PNG, or WebP photo.' })
    }
    if (image.length > 6_000_000) return send(response, 413, { error: 'The photo is too large. Please choose a smaller image.' })

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: YOUSHIE_PROMPT }, { inlineData: { mimeType, data: image } }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
            thinkingConfig: { thinkingLevel: 'HIGH', includeThoughts: false },
          },
        }),
      },
    )

    const result = await geminiResponse.json() as {
      error?: { message?: string }
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string }; thought?: boolean }> } }>
    }
    if (!geminiResponse.ok) throw new Error(result.error?.message || 'Gemini could not generate the image.')

    const generated = result.candidates?.flatMap(candidate => candidate.content?.parts || [])
      .find(part => !part.thought && part.inlineData?.data)?.inlineData
    if (!generated?.data) throw new Error('Gemini returned no image. Try a clearer front-facing photo.')

    return send(response, 200, { image: generated.data, mimeType: generated.mimeType || 'image/png' })
  } catch (error) {
    console.error('Youshie generation failed', error)
    return send(response, 500, { error: error instanceof Error ? error.message : 'Could not create this Youshie.' })
  }
}
