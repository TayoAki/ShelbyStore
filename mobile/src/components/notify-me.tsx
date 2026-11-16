import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { ActivityIndicator, Platform, Pressable, StyleSheet, Switch, TextInput, View } from "react-native"

import { colors, fonts, golf, radius, type } from "@/constants/theme"
import { useReminderList } from "@/hooks/use-reminders"
import { track, trackTap } from "@/lib/analytics"
import { errorMessage } from "@/lib/medusa"
import { getPushTokenSilently } from "@/lib/push"
import { createReminder } from "@/lib/releases"
import { useAuth } from "@/providers/auth-provider"

import { Text } from "./text"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The tee sheet (APP_SPEC G.3): the waitlist for a hole. A pill input with a
 * white JOIN button, plus an opt-in for a push at the real release time (the
 * same moment the web goes live; no app-only drops or early access).
 */
export function TeeSheet({
  releaseId,
  hole,
  name,
  inverse = false,
  showEyebrow = true,
}: {
  releaseId: string
  hole: number
  name: string
  /** On a dark or golf-green band. */
  inverse?: boolean
  showEyebrow?: boolean
}) {
  const { customer } = useAuth()
  const reminders = useReminderList()
  const [email, setEmail] = useState(customer?.email ?? "")
  const [push, setPush] = useState(Platform.OS !== "web")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (reminders.has(releaseId)) {
    return (
      <View style={styles.done} accessibilityLiveRegion="polite">
        <Ionicons name="checkmark-circle-outline" size={16} color={inverse ? colors.white : golf.green} />
        <Text variant="meta" tone={inverse ? "inverse" : "default"} style={styles.flexShrink}>
          You&apos;re on the tee sheet for Hole {hole}. We&apos;ll email you when it goes live.
        </Text>
      </View>
    )
  }

  const submit = async () => {
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const pushToken = push ? await getPushTokenSilently() : null
      await createReminder(releaseId, { email: trimmed, push_token: pushToken ?? undefined })
      await reminders.add(releaseId)
      trackTap("notify_me", { release_id: releaseId, hole })
      track("notify_me_submitted", { release_id: releaseId, hole, push: !!pushToken })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.wrap}>
      {showEyebrow ? (
        <Text variant="eyebrow" tone={inverse ? "inverse" : "default"}>
          Join the tee sheet
        </Text>
      ) : null}
      <View style={[styles.pill, inverse && styles.pillInverse]}>
        <TextInput
          accessibilityLabel={`Email for Hole ${hole}, ${name}`}
          value={email}
          onChangeText={setEmail}
          placeholder={`Email for Hole ${hole}, ${name}`}
          placeholderTextColor={colors.gray500}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={submit}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Join"
          onPress={submitting ? undefined : submit}
          style={({ pressed }) => [styles.join, pressed && { backgroundColor: colors.black }]}>
          {({ pressed }) =>
            submitting ? (
              <ActivityIndicator size="small" color={colors.black} />
            ) : (
              <Text style={[type.button, { color: pressed ? colors.white : colors.black }]}>Join</Text>
            )
          }
        </Pressable>
      </View>
      {Platform.OS !== "web" ? (
        <View style={styles.pushRow}>
          <Ionicons name="notifications-outline" size={16} color={inverse ? colors.white : colors.black} />
          <Text variant="meta" tone={inverse ? "inverse" : "default"} style={styles.flex}>
            And send me a push at release time
          </Text>
          <Switch
            value={push}
            onValueChange={setPush}
            trackColor={{ true: inverse ? colors.white : golf.green, false: colors.naturalWhite }}
            thumbColor={push && inverse ? golf.green : colors.white}
            accessibilityLabel="Send me a push at release time"
          />
        </View>
      ) : null}
      {error ? (
        <Text variant="meta" tone={inverse ? "inverse" : "error"}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10, alignSelf: "stretch" },
  pill: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 4,
  },
  pillInverse: { borderColor: colors.white },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.black, paddingVertical: 0 },
  join: {
    height: 33,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pushRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  done: { flexDirection: "row", alignItems: "center", gap: 8 },
})
