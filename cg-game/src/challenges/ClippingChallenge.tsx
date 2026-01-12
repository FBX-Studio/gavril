import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

type Pt = { x: number; y: number }

type Rect = { xmin: number; ymin: number; xmax: number; ymax: number }

function clipPolygonToRect(poly: Pt[], r: Rect): Pt[] {
  // Sutherland–Hodgman for axis-aligned rectangle
  const insideLeft = (p: Pt) => p.x >= r.xmin
  const insideRight = (p: Pt) => p.x <= r.xmax
  const insideBottom = (p: Pt) => p.y <= r.ymax
  const insideTop = (p: Pt) => p.y >= r.ymin

  const intersectX = (a: Pt, b: Pt, x: number): Pt => {
    const t = (x - a.x) / (b.x - a.x)
    return { x, y: a.y + (b.y - a.y) * t }
  }

  const intersectY = (a: Pt, b: Pt, y: number): Pt => {
    const t = (y - a.y) / (b.y - a.y)
    return { x: a.x + (b.x - a.x) * t, y }
  }

  const clipEdge = (input: Pt[], inside: (p: Pt) => boolean, intersect: (a: Pt, b: Pt) => Pt): Pt[] => {
    const out: Pt[] = []
    if (input.length === 0) return out

    let prev = input[input.length - 1]
    let prevIn = inside(prev)

    for (const cur of input) {
      const curIn = inside(cur)
      if (curIn) {
        if (!prevIn) out.push(intersect(prev, cur))
        out.push(cur)
      } else if (prevIn) {
        out.push(intersect(prev, cur))
      }
      prev = cur
      prevIn = curIn
    }
    return out
  }

  let out = poly
  out = clipEdge(out, insideLeft, (a, b) => intersectX(a, b, r.xmin))
  out = clipEdge(out, insideRight, (a, b) => intersectX(a, b, r.xmax))
  out = clipEdge(out, insideTop, (a, b) => intersectY(a, b, r.ymin))
  out = clipEdge(out, insideBottom, (a, b) => intersectY(a, b, r.ymax))

  // remove near-duplicate consecutive points
  const cleaned: Pt[] = []
  const eps = 1e-6
  for (const p of out) {
    const last = cleaned[cleaned.length - 1]
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > eps) cleaned.push(p)
  }
  if (cleaned.length >= 2) {
    const first = cleaned[0]
    const last = cleaned[cleaned.length - 1]
    if (Math.hypot(first.x - last.x, first.y - last.y) < eps) cleaned.pop()
  }

  return cleaned
}

export function ClippingChallenge({ onPass }: { onPass: (r: { score: number }) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const rect = useMemo<Rect>(() => ({ xmin: 0, ymin: 0, xmax: 100, ymax: 100 }), [])
  // специально пересекает все 4 стороны окна, давая «интересный» результат
  const poly = useMemo<Pt[]>(
    () => [
      { x: -20, y: 20 },
      { x: 50, y: 130 },
      { x: 120, y: 60 },
      { x: 80, y: -30 },
      { x: 10, y: -10 },
    ],
    [],
  )

  const clipped = useMemo(() => clipPolygonToRect(poly, rect), [poly, rect])

  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; expected: number }>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const w = 360
    const h = 260
    c.width = w
    c.height = h

    const pad = 20
    const sx = (w - pad * 2) / 140
    const sy = (h - pad * 2) / 140
    const tx = (x: number) => pad + (x + 20) * sx
    const ty = (y: number) => pad + (y + 20) * sy

    ctx.clearRect(0, 0, w, h)

    // background grid-ish
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, w, h)

    // clip window
    ctx.strokeStyle = 'rgba(34,197,94,0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(tx(rect.xmin), ty(rect.ymin), (rect.xmax - rect.xmin) * sx, (rect.ymax - rect.ymin) * sy)

    const drawPoly = (pts: Pt[], stroke: string, fill: string) => {
      if (pts.length === 0) return
      ctx.beginPath()
      ctx.moveTo(tx(pts[0].x), ty(pts[0].y))
      for (let i = 1; i < pts.length; i++) ctx.lineTo(tx(pts[i].x), ty(pts[i].y))
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2
      ctx.stroke()
    }

    drawPoly(poly, 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.06)')
    drawPoly(clipped, 'rgba(99,102,241,0.9)', 'rgba(99,102,241,0.12)')

    // vertices
    const drawPts = (pts: Pt[], color: string) => {
      ctx.fillStyle = color
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(tx(p.x), ty(p.y), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    drawPts(poly, 'rgba(255,255,255,0.55)')
    drawPts(clipped, 'rgba(99,102,241,0.95)')
  }, [clipped, poly, rect])

  const check = () => {
    const n = Number(answer)
    const expected = clipped.length
    const ok = Number.isFinite(n) && Math.round(n) === expected
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
        <div className="text-sm font-semibold text-white">Челлендж: отсечение многоугольника (Сазерленд–Ходгман)</div>
        <div className="mt-2 text-xs text-white/70">
          Синий — результат отсечения (показан как подсказка). Вопрос: сколько вершин у отсечённого многоугольника?
        </div>

        <div className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3">
          <canvas ref={canvasRef} className="max-w-full rounded-xl" />
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs text-white/70">Ответ (кол-во вершин)</label>
            <input
              className="mt-1 w-44 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              inputMode="numeric"
              placeholder="например: 6"
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
