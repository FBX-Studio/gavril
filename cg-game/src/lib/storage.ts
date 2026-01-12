export type ProgressState = {
  unlockedLevelIds: string[]
  completedLevelIds: string[]
  passedChallengeIds: string[]
  xp: number
}

const STORAGE_KEY = 'cg_game_progress_v1'

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { unlockedLevelIds: ['lvl1'], completedLevelIds: [], passedChallengeIds: [], xp: 0 }
    }
    const parsed = JSON.parse(raw) as ProgressState
    return {
      unlockedLevelIds: Array.isArray(parsed.unlockedLevelIds)
        ? parsed.unlockedLevelIds
        : ['lvl1'],
      completedLevelIds: Array.isArray(parsed.completedLevelIds)
        ? parsed.completedLevelIds
        : [],
      passedChallengeIds: Array.isArray((parsed as any).passedChallengeIds)
        ? (parsed as any).passedChallengeIds
        : [],
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
    }
  } catch {
    return { unlockedLevelIds: ['lvl1'], completedLevelIds: [], passedChallengeIds: [], xp: 0 }
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY)
}
