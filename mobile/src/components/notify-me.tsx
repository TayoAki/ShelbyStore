import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { Platform, StyleSheet, Switch, View } from "react-native"

import { colors } from "@/constants/theme"
import { useReminderList } from "@/hooks/use-reminders"
import { track, trackTap } from "@/lib/analytics"
import { errorMessage } from "@/lib/medusa"
import { getPushTokenSilently } from "@/lib/push"
import { createReminder } from "@/lib/releases"
import { useAuth } from "@/providers/auth-provider"

import { Button } from "./button"
import { ErrorBox, TextField } from "./text-field"
import { Text } from "./text"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The tee sheet (APP_SPEC G.3, v8 V8.3): the waitlist for a hole, an email
 * field and a `secondary` button stacked, the meta line under them, and an
 * opt-in for a push at the real release time (the same moment the web goes
 * live; no app-only drops). On the black footer band it prints in white.
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
        <Ionicons name="checkmark-circle-outline" size={18} color={inverse ? colors.onInk : colors.green} />
        <Text variant="meta" tone={inverse ? "onInk" : "default"} style={styles.flexShrink}>
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
        <Text variant="eyebrowSm" tone={inverse ? "onInk" : "default"}>
          Join the tee sheet
        </Text>
      ) : null}
      <TextField
        label={`Email for Hole ${hole}, ${name}`}
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="done"
        onSubmitEditing={submit}
        inverse={inverse}
      />
      <Button title="Join the tee sheet" variant={inverse ? "white" : "secondary"} loading={submitting} onPress={submit} />
      <Text variant="meta" tone={inverse ? "onInk" : "muted"}>
        One email when Hole {String(hole).padStart(2, "0")} opens. Nothing else.
      </Text>
      {Platform.OS !== "web" ? (
        <View style={styles.pushRow}>
          <Ionicons name="notifications-outline" size={16} color={inverse ? colors.onInk : colors.text} />
          <Text variant="meta" tone={inverse ? "onInk" : "default"} style={styles.flex}>
            And send me a push at release time
          </Text>
          <Switch
            value={push}
            onValueChange={setPush}
            trackColor={{ true: colors.green, false: colors.track }}
            thumbColor={colors.white}
            accessibilityLabel="Send me a push at release time"
          />
        </View>
      ) : null}
      {error ? <ErrorBox message={error} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10, alignSelf: "stretch" },
  pushRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  done: { flexDirection: "row", alignItems: "center", gap: 8 },
})
