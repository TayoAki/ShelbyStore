import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { colors, fonts } from "@/constants/theme"
import { POLICY } from "@/lib/policy"

/**
 * The black announcement bar (APP_SPEC §3), Home only: the true policy lines,
 * plus "[Drop] Is Live Now" while a drop is live, crossfading every 5s.
 */
export function AnnouncementBar({ liveDrop }: { liveDrop?: string | null }) {
  const messages = [POLICY.shippingShort, POLICY.returnsShort, ...(liveDrop ? [`${liveDrop} Is Live Now`] : [])]
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => n + 1), 5000)
    return () => clearInterval(id)
  }, [])
  const message = messages[i % messages.length]
  return (
    <View style={styles.bar} accessibilityRole="text" accessibilityLabel={messages.join(". ")}>
      <Animated.Text key={message} entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.text}>
        {message}
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { height: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: fonts.system, fontSize: 13, lineHeight: 16, color: colors.textInverse, position: "absolute" },
})
