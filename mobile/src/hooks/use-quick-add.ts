import { useCallback, useState } from "react"
import { Alert } from "react-native"

import { track } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage } from "@/lib/medusa"
import { colorOptionOf, imagesFor, variantOptionMap, variantPrice, variantStock, type Product, type Variant } from "@/lib/product"
import { useAddedSheet } from "@/providers/added-sheet-provider"
import { useCart } from "@/providers/cart-provider"

import { useLiveReleaseIndex } from "./use-releases"

/**
 * Adds a variant (or a one-size colourway) to the bag, tags the live release,
 * records `add_to_cart` with its `source` and opens the Added sheet.
 */
export function useQuickAdd() {
  const { addItem } = useCart()
  const added = useAddedSheet()
  const releaseIndex = useLiveReleaseIndex()
  const [pending, setPending] = useState<string | null>(null)

  const addVariant = useCallback(
    async (product: Product, variant: Variant, source: string, opts?: { detail?: string; image?: string | null }) => {
      setPending(variant.id)
      try {
        const releaseId = releaseIndex.get(product.id)
        await addItem(variant.id, 1, { releaseId })
        const price = variantPrice(variant)
        track("add_to_cart", {
          product_id: product.id,
          variant_id: variant.id,
          quantity: 1,
          price: price?.amount,
          currency: price?.currency?.toUpperCase(),
          release_id: releaseId,
          source,
        })
        const colorId = colorOptionOf(product)?.id
        const colour = colorId ? variantOptionMap(variant)[colorId] : null
        added.show({
          title: product.title ?? "",
          detail: opts?.detail ?? variant.title ?? null,
          price: price ? formatMoney(price.amount, price.currency) : null,
          image: opts?.image ?? (colour ? imagesFor(product, colour)[0] : imagesFor(product)[0]) ?? null,
        })
      } catch (e) {
        Alert.alert("Couldn't add to bag", errorMessage(e))
      } finally {
        setPending(null)
      }
    },
    [addItem, added, releaseIndex]
  )

  /** One-size colourway: the colour's in-stock variant. */
  const addColour = useCallback(
    (product: Product, colour: string, source: string) => {
      const colorId = colorOptionOf(product)?.id
      const variant =
        (product.variants ?? []).find((v) => colorId && variantOptionMap(v)[colorId] === colour && variantStock(v).state !== "sold_out") ??
        null
      if (!variant) {
        Alert.alert("Sold out", `${colour} is out of stock right now.`)
        return
      }
      return addVariant(product, variant, source, { detail: `${colour} / One Size` })
    },
    [addVariant]
  )

  return { addVariant, addColour, pending }
}
