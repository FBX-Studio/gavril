import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

function randInt(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a + 1))
}

type Mat3 = [[number, number, number], [number, number, number], [number, number, number]]

function applyKernel(p: Mat3, k: Mat3) {
  let s = 0
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) s += p[y][x] * k[y][x]
  }
  // clamp 0..255 like typical image pipeline
  return Math.max(0, Math.min(255, Math.round(s)))
}

export function ConvolutionChallenge({ onPass }: { onPass: (r: { score: number }) => void }) {
  const pixels = useMemo<Mat3>(() => {
    // вокруг центра держим значения близкими, чтобы не было диких отрицательных после sharpening
    const base = randInt(40, 210)
    return [
      [base + randInt(-30, 30), base + randInt(-30, 30), base + randInt(-30, 30)],
      [base + randInt(-30, 30), base + randInt(-30, 30), base + randInt(-30, 30)],
      [base + randInt(-30, 30), base + randInt(-30, 30), base + randInt(-30, 30)],
    ] as Mat3
  }, [])

  const kernel = useMemo<Mat3>(() => [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], [])
  const expected = useMemo(() => applyKernel(pixels, kernel), [kernel, pixels])

  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; expected: number }>(null)

  const check = () => {
    const n = Number(answer)
    const ok = Number.isFinite(n) && Math.round(n) === expected
    setResult({ ok, expected })
    if (ok) onPass({ score: 1 })
  }

  const reset = () => {
    setAnswer('')
    setResult(null)
  }

  const Cell = ({ v }: { v: number }) => (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-white/80">{v}</div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: свёртка (convolution)</div>
        <div className="mt-2 text-xs text-white/70">
          Посчитай значение нового центрального пикселя после применения 3×3 ядра (sharpen). Округляем и ограничиваем в диапазон 0..255.
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-white/70">Пиксели (3×3)</div>
            <div className="mt-2 grid w-fit grid-cols-3 gap-2">
              {pixels.flat().map((v, i) => (
                <Cell key={i} v={v} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/70">Ядро</div>
            <div className="mt-2 grid w-fit grid-cols-3 gap-2">
              {kernel.flat().map((v, i) => (
                <Cell key={i} v={v} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs text-white/70">Ответ</label>
            <input
              className="mt-1 w-40 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              inputMode="numeric"
              placeholder="0..255"
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
      </Card>
    </div>
  )
}
