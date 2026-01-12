const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'src', 'content', 'questions.ts')
const s = fs.readFileSync(file, 'utf8')

const m = s.match(
  /export const QUESTIONS: Question\[] = (\[\s*[\s\S]*?\n\])\n\nexport function/,
)
if (!m) {
  console.error('Could not locate QUESTIONS JSON in', file)
  process.exit(1)
}

const arr = JSON.parse(m[1])
const short = arr
  .filter((q) => String(q.answer ?? '').trim().length < 200)
  .map((q) => ({ id: q.id, len: String(q.answer ?? '').trim().length, title: q.title }))
  .sort((a, b) => a.len - b.len)

console.log('Total:', arr.length)
console.log('Short (<200 chars):', short.length)
console.log(short)
