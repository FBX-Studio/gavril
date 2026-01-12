import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

function randInt(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a + 1))
}

export function ColorModelsChallenge({ onPass }: { onPass: (r: { score: number }) => void }) {
  const rgb = useMemo(() => ({ r: randInt(0, 255), g: randInt(0, 255), b: randInt(0, 255) }), [])
  const expected = useMemo(
    () => ({ c: 255 - rgb.r, m: 255 - rgb.g, y: 255 - rgb.b }),
    [rgb.b, rgb.g, rgb.r],
  )

  const [c, setC] = useState('')
  const [m, setM] = useState('')
  const [y, setY] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; expected: typeof expected }>(null)

  const check = () => {
    const cn = Number(c)
    const mn = Number(m)
    const yn = Number(y)

    const ok =
      Number.isFinite(cn) &&
      Number.isFinite(mn) &&
      Number.isFinite(yn) &&
      Math.abs(cn - expected.c) <= 1 &&
      Math.abs(mn - expected.m) <= 1 &&
      Math.abs(yn - expected.y) <= 1

    setResult({ ok, expected })
    if (ok) onPass({ score: 1 })
  }

  const reset = () => {
    setC('')
    setM('')
    setY('')
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: RGB → CMY</div>
        <div className="mt-2 text-xs text-white/70">
          Переведи цвет из RGB в CMY по формуле: C=255−R, M=255−G, Y=255−B.
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
          Дано: RGB({rgb.r}, {rgb.g}, {rgb.b})
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-white/70">C</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={c}
              onChange={(e) => setC(e.target.value)}
              inputMode="numeric"
              placeholder="0..255"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">M</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={m}
              onChange={(e) => setM(e.target.value)}
              inputMode="numeric"
              placeholder="0..255"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">Y</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={y}
              onChange={(e) => setY(e.target.value)}
              inputMode="numeric"
              placeholder="0..255"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={check}>Проверить</Button>
          <Button variant="ghost" onClick={reset}>
            Сброс
          </Button>
        </div>

        {result && (
          <div className="mt-2 text-xs text-white/70">
            {result.ok ? (
              'Верно!'
            ) : (
              <>
                Неверно. Ожидалось: CMY({result.expected.c}, {result.expected.m}, {result.expected.y})
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
