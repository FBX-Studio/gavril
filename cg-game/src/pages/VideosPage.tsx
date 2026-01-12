import { Card } from '../components/Card'
import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { LEVELS } from '../game/levels'

export function VideosPage() {
  const all = LEVELS.flatMap((l) => l.videos.map((v) => ({ ...v, level: l.title })))

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-white">Видео по темам (русский)</div>
        <div className="text-sm text-white/60">Короткие ролики для быстрого понимания.</div>
      </div>

      {all.length === 0 ? (
        <Card>
          <div className="text-sm text-white/80">Пока нет видео.</div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {all.map((v) => (
            <Card key={v.url}>
              <div className="mb-2 text-xs text-white/50">{v.level}</div>
              <YouTubeEmbed url={v.url} title={v.title} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
