import AsyncStorage from "@react-native-async-storage/async-storage"
import type { HttpTypes } from "@medusajs/types"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { useRegion } from "@/hooks/use-region"
import { analyticsId } from "@/lib/analytics"
import { attributionPatch, clearAttribution, readAttribution } from "@/lib/attribution"
import { isNotFound, sdk } from "@/lib/medusa"

export type Cart = HttpTypes.StoreCart

const CART_KEY = "shelby.cart_id"

type CartContextValue = {
  cart: Cart | null
  itemCount: number
  isLoading: boolean
  isMutating: boolean
  /** `releaseId` tags the cart (and the line) with the live drop the product belongs to. */
  addItem: (variantId: string, quantity: number, opts?: { releaseId?: string }) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  /** Re-applies stored attribution (e.g. after a deep link) to an existing cart. */
  syncAttribution: () => Promise<void>
  setCart: (cart: Cart) => void
  refresh: () => Promise<void>
  /** Drops the cart. After an order, also clears attribution so it isn't counted twice. */
  reset: (opts?: { keepAttribution?: boolean }) => Promise<void>
  transferToCustomer: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: region } = useRegion()
  const [cart, setCartState] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pending, setPending] = useState(0)
  const cartRef = useRef<Cart | null>(null)
  // Serialize mutations so rapid +/- taps can't race each other.
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  const setCart = useCallback((next: Cart | null) => {
    cartRef.current = next
    setCartState(next)
  }, [])

  const run = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const next = queue.current.then(async () => {
      setPending((n) => n + 1)
      try {
        return await task()
      } finally {
        setPending((n) => n - 1)
      }
    })
    queue.current = next.catch(() => undefined)
    return next
  }, [])

  const forget = useCallback(async () => {
    await AsyncStorage.removeItem(CART_KEY).catch(() => undefined)
    setCart(null)
  }, [setCart])

  const load = useCallback(async () => {
    const id = await AsyncStorage.getItem(CART_KEY).catch(() => null)
    if (!id) {
      setCart(null)
      return
    }
    try {
      const { cart: fetched } = await sdk.store.cart.retrieve(id)
      if ((fetched as Cart & { completed_at?: string | null }).completed_at) await forget()
      else setCart(fetched)
    } catch (error) {
      if (isNotFound(error)) await forget()
      else throw error
    }
  }, [forget, setCart])

  useEffect(() => {
    // Start after the effect returns: load() updates state once AsyncStorage answers.
    Promise.resolve()
      .then(load)
      .catch(() => undefined)
      .finally(() => setIsLoading(false))
  }, [load])

  const ensureCart = useCallback(async (): Promise<Cart> => {
    const current = cartRef.current
    if (current && (!region || current.region_id === region.id)) return current
    if (current && region) {
      const { cart: moved } = await sdk.store.cart.update(current.id, { region_id: region.id })
      setCart(moved)
      return moved
    }
    if (!region) throw new Error("The store isn't ready yet. Please try again in a moment.")
    const attribution = await readAttribution()
    // analytics_id lets the backend's order_completed event join this visitor's journey.
    const id = analyticsId()
    const patch = attributionPatch({}, attribution) ?? {}
    const metadata = Object.keys(patch).length || id ? { ...patch, ...(id ? { analytics_id: id } : {}) } : undefined
    const { cart: created } = await sdk.store.cart.create({ region_id: region.id, metadata })
    await AsyncStorage.setItem(CART_KEY, created.id).catch(() => undefined)
    setCart(created)
    return created
  }, [region, setCart])

  const applyAttribution = useCallback(
    async (target: Cart, releaseId?: string): Promise<Cart> => {
      const patch = attributionPatch(target.metadata, await readAttribution(), releaseId)
      if (!patch) return target
      const { cart: updated } = await sdk.store.cart.update(target.id, { metadata: patch })
      return updated
    },
    []
  )

  const addItem = useCallback<CartContextValue["addItem"]>(
    (variantId, quantity, opts) =>
      run(async () => {
        const target = await ensureCart()
        const { cart: withItem } = await sdk.store.cart.createLineItem(target.id, {
          variant_id: variantId,
          quantity,
          metadata: opts?.releaseId ? { release_id: opts.releaseId } : undefined,
        })
        setCart(await applyAttribution(withItem, opts?.releaseId))
      }),
    [applyAttribution, ensureCart, run, setCart]
  )

  const updateItem = useCallback<CartContextValue["updateItem"]>(
    (lineId, quantity) =>
      run(async () => {
        const current = cartRef.current
        if (!current) return
        if (quantity <= 0) {
          const res = await sdk.store.cart.deleteLineItem(current.id, lineId)
          setCart(res.parent ?? (await sdk.store.cart.retrieve(current.id)).cart)
          return
        }
        const { cart: updated } = await sdk.store.cart.updateLineItem(current.id, lineId, { quantity })
        setCart(updated)
      }),
    [run, setCart]
  )

  const removeItem = useCallback((lineId: string) => updateItem(lineId, 0), [updateItem])

  const syncAttribution = useCallback(
    () =>
      run(async () => {
        const current = cartRef.current
        if (current) setCart(await applyAttribution(current))
      }),
    [applyAttribution, run, setCart]
  )

  const refresh = useCallback(() => run(load), [load, run])

  const reset = useCallback(
    async (opts?: { keepAttribution?: boolean }) => {
      await forget()
      if (!opts?.keepAttribution) await clearAttribution()
    },
    [forget]
  )

  const transferToCustomer = useCallback(
    () =>
      run(async () => {
        const current = cartRef.current
        if (!current) return
        try {
          const { cart: transferred } = await sdk.store.cart.transferCart(current.id)
          setCart(transferred)
        } catch {
          // A cart that already belongs to someone else can't move; start fresh instead.
          await forget()
        }
      }),
    [forget, run, setCart]
  )

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
      isLoading,
      isMutating: pending > 0,
      addItem,
      updateItem,
      removeItem,
      syncAttribution,
      setCart: (next: Cart) => setCart(next),
      refresh,
      reset,
      transferToCustomer,
    }),
    [cart, isLoading, pending, addItem, updateItem, removeItem, syncAttribution, setCart, refresh, reset, transferToCustomer]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
