import type { HttpTypes } from "@medusajs/types"
import { useQueryClient } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { EmptyState } from "@/components/state-views"
import { Text } from "@/components/text"
import { TextField } from "@/components/text-field"
import { colors, fonts, radius } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage, sdk } from "@/lib/medusa"
import { lineImage } from "@/lib/product"
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
  useTrackOnce("checkout_started", cart?.items?.length ? cart.id : null, () => ({
    cart_id: cart?.id,
    value: cart?.total,
    currency: cart?.currency_code?.toUpperCase(),
  }))

  if (!cart || !cart.items?.length) {
    return (
      <Screen>
        <EmptyState icon="bag-outline" title="Your Bag Is Empty" actionTitle="Shop the Everyday Cap" onAction={() => router.replace("/products/everyday-cap")} />
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
            title="Contact & address"
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
            <Text variant="micro" tone="muted">
              We currently ship within the United States.
            </Text>
            <Button title="Continue to delivery" size="atc" onPress={saveDetails} loading={busy} />
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
                    <Text style={styles.optionName}>{option.name}</Text>
                    {option.type?.description ? (
                      <Text variant="micro" tone="muted">
                        {option.type.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="bodySm">{formatMoney(option.amount, currency)}</Text>
                </Pressable>
              )
            })}
            <Button
              title="Continue to payment"
              size="atc"
              onPress={() => setStep("payment")}
              disabled={!selectedOptionId || busy}
            />
          </Section>

          <Section index={3} title="Payment" active={step === "payment"} done={false}>
            <View style={styles.notice}>
              <Text style={styles.optionName}>Test payment</Text>
              <Text variant="micro" tone="muted" style={styles.noticeCopy}>
                This build uses Medusa&apos;s built-in test provider: your order is recorded, and no card is charged.
                Card payments (e.g. Stripe) get switched on before launch.
              </Text>
            </View>
            <Button
              title={`Place order · ${formatMoney(cart.total, currency)}`}
              size="checkout"
              onPress={placeOrder}
              loading={busy}
            />
          </Section>

          {error ? <Text style={styles.error}>{error}</Text> : null}
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
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.step, !(active || done) && styles.stepIdle]}>
          {index}. {title}
        </Text>
        {done && onEdit ? <Button title="Edit" variant="micro" onPress={onEdit} /> : null}
      </View>
      {active ? <View style={styles.sectionBody}>{children}</View> : null}
      {!active && done && summary ? (
        <Text variant="micro" tone="muted" numberOfLines={2}>
          {summary}
        </Text>
      ) : null}
    </View>
  )
}

function Summary({ cart }: { cart: Cart }) {
  const catalog = useCatalog()
  const currency = cart.currency_code
  const rows: [string, number | undefined][] = [
    ["Subtotal", cart.item_subtotal],
    ["Shipping", cart.shipping_methods?.length ? cart.shipping_total : undefined],
    ["Tax", cart.tax_total],
  ]
  return (
    <View style={styles.summary}>
      {(cart.items ?? []).map((item) => {
        const image = lineImage(catalog.data, item)
        return (
          <View key={item.id} style={styles.summaryLine}>
            <View>
              {image ? <Image source={image} style={styles.summaryImage} contentFit="contain" /> : <View style={styles.summaryImage} />}
              <View style={styles.qty}>
                <Text style={styles.qtyText}>{item.quantity}</Text>
              </View>
            </View>
            <View style={styles.flex}>
              <Text variant="bodySm" numberOfLines={1}>
                {item.product_title ?? item.title}
              </Text>
              {item.variant_title ? (
                <Text variant="micro" tone="muted" numberOfLines={1}>
                  {item.variant_title}
                </Text>
              ) : null}
            </View>
            <Text variant="bodySm">{formatMoney(item.total, currency)}</Text>
          </View>
        )
      })}
      <View style={styles.divider} />
      {rows.map(([label, value]) => (
        <View key={label} style={styles.summaryRow}>
          <Text variant="bodySm" tone="muted">
            {label}
          </Text>
          <Text variant="bodySm" tone="muted">
            {value === undefined ? "—" : formatMoney(value, currency)}
          </Text>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text style={styles.total}>Total</Text>
        <Text style={styles.total}>{formatMoney(cart.total, currency)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 16, gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  summary: { padding: 16, gap: 10, backgroundColor: colors.tile },
  summaryLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryImage: { width: 64, height: 64, borderRadius: radius.addon, backgroundColor: colors.secondary },
  qty: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  qtyText: { fontFamily: fonts.heading, fontSize: 11, lineHeight: 13, color: colors.textInverse },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  total: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4, color: colors.text },
  section: { paddingVertical: 16, gap: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  step: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 23.4, letterSpacing: 1.3, textTransform: "uppercase", color: colors.text },
  stepIdle: { color: colors.textMuted },
  sectionBody: { gap: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionSelected: { borderColor: colors.primary },
  optionName: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 21, color: colors.text },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.primary },
  radioOn: { borderWidth: 6 },
  notice: { padding: 14, gap: 4, borderRadius: radius.button, backgroundColor: colors.tile },
  noticeCopy: { lineHeight: 19.5 },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.error },
})
