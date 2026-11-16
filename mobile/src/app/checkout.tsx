import type { HttpTypes } from "@medusajs/types"
import { useQueryClient } from "@tanstack/react-query"
import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { Button } from "@/components/button"
import { Screen } from "@/components/screen"
import { EmptyState } from "@/components/state-views"
import { Text } from "@/components/text"
import { ErrorBox, TextField } from "@/components/text-field"
import { Tile } from "@/components/tile"
import { colors, dur, ease, fonts, layout, motion } from "@/constants/theme"
import { useCatalog } from "@/hooks/use-products"
import { useTrackOnce } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import { errorMessage, sdk } from "@/lib/medusa"
import { lineImage, lineMeta } from "@/lib/product"
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

/**
 * Checkout (APP_SPEC v8 V8.5 §8, web E.6.5): a collapsible #F6F6F6 order
 * summary bar, then Contact, Delivery and Payment, each a titled step with
 * 44pt fields, shipping radio cards and Continue / Place Order. The
 * `checkout_started` event and the Medusa flow are unchanged.
 */
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
      <Screen header={false} under="safe">
        <EmptyState title="Your bag is empty." actionTitle="Shop the Rope Cap" onAction={() => router.replace("/products/rope-cap")} />
      </Screen>
    )
  }

  const currency = cart.currency_code
  const countryCode = cart.region?.countries?.find((c) => c.iso_2 === "us")?.iso_2 ?? cart.region?.countries?.[0]?.iso_2 ?? "us"
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
      <Screen header={false} under="safe">
        <Summary cart={cart} />
        <View style={styles.body}>
          <Section
            index={1}
            title="Contact"
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
            <Text variant="labelCaps" style={styles.subhead}>
              Shipping address
            </Text>
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
            <TextField label="Address" value={form.address_1} onChangeText={set("address_1")} autoComplete="address-line1" error={fieldErrors.address_1} />
            <TextField label="Apt, suite (optional)" value={form.address_2} onChangeText={set("address_2")} autoComplete="address-line2" />
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
            <TextField label="Phone (optional)" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" autoComplete="tel" />
            <Text variant="meta" tone="muted">
              We currently ship within the United States.
            </Text>
            <Button title="Continue" variant="secondary" onPress={saveDetails} loading={busy} />
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
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                  <View style={styles.flex}>
                    <Text style={styles.optionName}>{option.name}</Text>
                    {option.type?.description ? (
                      <Text variant="meta" tone="muted">
                        {option.type.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.amount}>{option.amount === 0 ? "Free" : formatMoney(option.amount, currency)}</Text>
                </Pressable>
              )
            })}
            <Button title="Continue" variant="secondary" onPress={() => setStep("payment")} disabled={!selectedOptionId || busy} />
          </Section>

          <Section index={3} title="Payment" active={step === "payment"} done={false}>
            <View style={styles.notice}>
              <Text style={styles.optionName}>Test payment</Text>
              <Text variant="meta" tone="muted">
                This build uses Medusa&apos;s built-in test provider: your order is recorded, and no card is charged. Card payments (e.g.
                Stripe) get switched on before launch.
              </Text>
            </View>
            <Button title={`Place Order · ${formatMoney(cart.total, currency)}`} variant="primary" onPress={placeOrder} loading={busy} />
          </Section>

          {error ? (
            <View accessibilityLiveRegion="polite">
              <ErrorBox message={error} />
            </View>
          ) : null}
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
        <Text variant="titleCard" accessibilityRole="header" style={[styles.flex, !active && !done && styles.dim]}>
          {index}. {title}
        </Text>
        {done && onEdit ? <Button title="Edit" variant="link" onPress={onEdit} /> : null}
      </View>
      {active ? <View style={styles.sectionBody}>{children}</View> : null}
      {!active && done && summary ? (
        <Text variant="meta" tone="muted" numberOfLines={2}>
          {summary}
        </Text>
      ) : null}
    </View>
  )
}

/** The #F6F6F6 summary bar: "Show order summary · $96.00", the chevron turns (M19) and the lines open below. */
function Summary({ cart }: { cart: Cart }) {
  const catalog = useCatalog()
  const [open, setOpen] = useState(false)
  const turn = useSharedValue(0)
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }))
  const currency = cart.currency_code
  const rows: [string, number | undefined][] = [
    ["Subtotal", cart.item_subtotal],
    ["Shipping", cart.shipping_methods?.length ? cart.shipping_total : undefined],
    ["Tax", cart.tax_total],
  ]
  const toggle = () => {
    const next = !open
    setOpen(next)
    turn.set(withTiming(next ? 1 : 0, { duration: dur.rotate, easing: ease.out, reduceMotion: motion.reduceMotion }))
  }
  return (
    <View style={styles.summary}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={toggle} style={styles.summaryBar}>
        <Text variant="bodyPdp" style={styles.flex}>
          {open ? "Hide" : "Show"} order summary
        </Text>
        <Animated.View style={chevron}>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </Animated.View>
        <Text style={styles.amount}>{formatMoney(cart.total, currency)}</Text>
      </Pressable>
      {open ? (
        <View style={styles.summaryBody}>
          {(cart.items ?? []).map((item) => {
            const image = lineImage(catalog.data, item)
            return (
              <View key={item.id} style={styles.summaryLine}>
                <View style={styles.summaryTile}>
                  <Tile source={image} aspectRatio={1} style={styles.whiteTile} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.optionName} numberOfLines={1}>
                    {item.product_title ?? item.title}
                  </Text>
                  <Text variant="meta" tone="muted" numberOfLines={1}>
                    {item.quantity > 1 ? `${item.quantity} × ` : ""}
                    {lineMeta(
                      catalog.data?.find((p) => p.id === item.product_id),
                      item
                    )}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatMoney(item.total, currency)}</Text>
              </View>
            )
          })}
          <View style={styles.divider} />
          {rows.map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <Text variant="meta" tone="muted">
                {label}
              </Text>
              <Text variant="meta">{value === undefined ? "—" : label === "Shipping" && value === 0 ? "Free" : formatMoney(value, currency)}</Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text variant="labelCaps">Total</Text>
            <Text style={styles.total}>{formatMoney(cart.total, currency)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: layout.edge, paddingBottom: 48 },
  row: { flexDirection: "row", gap: 12 },
  dim: { opacity: 0.5 },
  subhead: { marginTop: 8 },
  summary: { backgroundColor: colors.tile, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryBar: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: layout.edge },
  summaryBody: { paddingHorizontal: layout.edge, paddingBottom: 20, gap: 12 },
  summaryLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryTile: { width: 64 },
  whiteTile: { backgroundColor: colors.white },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  total: { fontFamily: fonts.bodyMedium, fontSize: 21.6, lineHeight: 26, color: colors.text, fontVariant: ["tabular-nums"] },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  section: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionBody: { gap: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
  },
  optionSelected: { borderColor: colors.text, backgroundColor: colors.greenFade },
  optionName: { fontFamily: fonts.bodyMedium, fontSize: 14.4, lineHeight: 19, color: colors.text },
  amount: { fontFamily: fonts.body, fontSize: 14.4, lineHeight: 19, color: colors.text, fontVariant: ["tabular-nums"] },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.fieldBorder, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.text },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.text },
  notice: { padding: 14, gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 3, backgroundColor: colors.tile },
})
