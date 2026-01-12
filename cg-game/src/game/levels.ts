export type VideoLink = {
  title: string
  url: string
}

export type Level = {
  id: string
  title: string
  description: string
  questionIds: number[]
  videos: VideoLink[]
  demoId?:
    | 'raster-vector'
    | 'color-models'
    | 'bresenham'
    | 'clipping'
    | 'stego-lsb'
    | 'processing'
  quizSize: number
}

export const LEVELS: Level[] = [
  {
    id: 'lvl1',
    title: 'Уровень 1: Растр и вектор',
    description:
      'База: пиксели, разрешение, форматы, чем растр отличается от вектора.',
    questionIds: [1, 2, 3, 4, 5],
    demoId: 'raster-vector',
    quizSize: 6,
    videos: [
      {
        title: 'Основы графики (Растр и Вектор) — видео 1',
        url: 'https://www.youtube.com/watch?v=c1ShRJ07vhc',
      },
      {
        title: 'Основы графики (Растр и Вектор) — видео 2',
        url: 'https://www.youtube.com/watch?v=S9Nuvi9v9wY',
      },
    ],
  },
  {
    id: 'lvl2',
    title: 'Уровень 2: Цвет и модели',
    description:
      'Свет, зрение, тон/насыщенность/светлота. RGB/CMY/CMYK/HSV и где они используются.',
    questionIds: [6, 7, 10, 11, 12, 13, 14, 15],
    demoId: 'color-models',
    quizSize: 8,
    videos: [
      {
        title: 'Цветовые модели (RGB, CMYK, HSB) — видео 1',
        url: 'https://www.youtube.com/watch?v=GN1RZkViEAE',
      },
      {
        title: 'Цветовые модели (RGB, CMYK, HSB) — видео 2',
        url: 'https://www.youtube.com/watch?v=1pjtRkTORcA',
      },
    ],
  },
  {
    id: 'lvl3',
    title: 'Уровень 3: Освещение и закраска',
    description:
      'Плоская закраска, Гуро и Фонг — что интерполируется и почему это важно.',
    questionIds: [16, 17, 18],
    quizSize: 6,
    videos: [
      {
        title: 'Алгоритмы освещения (Гуро и Фонг) — видео 1',
        url: 'https://www.youtube.com/watch?v=j8BF1fjm5_Y',
      },
      {
        title: 'Алгоритмы освещения (Гуро и Фонг) — видео 2',
        url: 'https://www.youtube.com/watch?v=8VMu-YWZRG4',
      },
    ],
  },
  {
    id: 'lvl4',
    title: 'Уровень 4: Растеризация',
    description:
      'Как рисуются линии и окружности на пиксельной сетке: Брезенхем и midpoint.',
    questionIds: [20, 21, 24, 25],
    demoId: 'bresenham',
    quizSize: 8,
    videos: [
      {
        title: 'Алгоритмы Брезенхема (Линии и Окружности) — видео 1',
        url: 'https://www.youtube.com/watch?v=wJki7vbaVuc',
      },
      {
        title: 'Алгоритмы Брезенхема (Линии и Окружности) — видео 2',
        url: 'https://www.youtube.com/watch?v=jUKHYIBWMd0',
      },
      {
        title: 'Алгоритмы Брезенхема (Линии и Окружности) — видео 3',
        url: 'https://www.youtube.com/watch?v=Sy213pxWfyI',
      },
    ],
  },
  {
    id: 'lvl5',
    title: 'Уровень 5: Геометрия и отсечение',
    description:
      'Заполнение многоугольников, когерентность, отсечение Сазерленда–Ходгмана.',
    questionIds: [19, 22, 23],
    demoId: 'clipping',
    quizSize: 7,
    videos: [
      {
        title: 'Отсечение (Сазерленд-Ходгман) и Геометрия — видео 1',
        url: 'https://www.youtube.com/watch?v=CMWlL9_-rJw',
      },
      {
        title: 'Отсечение (Сазерленд-Ходгман) и Геометрия — видео 2',
        url: 'https://www.youtube.com/watch?v=clCzzMiQPc8',
      },
    ],
  },
  {
    id: 'lvl6',
    title: 'Уровень 6: Обработка и преобразования',
    description:
      'Яркость/контраст, масштабирование, повороты, фильтры и матрицы свёртки.',
    questionIds: [26, 27, 28, 29, 30, 31, 32, 33, 34],
    demoId: 'processing',
    quizSize: 10,
    videos: [],
  },
  {
    id: 'lvl7',
    title: 'Уровень 7: Сжатие и стеганография',
    description:
      'Принципы сжатия (JPEG/DCT), LSB, ЦВЗ, классы стегосистем и базовые модели. Обновление: билеты 54–57 теперь тоже входят в уровень.',
    questionIds: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 49, 50, 51, 52, 53, 54, 55, 56, 57],
    demoId: 'stego-lsb',
    quizSize: 12,
    videos: [
      {
        title: 'Стеганография и водяные знаки (ЦВЗ) — видео 1',
        url: 'https://www.youtube.com/watch?v=QH2J_YwOT0E',
      },
      {
        title: 'Стеганография и водяные знаки (ЦВЗ) — видео 2',
        url: 'https://www.youtube.com/watch?v=LFyXLTl6onQ',
      },
      {
        title: 'Стеганография и водяные знаки (ЦВЗ) — видео 3',
        url: 'https://www.youtube.com/watch?v=mQWgCY7cdzk',
      },
      {
        title: 'Стеганография и водяные знаки (ЦВЗ) — видео 4',
        url: 'https://www.youtube.com/watch?v=QlL82mOIsvM',
      },
    ],
  },
]

export function getLevel(levelId: string) {
  const level = LEVELS.find((l) => l.id === levelId)
  if (!level) throw new Error(`Unknown level: ${levelId}`)
  return level
}
