import { useMemo, useState } from 'react'
import { Card } from '../components/Card'

type Pt = { x: number; y: number }

function inside(p: Pt, edge: 'left' | 'right' | 'top' | 'bottom', r: { x: number; y: number; w: number; h: number }) {
  if (edge === 'left') return p.x >= r.x
  if (edge === 'right') return p.x <= r.x + r.w
  if (edge === 'top') return p.y >= r.y
  return p.y <= r.y + r.h
}

function intersect(a: Pt, b: Pt, edge: 'left' | 'right' | 'top' | 'bottom', r: { x: number; y: number; w: number; h: number }): Pt {
  const dx = b.x - a.x
  const dy = b.y - a.y

  if (edge === 'left') {
    const x = r.x
    const t = dx === 0 ? 0 : (x - a.x) / dx
    return { x, y: a.y + t * dy }
  }
  if (edge === 'right') {
    const x = r.x + r.w
    const t = dx === 0 ? 0 : (x - a.x) / dx
    return { x, y: a.y + t * dy }
  }
  if (edge === 'top') {
    const y = r.y
    const t = dy === 0 ? 0 : (y - a.y) / dy
    return { x: a.x + t * dx, y }
  }

  const y = r.y + r.h
  const t = dy === 0 ? 0 : (y - a.y) / dy
  return { x: a.x + t * dx, y }
}

function clipPolygon(poly: Pt[], rect: { x: number; y: number; w: number; h: number }) {
  const edges: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom']
  let output = poly

  for (const e of edges) {
    const input = output
    output = []
    if (input.length === 0) break

    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i - 1 + input.length) % input.length]
      const curIn = inside(cur, e, rect)
      const prevIn = inside(prev, e, rect)

      if (curIn) {
        if (!prevIn) output.push(intersect(prev, cur, e, rect))
        output.push(cur)
      } else if (prevIn) {
        output.push(intersect(prev, cur, e, rect))
      }
    }
  }

  return output
}

function toPath(pts: Pt[]) {
  if (pts.length === 0) return ''
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z'
}

export function ClippingDemo() {
  const [offset, setOffset] = useState(36)
  const rect = useMemo(() => ({ x: 80, y: 60, w: 200, h: 160 }), [])

  const poly = useMemo<Pt[]>(
    () => [
      { x: 40 + offset, y: 40 },
      { x: 320, y: 70 + offset * 0.2 },
      { x: 300, y: 260 },
      { x: 130, y: 250 },
      { x: 50, y: 160 },
    ],
    [offset],
  )

  const clipped = useMemo(() => clipPolygon(poly, rect), [poly, rect])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-semibold text-white">Сазерленд–Ходгман: отсечение многоугольника</div>
        <div className="mt-2 text-xs text-white/60">Двигаем исходный многоугольник и смотрим результат внутри окна.</div>
        <div className="mt-4">
          <label className="text-xs text-white/70">Смещение: {Math.round(offset)}</label>
          <input className="w-full" type="range" min={-80} max={120} value={offset} onChange={(e) => setOffset(Number(e.target.value))} />
        </div>
      </Card>

      <Card>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <svg viewBox="0 0 360 300" className="h-auto w-full">
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" />
            <path d={toPath(poly)} fill="rgba(96,165,250,0.14)" stroke="rgba(96,165,250,0.55)" strokeWidth={2} />
            <path d={toPath(clipped)} fill="rgba(129,140,248,0.25)" stroke="rgba(129,140,248,0.95)" strokeWidth={2} />
          </svg>
        </div>
        <div className="mt-2 text-xs text-white/60">Голубой — исходный, фиолетовый — отсечённый.</div>
      </Card>
    </div>
  )
}
