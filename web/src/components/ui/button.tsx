import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

type Variant = "primary" | "secondary" | "inverse" | "ghost"
type Size = "lg" | "md" | "sm"

const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-sans text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 disabled:cursor-not-allowed select-none whitespace-nowrap"

const variants: Record<Variant, string> = {
  primary: "bg-ink text-page hover:bg-black active:translate-y-px disabled:bg-surface-2 disabled:text-ink-muted",
  secondary:
    "border border-ink text-ink bg-transparent hover:bg-ink hover:text-page active:translate-y-px disabled:border-line disabled:text-ink-faint disabled:hover:bg-transparent",
  // For dark (ink) bands.
  inverse: "bg-page text-ink hover:bg-paper active:translate-y-px",
  ghost: "text-ink underline underline-offset-4 hover:text-ink-muted disabled:text-ink-faint normal-case tracking-normal font-medium",
}

const sizes: Record<Size, string> = {
  lg: "h-[52px] px-6",
  md: "h-12 px-6",
  sm: "h-10 px-4",
}

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  return [base, variants[variant], variant === "ghost" ? "" : sizes[size], block ? "w-full" : "", className]
    .filter(Boolean)
    .join(" ")
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
}

export function Button({ variant, size, block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
    >
      {loading ? <Dots /> : children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant,
  size,
  block,
  className,
  track,
  children,
}: {
  href: string
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
  /** Label for first-party `cta_click` autocapture (data-track). */
  track?: string
  children: ReactNode
}) {
  return (
    <Link href={href} data-track={track} className={buttonClass({ variant, size, block, className })}>
      {children}
    </Link>
  )
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}
