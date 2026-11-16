import { router } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { Text } from "@/components/text"
import { colors, radius } from "@/constants/theme"

/** Not found (APP_SPEC G.5): a value tile, no golf wordplay (G.1.3). */
export default function NotFound() {
  return (
    <Screen back>
      <View style={styles.tile}>
        <Text variant="eyebrow">404</Text>
        <Text variant="empty" style={styles.center}>
          This page wandered off.
        </Text>
        <Button title="Shop the Rope Cap" onPress={() => router.replace("/products/rope-cap")} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  tile: {
    margin: 10,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
    alignItems: "center",
  },
  center: { textAlign: "center" },
})
