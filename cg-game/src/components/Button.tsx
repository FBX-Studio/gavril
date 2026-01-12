import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
  }
>

export function Button({ variant = 'primary', className, ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

  const styles: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600',
    secondary:
      'bg-white/10 text-white hover:bg-white/15 active:bg-white/20',
    ghost: 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white',
  }

  return (
    <button
      {...props}
      className={[base, styles[variant], className].filter(Boolean).join(' ')}
    />
  )
}
