import { getQuestion } from '../content/questions'

export type QuizCard = {
  id: string
  prompt: string
  answer: string
  questionId: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildQuiz(questionIds: number[], size: number): QuizCard[] {
  const pool = shuffle(questionIds)
  const chosen = pool.slice(0, Math.max(1, Math.min(size, pool.length)))

  return chosen.map((qid) => {
    const q = getQuestion(qid)
    return {
      id: `q${qid}`,
      questionId: qid,
      prompt: `${qid}. ${q.title}`,
      answer: q.answer,
    }
  })
}
