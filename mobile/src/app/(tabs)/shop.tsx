import Ionicons from "@expo/vector-icons/Ionicons"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/button"
import { ProductCard, ProductGrid } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { colors, fonts, MAX_CONTENT_WIDTH, radius } from "@/constants/theme"
import { useListableProducts, useShapes } from "@/hooks/use-products"
import { useLiveReleaseIndex } from "@/hooks/use-releases"
import {
  colorOptionOf,
  productPrice,
  shapeOf,
  sizeOptionOf,
  valueStock,
  type Product,
} from "@/lib/product"

type Sort = "featured" | "price_asc" | "price_desc" | "newest"
const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low To High" },
  { value: "price_desc", label: "Price: High To Low" },
  { value: "newest", label: "Newest" },
]

type Filters = { sort: Sort; sizes: string[]; colors: string[] }
const NO_FILTERS: Filters = { sort: "featured", sizes: [], colors: [] }

const sizesOf = (p: Product) => sizeOptionOf(p)?.values ?? ["One Size"]
const colorsOf = (p: Product) => colorOptionOf(p)?.values ?? []

/** True when `size` is in stock in any colour of `p`. */
function hasSizeInStock(p: Product, size: string) {
  const option = sizeOptionOf(p)
  if (!option) return size === "One Size"
  return valueStock(p, option.id, size, {}).state !== "sold_out"
}

function applyFilters(products: Product[], f: Filters): Product[] {
  let out = products
  if (f.sizes.length) out = out.filter((p) => f.sizes.some((s) => sizesOf(p).includes(s) && hasSizeInStock(p, s)))
  if (f.colors.length) out = out.filter((p) => colorsOf(p).some((c) => f.colors.includes(c)))
  const price = (p: Product) => productPrice(p)?.amount ?? 0
  if (f.sort === "price_asc") out = [...out].sort((a, b) => price(a) - price(b))
  if (f.sort === "price_desc") out = [...out].sort((a, b) => price(b) - price(a))
  if (f.sort === "newest")
    out = [...out].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))
  return out
}

/** Shop (APP_SPEC §5.2): the full catalog with style pills, search and Filter + Sort. */
export default function ShopScreen() {
  const params = useLocalSearchParams<{ shape?: string }>()
  const { width: windowWidth } = useWindowDimensions()
  const W = Math.min(windowWidth, MAX_CONTENT_WIDTH)
  const cardWidth = (W - 48) / 2
  const live = useLiveReleaseIndex()
  const products = useListableProducts(new Set(live.keys()))
  const shapes = useShapes()
  const [shape, setShape] = useState<string | null>(typeof params.shape === "string" ? params.shape : null)
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)
  const [lastParam, setLastParam] = useState(params.shape)
  if (params.shape !== lastParam) {
    setLastParam(params.shape)
    setShape(typeof params.shape === "string" ? params.shape : null)
  }

  const active = shapes.data.find((s) => s.handle === shape) ?? null
  const q = query.trim().toLowerCase()
  const base = (products.data ?? []).filter((p) => {
    if (active && shapeOf(p)?.handle !== active.handle) return false
    if (!q) return true
    const hay = [p.title, shapeOf(p)?.name ?? "", ...colorsOf(p)].join(" ").toLowerCase()
    return hay.includes(q)
  })
  const shown = applyFilters(base, filters)

  return (
    <Screen
      edges={["top"]}
      header={<AppHeader condensed={condensed} search={query} onSearch={setQuery} />}
      onScrollY={(y) => setCondensed(y > 121)}
      refreshing={products.isRefetching}
      onRefresh={() => products.refetch()}>
      <View style={styles.titleBand}>
        <Text style={styles.title}>{active ? active.name : "Hats"}</Text>
        <Text variant="micro" tone="mutedSub" style={styles.subtitle}>
          {active?.description || (active ? `Shop Our ${active.name}` : "Shop Our Full Range Of Hats")}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {[{ handle: null as string | null, name: "View All" }, ...shapes.data].map((s) => {
          const on = s.handle === shape
          return (
            <Pressable
              key={s.handle ?? "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setShape(s.handle)
                router.setParams({ shape: s.handle ?? undefined })
              }}
              style={[styles.pill, on && styles.pillOn]}>
              <Text style={[styles.pillLabel, on && styles.pillLabelOn]}>{s.name}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
      <View style={styles.divider} />

      <View style={styles.toolbar}>
        <Button title="Filter + Sort" variant="action" icon="options-outline" onPress={() => setFilterOpen(true)} />
        <Text variant="micro" tone="muted">
          {shown.length} {shown.length === 1 ? "Result" : "Results"}
        </Text>
      </View>

      {products.isLoading ? <LoadingState /> : null}
      {products.error ? <ErrorState error={products.error} onRetry={() => products.refetch()} /> : null}
      {!products.isLoading && !products.error && !shown.length ? (
        <EmptyState
          title="Nothing Matches Right Now"
          body="Try another style, or clear the filters."
          actionTitle="View all hats"
          onAction={() => {
            setShape(null)
            setQuery("")
            setFilters(NO_FILTERS)
          }}
        />
      ) : null}
      <ProductGrid>
        {shown.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            width={cardWidth}
            releaseId={live.get(p.id)}
            status={live.has(p.id) ? "live" : p.collection?.handle === "core" ? "core" : null}
          />
        ))}
      </ProductGrid>

      <FilterSort
        visible={filterOpen}
        products={base}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f)
          setFilterOpen(false)
        }}
      />
    </Screen>
  )
}

/** Full-screen Filter + Sort (APP_SPEC §5.2 item 4). */
function FilterSort({
  visible,
  products,
  value,
  onClose,
  onApply,
}: {
  visible: boolean
  products: Product[]
  value: Filters
  onClose: () => void
  onApply: (f: Filters) => void
}) {
  const [draft, setDraft] = useState<Filters>(value)
  const [wasVisible, setWasVisible] = useState(visible)
  if (visible !== wasVisible) {
    setWasVisible(visible)
    if (visible) setDraft(value)
  }
  const allSizes = ["One Size", "S/M", "L/XL"].filter((s) => products.some((p) => sizesOf(p).includes(s) && hasSizeInStock(p, s)))
  const allColors = Array.from(new Set(products.flatMap(colorsOf)))
  const count = applyFilters(products, draft).length
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={["top", "bottom"]}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>Filter + Sort</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalBody}>
          <Text style={styles.group}>Sort</Text>
          {SORTS.map((s) => {
            const on = draft.sort === s.value
            return (
              <Pressable
                key={s.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setDraft({ ...draft, sort: s.value })}
                style={styles.radioRow}>
                <View style={[styles.radio, on && styles.radioOn]} />
                <Text variant="bodySm">{s.label}</Text>
              </Pressable>
            )
          })}

          {allSizes.length ? <Text style={styles.group}>Size</Text> : null}
          <View style={styles.sizeRow}>
            {allSizes.map((s) => {
              const on = draft.sizes.includes(s)
              return (
                <Pressable
                  key={s}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => setDraft({ ...draft, sizes: toggle(draft.sizes, s) })}
                  style={[styles.sizeBox, on && styles.sizeBoxOn]}>
                  <Text style={[styles.sizeLabel, on && styles.sizeLabelOn]}>{s === "One Size" ? "OS" : s}</Text>
                </Pressable>
              )
            })}
          </View>

          {allColors.length ? <Text style={styles.group}>Color</Text> : null}
          <View style={styles.colorGrid}>
            {allColors.map((c) => (
              <View key={c} style={styles.colorCell}>
                <Swatch
                  name={c}
                  size={32}
                  selected={draft.colors.includes(c)}
                  onPress={() => setDraft({ ...draft, colors: toggle(draft.colors, c) })}
                />
                <Text style={styles.colorName} numberOfLines={2}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.modalFoot}>
          <Button title="Clear" variant="light" onPress={() => setDraft(NO_FILTERS)} style={styles.flex} />
          <Button title={`View ${count} results`} onPress={() => onApply(draft)} style={styles.flex} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleBand: { alignItems: "center", paddingTop: 28, paddingHorizontal: 16 },
  title: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 39, textTransform: "uppercase", color: colors.text },
  subtitle: { textTransform: "capitalize", textAlign: "center" },
  pills: { paddingHorizontal: 16, gap: 9, marginTop: 28 },
  pill: {
    height: 35,
    minWidth: 85,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.tile,
    alignItems: "center",
    justifyContent: "center",
  },
  pillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillLabel: { fontFamily: fonts.body, fontSize: 13, lineHeight: 16, letterSpacing: 1.3, color: colors.text },
  pillLabelOn: { color: colors.textInverse },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 28 },
  toolbar: {
    marginVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modal: { flex: 1, backgroundColor: colors.secondary },
  modalHead: {
    height: 56,
    backgroundColor: colors.tile,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, letterSpacing: 1.4, textTransform: "uppercase", color: colors.text },
  modalBody: { padding: 16, paddingBottom: 32 },
  group: {
    fontFamily: fonts.heading,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.primary },
  radioOn: { borderWidth: 6 },
  sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  sizeBox: { width: 45, height: 45, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  sizeBoxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeLabel: { fontFamily: fonts.body, fontSize: 12, lineHeight: 14, color: colors.text },
  sizeLabelOn: { color: colors.textInverse },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 16 },
  colorCell: { width: "25%", alignItems: "center", gap: 6 },
  colorName: { fontFamily: fonts.body, fontSize: 12, lineHeight: 15, color: colors.text, textAlign: "center" },
  modalFoot: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.secondary,
  },
})
