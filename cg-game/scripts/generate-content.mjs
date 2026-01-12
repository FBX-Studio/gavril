import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const ROOT = path.resolve(process.cwd())
const PARENT = path.resolve(ROOT, '..')

function extractUrls(text) {
  const urls = []
  const re = /https?:\/\/[^\s)\]]+/g
  let m
  while ((m = re.exec(text))) urls.push(m[0])
  return Array.from(new Set(urls))
}

function normalizeSpaces(s) {
  return s.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim()
}

function stripUrls(s) {
  return s.replace(/https?:\/\/[^\s)\]]+/g, '').trim()
}

function normalizeForSearch(s) {
  return normalizeSpaces(s)
    .toLowerCase()
    .replace(/[«»"'`]/g, '')
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildNormalizedWithMap(original) {
  // Строим нормализованную строку и отображение normIndex -> originalIndex
  const map = []
  let norm = ''
  let lastWasSpace = false

  for (let i = 0; i < original.length; i++) {
    const ch = original[i]
    const lower = ch.toLowerCase()
    const isAlphaNum = /[a-z0-9а-яё]/i.test(lower)

    if (isAlphaNum) {
      norm += lower
      map.push(i)
      lastWasSpace = false
      continue
    }

    // Любая пунктуация/перевод строки/пробел → один пробел
    if (!lastWasSpace) {
      norm += ' '
      map.push(i)
      lastWasSpace = true
    }
  }

  // trim с корректировкой карты
  let start = 0
  while (start < norm.length && norm[start] === ' ') start++
  let end = norm.length
  while (end > start && norm[end - 1] === ' ') end--

  return {
    norm: norm.slice(start, end),
    map: map.slice(start, end),
  }
}

function makeTitleKey(title) {
  const noUrl = stripUrls(title)
  const norm = normalizeForSearch(noUrl)
  const words = norm.split(' ').filter(Boolean)
  // Берём достаточно длинный ключ, но не слишком, чтобы переживать мелкие расхождения
  const take = Math.min(12, Math.max(6, words.length))
  return words.slice(0, take).join(' ')
}

function splitNumberedSections(raw) {
  // Делим по заголовкам вида "12." или "12)" или "12. "
  const text = raw.replace(/\r/g, '')
  const re = /(^|\n)\s*(\d{1,3})\s*[\.)]\s*/g
  const indices = []
  let m
  while ((m = re.exec(text))) {
    indices.push({ idx: m.index + (m[1] ? 1 : 0), id: Number(m[2]) })
  }

  const sections = new Map()
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx
    const id = indices[i].id
    const end = i + 1 < indices.length ? indices[i + 1].idx : text.length
    const body = text.slice(start, end)
    sections.set(id, body)
  }
  return sections
}

function cleanAnswer(raw) {
  return raw
    .replace(/^\s*\d{1,3}\s*[\.)]\s*/m, '')
    .replace(/\n\s*--\s*\d+\s+of\s+\d+\s*--\s*\n/gi, '\n')
    .replace(/\n\s*Переписать\s*\n/gi, '\n')
    .replace(/\u200b/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\s*\d{1,3}\s*$/g, '')
    .trim()
}

function extractByTitles(pdfText, questions) {
  // Старый title-scan оставляем как fallback, но основной путь ниже — matching по заголовкам секций.
  const original = pdfText.replace(/\r/g, '')
  const { norm, map } = buildNormalizedWithMap(original)

  const hits = []
  for (const q of questions) {
    const key = makeTitleKey(q.title)
    if (!key) continue
    const idx = norm.indexOf(key)
    if (idx >= 0) hits.push({ id: q.id, idx })
  }

  hits.sort((a, b) => a.idx - b.idx)
  const out = new Map()
  for (let i = 0; i < hits.length; i++) {
    const cur = hits[i]
    const next = hits[i + 1]
    const startNorm = cur.idx
    const endNorm = next ? next.idx : norm.length
    const startOrig = map[startNorm] ?? 0
    const endOrig = map[Math.max(startNorm, endNorm - 1)] ?? original.length
    out.set(cur.id, original.slice(startOrig, endOrig))
  }
  return out
}

function splitPdfIntoHeadingSections(text) {
  // Ищем заголовки вида "12 ..." или "12. ..." или "12) ..." в начале строки
  const re = /(^|\n)\s*(\d{1,3})\s*[\.)]?\s+([^\n]{6,})/g
  const hits = []
  let m
  while ((m = re.exec(text))) {
    const title = m[3].trim()
    // небольшая защита от ложных срабатываний
    if (!/[a-zа-яё]/i.test(title)) continue
    hits.push({ idx: m.index + (m[1] ? 1 : 0), num: Number(m[2]), title })
  }

  const sections = []
  for (let i = 0; i < hits.length; i++) {
    const start = hits[i].idx
    const end = i + 1 < hits.length ? hits[i + 1].idx : text.length
    const chunk = text.slice(start, end)
    sections.push({ num: hits[i].num, title: hits[i].title, chunk })
  }

  return sections
}

function tokenizeTitle(s) {
  const words = normalizeForSearch(stripUrls(s)).split(' ').filter(Boolean)
  // выкидываем очень короткие токены, чтобы не шуметь
  return words.filter((w) => w.length >= 3)
}

function pickBestSectionForQuestion(questionTitle, sections) {
  const qTokens = tokenizeTitle(questionTitle)
  if (qTokens.length === 0) return null

  const qSet = new Set(qTokens)
  const qFirst = qTokens.slice(0, 2).join(' ')

  let best = null
  let bestScore = 0

  for (const s of sections) {
    const st = tokenizeTitle(s.title)
    const stSet = new Set(st)
    let common = 0
    for (const t of qSet) if (stSet.has(t)) common++

    const titleNorm = normalizeForSearch(s.title)
    let score = common * 3
    if (qFirst && titleNorm.includes(qFirst)) score += 6
    if (titleNorm.includes(qTokens[0])) score += 2

    // небольшой бонус за близость по длине (короче/длиннее заголовки)
    score += Math.max(0, 3 - Math.abs(st.length - qTokens.length))

    if (score > bestScore) {
      bestScore = score
      best = s
    }
  }

  // порог: минимум 2 общих слова или хороший попадание по началу
  if (!best) return null
  if (bestScore < 8) return null
  return best
}

const ENRICH = new Map([
  [
    2,
    `Памятка:\n- Разрешение: $W\times H$ пикселей, для печати часто считают ppi/dpi.\n- Глубина: 8 бит/канал → 256 уровней, 24 бит RGB → ~16.7 млн цветов.\n- Динамический/тоновый диапазон: детали в тенях и светах (HDR шире).`,
  ],
  [
    11,
    `Памятка:\n- Аддитивная (RGB): складываем свет, (0,0,0) чёрный, (max,max,max) белый.\n- Субтрактивная (CMY/CMYK): краски поглощают свет, базовая подложка — белая бумага.`,
  ],
  [12, `Памятка: яркость (luma) часто оценивают как $Y \approx 0.299R + 0.587G + 0.114B$.`],
  [20, `Памятка: Брезенхем использует целые числа и накопление ошибки — быстро и детерминированно.`],
  [22, `Памятка: Сазерленд–Ходгман работает корректно для отсечения по выпуклому окну.`],
  [35, `Памятка: JPEG обычно делает RGB→YCbCr, подсэмплинг цветности, DCT 8×8, квантование, энтропийное кодирование.`],
  [39, `Памятка: LSB легко ломается сжатием/фильтрами и сравнительно легко детектируется статистикой.`],
])

async function main() {
  const docxPath = path.join(PARENT, 'vopros.docx')
  const pdf1Path = path.join(PARENT, 'otvet1.pdf')
  const pdf2Path = path.join(PARENT, 'otvet2.pdf')

  const docxBuf = await fs.readFile(docxPath)
  const doc = await mammoth.extractRawText({ buffer: docxBuf })
  const docText = doc.value.replace(/\r/g, '')

  const lines = docText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Парсим вопросы + привязанные ссылки (URL до следующего номера)
  const questions = []
  let current = null
  for (const line of lines) {
    const m = line.match(/^(\d{1,3})\s*\.\s*(.+)$/)
    if (m) {
      if (current) questions.push(current)
      current = { id: Number(m[1]), title: normalizeSpaces(m[2]), linkLines: [] }
      const urls = extractUrls(line)
      current.linkLines.push(...urls)
      continue
    }

    if (current) {
      const urls = extractUrls(line)
      if (urls.length) current.linkLines.push(...urls)
    }
  }
  if (current) questions.push(current)

  const pdf1Buf = await fs.readFile(pdf1Path)
  const pdf2Buf = await fs.readFile(pdf2Path)

  const pdf1U8 = new Uint8Array(pdf1Buf.buffer, pdf1Buf.byteOffset, pdf1Buf.byteLength)
  const pdf2U8 = new Uint8Array(pdf2Buf.buffer, pdf2Buf.byteOffset, pdf2Buf.byteLength)

  const p1 = new PDFParse(pdf1U8)
  await p1.load()
  const pdf1Text = (await p1.getText()).text ?? ''
  await p1.destroy()

  const p2 = new PDFParse(pdf2U8)
  await p2.load()
  const pdf2Text = (await p2.getText()).text ?? ''
  await p2.destroy()

  const a1 = splitNumberedSections(pdf1Text)
  const a2 = splitNumberedSections(pdf2Text)

  const combinedPdfText = `${pdf1Text}\n\n${pdf2Text}`
  const byTitle = extractByTitles(combinedPdfText, questions)
  const headingSections = splitPdfIntoHeadingSections(combinedPdfText.replace(/\r/g, ''))

  const items = questions.map((q) => {
    // 1) основной путь: находим подходящую секцию по заголовку в PDF
    const bestSection = pickBestSectionForQuestion(q.title, headingSections)
    const sectionHit = bestSection?.chunk ?? ''

    // 2) fallback: пробуем найти по точным/частичным совпадениям заголовков
    const titleHit = byTitle.get(q.id) ?? ''

    const raw1 = a1.get(q.id) ?? ''
    const raw2 = a2.get(q.id) ?? ''
    const base = raw1.trim() ? raw1 : raw2

    let answer = ''
    if (sectionHit.trim()) {
      answer = cleanAnswer(sectionHit)
    } else if (titleHit.trim()) {
      answer = cleanAnswer(titleHit)
    } else if (base.trim()) {
      answer = cleanAnswer(base)
    } else {
      answer = 'Ответ не найден в PDF.'
    }

    const extra = ENRICH.get(q.id)
    if (extra) answer = `${answer}\n\n${extra}`

    const links = Array.from(new Set(q.linkLines))
      .filter(Boolean)
      .map((url) => ({ title: url, url }))

    return {
      id: q.id,
      title: q.title,
      answer,
      links: links.length ? links : undefined,
    }
  })

  const outPath = path.join(ROOT, 'src', 'content', 'questions.ts')
  const banner = `import type { Question } from './types'\n\n// Автогенерация из ../vopros.docx + ../otvet1.pdf + ../otvet2.pdf\n// Перегенерация: npm run gen:content\n`

  const body = `export const QUESTIONS: Question[] = ${JSON.stringify(items, null, 2)}\n\nexport function getQuestion(id: number): Question {\n  const q = QUESTIONS.find((x) => x.id === id)\n  if (!q) {\n    return {\n      id,\n      title: \`Вопрос ${'${id}'}\`,\n      answer: 'Ответ ещё не добавлен.',\n    }\n  }\n  return q\n}\n`

  // Превращаем JSON в TS-литералы (убираем кавычки у ключей нельзя — ок и так)
  await fs.writeFile(outPath, banner + '\n' + body, 'utf8')

  console.log(`Generated ${items.length} questions -> ${path.relative(ROOT, outPath)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
