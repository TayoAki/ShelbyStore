"use client"

import Image from "next/image"
import { createContext, useContext, useState } from "react"

/**
 * The colour picked in the buy box, shared with the gallery so each colour
 * shows its own photos (Medusa variant images). `shared` is false outside a
 * provider (e.g. the story page's offer), where the URL isn't touched.
 */
type Selection = { color: string | null; setColor: (color: string) => void; shared: boolean }

const SelectionContext = createContext<Selection>({ color: null, setColor: () => {}, shared: false })

export function SelectionProvider({
  initialColor,
  syncUrl = true,
  children,
}: {
  initialColor: string | null
  /** Write ?color= to the URL on change (product pages only). */
  syncUrl?: boolean
  children: React.ReactNode
}) {
  const [color, setColor] = useState(initialColor)
  return <SelectionContext.Provider value={{ color, setColor, shared: syncUrl }}>{children}</SelectionContext.Provider>
}

/** One image that follows the selected colour (the story page's offer). */
export function SelectedImage({ byColor, fallback, alt, sizes }: { byColor: Record<string, string>; fallback: string | null; alt: string; sizes: string }) {
  const { color } = useSelection()
  const src = (color && byColor[color]) || fallback
  return src ? <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" /> : null
}

export const useSelection = () => useContext(SelectionContext)
