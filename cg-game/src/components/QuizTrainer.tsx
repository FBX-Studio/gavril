import { useMemo, useState } from 'react'
import type { QuizCard } from '../game/quiz'
import { Button } from './Button'
import { Card } from './Card'
import { ProgressBar } from './ProgressBar'

export function QuizTrainer({
  cards,
  onFinish,
  onXp,
}: {
  cards: QuizCard[]
  onFinish: (stats: { known: number; total: number }) => void
  onXp: (delta: number) => void
}) {
  const total = cards.length
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [known, setKnown] = useState(0)

  const current = cards[idx]
  const progress = useMemo(() => (total === 0 ? 0 : idx / total), [idx, total])

  if (total === 0) {
    return (
      <Card>
        <div className="text-sm text-white/80">Нет вопросов для квиза.</div>
      </Card>
    )
  }

  const next = (markKnown: boolean) => {
    const nextKnown = markKnown ? known + 1 : known
    if (markKnown) {
      setKnown(nextKnown)
      onXp(10)
    } else {
      onXp(2)
    }

    const nextIdx = idx + 1
    if (nextIdx >= total) {
      onFinish({ known: nextKnown, total })
      return
    }
    setIdx(nextIdx)
    setRevealed(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Карта {idx + 1} из {total}
        </div>
        <div className="text-xs text-white/60">Знаю: {known}</div>
      </div>
      <ProgressBar value={progress} />

      <Card>
        <div className="text-sm font-semibold text-white">{current.prompt}</div>
        <div className="mt-3">
          {!revealed ? (
            <Button variant="secondary" onClick={() => setRevealed(true)}>
              Показать ответ
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                {current.answer}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => next(true)}>Знаю</Button>
                <Button variant="secondary" onClick={() => next(false)}>
                  Нужно повторить
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
