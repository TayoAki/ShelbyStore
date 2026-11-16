import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"

import { Box, Digits, Face, InkText, Plate, Window, type Ink } from "@/components/box"
import { Button } from "@/components/button"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Screen } from "@/components/screen"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { TextField } from "@/components/text-field"
import { colors, CORE_COLOURWAYS } from "@/constants/theme"
import { track, trackTap } from "@/lib/analytics"
import { readAttribution } from "@/lib/attribution"
import { submitCustomQuote } from "@/lib/catalog"
import { errorMessage } from "@/lib/medusa"
import { hatImage } from "@/lib/product"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/i
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const FACTS = [
  { label: "Minimum", value: "24 caps" },
  { label: "Per color", value: "In twelves" },
  { label: "Price", value: "$40 a cap" },
  { label: "Set-up", value: "Quoted with your artwork" },
  { label: "Timing", value: "2–4 weeks after artwork approval" },
  { label: "Colors", value: "Tour White, Clubhouse Navy, Pine, Fescue" },
  { label: "Mark", value: "Your logo, embroidered above the rope" },
]

type Errors = Partial<Record<"name" | "email" | "organisation" | "quantity" | "colors" | "needed_by" | "artwork_url" | "rights", string>>

/**
 * Custom club and outing orders (APP_SPEC v7 §5.7): one box. The front face in
 * navy (window, name, terms in the meta line), the terms on a keylined plate,
 * the three steps numbered in tight figures, and the quote form that posts to
 * POST /store/custom-quotes.
 */
export default function CustomScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [organisation, setOrganisation] = useState("")
  const [quantity, setQuantity] = useState("24")
  const [colours, setColours] = useState<Record<string, number>>({ "Tour White": 12, "Clubhouse Navy": 12, Pine: 0, Fescue: 0 })
  const [neededBy, setNeededBy] = useState("")
  const [artwork, setArtwork] = useState("")
  const [notes, setNotes] = useState("")
  const [rights, setRights] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const total = Object.values(colours).reduce((a, n) => a + n, 0)
  const qty = Number(quantity)

  const validate = (): Errors => {
    const e: Errors = {}
    if (!name.trim()) e.name = "Required"
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email."
    if (!organisation.trim()) e.organisation = "Required"
    if (!Number.isInteger(qty) || qty < 24) e.quantity = "24 caps minimum."
    else if (qty % 12) e.quantity = "Order in twelves (24, 36, 48…)."
    if (total !== qty) e.colors = `Your colors add up to ${total}; make them total ${Number.isFinite(qty) ? qty : 0}.`
    if (neededBy.trim()) {
      const m = DATE_RE.exec(neededBy.trim())
      const d = m ? new Date(`${neededBy.trim()}T12:00:00Z`) : null
      if (!d || Number.isNaN(d.getTime())) e.needed_by = "Use YYYY-MM-DD."
    }
    if (artwork.trim() && !URL_RE.test(artwork.trim())) e.artwork_url = "Enter a full link (https://…)."
    if (!rights) e.rights = "Please confirm you have the right to use this artwork."
    return e
  }

  const submit = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    setError(null)
    try {
      const attribution = await readAttribution()
      const picked = Object.fromEntries(Object.entries(colours).filter(([, n]) => n > 0))
      await submitCustomQuote({
        name: name.trim(),
        email: email.trim(),
        organisation: organisation.trim(),
        quantity: qty,
        colors: picked,
        needed_by: neededBy.trim() || undefined,
        artwork_url: artwork.trim() || undefined,
        notes: notes.trim() || undefined,
        rights_confirmed: true,
        company_website: "",
        source: attribution?.asset ? { asset: attribution.asset, platform: "app" } : { platform: "app" },
      })
      trackTap("custom_submit")
      track("custom_quote_submitted", { quantity: qty, colors: Object.keys(picked).join(","), needed_by: neededBy.trim() || undefined })
      setDone(name.trim().split(/\s+/)[0])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen back>
        <View style={styles.wrap}>
          <Box>
            <Face ink={NAVY}>
              <Window source={hatImage("rope-clubhouse.jpg")} alt="Rope caps on a clubhouse bench" aspectRatio={4 / 3} contentFit="cover" />
              <View style={styles.gap8}>
                <InkText variant="model" accessibilityRole="header">
                  Club caps
                </InkText>
                <InkText variant="specLine">Custom · 24 caps minimum · $40 a cap</InkText>
              </View>
              <InkText variant="bodyLong">Your logo embroidered above the rope, for the club, the society or the outing.</InkText>
            </Face>
            <Face>
              <InkText variant="panelTitle" accessibilityRole="header">
                The terms
              </InkText>
              <Plate columns={1}>
                {FACTS.map((f) => (
                  <View key={f.label} style={styles.unit}>
                    <InkText variant="label">{f.label}</InkText>
                    <InkText variant="body">{f.value}</InkText>
                  </View>
                ))}
              </Plate>
            </Face>
            <Face>
              <InkText variant="panelTitle" accessibilityRole="header">
                How it works
              </InkText>
              {STEPS.map((step, i) => (
                <View key={step.title} style={styles.step}>
                  <Digits value={String(i + 1).padStart(2, "0")} variant="holeNumber" style={styles.stepNo} />
                  <View style={styles.flexGap}>
                    <InkText variant="cardTitle">{step.title}</InkText>
                    <InkText variant="body">{step.body}</InkText>
                  </View>
                </View>
              ))}
            </Face>
            <Face>
              {done ? (
                <View style={styles.gap8} accessibilityLiveRegion="polite">
                  <InkText variant="panelTitle" accessibilityRole="header">
                    Thanks, {done}.
                  </InkText>
                  <InkText variant="bodyLong">We&apos;ll reply within two business days.</InkText>
                </View>
              ) : (
                <>
                  <InkText variant="panelTitle" accessibilityRole="header">
                    Request a quote
                  </InkText>
                  <TextField label="Name" value={name} onChangeText={setName} autoComplete="name" error={errors.name} />
                  <TextField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email}
                  />
                  <TextField label="Club or organisation" value={organisation} onChangeText={setOrganisation} error={errors.organisation} />
                  <TextField
                    label="Quantity"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                    error={errors.quantity}
                  />
                  <View style={styles.colours}>
                    <Text variant="label">Colors, in twelves</Text>
                    {CORE_COLOURWAYS.map((c) => (
                      <View key={c} style={styles.colourRow}>
                        <Swatch name={c} size={20} />
                        <Text variant="body" style={styles.flex}>
                          {c}
                        </Text>
                        <QuantityStepper
                          label={c}
                          value={colours[c] ?? 0}
                          step={12}
                          max={9996}
                          onChange={(n) => setColours((s) => ({ ...s, [c]: n }))}
                        />
                      </View>
                    ))}
                    <Text variant="meta" tone={errors.colors ? "error" : "default"}>
                      {errors.colors ?? `Total: ${total} caps`}
                    </Text>
                  </View>
                  <TextField
                    label="Needed by (optional)"
                    value={neededBy}
                    onChangeText={setNeededBy}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    error={errors.needed_by}
                  />
                  <TextField
                    label="Artwork link (optional)"
                    value={artwork}
                    onChangeText={setArtwork}
                    autoCapitalize="none"
                    keyboardType="url"
                    placeholder="https://"
                    error={errors.artwork_url}
                  />
                  <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rights }}
                    onPress={() => setRights((r) => !r)}
                    style={styles.check}>
                    <View style={[styles.box, rights && styles.boxOn]}>
                      {rights ? <Ionicons name="checkmark" size={16} color={colors.paper} /> : null}
                    </View>
                    <Text variant="body" style={styles.flex}>
                      I have the right to use this artwork
                    </Text>
                  </Pressable>
                  {errors.rights ? (
                    <Text variant="meta" tone="error">
                      {errors.rights}
                    </Text>
                  ) : null}
                  <Button title="Request a quote" variant="ink" size="atc" onPress={submit} loading={busy} />
                  {error ? (
                    <Text variant="meta" tone="error">
                      {error}
                    </Text>
                  ) : null}
                </>
              )}
            </Face>
          </Box>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
}

const NAVY: Ink = { panel: colors.ink, ink: colors.paper, edge: colors.ink }

const STEPS = [
  { title: "Send your logo", body: "Tell us the club, the colors and the count. A link to your artwork helps." },
  { title: "Approve a proof", body: "We send a stitched proof of your mark above the rope, with the set-up quote." },
  { title: "We make and ship", body: "Two to four weeks after you approve the proof, the caps ship to you." },
]

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: 4 },
  wrap: { marginHorizontal: 12 },
  gap8: { gap: 8 },
  unit: { paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
  step: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  stepNo: { width: 44 },
  colours: { gap: 10 },
  colourRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  check: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  box: { width: 24, height: 24, borderWidth: 2, borderColor: colors.ink, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: colors.ink },
})
