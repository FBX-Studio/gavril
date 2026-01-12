import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const ROOT = path.resolve(process.cwd())
const PARENT = path.resolve(ROOT, '..')

function splitNumberedSections(raw) {
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

async function extractPdfText(pdfPath) {
  const buf = await fs.readFile(pdfPath)
  const u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  const p = new PDFParse(u8)
  await p.load()
  const text = (await p.getText()).text ?? ''
  await p.destroy()
  return text
}

function toTsRecord(map, name) {
  const ids = Array.from({ length: 57 }, (_, i) => i + 1)
  const entries = ids.map((id) => {
    const v = map.get(id)
    const cleaned = v ? cleanAnswer(v) : ''
    return `  ${id}: ${JSON.stringify(cleaned)}`
  })
  return `// Автогенерация из ../${name}\n// Перегенерация: npm run gen:theory\n\nexport const ${name.startsWith('otvet1') ? 'OTVET1' : 'OTVET2'}: Record<number, string> = {\n${entries.join(',\n')}\n}\n`
}

async function main() {
  const pdf1Path = path.join(PARENT, 'otvet1.pdf')
  const pdf2Path = path.join(PARENT, 'otvet2.pdf')

  const [t1, t2] = await Promise.all([extractPdfText(pdf1Path), extractPdfText(pdf2Path)])

  const m1 = splitNumberedSections(t1)
  const m2 = splitNumberedSections(t2)

  const out1 = path.join(ROOT, 'src', 'content', 'otvet1.ts')
  const out2 = path.join(ROOT, 'src', 'content', 'otvet2.ts')

  await fs.writeFile(out1, toTsRecord(m1, 'otvet1.pdf'), 'utf8')
  await fs.writeFile(out2, toTsRecord(m2, 'otvet2.pdf'), 'utf8')

  console.log(`Generated theory sources -> ${path.relative(ROOT, out1)}, ${path.relative(ROOT, out2)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
