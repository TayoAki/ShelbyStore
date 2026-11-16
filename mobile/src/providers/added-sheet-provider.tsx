import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { Modal, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import { colors, fonts, radius } from "@/constants/theme"

export type AddedLine = { title: string; detail?: string | null; price?: string | null; image?: string | null }

type Ctx = { show: (line: AddedLine) => void }

const AddedSheetContext = createContext<Ctx>({ show: () => {} })

/**
 * The Added sheet (APP_SPEC §5.6): the native stand-in for Melin's slide-in
 * cart drawer. Every add to cart (PDP, quick add, bag suggestions) opens it.
 */
export function AddedSheetProvider({ children }: { children: React.ReactNode }) {
  const [line, setLine] = useState<AddedLine | null>(null)
  const insets = useSafeAreaInsets()
  const show = useCallback((next: AddedLine) => setLine(next), [])
  const value = useMemo(() => ({ show }), [show])
  const close = () => setLine(null)

  return (
    <AddedSheetContext.Provider value={value}>
      {children}
      <Modal visible={!!line} transparent animationType="slide" onRequestClose={close}>
        <Pressable accessibilityLabel="Close" style={styles.overlay} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.head}>
            <Ionicons name="checkmark-circle" size={16} color={colors.inStock} />
            <Text style={styles.headText}>Added To Your Bag</Text>
          </View>
          {line ? (
            <View style={styles.line}>
              {line.image ? <Image source={line.image} style={styles.image} contentFit="contain" /> : null}
              <View style={styles.lineText}>
                <Text style={styles.title} numberOfLines={2}>
                  {line.title}
                </Text>
                {line.detail ? <Text style={styles.detail}>{line.detail}</Text> : null}
              </View>
              {line.price ? <Text style={styles.price}>{line.price}</Text> : null}
            </View>
          ) : null}
          <View style={styles.actions}>
            <Button title="Keep shopping" variant="light" onPress={close} style={styles.flex} />
            <Button
              title="View bag"
              onPress={() => {
                close()
                router.push("/cart")
              }}
              style={styles.flex}
            />
          </View>
        </View>
      </Modal>
    </AddedSheetContext.Provider>
  )
}

export const useAddedSheet = () => useContext(AddedSheetContext)

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.secondary,
    borderTopLeftRadius: radius.addon,
    borderTopRightRadius: radius.addon,
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  headText: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, letterSpacing: 1.3, textTransform: "uppercase", color: colors.text },
  line: { flexDirection: "row", alignItems: "center", gap: 12 },
  image: { width: 72, height: 72, borderRadius: radius.addon, backgroundColor: colors.secondary },
  lineText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.subheading, fontSize: 14.08, lineHeight: 21, color: colors.text },
  detail: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.textMuted },
  price: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
  actions: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
})
