import Ionicons from "@expo/vector-icons/Ionicons"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { useState } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { SegmentedControl } from "@/components/segmented-control"
import { Screen } from "@/components/screen"
import { ErrorState, LoadingState } from "@/components/state-views"
import { Text } from "@/components/text"
import { TextField } from "@/components/text-field"
import { colors, radius } from "@/constants/theme"
import { trackTap } from "@/lib/analytics"
import { openWeb } from "@/lib/links"
import { formatMoney, formatShortDate } from "@/lib/format"
import { errorMessage, sdk } from "@/lib/medusa"
import { useAuth } from "@/providers/auth-provider"

export default function AccountScreen() {
  const { customer, isLoading } = useAuth()
  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="section" accessibilityRole="header">
          Account
        </Text>
      </View>
      {isLoading ? <LoadingState /> : customer ? <SignedIn /> : <AuthForms />}
      <View style={[styles.body, { marginTop: 10 }]}>
        <View style={styles.card}>
          <Text variant="label">Help</Text>
          <AccountLink
            label="Custom orders for your club"
            onPress={() => {
              trackTap("nav_custom")
              router.push("/custom")
            }}
          />
          <AccountLink label="Fit guide" onPress={() => openWeb("/fit-guide")} />
          <AccountLink label="Shipping & returns" onPress={() => openWeb("/help/shipping-returns")} />
        </View>
      </View>
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
    <View style={styles.body}>
      <View style={styles.card}>
        <Text variant="eyebrow" tone="muted">
          Signed in
        </Text>
        <Text variant="cardTitle">
          {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email}
        </Text>
        <Text variant="body" tone="muted">
          {customer?.email}
        </Text>
      </View>

      <View style={styles.card}>
        <Text variant="label">Orders</Text>
        {orders.isLoading ? <LoadingState /> : null}
        {orders.error ? <ErrorState error={orders.error} onRetry={() => orders.refetch()} /> : null}
        {orders.data && !orders.data.length ? (
          <Text variant="body" tone="muted">
            No orders yet. When you buy something, it shows up here.
          </Text>
        ) : null}
        {orders.data?.map((order) => (
          <Pressable
            key={order.id}
            accessibilityRole="link"
            onPress={() => router.push(`/order/${order.id}`)}
            style={({ pressed }) => [styles.orderRow, pressed && { opacity: 0.8 }]}>
            <View style={styles.flex}>
              <Text variant="cardTitle">Order #{order.display_id}</Text>
              <Text variant="meta" tone="muted">
                {formatShortDate(order.created_at as unknown as string)} · {order.items?.length ?? 0} item
                {(order.items?.length ?? 0) === 1 ? "" : "s"} · {humanStatus(order.fulfillment_status)}
              </Text>
            </View>
            <Text variant="priceSm">{formatMoney(order.total, order.currency_code)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.black} />
          </Pressable>
        ))}
      </View>

      <Button title="Sign out" variant="outlineBlack" onPress={() => logout()} />
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
    <View style={styles.body}>
      <SegmentedControl
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

      <Text variant="body" tone="muted">
        {mode === "login"
          ? "Track orders and check out faster."
          : "Save your details, see your orders, and join the tee sheet faster."}
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
        {error ? <Text variant="meta" tone="error">{error}</Text> : null}
        <Button title={mode === "login" ? "Sign in" : "Create account"} size="atc" onPress={submit} loading={submitting} />
        <Button
          title={mode === "login" ? "Create account" : "Sign in"}
          variant="outlineBlack"
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
    <Pressable accessibilityRole="link" onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}>
      <Text variant="menuItem" style={styles.flex}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.black} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  body: { paddingHorizontal: 10, gap: 10 },
  card: { padding: 20, gap: 10, backgroundColor: colors.white, borderRadius: radius.xxl },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.page,
  },
  linkRow: { flexDirection: "row", alignItems: "center", height: 48, borderBottomWidth: 1, borderBottomColor: colors.page },
  flex: { flex: 1 },
  form: { gap: 16, backgroundColor: colors.white, borderRadius: radius.xxl, padding: 20 },
  row: { flexDirection: "row", gap: 12 },
})
