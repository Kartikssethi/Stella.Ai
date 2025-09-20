import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
  solid:
    'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none',
}

const variantStyles = {
  solid: {
    zinc:
      'bg-zinc-900 text-white hover:bg-zinc-700 hover:text-zinc-100 active:bg-zinc-800 active:text-zinc-300 focus-visible:outline-zinc-900',
    rose: 'bg-rose-600 text-white hover:text-zinc-100 hover:bg-rose-500 active:bg-rose-800 active:text-rose-100 focus-visible:outline-rose-600',
    white:
      'bg-white text-zinc-900 hover:bg-rose-50 active:bg-rose-200 active:text-zinc-600 focus-visible:outline-white',
  },
  outline: {
    zinc:
      'ring-zinc-200 text-zinc-700 hover:text-zinc-900 hover:ring-zinc-300 active:bg-zinc-100 active:text-zinc-600 focus-visible:outline-rose-600 focus-visible:ring-zinc-300',
    white:
      'ring-zinc-700 text-white hover:ring-zinc-500 active:ring-zinc-700 active:text-zinc-400 focus-visible:outline-white',
  },
}

export function Button({ className, ...props }) {
  props.variant ??= 'solid'
  props.color ??= 'zinc'

  className = clsx(
    baseStyles[props.variant],
    props.variant === 'outline'
      ? variantStyles.outline[props.color]
      : props.variant === 'solid'
        ? variantStyles.solid[props.color]
        : undefined,
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
