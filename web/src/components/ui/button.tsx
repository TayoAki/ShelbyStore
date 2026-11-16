import { ArrowRight, CircleNotch } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

/**
 * Eastside-style buttons (SITE_SPEC v8 E.5.1): the classes live in globals.css
 * (.btn plus a fill and a size). Hover runs the skewed sweep (M1); arrows nudge
 * (M2). `primary` is the green add-to-bag.
 */
export type Variant = "primary" | "secondary" | "black" | "white" | "outline" | "outline-black" | "outline-white" | "outline-green" | "kit" | "link"
export type Size = "default" | "small" | "large" | "atc" | "sticky" | "checkout"

const variantClass: Record<Exclude<Variant, "link">, string> = {
  primary: "btn-green",
  secondary: "btn-charcoal",
  black: "btn-black",
  white: "btn-white",
  outline: "btn-outline",
  "outline-black": "btn-outline-black",
  "outline-white": "btn-outline-white",
  "outline-green": "btn-outline-green",
  kit: "btn-kit",
}
const sizeClass: Record<Size, string> = { default: "", small: "btn-sm", large: "btn-lg", atc: "btn-atc", sticky: "btn-sticky", checkout: "btn-checkout" }

export function buttonClass({
  variant = "primary",
  size = "default",
  block = false,
  className = "",
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  if (variant === "link") return ["link", className].filter(Boolean).join(" ")
  return ["btn", variantClass[variant], sizeClass[size], block ? "btn-block" : "", className].filter(Boolean).join(" ")
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  arrow?: boolean
  /** Label for first-party `cta_click` autocapture (data-track). */
  track?: string
}

export function Button({ variant, size, block, loading, arrow, track, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      {...(track ? { "data-track": track } : {})}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
    >
      {children}
      {loading && <CircleNotch size={16} className="spin" aria-hidden />}
      {arrow && !loading && <ArrowRight size={16} className="icon-arrow" aria-hidden />}
    </button>
  )
}

export function ButtonLink({
  href,
  variant,
  size,
  block,
  arrow,
  className,
  track,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  href: string
  variant?: Variant
  size?: Size
  block?: boolean
  arrow?: boolean
  className?: string
  track?: string
  children: ReactNode
}) {
  return (
    <Link href={href} data-track={track} className={buttonClass({ variant, size, block, className })} {...rest}>
      {children}
      {arrow && <ArrowRight size={16} className="icon-arrow" aria-hidden />}
    </Link>
  )
}
