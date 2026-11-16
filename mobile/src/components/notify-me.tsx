import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native"

import { colors, fonts, radius, type } from "@/constants/theme"
import { useReminderList } from "@/hooks/use-reminders"
import { track } from "@/lib/analytics"
import { errorMessage } from "@/lib/medusa"
import { getPushTokenSilently } from "@/lib/push"
import { createReminder } from "@/lib/releases"
import { useAuth } from "@/providers/auth-provider"

import { Text } from "./text"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * "Notify me" for an upcoming drop (APP_SPEC §5.1 item 11, §5.9): a 39pt email
 * input joined to a black button. Sends the email, plus an Expo push token
 * when the device can provide one.
 */
export function NotifyMe({
  releaseId,
  buttonLabel = "Notify me",
  inverse = false,
}: {
  releaseId: string
  buttonLabel?: string
  inverse?: boolean
}) {
  const { customer } = useAuth()
  const reminders = useReminderList()
  const [email, setEmail] = useState(customer?.email ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (reminders.has(releaseId)) {
    return (
      <View style={styles.done}>
        <Ionicons name="checkmark-circle" size={16} color={colors.inStock} />
        <Text style={[styles.doneText, inverse && styles.inverse]}>You&apos;re on the list. We&apos;ll tell you the moment it drops.</Text>
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
      const pushToken = await getPushTokenSilently()
      await createReminder(releaseId, { email: trimmed, push_token: pushToken ?? undefined })
      await reminders.add(releaseId)
      track("notify_me_submitted", { release_id: releaseId })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel="Email for the drop alert"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={submit}
          style={[styles.input, inverse && styles.inputInverse]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          onPress={submitting ? undefined : submit}
          style={({ pressed }) => [styles.button, inverse && styles.buttonInverse, pressed && { opacity: 0.85 }]}>
          {submitting ? (
            <ActivityIndicator size="small" color={inverse ? colors.text : colors.textInverse} />
          ) : (
            <Text style={[type.button, styles.buttonLabel, inverse && { color: colors.text }]}>{buttonLabel}</Text>
          )}
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6, alignSelf: "stretch" },
  row: { flexDirection: "row" },
  input: {
    flex: 1,
    height: 39,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.primary,
    borderTopLeftRadius: radius.button,
    borderBottomLeftRadius: radius.button,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.secondary,
  },
  inputInverse: { borderColor: colors.secondary },
  button: {
    height: 39,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderTopRightRadius: radius.button,
    borderBottomRightRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInverse: { backgroundColor: colors.secondary },
  buttonLabel: { color: colors.textInverse },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.error },
  done: { flexDirection: "row", alignItems: "center", gap: 8 },
  doneText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19.5, color: colors.text, flexShrink: 1 },
  inverse: { color: colors.textInverse },
})
