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

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[«»"'`.,:;!?()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function choiceSnippet(answer: string, title: string) {
  const lines = answer
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

  const t = normalize(title)
  const isTitleLike = (line: string) => {
    const n = normalize(line)
    if (!n) return true
    if (t && (n === t || n.startsWith(t) || t.startsWith(n))) return true
    if (n.length <= 10) return true
    return false
  }

  const bulletLines = lines
    .filter((l) => /^[-•*]\s+/.test(l))
    .map((l) => l.replace(/^[-•*]\s+/, '').trim())
    .filter((l) => !isTitleLike(l))

  const picked =
    bulletLines.length >= 2
      ? bulletLines.slice(0, 2).join(' · ')
      : lines.find((l) => !isTitleLike(l) && l.length >= 16) ??
        lines.find((l) => !isTitleLike(l)) ??
        answer

  return picked.replace(/\s+/g, ' ').trim().slice(0, 180)
}

export function SituationsTrainer({
  questionIds,
  onXp,
}: {
  questionIds: number[]
  onXp: (delta: number) => void
}) {
  const levelIds = useMemo(() => {
    const unique = Array.from(new Set(questionIds)).filter((id) => Number.isFinite(id))
    return unique.length > 0 ? unique : QUESTIONS.map((q) => q.id)
  }, [questionIds])

  const allIds = useMemo(() => QUESTIONS.map((q) => q.id), [])

  const [order, setOrder] = useState(() => shuffle(levelIds).slice(0, Math.min(10, levelIds.length)))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)

  const finished = idx >= order.length
  const currentId = order[idx] ?? order[0] ?? 1
  const q = getQuestion(currentId)

  const prompt = SITUATIONS[currentId] ?? `Ситуация по теме: «${q.title}». Какой ответ лучше подходит?`

  const options = useMemo(() => {
    const levelPool = levelIds.filter((x) => x !== currentId)
    const globalPool = allIds.filter((x) => x !== currentId && !levelPool.includes(x))

    const distractorsFromLevel = shuffle(levelPool).slice(0, 3)
    const remaining = 3 - distractorsFromLevel.length
    const distractors = remaining > 0 ? distractorsFromLevel.concat(shuffle(globalPool).slice(0, remaining)) : distractorsFromLevel

    return shuffle([currentId, ...distractors]).map((id) => {
      const qq = getQuestion(id)
      return { id, label: choiceSnippet(qq.answer, qq.title) }
    })
  }, [allIds, currentId, levelIds])

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
    setOrder(shuffle(levelIds).slice(0, Math.min(10, levelIds.length)))
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
      <div className="mt-2 text-xs text-white/60">Выбери лучший вариант ответа (по смыслу/ключевой фразе).</div>

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
              {o.label}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="mt-3 space-y-3">
          <div className="text-xs text-white/60">Разбор:</div>
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
