function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (!v) return null
      return `https://www.youtube.com/embed/${v}`
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '').trim()
      if (!id) return null
      return `https://www.youtube.com/embed/${id}`
    }
    return null
  } catch {
    return null
  }
}

export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const embed = toYouTubeEmbedUrl(url)
  if (!embed) {
    return (
      <a className="text-indigo-200 hover:underline" href={url} target="_blank" rel="noreferrer">
        {title}
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
