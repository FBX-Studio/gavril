import { useEffect, useMemo, useRef, useState } from 'react'
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

export function BresenhamDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [gridSize, setGridSize] = useState(24)
  const [a, setA] = useState<Pt>({ x: 2, y: 4 })
  const [b, setB] = useState<Pt>({ x: 18, y: 14 })

  const pts = useMemo(() => bresenhamLine(a, b), [a, b])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const cell = 18
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

    // ideal line
    ctx.strokeStyle = 'rgba(96,165,250,0.55)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo((a.x + 0.5) * cell, (a.y + 0.5) * cell)
    ctx.lineTo((b.x + 0.5) * cell, (b.y + 0.5) * cell)
    ctx.stroke()

    // pixels
    for (const p of pts) {
      ctx.fillStyle = 'rgba(129,140,248,0.95)'
      ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2)
    }

    // endpoints
    const drawPoint = (p: Pt, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    drawPoint(a, 'rgba(34,197,94,0.9)')
    drawPoint(b, 'rgba(239,68,68,0.9)')
  }, [a, b, gridSize, pts])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-semibold text-white">Брезенхем: линия по пикселям</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/70">A.x: {a.x}</label>
            <input className="w-full" type="range" min={0} max={gridSize - 1} value={a.x} onChange={(e) => setA((p) => ({ ...p, x: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs text-white/70">A.y: {a.y}</label>
            <input className="w-full" type="range" min={0} max={gridSize - 1} value={a.y} onChange={(e) => setA((p) => ({ ...p, y: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs text-white/70">B.x: {b.x}</label>
            <input className="w-full" type="range" min={0} max={gridSize - 1} value={b.x} onChange={(e) => setB((p) => ({ ...p, x: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs text-white/70">B.y: {b.y}</label>
            <input className="w-full" type="range" min={0} max={gridSize - 1} value={b.y} onChange={(e) => setB((p) => ({ ...p, y: Number(e.target.value) }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/70">Размер сетки: {gridSize}</label>
            <input className="w-full" type="range" min={12} max={34} value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-3 text-xs text-white/60">Пиксели выбраны целочисленно, без float. Голубая линия — идеальная (для сравнения).</div>
      </Card>

      <Card>
        <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3">
          <canvas ref={canvasRef} className="max-w-full rounded-xl" />
        </div>
        <div className="mt-2 text-xs text-white/60">Зелёная точка — A, красная — B.</div>
      </Card>
    </div>
  )
}
