import { router } from "expo-router"
import { StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { Text } from "@/components/text"
import { layout } from "@/constants/theme"

/** Not found (APP_SPEC v8 V8.5 §10): the Monomakh line, one sentence and the way back. */
export default function NotFound() {
  return (
    <Screen back>
      <View style={styles.wrap}>
        <Text variant="displayXl" accessibilityRole="header">
          Out of bounds.
        </Text>
        <Text variant="bodyPdp">That page isn&apos;t here. The link may be old; the cap is still where it was.</Text>
        <Button title="Shop the Rope Cap" variant="primary" onPress={() => router.replace("/products/rope-cap")} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({ wrap: { paddingHorizontal: layout.edge, paddingVertical: 48, gap: 16 } })
