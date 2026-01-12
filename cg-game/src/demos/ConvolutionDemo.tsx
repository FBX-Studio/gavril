import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/Card'

type Kernel = {
  name: string
  k: number[][]
  norm?: number
  bias?: number
}

const KERNELS: Kernel[] = [
  {
    name: 'Blur (box 3×3)',
    k: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    norm: 9,
  },
  {
    name: 'Sharpen',
    k: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  {
    name: 'Edge',
    k: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
    bias: 0,
  },
]

function clampByte(x: number) {
  return Math.max(0, Math.min(255, Math.round(x)))
}

function applyKernel(src: ImageData, kernel: Kernel): ImageData {
  const { width, height, data } = src
  const out = new Uint8ClampedArray(data.length)
  const k = kernel.k
  const kh = k.length
  const kw = k[0].length
  const oy = Math.floor(kh / 2)
  const ox = Math.floor(kw / 2)
  const norm = kernel.norm ?? 1
  const bias = kernel.bias ?? 0

  const idx = (x: number, y: number) => (y * width + x) * 4

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rr = 0
      let gg = 0
      let bb = 0
      const a = data[idx(x, y) + 3]

      for (let j = 0; j < kh; j++) {
        for (let i = 0; i < kw; i++) {
          const sx = Math.max(0, Math.min(width - 1, x + i - ox))
          const sy = Math.max(0, Math.min(height - 1, y + j - oy))
          const w = k[j][i]
          const p = idx(sx, sy)
          rr += data[p] * w
          gg += data[p + 1] * w
          bb += data[p + 2] * w
        }
      }

      const o = idx(x, y)
      out[o] = clampByte(rr / norm + bias)
      out[o + 1] = clampByte(gg / norm + bias)
      out[o + 2] = clampByte(bb / norm + bias)
      out[o + 3] = a
    }
  }

  return new ImageData(out, width, height)
}

export function ConvolutionDemo() {
  const srcRef = useRef<HTMLCanvasElement | null>(null)
  const outRef = useRef<HTMLCanvasElement | null>(null)

  const size = 220
  const [kernelName, setKernelName] = useState(KERNELS[0].name)

  const kernel = useMemo(() => KERNELS.find((k) => k.name === kernelName) ?? KERNELS[0], [kernelName])

  useEffect(() => {
    const c = srcRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    c.width = size
    c.height = size

    // Генерируем картинку: градиент + сетка + текст (чтобы было видно края)
    const g = ctx.createLinearGradient(0, 0, size, size)
    g.addColorStop(0, '#60a5fa')
    g.addColorStop(1, '#a78bfa')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(0,0,0,0.22)'
    for (let i = 0; i <= size; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(18, 18, 184, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = 'bold 16px ui-sans-serif'
    ctx.fillText('Фильтры (свёртка)', 30, 52)

    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(40, 120, 140, 70)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = 'bold 18px ui-sans-serif'
    ctx.fillText('EDGE', 92, 162)
  }, [])

  useEffect(() => {
    const src = srcRef.current
    const out = outRef.current
    if (!src || !out) return

    const sctx = src.getContext('2d')
    const octx = out.getContext('2d')
    if (!sctx || !octx) return

    out.width = size
    out.height = size

    const img = sctx.getImageData(0, 0, size, size)
    const filtered = applyKernel(img, kernel)
    octx.putImageData(filtered, 0, 0)
  }, [kernel, kernelName])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="text-sm font-semibold text-white">Цифровые фильтры: свёртка 3×3</div>
        <div className="mt-2 text-xs text-white/60">
          Фильтр — это ядро (матрица коэффициентов), которое «ездит» по изображению и смешивает соседние пиксели.
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/70">Выбор ядра</label>
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            value={kernelName}
            onChange={(e) => setKernelName(e.target.value)}
          >
            {KERNELS.map((k) => (
              <option key={k.name} value={k.name}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-white/60">Ядро</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {kernel.k.flatMap((row, y) =>
              row.map((v, x) => (
                <div key={`${x}-${y}`} className="rounded-lg bg-white/5 px-2 py-2 text-center text-xs text-white/80 ring-1 ring-white/10">
                  {v}
                </div>
              )),
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-white/60">Исходник</div>
            <canvas ref={srcRef} className="mt-2 w-full rounded-xl border border-white/10" />
          </div>
          <div>
            <div className="text-xs text-white/60">После фильтра</div>
            <canvas ref={outRef} className="mt-2 w-full rounded-xl border border-white/10" />
          </div>
        </div>
      </Card>
    </div>
  )
}
