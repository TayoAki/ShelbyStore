"use client"

import { useCartDrawer } from "./drawer-context"
import { DrawerHead, SideDrawer } from "./side-drawer"

/** The cart flyout's frame (SITE_SPEC v8 E.6.4). Head, body and foot come from the server (BagContents). */
export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useCartDrawer()
  return (
    <SideDrawer open={isOpen} onClose={close} label="Your bag">
      {children}
    </SideDrawer>
  )
}

/** "Bag (1)" with the close button, 64px. */
export function CartHead({ count }: { count: number | null }) {
  const { close } = useCartDrawer()
  return (
    <DrawerHead onClose={close}>
      <h2 className="label !text-[14.4px] text-text">
        Bag{count !== null && <span className="tabular"> ({count})</span>}
      </h2>
    </DrawerHead>
  )
}
