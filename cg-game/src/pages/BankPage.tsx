import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { QuestionAccordion, type TheorySource } from '../components/QuestionAccordion'
import { QUESTIONS } from '../content/questions'
import { getQuestion } from '../content/questions'

export function BankPage() {
  const [query, setQuery] = useState('')
  const [theorySource, setTheorySource] = useState<TheorySource>('ideal')

  const ids = useMemo(() => QUESTIONS.map((q) => q.id).sort((a, b) => a - b), [])

  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ids

    return ids.filter((id) => {
      const item = getQuestion(id)
      return (
        item.title.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      )
    })
  }, [ids, query])

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold text-white">Банк вопросов (все 57)</div>
        <div className="mt-2 text-sm text-white/70">Можно искать по заголовку или по словам из ответа.</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={[
              'rounded-xl px-3 py-2 text-xs font-semibold transition',
              theorySource === 'ideal' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
            ].join(' ')}
            onClick={() => setTheorySource('ideal')}
          >
            Сводка
          </button>
          <button
            className={[
              'rounded-xl px-3 py-2 text-xs font-semibold transition',
              theorySource === 'otvet1' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
            ].join(' ')}
            onClick={() => setTheorySource('otvet1')}
          >
            Конспект 1
          </button>
          <button
            className={[
              'rounded-xl px-3 py-2 text-xs font-semibold transition',
              theorySource === 'otvet2' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
            ].join(' ')}
            onClick={() => setTheorySource('otvet2')}
          >
            Конспект 2
          </button>
        </div>
        <div className="mt-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
            placeholder="Поиск: например, 'Брезенхем', 'CMYK', 'DCT', 'свёртка'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-2 text-xs text-white/50">Найдено: {filteredIds.length}</div>
        </div>
      </Card>

      <QuestionAccordion questionIds={filteredIds} theorySource={theorySource} />
    </div>
  )
}
