import { StyleSheet, View } from "react-native"

/**
 * A bottom-up dark veil over a photo (v5 banner veil `linear-gradient(0deg,
 * rgba(0,0,0,a), transparent)`), built from stacked strips so it renders the
 * same on iOS, Android and web. `cover` is the fraction of the height it spans.
 */
export function Veil({ alpha = 0.55, cover = 0.7, steps = 14 }: { alpha?: number; cover?: number; steps?: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]}>
      <View style={{ height: `${cover * 100}%` }}>
        {Array.from({ length: steps }, (_, i) => {
          const t = (i + 1) / steps
          return <View key={i} style={{ flex: 1, backgroundColor: `rgba(0,0,0,${(alpha * t * t).toFixed(3)})` }} />
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { justifyContent: "flex-end" } })
