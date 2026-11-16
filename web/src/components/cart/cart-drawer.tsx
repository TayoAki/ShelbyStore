"use client"

import { useCartDrawer } from "./drawer-context"
import { DrawerClose, SideDrawer } from "./side-drawer"

/** The slider cart's frame and header (v5 §6.7, G.6.8). Body and summary come from the server. */
export function CartDrawer({ policy, children }: { policy: string; children: React.ReactNode }) {
  const { isOpen, close } = useCartDrawer()
  return (
    <SideDrawer open={isOpen} onClose={close} label="Your bag">
      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b-2 border-ink px-5">
        <h2 className="panel-title !text-[2rem]">Bag</h2>
        <p className="mr-auto text-[0.875rem] leading-5 text-ink-2">{policy}</p>
        <DrawerClose onClose={close} className="!size-11" />
      </div>
      {children}
    </SideDrawer>
  )
}
