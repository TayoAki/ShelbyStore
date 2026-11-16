import { Image, type ImageSource } from "expo-image"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { useReducedMotion } from "react-native-reanimated"

import { colors } from "@/constants/theme"

import { EditionBadge } from "./edition-badge"

/**
 * Eastside's image tile (APP_SPEC v8 V8.3, web E.7.1): a square-cornered
 * #F6F6F6 tile. The cap shots are square on white, so they sit `contain` with
 * a multiply blend that takes their white ground to the tile grey (the image
 * files stay untouched); lifestyle photos fill with `cover`. Images fade in
 * over 500ms ease-in (M11), instantly under Reduce Motion. An optional badge
 * pill sits at the top-left, 5/5.
 */
export function Tile({
  source,
  alt,
  aspectRatio = 5 / 6,
  fit = "contain",
  badge,
  badgeDark = false,
  style,
  inset = 0.06,
}: {
  source: ImageSource | string | null | undefined
  alt?: string
  aspectRatio?: number
  fit?: "contain" | "cover"
  badge?: string | null
  badgeDark?: boolean
  style?: StyleProp<ViewStyle>
  /** Breathing room around a `contain` cap shot, as a fraction of the tile. */
  inset?: number
}) {
  const reduce = useReducedMotion()
  // The image sits directly on the grey tile (no wrapper view): a wrapper is its
  // own stacking context on web, and the multiply would blend with nothing.
  const pad = fit === "contain" ? (`${inset * 100}%` as const) : 0
  return (
    <View style={[styles.tile, { aspectRatio }, style]}>
      {source ? (
        <Image
          source={source}
          accessibilityLabel={alt}
          accessible={!!alt}
          contentFit={fit}
          transition={reduce ? 0 : { duration: 500, timing: "ease-in", effect: "cross-dissolve" }}
          style={[styles.image, { top: pad, left: pad, right: pad, bottom: pad }, fit === "contain" && styles.blend]}
        />
      ) : null}
      {badge ? <EditionBadge size={null} label={badge} dark={badgeDark} style={styles.badge} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  tile: { width: "100%", backgroundColor: colors.tile, overflow: "hidden" },
  image: { position: "absolute" },
  blend: { mixBlendMode: "multiply" },
  badge: { position: "absolute", top: 5, left: 5 },
})
