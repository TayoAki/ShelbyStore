import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, View } from "react-native"

import { colors, CORE_COLOURWAYS, layout, type } from "@/constants/theme"
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
 * Eastside's mobile header (APP_SPEC v8 V8.3): 72pt, white, no border. Search
 * at the left (the tab bar replaces Eastside's hamburger), the SHELBY wordmark
 * centred in Monomakh, recently viewed at the right. Stack screens put a back
 * chevron before search and the bag after recently viewed, since the tab bar
 * is not on screen there. Every icon is a 44pt target.
 */
export function AppHeader({ back = false }: { belowTicker?: boolean; back?: boolean }) {
  const { itemCount } = useCart()
  const viewed = useRecentlyViewed()
  const [search, setSearch] = useState(false)
  const [recent, setRecent] = useState(false)
  const stack = back && router.canGoBack()

  return (
    <>
      <View style={styles.bar}>
        <View style={styles.side}>
          {stack ? <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} /> : null}
          <IconButton icon="search" label="Search" onPress={() => setSearch(true)} />
        </View>
        <Pressable accessibilityRole="link" accessibilityLabel="Shelby, home" onPress={() => router.navigate("/")} style={styles.wordmarkWrap}>
          <Text style={type.wordmark}>Shelby</Text>
        </Pressable>
        <View style={[styles.side, styles.right]}>
          <IconButton
            icon="eye-outline"
            label={`Previously viewed, ${viewed.handles.length} products`}
            count={viewed.handles.length}
            onPress={() => {
              trackTap("recently_viewed")
              setRecent(true)
            }}
          />
          {back ? (
            <IconButton icon="bag-handle-outline" label={`Bag, ${itemCount} items`} count={itemCount} onPress={() => router.navigate("/cart")} />
          ) : null}
        </View>
      </View>
      <SearchSheet visible={search} onClose={() => setSearch(false)} />
      <RecentSheet visible={recent} onClose={() => setRecent(false)} handles={viewed.handles} />
    </>
  )
}

/** v6 helper kept for call sites: content starts directly under the header. */
export function useHeaderInset(_belowTicker = false) {
  return 0
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
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={4} onPress={onPress} style={styles.icon}>
      {({ pressed }) => (
        <>
          <Ionicons name={icon} size={22} color={pressed ? colors.linkPressed : colors.text} />
          {count > 0 ? (
            <View style={styles.count} pointerEvents="none">
              <Text style={[type.countBadge, { color: colors.white }]}>{count > 99 ? "99" : count}</Text>
            </View>
          ) : null}
        </>
      )}
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
  const results = query
    ? index.filter((e) => query.split(/\s+/).every((t) => e.terms.includes(t) || e.title.toLowerCase().includes(t)))
    : index
  const go = (href: string) => {
    trackTap("search_result", { q: query })
    onClose()
    router.push(href as never)
  }
  return (
    <TopSheet visible={visible} onClose={onClose} title="Search">
      <View style={{ gap: 16 }}>
        <SearchPill value={q} onChangeText={setQ} autoFocus={visible} onSubmit={() => trackTap("search_submit", { q: query })} />
        <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">
          <View style={styles.grid}>
            {results.slice(0, 8).map((e) => (
              <Pressable key={e.key} accessibilityRole="link" onPress={() => go(e.href)} style={styles.cell}>
                {({ pressed }) => (
                  <>
                    <View style={styles.tile}>
                      {e.image ? <Image source={e.image} style={styles.tileImage} contentFit="contain" /> : null}
                    </View>
                    <Text variant="cardTitleEastside" numberOfLines={2} style={pressed && { color: colors.linkPressed }}>
                      {e.title}
                    </Text>
                    <Text variant="priceCard" numberOfLines={1}>
                      {e.meta}
                    </Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
          {query && !results.length ? (
            <Text variant="bodyPdp" tone="muted">
              Nothing matches &ldquo;{q}&rdquo;. Try a color: navy, pine, fescue.
            </Text>
          ) : null}
        </ScrollView>
        <Pressable accessibilityRole="link" onPress={() => go("/shop")} style={styles.more}>
          <Text variant="meta" style={styles.underline}>
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
    <BottomSheet visible={visible} onClose={onClose} title={`Previously viewed (${products.length})`}>
      <ScrollView>
        <View style={styles.grid}>
          {products.map((p) => {
            const price = productPrice(p)
            return (
              <Pressable
                key={p.id}
                accessibilityRole="link"
                style={styles.cell}
                onPress={() => {
                  onClose()
                  router.push(`/products/${p.handle}`)
                }}>
                <View style={styles.tile}>
                  <Image source={imagesFor(p)[0] ?? null} style={styles.tileImage} contentFit="contain" />
                </View>
                <Text variant="cardTitleEastside" numberOfLines={1}>
                  {p.title}
                </Text>
                {price ? <Text variant="priceCard">{formatMoney(price.amount, price.currency)}</Text> : null}
              </Pressable>
            )
          })}
        </View>
        {!products.length ? (
          <Text variant="bodyPdp" tone="muted">
            Nothing viewed yet.
          </Text>
        ) : null}
      </ScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  bar: {
    height: layout.header,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 80,
  },
  side: { flexDirection: "row", alignItems: "center", minWidth: 88 },
  right: { justifyContent: "flex-end" },
  wordmarkWrap: { position: "absolute", left: 96, right: 96, alignItems: "center", justifyContent: "center", minHeight: 44, zIndex: -1 },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  count: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", columnGap: layout.gridGap, rowGap: 16 },
  cell: { width: "47.5%", gap: 6 },
  tile: { width: "100%", aspectRatio: 5 / 6, backgroundColor: colors.tile, alignItems: "center", justifyContent: "center" },
  tileImage: { width: "88%", height: "88%" },
  more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  underline: { textDecorationLine: "underline" },
})
