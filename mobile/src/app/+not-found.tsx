import { router } from "expo-router"
import { StyleSheet } from "react-native"

import { InkText, Panel } from "@/components/box"
import { Button } from "@/components/button"
import { Screen } from "@/components/screen"

/** Not found (APP_SPEC v7 §5.8): one printed panel, no golf wordplay (G.1.3). */
export default function NotFound() {
  return (
    <Screen back>
      <Panel style={styles.wrap}>
        <InkText variant="panelTitle" accessibilityRole="header">
          This page isn&apos;t here.
        </InkText>
        <InkText variant="body">The link may be old. The cap is still where it was.</InkText>
        <Button title="Shop the Rope Cap" variant="ink" size="large" onPress={() => router.replace("/products/rope-cap")} />
      </Panel>
    </Screen>
  )
}

const styles = StyleSheet.create({ wrap: { marginHorizontal: 12 } })
