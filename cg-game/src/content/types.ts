export type Question = {
  id: number
  title: string
  answer: string
  // Теория из исходных файлов (otvet1.pdf/otvet2.pdf). Опционально.
  answer1?: string
  answer2?: string
  links?: { title: string; url: string }[]
}
