import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

type Method = 'flat' | 'gouraud' | 'phong'

type Item = {
  prompt: string
  answer: Method
}

const ITEMS: Item[] = [
  {
    prompt: 'Интерполируем нормали по пикселям, освещение считаем в пикселе (самое гладкое)',
    answer: 'phong',
  },
  {
    prompt: 'Освещение считаем в вершинах, затем интерполируем интенсивность/цвет по пикселям',
    answer: 'gouraud',
  },
  {
    prompt: 'Одна нормаль/цвет на весь полигон, грани выглядят «ломано»',
    answer: 'flat',
  },
  {
    prompt: 'Блики могут «пропадать», если не попали в вершины',
    answer: 'gouraud',
  },
  {
    prompt: 'Дороже по вычислениям, но лучше передаёт зеркальные блики',
    answer: 'phong',
  },
  {
    prompt: 'Самый дешёвый, но хорошо показывает фасетность',
    answer: 'flat',
  },
]

const LABEL: Record<Method, string> = {
  flat: 'Плоская',
  gouraud: 'Гуро',
  phong: 'Фонг',
}

export function ShadingChallenge({ onPass }: { onPass: (r: { score: number }) => void }) {
  const items = useMemo(() => ITEMS.slice().sort(() => Math.random() - 0.5).slice(0, 5), [])
  const [ans, setAns] = useState<Record<number, Method | ''>>({})
  const [result, setResult] = useState<null | { correct: number; total: number }>(null)

  const check = () => {
    let correct = 0
    for (let i = 0; i < items.length; i++) {
      if (ans[i] === items[i].answer) correct++
    }
    const res = { correct, total: items.length }
    setResult(res)

    const score = correct / items.length
    if (score >= 0.8) onPass({ score })
  }

  const reset = () => {
    setAns({})
    setResult(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-semibold text-white">Челлендж: закраска (Flat / Gouraud / Phong)</div>
        <div className="mt-2 text-xs text-white/70">Подбери правильный метод к каждому утверждению.</div>

        <div className="mt-3 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm text-white/80">{it.prompt}</div>
              <div className="mt-2">
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                  value={ans[i] ?? ''}
                  onChange={(e) => setAns((p) => ({ ...p, [i]: e.target.value as Method }))}
                >
                  <option value="">Выбери…</option>
                  <option value="flat">{LABEL.flat}</option>
                  <option value="gouraud">{LABEL.gouraud}</option>
                  <option value="phong">{LABEL.phong}</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={check}>Проверить</Button>
          <Button variant="ghost" onClick={reset}>
            Сброс
          </Button>
        </div>

        {result && (
          <div className="mt-2 text-xs text-white/70">
            Верно: {result.correct}/{result.total}. Нужно ≥ 4 из 5.
          </div>
        )}
      </Card>
    </div>
  )
}
