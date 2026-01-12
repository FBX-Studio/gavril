import { useMemo, useState } from 'react'
import { getQuestion, QUESTIONS } from '../content/questions'
import { SITUATIONS } from '../game/situations'
import { Button } from './Button'
import { Card } from './Card'

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function SituationsTrainer({
  questionIds,
  onXp,
}: {
  questionIds: number[]
  onXp: (delta: number) => void
}) {
  const allIds = useMemo(() => {
    const unique = Array.from(new Set(questionIds))
    return unique.length >= 4 ? unique : QUESTIONS.map((q) => q.id)
  }, [questionIds])

  const [order, setOrder] = useState(() => shuffle(allIds).slice(0, Math.min(10, allIds.length)))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const finished = idx >= order.length
  const currentId = order[idx] ?? order[0] ?? 1
  const q = getQuestion(currentId)

  const prompt = SITUATIONS[currentId] ?? `Ситуация по билету: «${q.title}». Какой билет описывает решение/идею?`

  const options = useMemo(() => {
    const pool = allIds.filter((x) => x !== currentId)
    const distractors = shuffle(pool).slice(0, 3)
    return shuffle([currentId, ...distractors]).map((id) => ({ id, title: getQuestion(id).title }))
  }, [allIds, currentId])

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
    setOrder(shuffle(allIds).slice(0, Math.min(10, allIds.length)))
    setIdx(0)
    setPicked(null)
    setCorrect(0)
  }

  if (finished) {
    return (
      <Card>
        <div className="text-sm font-semibold text-white">Ситуации завершены</div>
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
    <Card>
      <div className="text-xs text-white/60">
        Ситуация {idx + 1} / {order.length}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{prompt}</div>
      <div className="mt-2 text-xs text-white/60">Выбери билет (вопрос), который лучше всего подходит.</div>

      <div className="mt-3 space-y-2">
        {options.map((o) => {
          const isSelected = picked === o.id
          const isCorrect = picked !== null && o.id === currentId
          const isWrong = picked !== null && isSelected && o.id !== currentId

          const cls = [
            'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
            'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
            isCorrect ? 'border-emerald-400/40 bg-emerald-400/10' : '',
            isWrong ? 'border-rose-400/40 bg-rose-400/10' : '',
          ].join(' ')

          return (
            <button key={o.id} className={cls} onClick={() => pick(o.id)}>
              {o.id}. {o.title}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="mt-3 space-y-3">
          <div className="text-xs text-white/60">Разбор билета:</div>
          <div className="text-sm font-semibold text-white">{q.id}. {q.title}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{q.answer}</div>
          <div>
            <Button onClick={next}>Дальше</Button>
          </div>
        </div>
      )}
    </Card>
  )
}
