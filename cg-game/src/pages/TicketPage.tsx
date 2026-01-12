import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Demo } from '../demos'
import { getQuestion } from '../content/questions'
import type { TheorySource } from '../components/QuestionAccordion'
import { OTVET1 } from '../content/otvet1'
import { OTVET2 } from '../content/otvet2'
import { getTicketPractice } from '../game/ticketPractice'
import { LEVELS } from '../game/levels'
import { RasterVectorChallenge } from '../challenges/RasterVectorChallenge'
import { ColorModelsChallenge } from '../challenges/ColorModelsChallenge'
import { ShadingChallenge } from '../challenges/ShadingChallenge'
import { BresenhamChallenge } from '../challenges/BresenhamChallenge'
import { ClippingChallenge } from '../challenges/ClippingChallenge'
import { ConvolutionChallenge } from '../challenges/ConvolutionChallenge'
import { StegoLSBChallenge } from '../challenges/StegoLSBChallenge'

type Tab = 'about' | 'theory' | 'practice'

function clampTicketId(raw: string | undefined): number | null {
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  const id = Math.trunc(n)
  if (id < 1 || id > 57) return null
  return id
}

function takeNonEmptyLines(text: string, max: number) {
  const lines = text
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
  return lines.slice(0, max)
}

function getTheory(source: TheorySource, id: number, fallback: string) {
  if (source === 'otvet1') return OTVET1[id]?.trim() ? OTVET1[id] : 'Нет ответа в otvet1.pdf для этого билета.'
  if (source === 'otvet2') return OTVET2[id]?.trim() ? OTVET2[id] : 'Нет ответа в otvet2.pdf для этого билета.'
  return fallback
}

export function TicketPage() {
  const params = useParams()
  const ticketId = clampTicketId(params.ticketId)

  const [tab, setTab] = useState<Tab>('about')
  const [theorySource, setTheorySource] = useState<TheorySource>('ideal')

  if (!ticketId) return <Navigate to="/bank" replace />

  const q = useMemo(() => getQuestion(ticketId), [ticketId])
  const practice = useMemo(() => getTicketPractice(ticketId), [ticketId])
  const levelsWithTicket = useMemo(
    () => LEVELS.filter((l) => l.questionIds.includes(ticketId)),
    [ticketId],
  )

  const prevId = ticketId > 1 ? ticketId - 1 : null
  const nextId = ticketId < 57 ? ticketId + 1 : null

  const TabButton = ({ id, label }: { id: Tab; label: string }) => (
    <button
      className={[
        'rounded-xl px-3 py-2 text-xs font-semibold transition',
        tab === id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
      ].join(' ')}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white/60">Билет {ticketId}</div>
          <div className="text-lg font-semibold text-white">{q.title}</div>
          {levelsWithTicket.length > 0 && (
            <div className="mt-1 text-xs text-white/60">
              В уровнях: {levelsWithTicket.map((l) => l.title).join(' • ')}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/bank">
            <Button variant="ghost">К банку</Button>
          </Link>
          {levelsWithTicket[0] && (
            <Link to={`/level/${levelsWithTicket[0].id}`}>
              <Button variant="secondary">Открыть уровень</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <TabButton id="about" label="О чём" />
          <TabButton id="theory" label="Теория" />
          <TabButton id="practice" label="Практика" />
        </div>
        <div className="flex flex-wrap gap-2">
          {prevId && (
            <Link to={`/ticket/${prevId}`}>
              <Button variant="ghost">← {prevId}</Button>
            </Link>
          )}
          {nextId && (
            <Link to={`/ticket/${nextId}`}>
              <Button variant="ghost">{nextId} →</Button>
            </Link>
          )}
        </div>
      </div>

      {tab === 'about' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="text-sm font-semibold text-white">Коротко о билете</div>
              <div className="mt-3 space-y-2 text-sm text-white/80">
                {practice.aboutBullets.map((b, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    {b}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold text-white">Суть (первые строки из ответа)</div>
              <div className="mt-3 space-y-2 text-xs text-white/70">
                {takeNonEmptyLines(q.answer, 8).map((line, i) => (
                  <div key={i}>• {line}</div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="text-sm font-semibold text-white">Как учить именно этот билет</div>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-white/70">
              <li>Скажи вслух определение/идею (30–60 сек).</li>
              <li>Назови 3 термина и 1 формулу/шаг алгоритма.</li>
              <li>Перейди в «Практика» и сделай микро-задачу.</li>
            </ol>
          </Card>
        </div>
      )}

      {tab === 'theory' && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-white/70">Теория</div>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
            {getTheory(theorySource, ticketId, q.answer)}
          </div>

          {q.links && q.links.length > 0 && (
            <div className="mt-4 space-y-1">
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
        </Card>
      )}

      {tab === 'practice' && (
        <div className="space-y-4">
          {practice.demoId ? (
            <Demo demoId={practice.demoId} />
          ) : (
            <Card>
              <div className="text-sm font-semibold text-white">Практика</div>
              <div className="mt-2 text-xs text-white/60">Для этого билета пока нет отдельного демо — но ниже есть микро-задачи.</div>
            </Card>
          )}

          {practice.challenge === 'raster-vector' && <RasterVectorChallenge onPass={() => {}} />}
          {practice.challenge === 'color-models' && <ColorModelsChallenge onPass={() => {}} />}
          {practice.challenge === 'shading' && <ShadingChallenge onPass={() => {}} />}
          {practice.challenge === 'bresenham' && <BresenhamChallenge onPass={() => {}} />}
          {practice.challenge === 'clipping' && <ClippingChallenge onPass={() => {}} />}
          {practice.challenge === 'convolution' && <ConvolutionChallenge onPass={() => {}} />}
          {practice.challenge === 'stego-lsb' && <StegoLSBChallenge onPass={() => {}} />}

          <Card>
            <div className="text-sm font-semibold text-white">Наглядные примеры</div>
            <div className="mt-3 grid gap-3">
              {practice.examples.map((e, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs font-semibold text-white/80">{e.title}</div>
                  <div className="mt-2 whitespace-pre-wrap text-xs text-white/70">{e.text}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="text-sm font-semibold text-white">Что тут важно увидеть</div>
              <div className="mt-3 space-y-2 text-xs text-white/70">
                {practice.practiceBullets.map((b, i) => (
                  <div key={i}>• {b}</div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="text-sm font-semibold text-white">Микро-задача (на 2–4 минуты)</div>
              <div className="mt-3 space-y-2 text-xs text-white/70">
                {practice.microTasks.map((t, i) => (
                  <div key={i}>• {t}</div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="text-xs text-white/60">Примечание</div>
            <div className="mt-1 text-xs text-white/70">
              Челленджи здесь работают как тренажёр и не начисляют XP/прогресс.
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
