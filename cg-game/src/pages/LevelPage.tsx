import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { QuestionAccordion } from '../components/QuestionAccordion'
import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { Demo } from '../demos'
import { getLevel, LEVELS } from '../game/levels'
import { buildQuiz } from '../game/quiz'
import { useProgress } from '../lib/useProgress'
import { QuizTrainer } from '../components/QuizTrainer'
import { BresenhamChallenge } from '../challenges/BresenhamChallenge'
import type { TheorySource } from '../components/QuestionAccordion'
import { MultipleChoiceTrainer } from '../components/MultipleChoiceTrainer'
import { SituationsTrainer } from '../components/SituationsTrainer'
import { RasterVectorChallenge } from '../challenges/RasterVectorChallenge'
import { ColorModelsChallenge } from '../challenges/ColorModelsChallenge'
import { ShadingChallenge } from '../challenges/ShadingChallenge'
import { ClippingChallenge } from '../challenges/ClippingChallenge'
import { ConvolutionChallenge } from '../challenges/ConvolutionChallenge'
import { StegoLSBChallenge } from '../challenges/StegoLSBChallenge'

type Tab = 'theory' | 'practice' | 'quiz' | 'tests' | 'videos'

export function LevelPage() {
  const params = useParams()
  const levelId = params.levelId ?? 'lvl1'
  const level = useMemo(() => getLevel(levelId), [levelId])

  const { isUnlocked, isCompleted, isChallengePassed, passChallenge, completeLevel, addXp } = useProgress()
  const unlocked = isUnlocked(level.id)
  const completed = isCompleted(level.id)

  const [tab, setTab] = useState<Tab>('theory')
  const [theorySource, setTheorySource] = useState<TheorySource>('ideal')
  const [quizDone, setQuizDone] = useState<{ known: number; total: number } | null>(null)
  const [testMode, setTestMode] = useState<'mcq' | 'situations'>('mcq')

  const quiz = useMemo(() => buildQuiz(level.questionIds, level.quizSize), [level.questionIds, level.quizSize])

  const finishLevel = () => {
    completeLevel(level.id)
    addXp(50)
  }

  const nextLevel = useMemo(() => {
    const idx = LEVELS.findIndex((l) => l.id === level.id)
    return LEVELS[idx + 1]
  }, [level.id])

  const challengeId = useMemo(() => {
    switch (level.id) {
      case 'lvl1':
        return 'c:lvl1-raster-vector'
      case 'lvl2':
        return 'c:lvl2-color-cmy'
      case 'lvl3':
        return 'c:lvl3-shading'
      case 'lvl4':
        return 'c:lvl4-bresenham'
      case 'lvl5':
        return 'c:lvl5-clipping'
      case 'lvl6':
        return 'c:lvl6-convolution'
      case 'lvl7':
        return 'c:lvl7-stego-lsb'
      default:
        return null
    }
  }, [level.id])

  const challengeAlreadyPassed = challengeId ? isChallengePassed(challengeId) : false

  const awardChallenge = (xp: number) => {
    if (!challengeId) return
    if (!isChallengePassed(challengeId)) {
      passChallenge(challengeId)
      addXp(xp)
    }
    completeLevel(level.id)
  }

  if (!unlocked) {
    return (
      <Card>
        <div className="text-sm font-semibold text-white">Уровень закрыт</div>
        <div className="mt-2 text-xs text-white/60">Сначала пройди предыдущий уровень на карте.</div>
        <div className="mt-4">
          <Link to="/">
            <Button>Назад к уровням</Button>
          </Link>
        </div>
      </Card>
    )
  }

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
          <div className="text-lg font-semibold text-white">{level.title}</div>
          <div className="text-sm text-white/60">{level.description}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/">
            <Button variant="ghost">К карте</Button>
          </Link>
          {!completed && (
            <Button variant="secondary" onClick={finishLevel}>
              Отметить как пройденный
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton id="theory" label="Теория" />
        <TabButton id="practice" label="Практика" />
        <TabButton id="quiz" label="Квиз" />
        <TabButton id="tests" label="Тесты" />
        <TabButton id="videos" label="Видео" />
      </div>

      {tab === 'theory' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
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

              {level.id === 'lvl7' && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  Почему 54–57 не были в уровнях: раньше они просто не были добавлены в список билетов уровня 7 (в
                  <span className="font-mono"> LEVELS </span>) и поэтому показывались только в «Банке вопросов». Сейчас они включены в уровень.
                </div>
              )}

              <div className="mt-3">
                <QuestionAccordion questionIds={level.questionIds} theorySource={theorySource} />
              </div>
            </Card>
          </div>
          <Card>
            <div className="text-sm font-semibold text-white">Как учить быстро</div>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-white/70">
              <li>Открой вопрос → проговори ответ вслух 60–90 секунд.</li>
              <li>Сверься с ответом → выпиши 3 ключевых термина.</li>
              <li>Перейди в «Практику» и покрути демо.</li>
              <li>Закрепи в «Квизе».</li>
            </ol>
            <div className="mt-3 text-xs text-white/50">Подсказка: лучше 3–4 итерации, чем читать один раз.</div>
          </Card>
        </div>
      )}

      {tab === 'practice' && (
        <div className="space-y-4">
          {level.demoId ? (
            <Demo demoId={level.demoId} />
          ) : (
            <Card>
              <div className="text-sm text-white/80">Для этого уровня демо пока не добавлено.</div>
              <div className="mt-2 text-xs text-white/60">Могу расширить: фильтры (свёртка), повороты/матрицы, масштабирование.</div>
            </Card>
          )}

          {level.id === 'lvl1' && (
            <RasterVectorChallenge
              onPass={() => {
                awardChallenge(35)
              }}
            />
          )}

          {level.id === 'lvl2' && (
            <ColorModelsChallenge
              onPass={() => {
                awardChallenge(40)
              }}
            />
          )}

          {level.id === 'lvl3' && (
            <ShadingChallenge
              onPass={() => {
                awardChallenge(40)
              }}
            />
          )}

          {level.id === 'lvl4' && (
            <BresenhamChallenge
              onPass={(res) => {
                // награда за точность
                awardChallenge(res.perfect ? 60 : 45)
              }}
            />
          )}

          {level.id === 'lvl5' && (
            <ClippingChallenge
              onPass={() => {
                awardChallenge(55)
              }}
            />
          )}

          {level.id === 'lvl6' && (
            <ConvolutionChallenge
              onPass={() => {
                awardChallenge(55)
              }}
            />
          )}

          {level.id === 'lvl7' && (
            <StegoLSBChallenge
              onPass={() => {
                awardChallenge(60)
              }}
            />
          )}

          {challengeAlreadyPassed && (
            <Card>
              <div className="text-sm font-semibold text-white">Челлендж пройден</div>
              <div className="mt-2 text-xs text-white/70">Уровень засчитан. Можешь перейти к следующему или закрепить в квизе.</div>
              {nextLevel && (
                <div className="mt-3">
                  <Link to={`/level/${nextLevel.id}`}>
                    <Button>Дальше: {nextLevel.title}</Button>
                  </Link>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === 'quiz' && (
        <div className="space-y-4">
          {!quizDone ? (
            <QuizTrainer
              cards={quiz}
              onXp={(d) => addXp(d)}
              onFinish={(stats) => {
                setQuizDone(stats)
                // мягкое автозавершение: если знаешь >= 60%
                if (stats.total > 0 && stats.known / stats.total >= 0.6) {
                  completeLevel(level.id)
                  addXp(25)
                }
              }}
            />
          ) : (
            <Card>
              <div className="text-sm font-semibold text-white">Квиз завершён</div>
              <div className="mt-2 text-sm text-white/80">
                Знаю: {quizDone.known} из {quizDone.total}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setQuizDone(null)}>
                  Пройти ещё раз
                </Button>
                {nextLevel && (
                  <Link to={`/level/${nextLevel.id}`}>
                    <Button>Дальше: {nextLevel.title}</Button>
                  </Link>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'tests' && (
        <div className="space-y-4">
          <Card>
            <div className="text-sm font-semibold text-white">Проверка знаний по билетам уровня</div>
            <div className="mt-2 text-xs text-white/70">Два режима: тест по вариантам и «ситуации». Всё берётся из тех же билетов.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={[
                  'rounded-xl px-3 py-2 text-xs font-semibold transition',
                  testMode === 'mcq' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
                ].join(' ')}
                onClick={() => setTestMode('mcq')}
              >
                Тест (варианты)
              </button>
              <button
                className={[
                  'rounded-xl px-3 py-2 text-xs font-semibold transition',
                  testMode === 'situations' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
                ].join(' ')}
                onClick={() => setTestMode('situations')}
              >
                Ситуации
              </button>
            </div>
          </Card>

          {testMode === 'mcq' ? (
            <MultipleChoiceTrainer questionIds={level.questionIds} onXp={addXp} />
          ) : (
            <SituationsTrainer questionIds={level.questionIds} onXp={addXp} />
          )}
        </div>
      )}

      {tab === 'videos' && (
        <div className="space-y-4">
          {level.videos.length === 0 ? (
            <Card>
              <div className="text-sm text-white/80">Видео для этого уровня пока не добавлены.</div>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {level.videos.map((v) => (
                <Card key={v.url}>
                  <YouTubeEmbed url={v.url} title={v.title} />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
