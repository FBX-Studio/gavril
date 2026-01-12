import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { LEVELS } from '../game/levels'
import { useProgress } from '../lib/useProgress'

export function MapPage() {
  const { state, isUnlocked, isCompleted, unlockAllLevels, hardReset } = useProgress()
  const completedCount = state.completedLevelIds.length
  const total = LEVELS.length
  const allUnlocked = state.unlockedLevelIds.length >= LEVELS.length

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-sm font-semibold text-white">Твой прогресс</div>
          <div className="mt-2 text-xs text-white/60">Уровни: {completedCount}/{total}</div>
          <div className="mt-3">
            <ProgressBar value={total === 0 ? 0 : completedCount / total} />
          </div>
          <div className="mt-3 text-xs text-white/60">XP: {state.xp}</div>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-white">Режим подготовки</div>
          <div className="mt-2 text-xs text-white/60">Открывает все уровни сразу (без прохождения по порядку).</div>
          <div className="mt-3">
            <Button variant="secondary" onClick={unlockAllLevels} disabled={allUnlocked}>
              {allUnlocked ? 'Все уровни уже открыты' : 'Открыть все уровни'}
            </Button>
          </div>
          <div className="mt-2 text-xs text-white/50">
            Прогресс хранится в localStorage — при смене адреса (localhost ↔ IP) будет отдельный прогресс.
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-white">Режим экзамена</div>
          <div className="mt-2 text-xs text-white/60">Случайные вопросы + таймер + самооценка.</div>
          <div className="mt-3">
            <Link to="/exam">
              <Button>Начать экзамен</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-white">Сброс</div>
          <div className="mt-2 text-xs text-white/60">Если хочешь пройти игру заново.</div>
          <div className="mt-3">
            <Button variant="secondary" onClick={hardReset}>
              Сбросить прогресс
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LEVELS.map((lvl, idx) => {
          const unlocked = isUnlocked(lvl.id)
          const completed = isCompleted(lvl.id)
          return (
            <Card key={lvl.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{lvl.title}</div>
                  <div className="mt-1 text-xs text-white/60">{lvl.description}</div>
                  <div className="mt-2 text-xs text-white/50">Вопросы: {lvl.questionIds.join(', ')}</div>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
                  {completed ? 'Пройден' : unlocked ? 'Доступен' : 'Закрыт'}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {unlocked ? (
                  <Link to={`/level/${lvl.id}`}>
                    <Button>{completed ? 'Повторить' : idx === 0 ? 'Начать' : 'Продолжить'}</Button>
                  </Link>
                ) : (
                  <Button disabled variant="secondary">
                    Закрыт
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
