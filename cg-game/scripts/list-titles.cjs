const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'src', 'content', 'questions.ts')
const s = fs.readFileSync(file, 'utf8')
const m = s.match(/export const QUESTIONS: Question\[] = (\[\s*[\s\S]*?\n\])\n\nexport function/)
if (!m) throw new Error('Cannot parse QUESTIONS')
const arr = JSON.parse(m[1])
arr.sort((a, b) => a.id - b.id)
for (const q of arr) {
  console.log(`${q.id}. ${q.title}`)
}
