"use client"

import { Faders, X } from "@phosphor-icons/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useRef, useTransition } from "react"
import { Button } from "./ui/button"

/**
 * Multi-select Size + Colour filters (Baymard: allow multiple values).
 * Mobile: behind a "Filter" button in a bottom drawer (10/10 studied sites).
 * Desktop: inline chips. State lives in the URL (?size=M&size=L&color=Black).
 */
export function ShopFilters({ sizes, colors }: { sizes: string[]; colors: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const drawer = useRef<HTMLDialogElement>(null)

  const selected = { size: params.getAll("size"), color: params.getAll("color") }
  const count = selected.size.length + selected.color.length

  const toggle = (key: "size" | "color", value: string) => {
    const next = new URLSearchParams(params)
    const values = next.getAll(key)
    next.delete(key)
    for (const v of values.includes(value) ? values.filter((x) => x !== value) : [...values, value]) next.append(key, v)
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }))
  }
  const clear = () => startTransition(() => router.replace(pathname, { scroll: false }))

  const groups = (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
      <Group label="Size" values={sizes} active={selected.size} onToggle={(v) => toggle("size", v)} />
      <Group label="Colour" values={colors} active={selected.color} onToggle={(v) => toggle("color", v)} />
      {count > 0 && (
        <Button variant="ghost" onClick={clear}>
          Clear all
        </Button>
      )}
    </div>
  )

  return (
    <div aria-busy={pending || undefined}>
      <div className="hidden lg:block">{groups}</div>
      <div className="lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => drawer.current?.showModal()}>
          <Faders size={16} aria-hidden /> Filter{count ? ` (${count})` : ""}
        </Button>
        <dialog
          ref={drawer}
          className="mb-0 mt-auto w-full max-w-none rounded-t-[2px] bg-page p-0 text-ink backdrop:bg-ink/40"
          onClick={(e) => {
            if (e.target === drawer.current) drawer.current?.close()
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-display text-[22px]">Filter</h2>
            <button type="button" aria-label="Close filters" className="-mr-2 p-2" onClick={() => drawer.current?.close()}>
              <X size={20} />
            </button>
          </div>
          <div className="px-4 py-5">{groups}</div>
          <div className="border-t border-line px-4 py-3">
            <Button block onClick={() => drawer.current?.close()}>
              Show results
            </Button>
          </div>
        </dialog>
      </div>
    </div>
  )
}

function Group({
  label,
  values,
  active,
  onToggle,
}: {
  label: string
  values: string[]
  active: string[]
  onToggle: (v: string) => void
}) {
  if (!values.length) return null
  return (
    <fieldset className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <legend className="text-eyebrow mb-2 text-ink-muted lg:float-left lg:mb-0 lg:mr-1">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const on = active.includes(v)
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(v)}
              className={`h-10 min-w-11 rounded-[2px] border px-3 text-[14px] transition-colors duration-150 ${
                on ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
