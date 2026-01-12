import { useMemo, useState } from 'react'
import { Card } from '../components/Card'

type Mat3 = [number, number, number, number, number, number, number, number, number]

type Pt = { x: number; y: number }

function mul(A: Mat3, B: Mat3): Mat3 {
  const r: number[] = Array(9).fill(0)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let s = 0
      for (let k = 0; k < 3; k++) s += A[row * 3 + k] * B[k * 3 + col]
      r[row * 3 + col] = s
    }
  }
  return r as Mat3
}

function apply(M: Mat3, p: Pt): Pt {
  const x = M[0] * p.x + M[1] * p.y + M[2] * 1
  const y = M[3] * p.x + M[4] * p.y + M[5] * 1
  const w = M[6] * p.x + M[7] * p.y + M[8] * 1
  return { x: x / w, y: y / w }
}

function T(tx: number, ty: number): Mat3 {
  return [1, 0, tx, 0, 1, ty, 0, 0, 1]
}

function R(deg: number): Mat3 {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c, -s, 0, s, c, 0, 0, 0, 1]
}

function S(sx: number, sy: number): Mat3 {
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1]
}

function toPath(pts: Pt[]) {
  if (!pts.length) return ''
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z'
}

export function Transform2DDemo() {
  const [tx, setTx] = useState(40)
  const [ty, setTy] = useState(20)
  const [rot, setRot] = useState(20)
  const [sx, setSx] = useState(1.1)
  const [sy, setSy] = useState(0.9)

  const base = useMemo<Pt[]>(
    () => [
      { x: 80, y: 70 },
      { x: 200, y: 70 },
      { x: 200, y: 190 },
      { x: 80, y: 190 },
    ],
    [],
  )

  // Порядок: сначала масштаб, потом поворот, потом перенос
  const M = useMemo(() => mul(T(tx, ty), mul(R(rot), S(sx, sy))), [rot, sx, sy, tx, ty])
  const out = useMemo(() => base.map((p) => apply(M, p)), [M, base])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-semibold text-white">2D-преобразования (однородные координаты)</div>
        <div className="mt-2 text-xs text-white/60">Меняем матрицу $3\times 3$ и смотрим, как преобразуется квадрат.</div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/70">Перенос X: {tx}</label>
            <input className="w-full" type="range" min={-80} max={120} value={tx} onChange={(e) => setTx(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-white/70">Перенос Y: {ty}</label>
            <input className="w-full" type="range" min={-80} max={120} value={ty} onChange={(e) => setTy(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-white/70">Поворот: {rot}°</label>
            <input className="w-full" type="range" min={-180} max={180} value={rot} onChange={(e) => setRot(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-white/70">Масштаб X: {sx.toFixed(2)}</label>
            <input className="w-full" type="range" min={20} max={200} value={Math.round(sx * 100)} onChange={(e) => setSx(Number(e.target.value) / 100)} />
          </div>
          <div>
            <label className="text-xs text-white/70">Масштаб Y: {sy.toFixed(2)}</label>
            <input className="w-full" type="range" min={20} max={200} value={Math.round(sy * 100)} onChange={(e) => setSy(Number(e.target.value) / 100)} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-white/60">Идея</div>
          <div className="mt-2 text-xs text-white/70">
            В однородных координатах перенос тоже становится матрицей, а композиция преобразований — обычное умножение матриц.
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <svg viewBox="0 0 320 260" className="h-auto w-full">
            <rect x={0} y={0} width={320} height={260} fill="transparent" />

            <g stroke="rgba(255,255,255,0.06)">
              {Array.from({ length: 17 }).map((_, i) => (
                <line key={`vx-${i}`} x1={i * 20} y1={0} x2={i * 20} y2={260} />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`vy-${i}`} x1={0} y1={i * 20} x2={320} y2={i * 20} />
              ))}
            </g>

            <path d={toPath(base)} fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.55)" strokeWidth={2} />
            <path d={toPath(out)} fill="rgba(129,140,248,0.22)" stroke="rgba(129,140,248,0.95)" strokeWidth={2} />
          </svg>
        </div>
        <div className="mt-2 text-xs text-white/60">Голубой — исходный, фиолетовый — после матрицы.</div>
      </Card>
    </div>
  )
}
