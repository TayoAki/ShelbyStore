"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

/**
 * Opens and closes the slider cart (SITE_SPEC §6.7). Every add-to-cart path
 * calls `open()` after the server action succeeds; the drawer's contents are
 * server-rendered in the layout and refreshed by the action.
 */
type Drawer = { isOpen: boolean; open: () => void; close: () => void }

const DrawerContext = createContext<Drawer>({ isOpen: false, open: () => {}, close: () => {} })

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export const useCartDrawer = () => useContext(DrawerContext)
