import * as Haptics from "expo-haptics"
import { Platform } from "react-native"

/** A light impact for swatch, segment and tab select, and on Add to bag (APP_SPEC v8 V8.4). */
export function confirmHaptic() {
  if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined)
}
