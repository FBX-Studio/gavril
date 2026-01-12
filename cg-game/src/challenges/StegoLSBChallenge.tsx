import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

function randInt(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a + 1))
}

function lsb(v: number) {
  return v & 1
}

export function StegoLSBChallenge({ onPass }: { onPass: (r: { score: number }) => void }) {
  const pixels = useMemo(() => Array.from({ length: 8 }, () => randInt(0, 255)), [])
  const expected = useMemo(() => pixels.map((p) => lsb(p)).join(''), [pixels])

  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; expected: string }>(null)

  const check = () => {
    const a = answer.trim().replace(/\s+/g, '')
    const ok = a.length === 8 && /^[01]+$/.test(a) && a === expected
    setResult({ ok, expected })
    if (ok) onPass({ score: 1 })
  }

  const reset = () => {
    setAnswer('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: LSB-стеганография</div>
        <div className="mt-2 text-xs text-white/70">
          Даны 8 значений яркости пикселей (0..255). Извлеки сообщение как последовательность из 8 бит (младший бит каждого значения).
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {pixels.map((p, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              {p}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs text-white/70">Ответ (8 бит)</label>
            <input
              className="mt-1 w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none focus:border-indigo-400/60"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="например: 01001101"
            />
          </div>
          <Button onClick={check}>Проверить</Button>
          <Button variant="ghost" onClick={reset}>
            Сброс
          </Button>
        </div>

        {result && (
          <div className="mt-2 text-xs text-white/70">{result.ok ? 'Верно!' : `Неверно. Правильно: ${result.expected}`}</div>
        )}

        <div className="mt-2 text-xs text-white/50">Подсказка: LSB = v mod 2.</div>
      </Card>
    </div>
  )
}
