import ReactMarkdown from 'react-markdown'
import { Card } from '../components/Card'
import notes from '../../docs/gamer-notes.md?raw'

export function NotesPage() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-lg font-semibold text-white">Шпаргалка (простыми словами)</div>
        <div className="mt-2 text-sm text-white/60">
          Пересказ всех вопросов «как для геймеров и программистов».
        </div>
      </Card>

      <Card>
        <ReactMarkdown
          components={{
            h1: (p) => <h1 className="text-xl font-semibold text-white" {...p} />,
            h2: (p) => <h2 className="mt-6 text-lg font-semibold text-white" {...p} />,
            h3: (p) => <h3 className="mt-4 text-base font-semibold text-white" {...p} />,
            p: (p) => <p className="mt-2 text-sm leading-6 text-white/80" {...p} />,
            ul: (p) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80" {...p} />,
            ol: (p) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/80" {...p} />,
            li: (p) => <li className="text-sm text-white/80" {...p} />,
            hr: () => <div className="my-6 h-px w-full bg-white/10" />,
            code: ({ className, children, ...props }) => {
              const isBlock = typeof className === 'string' && className.includes('language-')
              if (isBlock) {
                return (
                  <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white/80">
                    <code {...props}>{children}</code>
                  </pre>
                )
              }
              return (
                <code
                  className="rounded-md border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-xs text-white/80"
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
        >
          {notes}
        </ReactMarkdown>
      </Card>
    </div>
  )
}
