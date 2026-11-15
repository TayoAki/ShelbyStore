import type { HttpTypes } from "@medusajs/types"
import { useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { EmptyState } from "@/components/state-views"
import { Text } from "@/components/text"
import { TextField } from "@/components/text-field"
import { colors, radius, spacing } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import { errorMessage, sdk } from "@/lib/medusa"
import { useAuth } from "@/providers/auth-provider"
import { useCart, type Cart } from "@/providers/cart-provider"

type Step = "details" | "delivery" | "payment"
type ShippingOption = HttpTypes.StoreCartShippingOption

type Form = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  phone: string
}

/** The seed's only payment provider. It records the order without charging a card. */
const TEST_PROVIDER = "pp_system_default"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ZIP_RE = /^\d{5}(-\d{4})?$/

function initialForm(cart: Cart | null, customer: HttpTypes.StoreCustomer | null): Form {
  const a = cart?.shipping_address
  return {
    email: cart?.email ?? customer?.email ?? "",
    first_name: a?.first_name ?? customer?.first_name ?? "",
    last_name: a?.last_name ?? customer?.last_name ?? "",
    address_1: a?.address_1 ?? "",
    address_2: a?.address_2 ?? "",
    city: a?.city ?? "",
    province: a?.province ?? "",
    postal_code: a?.postal_code ?? "",
    phone: a?.phone ?? customer?.phone ?? "",
  }
}

function validate(form: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {}
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email."
  if (!form.first_name.trim()) errors.first_name = "Required"
  if (!form.last_name.trim()) errors.last_name = "Required"
  if (!form.address_1.trim()) errors.address_1 = "Required"
  if (!form.city.trim()) errors.city = "Required"
  if (!form.province.trim()) errors.province = "Required"
  if (!ZIP_RE.test(form.postal_code.trim())) errors.postal_code = "Enter a 5-digit ZIP."
  return errors
}

export default function CheckoutScreen() {
  const { cart, setCart, reset } = useCart()
  const { customer } = useAuth()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("details")
  const [form, setForm] = useState<Form>(() => initialForm(cart, customer))
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!cart || !cart.items?.length) {
    return (
      <Screen>
        <EmptyState title="Your bag is empty" actionTitle="Shop the core" onAction={() => router.replace("/shop")} />
      </Screen>
    )
  }

  const currency = cart.currency_code
  const countryCode =
    cart.region?.countries?.find((c) => c.iso_2 === "us")?.iso_2 ?? cart.region?.countries?.[0]?.iso_2 ?? "us"
  const selectedOptionId = cart.shipping_methods?.[0]?.shipping_option_id
  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const saveDetails = async () => {
    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setBusy(true)
    setError(null)
    try {
      const address = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        address_1: form.address_1.trim(),
        address_2: form.address_2.trim() || undefined,
        city: form.city.trim(),
        province: form.province.trim().toUpperCase(),
        postal_code: form.postal_code.trim(),
        phone: form.phone.trim() || undefined,
        country_code: countryCode,
      }
      const { cart: updated } = await sdk.store.cart.update(cart.id, {
        email: form.email.trim(),
        shipping_address: address,
        billing_address: address,
      })
      setCart(updated)
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
      setOptions(shipping_options)
      if (!shipping_options.length) setError("We don't ship to this address yet.")
      setStep("delivery")
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const chooseOption = async (optionId: string) => {
    setBusy(true)
    setError(null)
    try {
      const { cart: updated } = await sdk.store.cart.addShippingMethod(cart.id, { option_id: optionId })
      setCart(updated)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const placeOrder = async () => {
    setBusy(true)
    setError(null)
    try {
      const { payment_providers } = await sdk.store.payment.listPaymentProviders({ region_id: cart.region_id! })
      const provider = payment_providers.find((p) => p.id === TEST_PROVIDER)
      if (!provider) {
        throw new Error(
          "This build only supports the test payment provider. Enable pp_system_default for the region, or wire up the card provider in the app."
        )
      }
      await sdk.store.payment.initiatePaymentSession(cart, { provider_id: provider.id })
      const result = await sdk.store.cart.complete(cart.id)
      if (result.type !== "order") {
        setError(result.error?.message ?? "We couldn't place your order. Please try again.")
        return
      }
      await reset()
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      router.replace(`/order/${result.order.id}`)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["bottom"]}>
        <View style={styles.body}>
          <Summary cart={cart} />

          <Section
            index={1}
            title="Contact & shipping"
            active={step === "details"}
            done={step !== "details"}
            onEdit={() => setStep("details")}
            summary={`${form.email} · ${form.address_1}, ${form.city} ${form.province} ${form.postal_code}`}>
            <TextField
              label="Email"
              value={form.email}
              onChangeText={set("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={fieldErrors.email}
            />
            <View style={styles.row}>
              <TextField
                label="First name"
                value={form.first_name}
                onChangeText={set("first_name")}
                autoComplete="given-name"
                error={fieldErrors.first_name}
                style={styles.flex}
              />
              <TextField
                label="Last name"
                value={form.last_name}
                onChangeText={set("last_name")}
                autoComplete="family-name"
                error={fieldErrors.last_name}
                style={styles.flex}
              />
            </View>
            <TextField
              label="Address"
              value={form.address_1}
              onChangeText={set("address_1")}
              autoComplete="address-line1"
              error={fieldErrors.address_1}
            />
            <TextField
              label="Apt, suite (optional)"
              value={form.address_2}
              onChangeText={set("address_2")}
              autoComplete="address-line2"
            />
            <TextField label="City" value={form.city} onChangeText={set("city")} error={fieldErrors.city} />
            <View style={styles.row}>
              <TextField
                label="State"
                value={form.province}
                onChangeText={set("province")}
                autoCapitalize="characters"
                maxLength={2}
                placeholder="CA"
                error={fieldErrors.province}
                style={styles.flex}
              />
              <TextField
                label="ZIP"
                value={form.postal_code}
                onChangeText={set("postal_code")}
                keyboardType="number-pad"
                autoComplete="postal-code"
                error={fieldErrors.postal_code}
                style={styles.flex}
              />
            </View>
            <TextField
              label="Phone (optional)"
              value={form.phone}
              onChangeText={set("phone")}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Text variant="small" tone="muted">
              We currently ship within the United States.
            </Text>
            <Button title="Continue to delivery" onPress={saveDetails} loading={busy} />
          </Section>

          <Section
            index={2}
            title="Delivery"
            active={step === "delivery"}
            done={step === "payment"}
            onEdit={() => setStep("delivery")}
            summary={cart.shipping_methods?.[0]?.name ?? ""}>
            {options.map((option) => {
              const selected = option.id === selectedOptionId
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => chooseOption(option.id)}
                  disabled={busy}
                  style={[styles.option, selected && styles.optionSelected]}>
                  <View style={[styles.radio, selected && styles.radioOn]} />
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{option.name}</Text>
                    {option.type?.description ? (
                      <Text variant="small" tone="muted">
                        {option.type.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="bodyStrong">{formatMoney(option.amount, currency)}</Text>
                </Pressable>
              )
            })}
            <Button
              title="Continue to payment"
              onPress={() => setStep("payment")}
              disabled={!selectedOptionId || busy}
            />
          </Section>

          <Section index={3} title="Payment" active={step === "payment"} done={false}>
            <View style={styles.notice}>
              <Text variant="bodyStrong">Test payment</Text>
              <Text variant="small" tone="muted">
                This build uses Medusa's built-in test provider: your order is recorded, and no card is charged. Card
                payments (e.g. Stripe) get switched on before launch.
              </Text>
            </View>
            <Button
              title={`Place order · ${formatMoney(cart.total, currency)}`}
              onPress={placeOrder}
              loading={busy}
            />
          </Section>

          {error ? <Text tone="danger">{error}</Text> : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
}

function Section({
  index,
  title,
  active,
  done,
  summary,
  onEdit,
  children,
}: {
  index: number
  title: string
  active: boolean
  done: boolean
  summary?: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <View style={[styles.section, active && styles.sectionActive]}>
      <View style={styles.sectionHeader}>
        <Text variant="heading" tone={active || done ? "default" : "muted"}>
          {index}. {title}
        </Text>
        {done && onEdit ? (
          <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={8}>
            <Text variant="small" style={styles.edit}>
              Edit
            </Text>
          </Pressable>
        ) : null}
      </View>
      {active ? <View style={styles.sectionBody}>{children}</View> : null}
      {!active && done && summary ? (
        <Text variant="small" tone="muted" numberOfLines={2}>
          {summary}
        </Text>
      ) : null}
    </View>
  )
}

function Summary({ cart }: { cart: Cart }) {
  const currency = cart.currency_code
  const rows: [string, number | undefined][] = [
    ["Subtotal", cart.item_subtotal],
    ["Shipping", cart.shipping_methods?.length ? cart.shipping_total : undefined],
    ["Tax", cart.tax_total],
  ]
  return (
    <View style={styles.summary}>
      {(cart.items ?? []).map((item) => (
        <View key={item.id} style={styles.summaryRow}>
          <Text variant="small" style={styles.flex} numberOfLines={1}>
            {item.quantity} × {item.product_title ?? item.title}
            {item.variant_title ? ` · ${item.variant_title}` : ""}
          </Text>
          <Text variant="small">{formatMoney(item.total, currency)}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      {rows.map(([label, value]) => (
        <View key={label} style={styles.summaryRow}>
          <Text variant="small" tone="muted">
            {label}
          </Text>
          <Text variant="small" tone="muted">
            {value === undefined ? "—" : formatMoney(value, currency)}
          </Text>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text variant="bodyStrong">Total</Text>
        <Text variant="bodyStrong">{formatMoney(cart.total, currency)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: spacing.xl, gap: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  summary: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs },
  section: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sectionActive: { backgroundColor: colors.surface, borderColor: colors.text },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionBody: { gap: spacing.lg },
  edit: { textDecorationLine: "underline", fontWeight: "600" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.text },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.textMuted },
  radioOn: { borderColor: colors.text, borderWidth: 6 },
  notice: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
})
