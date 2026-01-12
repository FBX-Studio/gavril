import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

function textToBits(text: string): number[] {
  const enc = new TextEncoder()
  const bytes = enc.encode(text)
  const bits: number[] = []
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  }
  return bits
}

function bitsToText(bits: number[]): string {
  const bytes: number[] = []
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let b = 0
    for (let k = 0; k < 8; k++) b = (b << 1) | (bits[i + k] & 1)
    bytes.push(b)
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes))
  } catch {
    return ''
  }
}

export function StegoLsbDemo() {
  const srcRef = useRef<HTMLCanvasElement | null>(null)
  const stegoRef = useRef<HTMLCanvasElement | null>(null)
  const diffRef = useRef<HTMLCanvasElement | null>(null)

  const [message, setMessage] = useState('KG: LSB работает!')
  const [status, setStatus] = useState<string>('')

  const size = 220

  const baseImage = useMemo(() => {
    const img = new Image()
    // генерируем градиент через canvas (без внешних файлов)
    return img
  }, [])

  useEffect(() => {
    const c = srcRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    c.width = size
    c.height = size

    const g = ctx.createLinearGradient(0, 0, size, size)
    g.addColorStop(0, '#0ea5e9')
    g.addColorStop(1, '#a78bfa')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fillRect(20, 20, 180, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 16px ui-sans-serif'
    ctx.fillText('Контейнер', 32, 55)
  }, [baseImage])

  const embed = () => {
    const src = srcRef.current
    const out = stegoRef.current
    const diff = diffRef.current
    if (!src || !out || !diff) return

    const sctx = src.getContext('2d')
    const octx = out.getContext('2d')
    const dctx = diff.getContext('2d')
    if (!sctx || !octx || !dctx) return

    out.width = size
    out.height = size
    diff.width = size
    diff.height = size

    const img = sctx.getImageData(0, 0, size, size)
    const data = img.data

    // header: 16 бит длины (в байтах)
    const bits = textToBits(message)
    const byteLen = Math.min(65535, Math.ceil(bits.length / 8))
    const header: number[] = []
    for (let i = 15; i >= 0; i--) header.push((byteLen >> i) & 1)

    const payload = header.concat(bits).slice(0, (data.length / 4) * 3) // 1 бит в R,G,B

    let bi = 0
    const outData = new Uint8ClampedArray(data)

    for (let i = 0; i < outData.length && bi < payload.length; i += 4) {
      for (let c = 0; c < 3 && bi < payload.length; c++) {
        const idx = i + c
        outData[idx] = (outData[idx] & 0xfe) | (payload[bi] & 1)
        bi++
      }
    }

    const stegoImg = new ImageData(outData, size, size)
    octx.putImageData(stegoImg, 0, 0)

    // diff visualization (увеличим изменения)
    const diffData = new Uint8ClampedArray(outData.length)
    for (let i = 0; i < outData.length; i += 4) {
      const dr = Math.abs(outData[i] - data[i])
      const dg = Math.abs(outData[i + 1] - data[i + 1])
      const db = Math.abs(outData[i + 2] - data[i + 2])
      diffData[i] = dr * 255
      diffData[i + 1] = dg * 255
      diffData[i + 2] = db * 255
      diffData[i + 3] = 255
    }
    dctx.putImageData(new ImageData(diffData, size, size), 0, 0)

    setStatus(`Встроено бит: ${bi}. Изменение на 1 в канале почти незаметно.`)
  }

  const extract = () => {
    const out = stegoRef.current
    if (!out) return
    const ctx = out.getContext('2d')
    if (!ctx) return

    const img = ctx.getImageData(0, 0, size, size)
    const data = img.data

    const bits: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      bits.push(data[i] & 1)
      bits.push(data[i + 1] & 1)
      bits.push(data[i + 2] & 1)
    }

    let len = 0
    for (let i = 0; i < 16; i++) len = (len << 1) | (bits[i] & 1)
    const payloadBits = bits.slice(16, 16 + len * 8)
    const text = bitsToText(payloadBits)
    setStatus(text ? `Извлечено: ${text}` : 'Не удалось извлечь сообщение (сначала нажми «Встроить»).')
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">LSB-стеганография (практика)</div>
        <div className="mt-2 text-xs text-white/60">Меняем младший бит в RGB-каналах — визуально почти не видно.</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-white/70">Сообщение</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={embed}>Встроить</Button>
            <Button variant="secondary" onClick={extract}>
              Извлечь
            </Button>
          </div>
        </div>
        {status && <div className="mt-3 text-xs text-white/70">{status}</div>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-xs text-white/60">Контейнер</div>
          <canvas ref={srcRef} className="mt-2 w-full rounded-xl" />
        </Card>
        <Card>
          <div className="text-xs text-white/60">Стего-изображение</div>
          <canvas ref={stegoRef} className="mt-2 w-full rounded-xl" />
        </Card>
        <Card>
          <div className="text-xs text-white/60">Разница (усиленная)</div>
          <canvas ref={diffRef} className="mt-2 w-full rounded-xl" />
        </Card>
      </div>
    </div>
  )
}
