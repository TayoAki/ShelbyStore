"use client"

import { X } from "@phosphor-icons/react"
import { useEffect, useRef } from "react"

/**
 * Eastside's drawer shell (SITE_SPEC v8 E.5.11): a modal <dialog> (focus
 * trap, Escape, inert page, focus back to the opener). `side="right"` is the
 * 650px cart flyout (M13) or, with `narrow`, the 380px recently-viewed drawer;
 * `side="left"` is the mobile menu (M12). A click on the scrim, or on any link
 * inside, closes it.
 */
export function SideDrawer({
  open,
  onClose,
  label,
  side = "right",
  narrow = false,
  className = "",
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  side?: "right" | "left"
  narrow?: boolean
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      document.documentElement.classList.add("scroll-locked")
    } else if (!open && d.open) {
      d.close()
    }
    if (!open) document.documentElement.classList.remove("scroll-locked")
  }, [open])

  useEffect(() => () => document.documentElement.classList.remove("scroll-locked"), [])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className="drawer"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        const t = e.target as HTMLElement
        if (t === ref.current || t.classList.contains("drawer-scrim") || t.closest("a")) onClose()
      }}
    >
      {open && (
        <>
          <div className="drawer-scrim" aria-hidden />
          <div className={`${side === "left" ? "menu-panel" : `drawer-panel${narrow ? " drawer-narrow" : ""}`} ${className}`}>{children}</div>
        </>
      )}
    </dialog>
  )
}

/** The drawer's close button: 34×34 visual in a 44px hit area, X 24px rotating 90° on hover (M14). */
export function DrawerClose({ onClose, className = "" }: { onClose: () => void; className?: string }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className={`drawer-close ${className}`}>
      <X size={24} />
    </button>
  )
}

/** The 64px drawer head. */
export function DrawerHead({ children, onClose, closeFirst = false }: { children?: React.ReactNode; onClose: () => void; closeFirst?: boolean }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-[15px]">
      {closeFirst && <DrawerClose onClose={onClose} className="-ml-[5px]" />}
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {!closeFirst && <DrawerClose onClose={onClose} className="-mr-[5px]" />}
    </div>
  )
}
