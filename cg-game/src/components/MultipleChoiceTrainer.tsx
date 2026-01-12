import { useMemo, useState } from 'react'
import { getQuestion } from '../content/questions'
import { Button } from './Button'
import { Card } from './Card'

type Choice = {
  id: number
  label: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function snippet(s: string) {
  const firstLine = s
    .split('\n')
    .map((x) => x.trim())
    .find(Boolean)
  const base = firstLine && firstLine.length >= 16 ? firstLine : s
  return base.replace(/\s+/g, ' ').trim().slice(0, 140)
}

export function MultipleChoiceTrainer({
  questionIds,
  onXp,
}: {
  questionIds: number[]
  onXp: (delta: number) => void
}) {
  const ids = useMemo(() => {
    const unique = Array.from(new Set(questionIds))
    return unique.length >= 4 ? unique : Array.from({ length: 57 }, (_, i) => i + 1)
  }, [questionIds])

  const [order, setOrder] = useState(() => shuffle(ids).slice(0, Math.min(10, ids.length)))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const currentId = order[idx] ?? order[0] ?? 1
  const q = getQuestion(currentId)

  const choices = useMemo<Choice[]>(() => {
    const pool = ids.filter((x) => x !== currentId)
    const distractors = shuffle(pool).slice(0, 3)
    const all = shuffle([currentId, ...distractors])
    return all.map((id) => ({ id, label: snippet(getQuestion(id).answer) }))
  }, [currentId, ids])

  const finished = idx >= order.length

  const pick = (id: number) => {
    if (picked !== null) return
    setPicked(id)
    const ok = id === currentId
    if (ok) {
      setCorrect((c) => c + 1)
      onXp(10)
    } else {
      onXp(2)
    }
  }

  const next = () => {
    setPicked(null)
    setIdx((i) => i + 1)
  }

  const restart = () => {
    setOrder(shuffle(ids).slice(0, Math.min(10, ids.length)))
    setIdx(0)
    setPicked(null)
    setCorrect(0)
  }

  if (finished) {
    return (
      <Card>
        <div className="text-sm font-semibold text-white">Тест завершён</div>
        <div className="mt-2 text-sm text-white/80">
          Результат: {correct} / {order.length}
        </div>
        <div className="mt-3">
          <Button variant="secondary" onClick={restart}>
            Ещё попытка
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="text-xs text-white/60">
          Вопрос {idx + 1} / {order.length}
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{q.id}. {q.title}</div>
        <div className="mt-2 text-xs text-white/60">Выбери правильный вариант ответа (по смыслу/ключевой фразе).</div>

        <div className="mt-3 space-y-2">
          {choices.map((c) => {
            const isSelected = picked === c.id
            const isCorrect = picked !== null && c.id === currentId
            const isWrong = picked !== null && isSelected && c.id !== currentId
            const cls = [
              'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
              'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
              isCorrect ? 'border-emerald-400/40 bg-emerald-400/10' : '',
              isWrong ? 'border-rose-400/40 bg-rose-400/10' : '',
            ].join(' ')

            return (
              <button key={c.id} className={cls} onClick={() => pick(c.id)}>
                {c.label}
              </button>
            )
          })}
        </div>

        {picked !== null && (
          <div className="mt-3 space-y-3">
            <div className="text-xs text-white/60">Правильный ответ:</div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{q.answer}</div>
            <div>
              <Button onClick={next}>Дальше</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
