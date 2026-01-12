import { useMemo, useState } from 'react'
import { Card } from '../components/Card'

function makeRaster(size: number) {
  // Простой "пиксель-арт": диагональ + круг
  const pixels: number[][] = Array.from({ length: size }, () => Array(size).fill(0))
  for (let y = 0; y < size; y++) {
    pixels[y][y] = 1
  }
  const cx = Math.floor(size * 0.65)
  const cy = Math.floor(size * 0.35)
  const r = Math.floor(size * 0.22)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r * r) pixels[y][x] = 1
    }
  }
  return pixels
}

export function RasterVectorDemo() {
  const [zoom, setZoom] = useState(14)
  const [grid, setGrid] = useState(true)
  const size = 16
  const pixels = useMemo(() => makeRaster(size), [])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Растр: увеличение = пиксели</div>
            <div className="text-xs text-white/60">Покажи сетку и увеличь масштаб</div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />
            Сетка
          </label>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            className="w-full"
            type="range"
            min={6}
            max={28}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <div className="w-10 text-right text-xs text-white/60">{zoom}×</div>
        </div>

        <div className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-4">
          <div
            className="inline-block"
            style={{
              width: size * zoom,
              height: size * zoom,
              display: 'grid',
              gridTemplateColumns: `repeat(${size}, ${zoom}px)`,
              gridTemplateRows: `repeat(${size}, ${zoom}px)`,
            }}
          >
            {pixels.flatMap((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: zoom,
                    height: zoom,
                    background: v ? 'rgba(129,140,248,0.95)' : 'rgba(0,0,0,0)',
                    outline: grid ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                />
              )),
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div>
          <div className="text-sm font-semibold text-white">Вектор: увеличение = гладко</div>
          <div className="text-xs text-white/60">Те же формы, но как примитивы</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[160, 320].map((s) => (
            <div key={s} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">SVG {s}×{s}</div>
              <svg width={s} height={s} viewBox="0 0 100 100" className="mt-2 rounded-xl bg-black/10">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#a5b4fc" />
                    <stop offset="1" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <circle cx="65" cy="35" r="22" fill="url(#g)" opacity="0.95" />
                <path d="M10 10 L90 90" stroke="#a5b4fc" strokeWidth="6" strokeLinecap="round" />
                <path d="M90 10 L10 90" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs leading-relaxed text-white/60">
          Вектор хранит параметры фигур (кривые/линии), поэтому при масштабировании пересчитывается геометрия.
        </div>
      </Card>
    </div>
  )
}
