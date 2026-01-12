import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { getQuestion, QUESTIONS } from '../content/questions'
import { useProgress } from '../lib/useProgress'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ExamPage() {
  const { addXp } = useProgress()
  const [started, setStarted] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [idx, setIdx] = useState(0)
  const [known, setKnown] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(60 * 30) // 30 минут

  const ids = useMemo(() => {
    const all = QUESTIONS.map((q) => q.id)
    const picked = shuffle(all).slice(0, Math.min(20, all.length || 1))
    return picked.length ? picked : [1]
  }, [])

  const total = ids.length
  const currentId = ids[idx]
  const q = getQuestion(currentId)

  useEffect(() => {
    if (!started) return
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [started])

  useEffect(() => {
    if (!started) return
    if (secondsLeft === 0) setStarted(false)
  }, [secondsLeft, started])

  const progress = total === 0 ? 0 : idx / total

  const next = (markKnown: boolean) => {
    const nextKnown = markKnown ? known + 1 : known
    if (markKnown) {
      setKnown(nextKnown)
      addXp(12)
    } else {
      addXp(3)
    }

    const nextIdx = idx + 1
    if (nextIdx >= total) {
      setStarted(false)
      return
    }
    setIdx(nextIdx)
    setReveal(false)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  if (!started && idx === 0 && known === 0 && secondsLeft === 60 * 30) {
    return (
      <Card>
        <div className="text-lg font-semibold text-white">Режим экзамена</div>
        <div className="mt-2 text-sm text-white/70">20 случайных вопросов. Ты сам оцениваешь «знаю/повторить».</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setStarted(true)}>Старт</Button>
          <Link to="/">
            <Button variant="secondary">К уровням</Button>
          </Link>
        </div>
        <div className="mt-3 text-xs text-white/60">Таймер: 30 минут (можно просто игнорировать).</div>
      </Card>
    )
  }

  if (!started && (idx >= total - 1 || secondsLeft === 0)) {
    return (
      <Card>
        <div className="text-lg font-semibold text-white">Экзамен завершён</div>
        <div className="mt-2 text-sm text-white/80">Знаю: {known} / {total}</div>
        <div className="mt-2 text-xs text-white/60">Совет: пройди уровни, где было «повторить».</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/">
            <Button>К уровням</Button>
          </Link>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Ещё попытка
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/60">Вопрос {idx + 1} / {total}</div>
        <div className="text-xs text-white/60">Таймер: {mm}:{ss}</div>
      </div>
      <ProgressBar value={progress} />

      <Card>
        <div className="text-sm font-semibold text-white">{q.id}. {q.title}</div>
        <div className="mt-3">
          {!reveal ? (
            <Button variant="secondary" onClick={() => setReveal(true)}>
              Показать ответ
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{q.answer}</div>
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
