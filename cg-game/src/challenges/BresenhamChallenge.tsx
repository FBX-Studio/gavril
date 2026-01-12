import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

type Pt = { x: number; y: number }

function bresenhamLine(a: Pt, b: Pt): Pt[] {
  let x0 = Math.round(a.x)
  let y0 = Math.round(a.y)
  const x1 = Math.round(b.x)
  const y1 = Math.round(b.y)

  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1

  let err = dx - dy
  const pts: Pt[] = []

  while (true) {
    pts.push({ x: x0, y: y0 })
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }

  return pts
}

function key(p: Pt) {
  return `${p.x},${p.y}`
}

export function BresenhamChallenge({
  onPass,
}: {
  onPass: (result: { score: number; perfect: boolean }) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const gridSize = 22
  const cell = 18

  // фиксированный "экзаменационный" отрезок (можно расширить рандомом)
  const a = useMemo<Pt>(() => ({ x: 2, y: 4 }), [])
  const b = useMemo<Pt>(() => ({ x: 18, y: 14 }), [])

  const expected = useMemo(() => new Set(bresenhamLine(a, b).map(key)), [a, b])

  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [reveal, setReveal] = useState(false)
  const [result, setResult] = useState<null | {
    tp: number
    fp: number
    fn: number
    score: number
    perfect: boolean
  }>(null)

  const toggleAt = (p: Pt) => {
    const k = key(p)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    c.width = gridSize * cell
    c.height = gridSize * cell

    ctx.clearRect(0, 0, c.width, c.height)

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cell, 0)
      ctx.lineTo(i * cell, c.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cell)
      ctx.lineTo(c.width, i * cell)
      ctx.stroke()
    }

    // highlight expected if reveal
    if (reveal) {
      for (const k of expected) {
        const [x, y] = k.split(',').map(Number)
        ctx.fillStyle = 'rgba(96,165,250,0.22)'
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
      }
    }

    // selected pixels
    for (const k of selected) {
      const [x, y] = k.split(',').map(Number)
      ctx.fillStyle = 'rgba(129,140,248,0.95)'
      ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4)
    }

    // ideal continuous line (for intuition)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo((a.x + 0.5) * cell, (a.y + 0.5) * cell)
    ctx.lineTo((b.x + 0.5) * cell, (b.y + 0.5) * cell)
    ctx.stroke()

    // endpoints
    const drawPoint = (p: Pt, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    drawPoint(a, 'rgba(34,197,94,0.95)')
    drawPoint(b, 'rgba(239,68,68,0.95)')
  }, [a, b, expected, gridSize, reveal, selected])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    const onClick = (ev: MouseEvent) => {
      const rect = c.getBoundingClientRect()
      const x = Math.floor((ev.clientX - rect.left) / cell)
      const y = Math.floor((ev.clientY - rect.top) / cell)
      if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return
      toggleAt({ x, y })
    }

    c.addEventListener('click', onClick)
    return () => c.removeEventListener('click', onClick)
  }, [gridSize])

  const check = () => {
    let tp = 0
    let fp = 0
    let fn = 0

    for (const k of selected) {
      if (expected.has(k)) tp++
      else fp++
    }
    for (const k of expected) {
      if (!selected.has(k)) fn++
    }

    // score: F1-like, но с небольшим штрафом за лишнее
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
    const recall = tp + fn === 0 ? 1 : tp / (tp + fn)
    const score = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
    const perfect = fp === 0 && fn === 0

    const res = { tp, fp, fn, score, perfect }
    setResult(res)

    if (perfect || score >= 0.92) {
      onPass({ score, perfect })
    }
  }

  const reset = () => {
    setSelected(new Set())
    setReveal(false)
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: нарисуй линию Брезенхемом</div>
        <div className="mt-2 text-xs text-white/70">
          Кликаем по клеткам и выбираем пиксели, которые должны быть включены алгоритмом.
          Зелёная точка — A, красная — B.
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={check}>Проверить</Button>
          <Button variant="secondary" onClick={() => setReveal((v) => !v)}>
            {reveal ? 'Скрыть подсказку' : 'Показать подсказку'}
          </Button>
          <Button variant="ghost" onClick={reset}>
            Сброс
          </Button>
        </div>

        {result && (
          <div className="mt-3 text-xs text-white/70">
            Совпадения: TP={result.tp}, лишние FP={result.fp}, пропуски FN={result.fn}. Балл: {Math.round(result.score * 100)}%
            {result.perfect ? ' (идеально)' : ''}
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3">
          <canvas ref={canvasRef} className="max-w-full rounded-xl" />
        </div>
        <div className="mt-2 text-xs text-white/60">
          Подсказка: алгоритм идёт по главной оси и «накапливает ошибку», выбирая ближайший пиксель.
        </div>
      </Card>
    </div>
  )
}
