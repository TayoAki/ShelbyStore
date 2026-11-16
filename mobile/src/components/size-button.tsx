import { Pressable, StyleSheet, View } from "react-native"

import { colors, fonts, radius } from "@/constants/theme"

import { Text } from "./text"

/**
 * Melin's size button (APP_SPEC §3): 48pt, 1pt #E4E4E4, radius 3, UPPERCASE
 * body label. Selected is black; sold out is #EFEFEF with a diagonal strike;
 * low stock adds "N LEFT".
 */
export function SizeButton({
  label,
  selected = false,
  soldOut = false,
  left,
  onPress,
}: {
  label: string
  selected?: boolean
  soldOut?: boolean
  left?: number | null
  onPress?: () => void
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}${soldOut ? ", sold out" : left ? `, ${left} left` : ""}`}
      accessibilityState={{ selected, disabled: soldOut }}
      disabled={soldOut || !onPress}
      onPress={onPress}
      style={[styles.button, selected && styles.selected, soldOut && styles.soldOut]}>
      <Text style={[styles.label, selected && styles.labelOn, soldOut && styles.labelOut]}>{label}</Text>
      {left && !soldOut ? <Text style={[styles.left, selected && styles.labelOn]}>{left} LEFT</Text> : null}
      {soldOut ? (
        <View pointerEvents="none" style={styles.strikeWrap}>
          <View style={styles.strike} />
        </View>
      ) : null}
    </Pressable>
  )
}

/** Equal columns, 9.5pt apart. */
export function SizeRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 9.5 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  soldOut: { backgroundColor: colors.fillDisabled },
  label: { fontFamily: fonts.body, fontSize: 14.08, lineHeight: 21.12, textTransform: "uppercase", color: colors.text },
  labelOn: { color: colors.textInverse },
  labelOut: { color: colors.textDisabled },
  left: { fontFamily: fonts.body, fontSize: 11, lineHeight: 13, color: colors.text },
  strikeWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  strike: { width: "120%", height: 1, backgroundColor: colors.textDisabled, transform: [{ rotate: "-12deg" }] },
})
