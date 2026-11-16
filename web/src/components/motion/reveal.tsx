"use client"

import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react"
import { useInView } from "@/lib/motion"

type Props<T extends ElementType> = {
  as?: T
  /** IntersectionObserver rootMargin: M1 "0px 0px -15% 0px", M2 "0px 0px 0px 0px", M4 "0px 0px -25% 0px". */
  rootMargin?: string
} & Omit<ComponentPropsWithoutRef<T>, "as">

/**
 * M1 section reveal (SITE_SPEC §2.4.4): renders `data-reveal` and sets
 * `data-in` once the element enters the viewport. Children marked
 * `data-reveal-child` (with `--i`) stagger in via CSS.
 */
export function Reveal<T extends ElementType = "section">({ as, rootMargin, ...rest }: Props<T>) {
  const ref = useRef<HTMLElement>(null)
  useInView(ref, { rootMargin })
  const Tag = (as ?? "section") as ElementType
  return <Tag ref={ref} data-reveal="" {...rest} />
}
