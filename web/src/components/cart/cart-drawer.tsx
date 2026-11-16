"use client"

import { Bag } from "@phosphor-icons/react"
import { useCartDrawer } from "./drawer-context"
import { DrawerClose, SideDrawer } from "./side-drawer"

/** The slider cart's frame and header (SITE_SPEC §6.7). Body and summary come from the server. */
export function CartDrawer({ policy, children }: { policy: string; children: React.ReactNode }) {
  const { isOpen, close } = useCartDrawer()
  return (
    <SideDrawer open={isOpen} onClose={close} label="Your bag">
      <div className="relative shrink-0 bg-white px-4 pb-5 pt-4 text-center">
        <DrawerClose onClose={close} className="absolute right-4 top-4" />
        <div className="flex items-center justify-center gap-1">
          <Bag size={24} aria-hidden />
          <h2 className="font-heading text-[16px] leading-6">Your Bag</h2>
        </div>
        <p className="mt-3 font-body text-[13px] capitalize leading-[15px] tracking-[-0.1px]">{policy}</p>
      </div>
      {children}
    </SideDrawer>
  )
}
