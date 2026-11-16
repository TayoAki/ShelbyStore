import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { colors, fonts, MAX_CONTENT_WIDTH } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { useCart } from "@/providers/cart-provider"

import { ProductCard, ProductGrid } from "./product-card"
import { SearchPill } from "./search-pill"
import { Text } from "./text"

const ROW2 = 60

/**
 * The app header (APP_SPEC §4.1): row 1 is the `shelby` wordmark with the
 * recently-viewed eye and the bag; row 2 is the search pill. When `condensed`
 * (the screen scrolled past 121pt) row 2 folds away and row 1 becomes the
 * search pill plus the bag.
 */
export function AppHeader({
  condensed = false,
  search,
  onSearch,
}: {
  condensed?: boolean
  /** Shop passes its query to filter in place; elsewhere the pill opens Shop. */
  search?: string
  onSearch?: (text: string) => void
}) {
  const { itemCount } = useCart()
  const { handles } = useRecentlyViewed()
  const [viewedOpen, setViewedOpen] = useState(false)
  const row2 = useSharedValue(condensed ? 0 : ROW2)
  useEffect(() => {
    row2.set(withTiming(condensed ? 0 : ROW2, { duration: 300 }))
  }, [condensed, row2])
  const row2Style = useAnimatedStyle(() => ({ height: row2.get(), opacity: row2.get() / ROW2 }))

  const pill = onSearch ? (
    <SearchPill value={search} onChangeText={onSearch} style={styles.flex} />
  ) : (
    <SearchPill onPress={() => router.navigate("/shop")} style={styles.flex} />
  )

  return (
    <View style={styles.header}>
      <View style={styles.row1}>
        {condensed ? (
          pill
        ) : (
          <Pressable accessibilityRole="link" accessibilityLabel="Shelby home" onPress={() => router.navigate("/")}>
            <Text style={styles.wordmark}>shelby</Text>
          </Pressable>
        )}
        <View style={styles.icons}>
          {!condensed && handles.length > 0 ? (
            <IconButton icon="eye-outline" label="Previously viewed" count={handles.length} onPress={() => setViewedOpen(true)} />
          ) : null}
          <IconButton icon="bag-outline" label="Bag" count={itemCount} onPress={() => router.navigate("/cart")} />
        </View>
      </View>
      <Animated.View style={[styles.row2, row2Style]}>{condensed ? null : pill}</Animated.View>
      <RecentlyViewedModal visible={viewedOpen} handles={handles} onClose={() => setViewedOpen(false)} />
    </View>
  )
}

function IconButton({
  icon,
  label,
  count,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"]
  label: string
  count: number
  onPress: () => void
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}${count ? `, ${count}` : ""}`} onPress={onPress} hitSlop={8}>
      <Ionicons name={icon} size={24} color={colors.text} />
      {count > 0 ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{count > 99 ? "99" : count}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

/** "Previously Viewed" (APP_SPEC §5.8): a full-screen grid of the last 12 products. */
function RecentlyViewedModal({ visible, handles, onClose }: { visible: boolean; handles: string[]; onClose: () => void }) {
  const catalog = useCatalog()
  const { width } = useWindowDimensions()
  const cardWidth = (Math.min(width, MAX_CONTENT_WIDTH) - 48) / 2
  const products = handles
    .map((h) => catalog.data?.find((p) => p.handle === h))
    .filter((p): p is NonNullable<typeof p> => !!p)
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={["top", "bottom"]}>
        <View style={styles.modalHead}>
          <View>
            <Text style={styles.modalTitle}>Previously Viewed</Text>
            <Text variant="micro" tone="muted">
              {products.length} Products
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalBody}>
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} width={cardWidth} carousel={false} onOpen={onClose} />
            ))}
          </ProductGrid>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.secondary, borderBottomWidth: 1, borderBottomColor: colors.lineHeader },
  row1: { height: 61, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  wordmark: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: colors.text },
  icons: { flexDirection: "row", alignItems: "center", gap: 16 },
  row2: { paddingHorizontal: 16, justifyContent: "center", overflow: "hidden" },
  flex: { flex: 1 },
  count: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { fontFamily: fonts.heading, fontSize: 10, lineHeight: 12, color: colors.textInverse },
  modal: { flex: 1, backgroundColor: colors.secondary },
  modalHead: {
    height: 75,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalTitle: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24, color: colors.text },
  modalBody: { paddingVertical: 16 },
})
