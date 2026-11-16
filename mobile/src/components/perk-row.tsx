import Ionicons from "@expo/vector-icons/Ionicons"
import { StyleSheet, View } from "react-native"

import { colors, fonts } from "@/constants/theme"

import { Text } from "./text"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

/** A perk row (APP_SPEC §3): 40pt icon, title and one detail line. True lines only. */
export function PerkRow({ icon, title, detail }: { icon: IconName; title: string; detail?: string | null }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={40} color={colors.primary} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 12 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.subheading, fontSize: 14.08, lineHeight: 18.3, color: colors.text },
  detail: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.text },
})
