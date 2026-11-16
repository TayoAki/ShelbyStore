"use client"

import { createContext, useContext, useState } from "react"

/**
 * The colour picked in the buy box, shared with the gallery so each colour
 * shows its own photos (Medusa variant images).
 */
type Selection = { color: string | null; setColor: (color: string) => void }

const SelectionContext = createContext<Selection>({ color: null, setColor: () => {} })

export function SelectionProvider({ initialColor, children }: { initialColor: string | null; children: React.ReactNode }) {
  const [color, setColor] = useState(initialColor)
  return <SelectionContext.Provider value={{ color, setColor }}>{children}</SelectionContext.Provider>
}

export const useSelection = () => useContext(SelectionContext)
