import type { ReactNode } from "react"

/**
 * Melin's card badge (SITE_SPEC §6.2): #ededed fill, body 15px/22.5px, padding
 * 4px 8px, square corners. `small` is the 12px drawer variant.
 */
export function Badge({ children, small = false, className = "" }: { children: ReactNode; small?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center bg-mega font-body text-black ${
        small ? "px-1.5 py-0.5 text-[12px] leading-[18px]" : "px-2 py-1 text-[15px] leading-[22.5px]"
      } ${className}`}
    >
      {children}
    </span>
  )
}
