import type { ReactNode } from "react"

/** Allbirds badge (SITE_SPEC §2.2 "Badge"): natural-white pill, Inter 500 uppercase. */
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>
}

/** The numbered-edition badge (G.5.5): white pill with a midnight border, mono edition line. */
export function EditionBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge-edition edition ${className}`}>{children}</span>
}
