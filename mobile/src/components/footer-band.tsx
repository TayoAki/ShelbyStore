import { router } from "expo-router"
import { StyleSheet, View } from "react-native"

import { colors, type } from "@/constants/theme"
import type { Hole } from "@/hooks/use-holes"
import { trackTap } from "@/lib/analytics"
import { openWeb } from "@/lib/links"

import { Button } from "./button"
import { TeeSheet } from "./notify-me"
import { Text } from "./text"

/**
 * Eastside's black footer band (APP_SPEC v8 V8.5 §1, §10): the wordmark at 32
 * centred in #F7F7F7, the next hole's tee sheet on black (`notify_me`), the
 * help links (Custom orders records `footer_custom`) and the copyright at .5.
 */
export function FooterBand({ hole = null }: { hole?: Hole | null }) {
  return (
    <View style={styles.band}>
      <Text style={[type.wordmark, styles.wordmark]} accessibilityRole="header">
        Shelby
      </Text>
      {hole?.release ? (
        <View style={styles.tee}>
          <Text variant="bodyEastside" tone="onInk" style={styles.center}>
            Hole {hole.number}, {hole.name}: join the tee sheet and we&apos;ll email you when it goes live.
          </Text>
          <TeeSheet releaseId={hole.release.id} hole={hole.number} name={hole.name} inverse showEyebrow={false} />
        </View>
      ) : null}
      <View style={styles.links}>
        <Button
          title="Custom orders"
          variant="link"
          inverse
          onPress={() => {
            trackTap("footer_custom")
            router.push("/custom")
          }}
        />
        <Button title="Fit guide" variant="link" inverse onPress={() => openWeb("/fit-guide")} />
        <Button title="Shipping & returns" variant="link" inverse onPress={() => openWeb("/help/shipping-returns")} />
      </View>
      <Text variant="meta" tone="onInk" style={styles.copy}>
        © Shelby 2026
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  band: { backgroundColor: colors.ink, paddingTop: 48, paddingBottom: 34, paddingHorizontal: 16, alignItems: "stretch", gap: 24 },
  wordmark: { fontSize: 32, lineHeight: 36, color: colors.onInk, textAlign: "center" },
  tee: { gap: 12 },
  center: { textAlign: "center" },
  links: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 20 },
  copy: { textAlign: "center", opacity: 0.5 },
})
