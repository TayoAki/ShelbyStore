import Ionicons from "@expo/vector-icons/Ionicons"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { FooterBand } from "@/components/footer-band"
import { Button } from "@/components/button"
import { SegmentedControl } from "@/components/segmented-control"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { ErrorBox, TextField } from "@/components/text-field"
import { colors, layout } from "@/constants/theme"
import { useReminderList } from "@/hooks/use-reminders"
import { trackTap } from "@/lib/analytics"
import { openWeb } from "@/lib/links"
import { formatMoney, formatShortDate } from "@/lib/format"
import { errorMessage, sdk } from "@/lib/medusa"
import { useAuth } from "@/providers/auth-provider"

/**
 * Account (APP_SPEC v8 V8.5 §10): the page title, sign-in or the signed-in
 * block with orders, then 52pt menu rows (uppercase, 1pt #F0F0F0 rules,
 * chevrons) and the black footer band. The web links open as before.
 */
export default function AccountScreen() {
  const { customer, isLoading } = useAuth()
  const reminders = useReminderList()
  return (
    <Screen>
      <View style={styles.head}>
        <Text variant="titlePage" accessibilityRole="header" style={styles.center}>
          Account
        </Text>
      </View>
      <View style={styles.body}>{isLoading ? <LoadingState /> : customer ? <SignedIn /> : <AuthForms />}</View>
      <View style={styles.menu}>
        <AccountLink
          label={`Your tee sheets${reminders.ids.length ? ` (${reminders.ids.length})` : ""}`}
          onPress={() => router.navigate("/card")}
        />
        <AccountLink label="Fit guide" onPress={() => openWeb("/fit-guide")} />
        <AccountLink label="The story" onPress={() => openWeb("/stories/crown-test")} />
        <AccountLink label="Why the Rope Cap" onPress={() => openWeb("/reasons/rope-cap")} />
        <AccountLink label="The quiz" onPress={() => openWeb("/quiz")} />
        <AccountLink label="Shipping & returns" onPress={() => openWeb("/help/shipping-returns")} />
        <AccountLink
          label="Custom orders"
          onPress={() => {
            trackTap("nav_custom")
            router.push("/custom")
          }}
        />
      </View>
      <FooterBand />
    </Screen>
  )
}

function SignedIn() {
  const { customer, logout } = useAuth()
  const orders = useQuery({
    queryKey: ["orders", customer?.id],
    queryFn: async () => {
      const { orders } = await sdk.store.order.list({
        limit: 20,
        order: "-created_at",
        fields: "id,display_id,created_at,total,currency_code,status,fulfillment_status,*items",
      })
      return orders
    },
    enabled: !!customer,
  })

  return (
    <View style={styles.block}>
      <View style={styles.gap8}>
        <Text variant="titleCard" accessibilityRole="header">
          {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Account"}
        </Text>
        <Text variant="meta" tone="muted">
          Signed in · {customer?.email}
        </Text>
      </View>

      <View>
        <Text variant="labelCaps" accessibilityRole="header" style={styles.ordersHead}>
          Orders
        </Text>
        {orders.isLoading ? <LoadingState /> : null}
        {orders.error ? <ErrorState error={orders.error} onRetry={() => orders.refetch()} /> : null}
        {orders.data && !orders.data.length ? (
          <Text variant="bodyPdp" tone="muted" style={styles.ordersEmpty}>
            No orders yet. When you buy something, it shows up here.
          </Text>
        ) : null}
        {orders.data?.map((order) => (
          <Pressable
            key={order.id}
            accessibilityRole="link"
            onPress={() => router.push(`/order/${order.id}`)}
            style={({ pressed }) => [styles.orderRow, pressed && { backgroundColor: colors.bgBrighter }]}>
            <View style={styles.flex}>
              <Text variant="menuRow">Order No. {order.display_id}</Text>
              <Text variant="meta" tone="muted">
                {formatShortDate(order.created_at as unknown as string)} · {order.items?.length ?? 0} item
                {(order.items?.length ?? 0) === 1 ? "" : "s"} · {humanStatus(order.fulfillment_status)}
              </Text>
            </View>
            <Text variant="meta">{formatMoney(order.total, order.currency_code)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </Pressable>
        ))}
      </View>

      <Button title="Sign out" variant="outline" onPress={() => logout()} />
    </View>
  )
}

function humanStatus(status?: string | null) {
  switch (status) {
    case "not_fulfilled":
      return "Preparing"
    case "partially_fulfilled":
    case "fulfilled":
      return "Packed"
    case "partially_shipped":
    case "shipped":
      return "Shipped"
    case "partially_delivered":
    case "delivered":
      return "Delivered"
    case "canceled":
      return "Canceled"
    default:
      return "Placed"
  }
}

function AuthForms() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError(null)
    if (!email.trim() || !password) {
      setError("Enter your email and password.")
      return
    }
    if (mode === "register") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Enter your first and last name.")
        return
      }
      if (password.length < 8) {
        setError("Use at least 8 characters for your password.")
        return
      }
    }
    setSubmitting(true)
    try {
      if (mode === "login") await login(email, password)
      else await register({ first_name: firstName, last_name: lastName, email, password })
    } catch (e) {
      setError(errorMessage(e, mode === "login" ? "Email or password is incorrect." : "We couldn't create your account."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.block}>
      <SegmentedControl
        scroll={false}
        options={[
          { value: "login", label: "Sign in" },
          { value: "register", label: "Create account" },
        ]}
        value={mode}
        onChange={(m) => {
          setMode(m)
          setError(null)
        }}
      />

      <Text variant="bodyPdp" tone="muted">
        {mode === "login" ? "Track orders and check out faster." : "Save your details, see your orders, and join the tee sheet faster."}
      </Text>

      <View style={styles.form}>
        {mode === "register" ? (
          <View style={styles.row}>
            <TextField
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              textContentType="givenName"
              style={styles.flex}
            />
            <TextField
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
              textContentType="familyName"
              style={styles.flex}
            />
          </View>
        ) : null}
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          textContentType={mode === "login" ? "password" : "newPassword"}
          onSubmitEditing={submit}
        />
        {error ? <ErrorBox message={error} /> : null}
        <Button title={mode === "login" ? "Sign In" : "Create Account"} variant="secondary" onPress={submit} loading={submitting} />
        <Button
          title={mode === "login" ? "Create Account" : "Sign In"}
          variant="outline"
          onPress={() => {
            setMode(mode === "login" ? "register" : "login")
            setError(null)
          }}
        />
      </View>
    </View>
  )
}

function AccountLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && { backgroundColor: colors.bgBrighter }]}>
      {({ pressed }) => (
        <>
          <Text variant="menuRow" style={[styles.flex, pressed && { color: colors.linkPressed }]}>
            {label}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text} />
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: layout.edge, paddingTop: 16, paddingBottom: 16 },
  center: { textAlign: "center" },
  body: { paddingHorizontal: layout.edge, paddingBottom: 24 },
  block: { gap: 16 },
  gap8: { gap: 4 },
  ordersHead: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  ordersEmpty: { paddingVertical: 12 },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menu: { paddingHorizontal: layout.edge, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: 0 },
  linkRow: { flexDirection: "row", alignItems: "center", minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.border },
  flex: { flex: 1 },
  form: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
})
