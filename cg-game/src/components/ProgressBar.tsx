export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-indigo-400"
        style={{ width: `${Math.round(clamped * 100)}%` }}
      />
    </div>
  )
}
