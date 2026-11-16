import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { router } from "expo-router"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { BottomSheet } from "@/components/sheet"
import { Text } from "@/components/text"
import { colors } from "@/constants/theme"

export type AddedLine = { title: string; detail?: string | null; price?: string | null; image?: string | null }

type Ctx = { show: (line: AddedLine) => void }

const AddedSheetContext = createContext<Ctx>({ show: () => {} })

/**
 * The Added sheet (APP_SPEC v7 §5.6): the box's bottom flap, opened by every
 * add to bag. The line in a small window, then Keep shopping and View bag.
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
          <Ionicons name="checkmark" size={22} color={colors.ink} />
          <Text variant="cardHeading" accessibilityRole="header">
            Added to your bag
          </Text>
        </View>
        {line ? (
          <View style={styles.line}>
            <View style={styles.window}>{line.image ? <Image source={line.image} style={styles.image} contentFit="contain" /> : null}</View>
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
  window: {
    width: 80,
    height: 80,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  image: { position: "absolute", top: "8%", left: "8%", right: "8%", bottom: "8%" },
  lineText: { flex: 1, gap: 4 },
  actions: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
})
