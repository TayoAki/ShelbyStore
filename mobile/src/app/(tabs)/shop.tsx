import Ionicons from "@expo/vector-icons/Ionicons"
import { useLocalSearchParams } from "expo-router"
import { useState, type ReactNode } from "react"
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { Accordion } from "@/components/accordion"
import { Button } from "@/components/button"
import { ColourwayCard, EditionCard, KitCard } from "@/components/product-card"
import { Screen } from "@/components/screen"
import { BottomSheet, SideSheet } from "@/components/sheet"
import { ErrorState, Skeleton } from "@/components/state-views"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { colors, CORE_COLOURWAYS, fonts, layout, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { useHoles, type Hole } from "@/hooks/use-holes"
import { useCatalog } from "@/hooks/use-products"
import { trackTap } from "@/lib/analytics"
import { POLICY } from "@/lib/policy"
import { capsIn, offersFor, productPrice, type Product } from "@/lib/product"

/** Route values stay the v7 ones so `?group=limited` deep links still land. */
type Group = "all" | "core" | "limited" | "bundles"
type Sort = "featured" | "low" | "high"

const GROUPS: { value: Group; label: string }[] = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "limited", label: "Numbered" },
  { value: "bundles", label: "Kits" },
]
const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price, low to high" },
  { value: "high", label: "Price, high to low" },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: "How does the Rope Cap fit?",
    a: `One size with a strapback: it ${POLICY.oneSize}. The crown is mid height, so it sits on the head rather than perched on top or pulled to the ears.`,
  },
  {
    q: "What is a numbered hole?",
    a: `Each hole after the first is one color released on a date of the 2027 season, in a numbered edition. ${POLICY.limitedRun} The Card lists every date.`,
  },
  {
    q: "How much is shipping?",
    a: `${POLICY.shipping}. ${POLICY.dispatch}. The Pair and the Foursome always ship free.`,
  },
  {
    q: "Can I return a cap?",
    a: `Yes: ${POLICY.returns} on unworn caps with the tags on, numbered holes included. Start a return from your order email.`,
  },
]

type Item = { key: string; colour: string | null; price: number | null; group: Group; node: ReactNode }

/**
 * Shop (APP_SPEC v8 V8.5 §2, web E.6.2): the breadcrumb and centred title, a
 * 56pt filter bar ("Show filters" opens a left sheet with Group and Color,
 * "Sort by" a bottom sheet), the two-column grid (core colours, editions,
 * holes without products, then the kits) and the collection FAQ.
 */
export default function ShopScreen() {
  const params = useLocalSearchParams<{ group?: string }>()
  const [group, setGroup] = useState<Group>((GROUPS.find((g) => g.value === params.group)?.value as Group) ?? "all")
  const [colour, setColour] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>("featured")
  const [filters, setFilters] = useState(false)
  const [sorting, setSorting] = useState(false)
  const catalog = useCatalog()
  const { holes } = useHoles()
  const { width } = useWindowDimensions()
  const cellWidth = (Math.min(width, MAX_CONTENT_WIDTH) - layout.railEdge * 2 - layout.gridGap) / 2
  const core = catalog.data?.find((p) => p.handle === "rope-cap")
  const offers = offersFor(catalog.data ?? [], "rope-cap")
    .slice()
    .sort((a, b) => capsIn(a) - capsIn(b))
  const editions = holes.filter((h) => h.number >= 2)

  const items = buildItems(core, editions, offers)
  const shown = items
    .filter((i) => group === "all" || i.group === group)
    .filter((i) => !colour || i.colour === colour)
  const sorted =
    sort === "featured" ? shown : shown.slice().sort((a, b) => ((a.price ?? 1e9) - (b.price ?? 1e9)) * (sort === "low" ? 1 : -1))
  const colours = Array.from(new Set(items.map((i) => i.colour).filter((c): c is string => !!c)))
  const pickGroup = (g: Group) => {
    trackTap("color_pill", { group: g, page_type: "collection" })
    setGroup(g)
  }

  return (
    <Screen refreshing={catalog.isRefetching} onRefresh={() => catalog.refetch()}>
      <View style={styles.head}>
        <Text variant="breadcrumb">Home / Shop</Text>
        <Text variant="titlePage" accessibilityRole="header" style={styles.title}>
          Shop
        </Text>
        <Text variant="meta" tone="muted" style={styles.center}>
          One rope cap in four core colors, a numbered color for each hole of the season, and two kits.
        </Text>
      </View>

      <View style={styles.bar}>
        <BarButton icon="options-outline" label="Show filters" onPress={() => setFilters(true)} />
        <Text variant="meta" tone="muted">
          {sorted.length} {sorted.length === 1 ? "product" : "products"}
        </Text>
        <BarButton icon="chevron-down" label="Sort by" onPress={() => setSorting(true)} iconAfter />
      </View>

      {catalog.isLoading ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={[styles.skeleton, { width: cellWidth }]} />
          ))}
        </View>
      ) : null}
      {catalog.error && !catalog.data ? <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} /> : null}

      {sorted.length ? (
        <View style={styles.grid}>
          {sorted.map((i) => (
            <View key={i.key} style={{ width: cellWidth }}>
              {i.node}
            </View>
          ))}
        </View>
      ) : catalog.data ? (
        <View style={styles.empty}>
          <Text variant="bodyPdp">Nothing matches those filters.</Text>
          <Button
            title="Clear filters"
            variant="outline"
            onPress={() => {
              setColour(null)
              setGroup("all")
            }}
          />
        </View>
      ) : null}

      <View style={styles.faq}>
        <Text variant="headingRecs" accessibilityRole="header" style={styles.faqTitle}>
          Questions
        </Text>
        {FAQ.map((f) => (
          <Accordion key={f.q} title={f.q}>
            <Text variant="bodyPdp">{f.a}</Text>
          </Accordion>
        ))}
      </View>

      <SideSheet visible={filters} onClose={() => setFilters(false)} title="Filters">
        <View style={styles.sheetBody}>
          <Text variant="labelCaps">Group</Text>
          <View style={styles.options}>
            {GROUPS.map((g) => (
              <Choice key={g.value} label={g.label} active={group === g.value} onPress={() => pickGroup(g.value)} />
            ))}
          </View>
          <Text variant="labelCaps" style={styles.sheetLabel}>
            Color
          </Text>
          <View style={styles.swatches}>
            {colours.map((c) => (
              <View key={c} style={styles.swatchCell}>
                <Swatch name={c} size={32} selected={colour === c} onPress={() => setColour(colour === c ? null : c)} />
                <Text variant="meta" numberOfLines={1} style={styles.center}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
          <Button title={`View ${sorted.length} results`} variant="secondary" onPress={() => setFilters(false)} style={styles.sheetCta} />
          {colour || group !== "all" ? (
            <Button
              title="Clear all"
              variant="link"
              onPress={() => {
                setColour(null)
                setGroup("all")
              }}
            />
          ) : null}
        </View>
      </SideSheet>

      <BottomSheet visible={sorting} onClose={() => setSorting(false)} title="Sort by">
        <View style={styles.sortList}>
          {SORTS.map((s) => (
            <Pressable
              key={s.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: sort === s.value }}
              onPress={() => {
                setSort(s.value)
                setSorting(false)
              }}
              style={({ pressed }) => [styles.sortRow, pressed && { backgroundColor: colors.bgBrighter }]}>
              <Text variant="bodyPdp" style={sort === s.value && styles.bold}>
                {s.label}
              </Text>
              {sort === s.value ? <Ionicons name="checkmark" size={18} color={colors.text} /> : null}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </Screen>
  )
}

function buildItems(core: Product | undefined, editions: Hole[], offers: Product[]): Item[] {
  const corePrice = core ? (productPrice(core)?.amount ?? null) : null
  const out: Item[] = []
  if (core) {
    for (const c of CORE_COLOURWAYS) {
      out.push({ key: c, colour: c, price: corePrice, group: "core", node: <ColourwayCard product={core} colourway={c} /> })
    }
  }
  const withProduct = editions.filter((h) => h.product)
  const without = editions.filter((h) => !h.product)
  for (const h of [...withProduct, ...without]) {
    out.push({
      key: `hole-${h.number}`,
      colour: h.colourway,
      price: h.price,
      group: "limited",
      node: <EditionCard hole={h} trackAs={h.product ? "pdp_edition_link" : "card_hole"} />,
    })
  }
  for (const o of offers) {
    out.push({
      key: o.id,
      colour: null,
      price: productPrice(o)?.amount ?? null,
      group: "bundles",
      node: <KitCard offer={o} track={{ page_type: "collection" }} />,
    })
  }
  return out
}

function BarButton({ icon, label, onPress, iconAfter = false }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void; iconAfter?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={styles.barButton}>
      {({ pressed }) => (
        <>
          {!iconAfter ? <Ionicons name={icon} size={16} color={pressed ? colors.linkPressed : colors.text} /> : null}
          <Text variant="navLabel" style={pressed && { color: colors.linkPressed }}>
            {label}
          </Text>
          {iconAfter ? <Ionicons name={icon} size={14} color={pressed ? colors.linkPressed : colors.text} /> : null}
        </>
      )}
    </Pressable>
  )
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, pressed && { backgroundColor: colors.bgBrighter }]}>
      <View style={[styles.radio, active && styles.radioOn]}>{active ? <View style={styles.radioDot} /> : null}</View>
      <Text variant="bodyPdp">{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: layout.edge, paddingTop: 16, paddingBottom: 20, gap: 10 },
  title: { textAlign: "center" },
  center: { textAlign: "center" },
  bar: {
    height: 56,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.railEdge,
    marginBottom: 16,
  },
  barButton: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: layout.railEdge, columnGap: layout.gridGap, rowGap: 24 },
  skeleton: { aspectRatio: 5 / 7 },
  empty: { paddingHorizontal: layout.edge, paddingVertical: 32, gap: 16, alignItems: "flex-start" },
  faq: { paddingHorizontal: layout.edge, paddingTop: 48, paddingBottom: 48 },
  faqTitle: { marginBottom: 8 },
  sheetBody: { padding: 20, gap: 12 },
  sheetLabel: { marginTop: 16 },
  options: { gap: 0 },
  choice: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.fieldBorder, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.text },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.text },
  swatches: { flexDirection: "row", flexWrap: "wrap", rowGap: 12 },
  swatchCell: { width: "33.33%", alignItems: "center", gap: 2 },
  sheetCta: { marginTop: 24 },
  sortList: { paddingBottom: 24 },
  sortRow: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bold: { fontFamily: fonts.bodyBold },
})
