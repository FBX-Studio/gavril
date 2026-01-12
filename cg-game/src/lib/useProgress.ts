import { useCallback, useMemo, useState } from 'react'
import { LEVELS } from '../game/levels'
import { loadProgress, resetProgress, saveProgress } from './storage'

export function useProgress() {
  const [state, setState] = useState(() => loadProgress())

  const byId = useMemo(() => new Map(LEVELS.map((l) => [l.id, l])), [])

  const persist = useCallback((next: typeof state) => {
    setState(next)
    saveProgress(next)
  }, [])

  const isUnlocked = useCallback(
    (levelId: string) => state.unlockedLevelIds.includes(levelId),
    [state.unlockedLevelIds],
  )

  const isCompleted = useCallback(
    (levelId: string) => state.completedLevelIds.includes(levelId),
    [state.completedLevelIds],
  )

  const isChallengePassed = useCallback(
    (challengeId: string) => state.passedChallengeIds.includes(challengeId),
    [state.passedChallengeIds],
  )

  const passChallenge = useCallback(
    (challengeId: string) => {
      const passed = new Set(state.passedChallengeIds)
      if (passed.has(challengeId)) return
      passed.add(challengeId)
      persist({ ...state, passedChallengeIds: Array.from(passed) })
    },
    [persist, state],
  )

  const completeLevel = useCallback(
    (levelId: string) => {
      if (!byId.has(levelId)) return

      const idx = LEVELS.findIndex((l) => l.id === levelId)
      const nextLevel = LEVELS[idx + 1]

      const completed = new Set(state.completedLevelIds)
      completed.add(levelId)

      const unlocked = new Set(state.unlockedLevelIds)
      unlocked.add(levelId)
      if (nextLevel) unlocked.add(nextLevel.id)

      persist({
        ...state,
        completedLevelIds: Array.from(completed),
        unlockedLevelIds: Array.from(unlocked),
      })
    },
    [byId, persist, state],
  )

  const addXp = useCallback(
    (delta: number) => {
      const safe = Number.isFinite(delta) ? delta : 0
      persist({ ...state, xp: Math.max(0, Math.round(state.xp + safe)) })
    },
    [persist, state],
  )

  const hardReset = useCallback(() => {
    resetProgress()
    setState(loadProgress())
  }, [])

  const unlockAllLevels = useCallback(() => {
    const all = LEVELS.map((l) => l.id)
    const unlocked = new Set(state.unlockedLevelIds)
    let changed = false
    for (const id of all) {
      if (!unlocked.has(id)) {
        unlocked.add(id)
        changed = true
      }
    }
    if (!changed) return
    persist({ ...state, unlockedLevelIds: Array.from(unlocked) })
  }, [persist, state])

  return {
    state,
    isUnlocked,
    isCompleted,
    isChallengePassed,
    passChallenge,
    completeLevel,
    addXp,
    hardReset,
    unlockAllLevels,
  }
}
