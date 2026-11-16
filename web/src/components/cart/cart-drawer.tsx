"use client"

import { useCartDrawer } from "./drawer-context"
import { DrawerClose, SideDrawer } from "./side-drawer"

/** The slider cart's frame and header (v5 §6.7, G.6.8). Body and summary come from the server. */
export function CartDrawer({ policy, children }: { policy: string; children: React.ReactNode }) {
  const { isOpen, close } = useCartDrawer()
  return (
    <SideDrawer open={isOpen} onClose={close} label="Your bag">
      <div className="relative flex h-11 shrink-0 items-center px-5">
        <h2 className="text-xs leading-4 font-medium uppercase">Bag</h2>
        <p className="m-auto text-xs leading-4 text-light-charcoal">{policy}</p>
        <DrawerClose onClose={close} className="size-8" />
      </div>
      {children}
    </SideDrawer>
  )
}
