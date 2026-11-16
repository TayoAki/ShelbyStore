"use client"

import { useEffect, useState, type RefObject } from "react"

/** True when the visitor asked for reduced motion (SITE_SPEC §2.4.4). */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

/**
 * M1/M2/M4 trigger: sets `data-in="true"` on the element once it crosses the
 * viewport line (`rootMargin`). Reduced motion marks it in at once.
 */
export function useInView(ref: RefObject<Element | null>, { rootMargin = "0px 0px -15% 0px", once = true } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-in", "true")
      const id = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-in", "true")
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          el.removeAttribute("data-in")
          setInView(false)
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once])
  return inView
}

/** M5: `mouseenter` sets data-hover after `delay` ms; `mouseleave` clears it at once. */
export function useHoverIntent(ref: RefObject<HTMLElement | null>, delay = 100) {
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia("(hover: hover)").matches) return
    let t: ReturnType<typeof setTimeout> | undefined
    const enter = () => {
      t = setTimeout(() => el.setAttribute("data-hover", "true"), delay)
    }
    const leave = () => {
      clearTimeout(t)
      el.removeAttribute("data-hover")
    }
    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      clearTimeout(t)
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [ref, delay])
}

const EASE = {
  "sine.out": (t: number) => Math.sin((t * Math.PI) / 2),
  "power3.out": (t: number) => 1 - (1 - t) ** 4,
  linear: (t: number) => t,
}

/**
 * M26b / M27a: moves SVG dots along a path with requestAnimationFrame and
 * getPointAtLength. Each dot travels from progress `from[i]` to `to[i]`.
 * With `repeat`, it loops the whole path from `from[i]`. Reduced motion puts
 * the dots at their resting points.
 */
export function usePathMotion(
  pathRef: RefObject<SVGPathElement | null>,
  dotRefs: RefObject<(SVGCircleElement | null)[]>,
  opts: { from: number[]; to: number[]; duration: number; ease: keyof typeof EASE; delay?: number[]; repeat?: boolean; start: boolean; radius?: number }
) {
  const { start } = opts
  useEffect(() => {
    const path = pathRef.current
    const dots = dotRefs.current ?? []
    if (!path || !start) return
    const len = path.getTotalLength()
    const place = (dot: SVGCircleElement | null, progress: number) => {
      if (!dot) return
      const p = path.getPointAtLength((((progress % 1) + 1) % 1) * len)
      dot.setAttribute("cx", String(p.x))
      dot.setAttribute("cy", String(p.y))
    }
    if (prefersReducedMotion()) {
      dots.forEach((d, i) => {
        place(d, opts.to[i] ?? 0)
        d?.setAttribute("r", String(opts.radius ?? 1.5))
      })
      return
    }
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(path)
    const t0 = performance.now()
    const ease = EASE[opts.ease]
    const tick = (now: number) => {
      if (visible) {
        dots.forEach((d, i) => {
          const delay = (opts.delay?.[i] ?? 0) * 1000
          const raw = (now - t0 - delay) / (opts.duration * 1000)
          if (raw < 0) return
          d?.setAttribute("r", String(opts.radius ?? 1.5))
          if (opts.repeat) place(d, (opts.from[i] ?? 0) + (raw % 1))
          else place(d, (opts.from[i] ?? 0) + ((opts.to[i] ?? 0) - (opts.from[i] ?? 0)) * ease(Math.min(raw, 1)))
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
    // The options are static per component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, pathRef, dotRefs])
}
