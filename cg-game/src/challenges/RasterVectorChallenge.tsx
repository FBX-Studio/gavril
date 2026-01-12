import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

type Kind = 'raster' | 'vector'

type Item = {
  prompt: string
  kind: Kind
}

const BANK: Item[] = [
  { prompt: 'Фотография с камеры/телефона', kind: 'raster' },
  { prompt: 'Скан страницы книги', kind: 'raster' },
  { prompt: 'PNG-иконка 256×256', kind: 'raster' },
  { prompt: 'Текстура для 3D (albedo/normal map)', kind: 'raster' },
  { prompt: 'Логотип в формате SVG', kind: 'vector' },
  { prompt: 'Чертёж/схема в CAD', kind: 'vector' },
  { prompt: 'Контур шрифта (кривые Безье)', kind: 'vector' },
  { prompt: 'Карта метро как набор линий/кривых', kind: 'vector' },
]

export function RasterVectorChallenge({
  onPass,
}: {
  onPass: (result: { score: number }) => void
}) {
  const items = useMemo(() => {
    const shuffled = BANK.slice().sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 6)
  }, [])

  const [answers, setAnswers] = useState<Record<number, Kind | null>>({})
  const [result, setResult] = useState<null | { correct: number; total: number }>(null)

  const set = (idx: number, kind: Kind) => {
    setAnswers((p) => ({ ...p, [idx]: kind }))
  }

  const check = () => {
    let correct = 0
    for (let i = 0; i < items.length; i++) {
      if (answers[i] === items[i].kind) correct++
    }
    const res = { correct, total: items.length }
    setResult(res)

    const score = correct / items.length
    if (score >= 0.84) onPass({ score })
  }

  const reset = () => {
    setAnswers({})
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: растр или вектор?</div>
        <div className="mt-2 text-xs text-white/70">
          Для каждого примера выбери, что хранится как пиксели (растр) или как геометрические примитивы (вектор).
        </div>

        <div className="mt-3 space-y-2">
          {items.map((it, i) => {
            const v = answers[i] ?? null
            return (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm text-white/80">{it.prompt}</div>
                <div className="flex gap-2">
                  <Button variant={v === 'raster' ? 'secondary' : 'ghost'} onClick={() => set(i, 'raster')}>
                    Растр
                  </Button>
                  <Button variant={v === 'vector' ? 'secondary' : 'ghost'} onClick={() => set(i, 'vector')}>
                    Вектор
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={check}>Проверить</Button>
          <Button variant="ghost" onClick={reset}>
            Сброс
          </Button>
        </div>

        {result && (
          <div className="mt-2 text-xs text-white/70">
            Верно: {result.correct} / {result.total}. Нужно ≥ 5 из 6.
          </div>
        )}
      </Card>
    </div>
  )
}
