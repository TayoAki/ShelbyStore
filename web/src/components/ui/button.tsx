import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

/**
 * Melin's button system (SITE_SPEC §5): the classes live in globals.css (.btn,
 * .btn--*). Primary has no hover change; outline variants fill with ink from
 * the centre on hover.
 */
export type Variant = "primary" | "light" | "dark" | "highlight" | "link" | "micro" | "action" | "icon"
export type Size = "default" | "atc" | "checkout" | "large" | "hero" | "small"

const variantClass: Record<Variant, string> = {
  primary: "btn--primary",
  light: "btn--light",
  dark: "btn--dark",
  highlight: "btn--highlight",
  link: "btn--link",
  micro: "btn--micro",
  action: "btn--action",
  icon: "btn--w-icon",
}

const sizeClass: Record<Size, string> = {
  default: "",
  atc: "btn--atc",
  checkout: "btn--checkout",
  large: "btn--large",
  hero: "btn--hero",
  small: "btn--small",
}

export function buttonClass({
  variant = "primary",
  size = "default",
  block = false,
  className = "",
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  return ["btn", variantClass[variant], sizeClass[size], block ? "w-full" : "", className].filter(Boolean).join(" ")
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  /** Label for first-party `cta_click` autocapture (data-track). */
  track?: string
  icon?: ReactNode
}

export function Button({ variant, size, block, loading, track, icon, className, children, disabled, ...rest }: ButtonProps) {
  const dark = variant === "primary" || variant === "icon" || variant === undefined
  return (
    <button
      {...rest}
      {...(track ? { "data-track": track } : {})}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center" aria-label="Loading">
          <Spinner light={dark} />
        </span>
      ) : (
        <span className="inline-flex items-center gap-3">
          {icon}
          {children}
        </span>
      )}
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
  icon,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  href: string
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
  track?: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <Link href={href} data-track={track} className={buttonClass({ variant, size, block, className })} {...rest}>
      <span className="inline-flex items-center gap-3">
        {icon}
        {children}
      </span>
    </Link>
  )
}

/** 14px spinner, 2px border (SITE_SPEC §5 `loading`). */
export function Spinner({ light = true }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-[14px] w-[14px] rounded-full border-2 ${light ? "border-white border-t-transparent" : "border-black border-t-transparent"}`}
      style={{ animation: "btn-spin .7s linear infinite" }}
    />
  )
}
