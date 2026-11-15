import { useState } from "react"
import { StyleSheet, View } from "react-native"

import { colors, spacing } from "@/constants/theme"
import { useReminderList } from "@/hooks/use-reminders"
import { errorMessage } from "@/lib/medusa"
import { getPushTokenSilently } from "@/lib/push"
import { createReminder } from "@/lib/releases"
import { useAuth } from "@/providers/auth-provider"

import { Button } from "./button"
import { Text } from "./text"
import { TextField } from "./text-field"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * "Notify me" for an upcoming drop: email (prefilled when signed in) plus an Expo push
 * token when the device can provide one. Drops are the reason customers come back,
 * so this is the main conversion point before release day.
 */
export function NotifyMe({ releaseId, compact = false }: { releaseId: string; compact?: boolean }) {
  const { customer } = useAuth()
  const reminders = useReminderList()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(customer?.email ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (reminders.has(releaseId)) {
    return (
      <View style={styles.done}>
        <Text variant="small" tone="success" style={styles.bold}>
          ✓ You're on the list
        </Text>
        <Text variant="small" tone="muted">
          We'll let you know the moment it drops.
        </Text>
      </View>
    )
  }

  if (!open) {
    return (
      <Button
        title="Notify me"
        variant="secondary"
        size={compact ? "sm" : "md"}
        onPress={() => {
          setEmail((current) => current || customer?.email || "")
          setOpen(true)
        }}
      />
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
      setOpen(false)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Email for the drop alert"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="done"
        onSubmitEditing={submit}
        error={error ?? undefined}
      />
      <View style={styles.actions}>
        <Button title="Remind me" onPress={submit} loading={submitting} size="sm" style={styles.flex} />
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => setOpen(false)} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  actions: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  flex: { flex: 1 },
  done: {
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bold: { fontWeight: "700" },
})
