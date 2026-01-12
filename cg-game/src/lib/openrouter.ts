export type ORMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type ORModel = {
  id: string
  name?: string
  pricing?: {
    prompt?: string | number
    completion?: string | number
  }
}

export async function listOpenRouterModels(): Promise<ORModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models')
  if (!res.ok) throw new Error(`OpenRouter models HTTP ${res.status}`)
  const data = (await res.json()) as any
  const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  return arr
    .map((m: any) => ({ id: String(m.id ?? ''), name: m.name, pricing: m.pricing }))
    .filter((m: ORModel) => m.id)
}

export async function openRouterChat(opts: {
  apiKey: string
  model: string
  messages: ORMessage[]
  temperature?: number
}): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
      // Рекомендуемые заголовки OpenRouter (кастомные — браузер разрешает)
      'X-Title': 'cg-game',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.3,
      stream: false,
    }),
  })

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `OpenRouter HTTP ${res.status}`)
  }

  const json = (await res.json()) as any
  const content = json?.choices?.[0]?.message?.content
  if (typeof content === 'string' && content.trim()) return content
  return 'Нет ответа (проверь модель/ключ).'
}

export function isFreeModel(model: ORModel): boolean {
  const p = model.pricing?.prompt
  const c = model.pricing?.completion
  const ps = typeof p === 'number' ? p : Number(String(p ?? '').trim())
  const cs = typeof c === 'number' ? c : Number(String(c ?? '').trim())
  return Number.isFinite(ps) && Number.isFinite(cs) && ps === 0 && cs === 0
}
