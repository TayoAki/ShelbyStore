import type { ReactNode } from "react"

/** A printed tag: keylined, square-cornered, label type. */
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>
}

/** The numbered-edition tag: printed in the sleeve-red stripe ink, editions only. */
export function EditionBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge-edition ${className}`}>{children}</span>
}
