"use client"

import { X } from "@phosphor-icons/react"
import { useEffect, useRef } from "react"

/**
 * Right-hand drawer frame shared by the cart and "Previously Viewed"
 * (SITE_SPEC §6.0.4, §6.7): a modal <dialog> (focus trap, Escape, inert page),
 * 500px on desktop and full screen on mobile, sliding in from the right over a
 * black/80 overlay.
 */
export function SideDrawer({
  open,
  onClose,
  label,
  className = "bg-tile",
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
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
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself; following
        // a link inside the drawer closes it too.
        if (e.target === ref.current || (e.target as HTMLElement).closest("a")) onClose()
      }}
      className={`fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-screen max-w-none p-0 text-black backdrop:bg-black/80 lg:w-[500px] ${className} translate-x-0 transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] starting:translate-x-full open:flex open:flex-col`}
    >
      {children}
    </dialog>
  )
}

export function DrawerClose({ onClose, className = "" }: { onClose: () => void; className?: string }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className={`flex h-6 w-6 items-center justify-center ${className}`}>
      <X size={24} />
    </button>
  )
}
