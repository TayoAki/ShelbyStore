import { router } from "expo-router"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { CompleteTheLook } from "@/components/complete-the-look"
import { FreeShippingProgress } from "@/components/free-shipping-progress"
import { BottomSheet } from "@/components/sheet"
import { Text } from "@/components/text"
import { Tile } from "@/components/tile"
import { colors, CORE_COLOURWAYS, fonts } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { track, trackTap } from "@/lib/analytics"
import { colorCounts } from "@/lib/product"
import { useCart } from "@/providers/cart-provider"

export type AddedLine = { title: string; detail?: string | null; price?: string | null; image?: string | null }

type Ctx = { show: (line: AddedLine) => void }

const AddedSheetContext = createContext<Ctx>({ show: () => {} })

/**
 * The Added sheet (APP_SPEC v8 V8.5 §7, web M13): a bottom sheet opened by
 * every add to bag. The head "Added to bag" with ✕, the line (80×96 tile,
 * title, price), the free-shipping progress, Checkout and View Bag, then two
 * Complete-the-look cards.
 */
export function AddedSheetProvider({ children }: { children: React.ReactNode }) {
  const [line, setLine] = useState<AddedLine | null>(null)
  const [visible, setVisible] = useState(false)
  const show = useCallback((next: AddedLine) => {
    setLine(next)
    setVisible(true)
  }, [])
  const value = useMemo(() => ({ show }), [show])
  const close = () => setVisible(false)

  return (
    <AddedSheetContext.Provider value={value}>
      {children}
      <BottomSheet visible={visible} onClose={close} title="Added to bag">
        <AddedBody line={line} close={close} />
      </BottomSheet>
    </AddedSheetContext.Provider>
  )
}

function AddedBody({ line, close }: { line: AddedLine | null; close: () => void }) {
  const { cart } = useCart()
  const catalog = useCatalog()
  const subtotal = Number(cart?.item_subtotal ?? cart?.subtotal ?? 0)
  const currency = cart?.currency_code ?? "usd"
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const inBag = new Set(
    (cart?.items ?? []).filter((i) => i.product_id === core?.id).map((i) => (i.variant_title ?? "").split(" / ")[0])
  )
  const suggestions = core
    ? CORE_COLOURWAYS.filter((c) => !inBag.has(c) && colorCounts(core).find((x) => x.color === c)?.state !== "sold_out").slice(0, 2)
    : []
  return (
    <View style={styles.body} accessibilityLiveRegion="polite">
      {line ? (
        <View style={styles.line}>
          <View style={styles.tile}>
            <Tile source={line.image ?? null} aspectRatio={80 / 96} />
          </View>
          <View style={styles.lineText}>
            <Text style={styles.title} numberOfLines={2}>
              {line.title}
            </Text>
            {line.detail ? (
              <Text variant="meta" tone="muted">
                {line.detail}
              </Text>
            ) : null}
            {line.price ? <Text style={styles.price}>{line.price}</Text> : null}
          </View>
        </View>
      ) : null}
      <FreeShippingProgress subtotal={subtotal} />
      <View style={styles.actions}>
        <Button
          title="Checkout"
          variant="black"
          onPress={() => {
            close()
            trackTap("cart_checkout")
            track("checkout_started", { cart_id: cart?.id, value: cart?.total, currency: currency.toUpperCase() })
            router.push("/checkout")
          }}
        />
        <Button
          title="View Bag"
          variant="outline"
          onPress={() => {
            close()
            router.navigate("/cart")
          }}
        />
      </View>
      {core && suggestions.length ? <CompleteTheLook core={core} colours={suggestions} compact /> : null}
    </View>
  )
}

export const useAddedSheet = () => useContext(AddedSheetContext)

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 18 },
  line: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  tile: { width: 80 },
  lineText: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 18, color: colors.text },
  price: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 18, color: colors.text, fontVariant: ["tabular-nums"] },
  actions: { gap: 10 },
})
