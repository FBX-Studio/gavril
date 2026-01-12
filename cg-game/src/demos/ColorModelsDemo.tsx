import { useMemo, useState } from 'react'
import { Card } from '../components/Card'

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let rn = 0,
    gn = 0,
    bn = 0

  if (h >= 0 && h < 60) {
    rn = c
    gn = x
  } else if (h < 120) {
    rn = x
    gn = c
  } else if (h < 180) {
    gn = c
    bn = x
  } else if (h < 240) {
    gn = x
    bn = c
  } else if (h < 300) {
    rn = x
    bn = c
  } else {
    rn = c
    bn = x
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  }
}

export function ColorModelsDemo() {
  const [mode, setMode] = useState<'rgb' | 'hsv'>('rgb')
  const [r, setR] = useState(96)
  const [g, setG] = useState(165)
  const [b, setB] = useState(250)

  const hsv = useMemo(() => rgbToHsv(r, g, b), [r, g, b])

  const [h, setH] = useState(210)
  const [s, setS] = useState(0.62)
  const [v, setV] = useState(0.98)

  const rgbFromHsv = useMemo(() => hsvToRgb(h, s, v), [h, s, v])
  const color = mode === 'rgb' ? `rgb(${r},${g},${b})` : `rgb(${rgbFromHsv.r},${rgbFromHsv.g},${rgbFromHsv.b})`

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Цветовые модели: RGB ↔ HSV</div>
            <div className="text-xs text-white/60">Покрути параметры и сравни, как думают модели</div>
          </div>
          <div className="flex gap-2">
            <button
              className={[
                'rounded-xl px-3 py-2 text-xs font-semibold',
                mode === 'rgb' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
              ].join(' ')}
              onClick={() => setMode('rgb')}
            >
              RGB
            </button>
            <button
              className={[
                'rounded-xl px-3 py-2 text-xs font-semibold',
                mode === 'hsv' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
              ].join(' ')}
              onClick={() => setMode('hsv')}
            >
              HSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {mode === 'rgb' ? (
            <>
              <label className="text-xs text-white/70">R: {r}</label>
              <input className="w-full" type="range" min={0} max={255} value={r} onChange={(e) => setR(Number(e.target.value))} />
              <label className="text-xs text-white/70">G: {g}</label>
              <input className="w-full" type="range" min={0} max={255} value={g} onChange={(e) => setG(Number(e.target.value))} />
              <label className="text-xs text-white/70">B: {b}</label>
              <input className="w-full" type="range" min={0} max={255} value={b} onChange={(e) => setB(Number(e.target.value))} />
              <div className="text-xs text-white/60">HSV (из RGB): H={Math.round(hsv.h)}°, S={Math.round(hsv.s * 100)}%, V={Math.round(hsv.v * 100)}%</div>
            </>
          ) : (
            <>
              <label className="text-xs text-white/70">H: {Math.round(h)}°</label>
              <input className="w-full" type="range" min={0} max={360} value={h} onChange={(e) => setH(Number(e.target.value))} />
              <label className="text-xs text-white/70">S: {Math.round(s * 100)}%</label>
              <input className="w-full" type="range" min={0} max={100} value={Math.round(s * 100)} onChange={(e) => setS(Number(e.target.value) / 100)} />
              <label className="text-xs text-white/70">V: {Math.round(v * 100)}%</label>
              <input className="w-full" type="range" min={0} max={100} value={Math.round(v * 100)} onChange={(e) => setV(Number(e.target.value) / 100)} />
              <div className="text-xs text-white/60">RGB (из HSV): r={rgbFromHsv.r}, g={rgbFromHsv.g}, b={rgbFromHsv.b}</div>
            </>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-white">Результат</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Цвет</div>
            <div className="mt-2 h-28 w-full rounded-xl" style={{ background: color }} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Где применяется</div>
            <ul className="mt-2 list-disc pl-5 text-xs text-white/70">
              <li>RGB: экраны, веб, камеры</li>
              <li>CMYK: печать</li>
              <li>HSV: удобный выбор цвета человеком</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
