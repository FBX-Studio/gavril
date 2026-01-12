import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuestion } from '../content/questions'
import { OTVET1 } from '../content/otvet1'
import { OTVET2 } from '../content/otvet2'
import { getTicketPractice } from '../game/ticketPractice'

export type TheorySource = 'ideal' | 'otvet1' | 'otvet2'

export function QuestionAccordion({
  questionIds,
  theorySource,
}: {
  questionIds: number[]
  theorySource: TheorySource
}) {
  const questions = useMemo(() => questionIds.map((id) => getQuestion(id)), [questionIds])
  const [openId, setOpenId] = useState<number | null>(questions[0]?.id ?? null)

  const getTheory = (id: number, fallback: string) => {
    if (theorySource === 'otvet1') {
      return OTVET1[id]?.trim() ? OTVET1[id] : 'Нет ответа в otvet1.pdf для этого билета.'
    }
    if (theorySource === 'otvet2') {
      return OTVET2[id]?.trim() ? OTVET2[id] : 'Нет ответа в otvet2.pdf для этого билета.'
    }
    return fallback
  }

  return (
    <div className="space-y-2">
      {questions.map((q) => {
        const isOpen = q.id === openId
        const practice = getTicketPractice(q.id)
        return (
          <div key={q.id} className="rounded-xl border border-white/10 bg-white/5">
            <button
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              onClick={() => setOpenId((prev) => (prev === q.id ? null : q.id))}
            >
              <div className="text-sm font-semibold text-white">
                {q.id}. {q.title}
              </div>
              <div className="text-white/60">{isOpen ? '−' : '+'}</div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm leading-relaxed text-white/80">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Link
                    to={`/ticket/${q.id}`}
                    className="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                  >
                    Открыть билет с практикой
                  </Link>
                </div>
                <div className="whitespace-pre-wrap">{getTheory(q.id, q.answer)}</div>

                {practice.examples && practice.examples.length > 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs font-semibold text-white/70">Наглядные примеры</div>
                    <div className="mt-2 space-y-3">
                      {practice.examples.map((ex, idx) => (
                        <div key={`${q.id}-ex-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white">{ex.title}</div>
                          <div className="mt-1 whitespace-pre-wrap text-xs text-white/75">{ex.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.links && q.links.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-semibold text-white/60">Ссылки</div>
                    {q.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block break-all text-xs text-indigo-200 hover:underline"
                      >
                        {l.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
