import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { BottomSheet } from "@/components/sheet"
import { Text } from "@/components/text"
import { colors, radius } from "@/constants/theme"

export type AddedLine = { title: string; detail?: string | null; price?: string | null; image?: string | null }

type Ctx = { show: (line: AddedLine) => void }

const AddedSheetContext = createContext<Ctx>({ show: () => {} })

/**
 * The Added sheet (APP_SPEC v5 §5.1): Allbirds' cart drawer as a native bottom
 * sheet (M20), opened by every add to bag.
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
      <BottomSheet visible={visible} onClose={close}>
        <View style={styles.head} accessibilityLiveRegion="polite">
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.green} />
          <Text variant="label">Added to your bag</Text>
        </View>
        {line ? (
          <View style={styles.line}>
            {line.image ? <Image source={line.image} style={styles.image} contentFit="contain" /> : <View style={styles.image} />}
            <View style={styles.lineText}>
              <Text variant="cardTitle" numberOfLines={2}>
                {line.title}
              </Text>
              {line.detail ? (
                <Text variant="meta" tone="muted">
                  {line.detail}
                </Text>
              ) : null}
            </View>
            {line.price ? <Text variant="priceSm">{line.price}</Text> : null}
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button title="Keep shopping" variant="outlineBlack" onPress={close} style={styles.flex} />
          <Button
            title="View bag"
            onPress={() => {
              close()
              router.navigate("/cart")
            }}
            style={styles.flex}
          />
        </View>
      </BottomSheet>
    </AddedSheetContext.Provider>
  )
}

export const useAddedSheet = () => useContext(AddedSheetContext)

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  line: { flexDirection: "row", alignItems: "center", gap: 12 },
  image: { width: 85, height: 85, borderRadius: radius.tile, backgroundColor: colors.naturalWhite25 },
  lineText: { flex: 1, gap: 4 },
  actions: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
})
