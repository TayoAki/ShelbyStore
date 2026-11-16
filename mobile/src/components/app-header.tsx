import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, CORE_COLOURWAYS, ease, layout, radius, shadow, type } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { trackTap } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { capsIn, imagesFor, isOffer, productPrice, ropeNameFor, type Product } from "@/lib/product"
import { useCart } from "@/providers/cart-provider"

import { SearchPill } from "./search-pill"
import { BottomSheet, TopSheet } from "./sheet"
import { Text } from "./text"

/**
 * The floating header pill (APP_SPEC v5 §4.1): white, radius 12, 40pt, 20pt
 * from the edges. Recently viewed at the left (hidden when empty), the
 * wordmark centred, search and bag at the right. `belowTicker` pushes it under
 * the 32pt ticker on Home.
 */
export function AppHeader({ belowTicker = false, back = false }: { belowTicker?: boolean; back?: boolean }) {
  const insets = useSafeAreaInsets()
  const { itemCount } = useCart()
  const viewed = useRecentlyViewed()
  const [search, setSearch] = useState(false)
  const [recent, setRecent] = useState(false)
  const top = insets.top + layout.pillTop + (belowTicker ? layout.ticker : 0)

  return (
    <>
      <View style={[styles.pill, shadow.sm, { top }]}>
        <View style={styles.side}>
          {back && router.canGoBack() ? (
            <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
          ) : null}
          {viewed.handles.length ? (
            <IconButton
              icon="eye-outline"
              label={`Previously viewed, ${viewed.handles.length} products`}
              count={viewed.handles.length}
              onPress={() => {
                trackTap("recently_viewed")
                setRecent(true)
              }}
            />
          ) : null}
        </View>
        <Pressable accessibilityRole="link" accessibilityLabel="Shelby, home" onPress={() => router.navigate("/")} style={styles.wordmarkWrap}>
          <Text style={type.wordmark}>shelby</Text>
        </Pressable>
        <View style={[styles.side, styles.right]}>
          <IconButton icon="search-outline" label="Search" onPress={() => setSearch(true)} />
          <IconButton icon="bag-handle-outline" label={`Bag, ${itemCount} items`} count={itemCount} onPress={() => router.navigate("/cart")} />
        </View>
      </View>
      <SearchSheet visible={search} onClose={() => setSearch(false)} />
      <RecentSheet visible={recent} onClose={() => setRecent(false)} handles={viewed.handles} />
    </>
  )
}

/** Screens start their content under the floating pill. */
export function useHeaderInset(belowTicker = false) {
  const insets = useSafeAreaInsets()
  return insets.top + layout.contentTop + (belowTicker ? layout.ticker : 0)
}

function IconButton({
  icon,
  label,
  count = 0,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"]
  label: string
  count?: number
  onPress: () => void
}) {
  const o = useSharedValue(count > 0 ? 1 : 0)
  useEffect(() => {
    o.value = withTiming(count > 0 ? 1 : 0, { duration: 50, easing: ease.sineIn })
  }, [count, o])
  const badge = useAnimatedStyle(() => ({ opacity: o.value }))
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={onPress} style={styles.icon}>
      <Ionicons name={icon} size={24} color={colors.black} />
      <Animated.View style={[styles.count, badge]} pointerEvents="none">
        <Text style={[type.countBadge, { color: colors.white }]}>{count > 99 ? "99" : count}</Text>
      </Animated.View>
    </Pressable>
  )
}

type Entry = { key: string; title: string; meta: string; image: string | null; href: string; terms: string }

/** One entry per colourway of the Rope Cap, each edition and both bundles (web G.6.1). */
function useSearchIndex(): Entry[] {
  const catalog = useCatalog()
  return useMemo(() => {
    const out: Entry[] = []
    for (const p of catalog.data ?? []) {
      const price = productPrice(p)
      const money = price ? formatMoney(price.amount, price.currency) : ""
      if (p.handle === "rope-cap") {
        for (const c of CORE_COLOURWAYS) {
          const rope = ropeNameFor(p, c)
          out.push({
            key: `${p.id}-${c}`,
            title: `The Rope Cap · ${c}`,
            meta: `${rope ? `${rope} rope · ` : ""}${money}`,
            image: imagesFor(p, c)[0] ?? null,
            href: `/products/rope-cap?color=${encodeURIComponent(c)}`,
            terms: `rope cap ${c} ${rope ?? ""} core`.toLowerCase(),
          })
        }
      } else if (isOffer(p)) {
        out.push({
          key: p.id,
          title: p.title ?? "",
          meta: `${capsIn(p)} caps · ${money}`,
          image: imagesFor(p)[0] ?? null,
          href: `/offer/${p.handle}`,
          terms: `${p.title} bundle ${capsIn(p) === 4 ? "four foursome" : "two pair"}`.toLowerCase(),
        })
      } else {
        out.push({
          key: p.id,
          title: p.title ?? "",
          meta: `Limited edition · ${money}`,
          image: imagesFor(p)[0] ?? null,
          href: `/products/${p.handle}`,
          terms: `${p.title} ${p.handle} limited edition hole`.toLowerCase(),
        })
      }
    }
    return out
  }, [catalog.data])
}

function SearchSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [q, setQ] = useState("")
  const index = useSearchIndex()
  const query = q.trim().toLowerCase()
  const results = query ? index.filter((e) => query.split(/\s+/).every((t) => e.terms.includes(t) || e.title.toLowerCase().includes(t))) : index
  const go = (href: string) => {
    trackTap("search_result", { q: query })
    onClose()
    router.push(href as never)
  }
  return (
    <TopSheet visible={visible} onClose={onClose}>
      <View style={{ gap: 12 }}>
        <SearchPill value={q} onChangeText={setQ} autoFocus={visible} onSubmit={() => trackTap("search_submit", { q: query })} />
        <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 8 }}>
            {results.slice(0, 8).map((e) => (
              <Pressable key={e.key} accessibilityRole="link" onPress={() => go(e.href)} style={styles.result}>
                {e.image ? <Image source={e.image} style={styles.resultImage} contentFit="contain" /> : <View style={styles.resultImage} />}
                <View style={styles.flex}>
                  <Text variant="cardTitle" numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text variant="meta" tone="muted" numberOfLines={1}>
                    {e.meta}
                  </Text>
                </View>
              </Pressable>
            ))}
            {query && !results.length ? (
              <Text variant="body" tone="muted">
                Nothing matches &ldquo;{q}&rdquo;. Try a color: navy, pine, fescue.
              </Text>
            ) : null}
          </View>
        </ScrollView>
        <Pressable accessibilityRole="link" onPress={() => go("/shop")}>
          <Text variant="meta" tone="golf" style={styles.underline}>
            View all results
          </Text>
        </Pressable>
      </View>
    </TopSheet>
  )
}

function RecentSheet({ visible, onClose, handles }: { visible: boolean; onClose: () => void; handles: string[] }) {
  const catalog = useCatalog()
  const products = handles.map((h) => catalog.data?.find((p) => p.handle === h)).filter((p): p is Product => !!p)
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="cardTitle">Previously viewed ({products.length})</Text>
      <ScrollView>
        <View style={styles.grid}>
          {products.map((p) => {
            const price = productPrice(p)
            return (
              <Pressable
                key={p.id}
                accessibilityRole="link"
                style={styles.recent}
                onPress={() => {
                  onClose()
                  router.push(`/products/${p.handle}`)
                }}>
                <Image source={imagesFor(p)[0] ?? null} style={styles.recentImage} contentFit="contain" />
                <Text variant="cardTitle" numberOfLines={1}>
                  {p.title}
                </Text>
                {price ? <Text variant="priceSm">{formatMoney(price.amount, price.currency)}</Text> : null}
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    left: layout.pillSide,
    right: layout.pillSide,
    height: layout.pillHeight,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 80,
  },
  side: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 64 },
  right: { justifyContent: "flex-end" },
  wordmarkWrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: -1 },
  icon: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  count: {
    position: "absolute",
    top: 0,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 2,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 8,
  },
  resultImage: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.white },
  underline: { textDecorationLine: "underline" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  recent: { width: "48%", gap: 4 },
  recentImage: { width: "100%", aspectRatio: 1, borderRadius: radius.xxl, backgroundColor: colors.naturalWhite25 },
})
