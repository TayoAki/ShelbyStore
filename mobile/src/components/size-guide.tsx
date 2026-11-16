import Ionicons from "@expo/vector-icons/Ionicons"
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, fonts, radius } from "@/constants/theme"
import type { SizeChart } from "@/lib/product"

import { Text } from "./text"

/** Fallback table when a product has no metadata.size_chart (the fit-guide numbers). */
const DEFAULT_CHART: SizeChart = {
  unit: "head circumference",
  columns: ["Size", "Inches", "Centimetres"],
  rows: [
    { Size: "One size (adjustable)", Inches: "21.5–23.75", Centimetres: "55–60" },
    { Size: "S/M", Inches: "21.5–22.5", Centimetres: "55–57" },
    { Size: "L/XL", Inches: "22.75–23.75", Centimetres: "58–60" },
  ],
}

/** Size guide bottom sheet (APP_SPEC §5.4 item 6, web §6.4.17). */
export function SizeGuide({
  visible,
  onClose,
  chart,
  notes,
}: {
  visible: boolean
  onClose: () => void
  chart: SizeChart | null
  notes?: string | null
}) {
  const insets = useSafeAreaInsets()
  const table = chart ?? DEFAULT_CHART
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.head}>
          <Text style={styles.title}>Size Guide</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView>
          <View style={styles.rowHead}>
            {table.columns.map((c) => (
              <Text key={c} style={[styles.th, c === table.columns[0] && styles.firstCol]}>
                {c}
              </Text>
            ))}
          </View>
          {table.rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {table.columns.map((c) => (
                <Text key={c} style={[styles.td, c === table.columns[0] && styles.firstCol]}>
                  {String(row[c] ?? "")}
                </Text>
              ))}
            </View>
          ))}
          {table.unit ? (
            <Text variant="micro" tone="muted" style={styles.note}>
              Measured as {table.unit}.
            </Text>
          ) : null}
          {notes ? (
            <Text variant="micro" style={styles.note}>
              {notes}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: "80%",
    backgroundColor: colors.secondary,
    borderTopLeftRadius: radius.addon,
    borderTopRightRadius: radius.addon,
    padding: 24,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4, color: colors.text },
  rowHead: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  row: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  th: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.text,
  },
  td: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
  firstCol: { flex: 1.4 },
  note: { marginTop: 12, lineHeight: 19.5 },
})
