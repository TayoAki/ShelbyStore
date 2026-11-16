import { CircleNotch } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

/**
 * Allbirds' button system (SITE_SPEC §5, colours G.2.2): pill, Inter 500
 * uppercase, classes in globals.css (.btn, .btn-primary…). `secondary` is the
 * dark main CTA; `primary` is the light (white) one.
 */
export type Variant = "primary" | "secondary" | "outline-black" | "outline-white" | "icon-black" | "icon-white" | "link"
export type Size = "default" | "small" | "large" | "atc"

const sizeClass: Record<Size, string> = { default: "", small: "btn-small", large: "btn-large", atc: "btn-atc w-full" }

export function buttonClass({
  variant = "secondary",
  size = "default",
  block = false,
  className = "",
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  if (variant === "link") return ["link text-sm", className].filter(Boolean).join(" ")
  return ["btn", `btn-${variant}`, sizeClass[size], block ? "w-full" : "", className].filter(Boolean).join(" ")
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  /** Label for first-party `cta_click` autocapture (data-track). */
  track?: string
}

export function Button({ variant, size, block, loading, track, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      {...(track ? { "data-track": track } : {})}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
    >
      {loading ? <CircleNotch size={16} className="animate-[spin_1s_linear_infinite]" aria-label="Loading" /> : children}
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
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  href: string
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
  track?: string
  children: ReactNode
}) {
  return (
    <Link href={href} data-track={track} className={buttonClass({ variant, size, block, className })} {...rest}>
      {children}
    </Link>
  )
}
