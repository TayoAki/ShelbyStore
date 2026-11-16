import { Linking, Pressable, StyleSheet, View } from "react-native"

import { colors, radius } from "@/constants/theme"
import { CREDIBILITY } from "@/lib/credibility"

import { Text } from "./text"

/** Hidden while CREDIBILITY is empty (evidence rule G.1.5). No logos, quotes or counts are invented. */
export function CredibilityStrip() {
  if (!CREDIBILITY.length) return null
  return (
    <View style={styles.strip}>
      <Text variant="scoreLabel">As seen</Text>
      {CREDIBILITY.map((item) =>
        item.href ? (
          <Pressable key={item.label} accessibilityRole="link" onPress={() => Linking.openURL(item.href!)}>
            <Text variant="scoreLabel">{item.label}</Text>
          </Pressable>
        ) : (
          <Text key={item.label} variant="scoreLabel">
            {item.label}
          </Text>
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: 10,
    marginVertical: 40,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 40,
    rowGap: 16,
  },
})
