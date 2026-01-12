import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { isFreeModel, listOpenRouterModels, openRouterChat, type ORMessage, type ORModel } from '../lib/openrouter'

type Msg = ORMessage

const KEY_STORAGE = 'cg_game_openrouter_key_v1'
const MODEL_STORAGE = 'cg_game_openrouter_model_v1'

export function ChatPage() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? '')
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_STORAGE) ?? 'openrouter/auto')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [models, setModels] = useState<ORModel[]>([])
  const [onlyFree, setOnlyFree] = useState(true)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'system',
      content:
        'Ты помощник по экзамену по компьютерной графике. Отвечай кратко, по делу, с примерами и формулами, если нужно. Язык: русский.',
    },
  ])

  const visible = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages])

  useEffect(() => {
    localStorage.setItem(KEY_STORAGE, apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE, model)
  }, [model])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await listOpenRouterModels()
        if (!alive) return
        setModels(list)
      } catch {
        // не блокируем чат, если список моделей недоступен
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const modelOptions = useMemo(() => {
    const list = models.slice().sort((a, b) => a.id.localeCompare(b.id))
    return onlyFree ? list.filter(isFreeModel) : list
  }, [models, onlyFree])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return

    if (!apiKey.trim()) {
      setError('Нужен API ключ OpenRouter. Вставь ключ в поле выше.')
      return
    }

    setError('')
    setBusy(true)
    const next = [...messages, { role: 'user', content: text } as Msg]
    setMessages(next)
    setInput('')

    try {
      const answer = await openRouterChat({
        apiKey: apiKey.trim(),
        model: model.trim(),
        messages: next,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold text-white">Нейро-чат (OpenRouter API)</div>
        <div className="mt-2 text-sm text-white/70">
          Вставь API‑ключ OpenRouter и выбери модель. Я могу подсвечивать модели с нулевой ценой, но доступность «free» зависит от OpenRouter.
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="text-xs text-white/70">OpenRouter API key</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              type="password"
              autoComplete="off"
            />
            <div className="mt-1 text-xs text-white/50">Ключ хранится только в твоём браузере (localStorage).</div>
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs text-white/70">Модель</label>
            {modelOptions.length > 0 ? (
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {modelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="например: openrouter/auto"
              />
            )}
            <label className="mt-2 flex items-center gap-2 text-xs text-white/70">
              <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />
              Показывать только бесплатные
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/70">Вопрос</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Например: объясни разницу Гуро и Фонга простыми словами"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void send()
                }}
              />
              <Button onClick={() => void send()} disabled={busy}>
                Отправить
              </Button>
            </div>
          </div>
        </div>
        {error && <div className="mt-3 whitespace-pre-wrap text-xs text-rose-200">{error}</div>}
      </Card>

      <Card>
        <div className="space-y-3">
          {visible.length === 0 ? (
            <div className="text-sm text-white/70">Задай вопрос — здесь появится диалог.</div>
          ) : (
            visible.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={[
                    'inline-block max-w-[min(60ch,100%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/30'
                      : 'bg-white/5 text-white/80 ring-1 ring-white/10',
                  ].join(' ')}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
