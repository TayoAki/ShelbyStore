import Ionicons from "@expo/vector-icons/Ionicons"
import { Image } from "expo-image"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native"

import { Button } from "@/components/button"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Scorecard } from "@/components/scorecard"
import { Screen } from "@/components/screen"
import { Swatch } from "@/components/swatch"
import { Text } from "@/components/text"
import { Veil } from "@/components/veil"
import { TextField } from "@/components/text-field"
import { ValueTile } from "@/components/value-tile"
import { colors, CORE_COLOURWAYS, golf, radius } from "@/constants/theme"
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
 * Custom club and outing orders (APP_SPEC G.5 Custom, web G.6.10): the facts
 * scorecard on this screen's golf-green band, how it works, and a quote form
 * that posts to POST /store/custom-quotes.
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
        <View style={styles.hero}>
          <Image source={hatImage("rope-clubhouse.jpg")} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Veil alpha={0.7} />
          <View style={styles.heroText}>
            <Text variant="heroEyebrow" tone="inverse">
              Custom
            </Text>
            <Text variant="hero" tone="inverse" accessibilityRole="header">
              Rope caps for your club or outing
            </Text>
            <Text variant="kicker" tone="inverse">
              Your logo above the rope. Twenty-four caps or more.
            </Text>
          </View>
        </View>

        <View style={styles.band}>
          <Scorecard title="Custom orders" rows={FACTS} />
        </View>

        <View style={styles.tiles}>
          <ValueTile eyebrow="01 Send your logo" body="Tell us the club, the colors and the count. A link to your artwork helps." />
          <ValueTile eyebrow="02 Approve a proof" body="We send a stitched proof of your mark above the rope, with the set-up quote." />
          <ValueTile eyebrow="03 We make and ship" body="Two to four weeks after you approve the proof, the caps ship to you." />
        </View>

        <View style={styles.form}>
          {done ? (
            <View style={styles.done} accessibilityLiveRegion="polite">
              <Ionicons name="checkmark-circle-outline" size={24} color={golf.green} />
              <Text variant="section">Thanks, {done}. We&apos;ll reply within two business days.</Text>
            </View>
          ) : (
            <>
              <Text variant="eyebrow">Request a quote</Text>
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
              <TextField label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" error={errors.quantity} />
              <View style={styles.colours}>
                <Text variant="label">Colors (in twelves)</Text>
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
                <Text variant="meta" tone={errors.colors ? "error" : "muted"}>
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
                <View style={[styles.box, rights && styles.boxOn]}>{rights ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}</View>
                <Text variant="body" style={styles.flex}>
                  I have the right to use this artwork
                </Text>
              </Pressable>
              {errors.rights ? (
                <Text variant="meta" tone="error">
                  {errors.rights}
                </Text>
              ) : null}
              <Button title="Request a quote" size="atc" onPress={submit} loading={busy} />
              {error ? (
                <Text variant="meta" tone="error">
                  {error}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { marginHorizontal: 10, aspectRatio: 0.85, borderRadius: radius.tile, overflow: "hidden", justifyContent: "flex-end" },
  heroText: { padding: 32, gap: 10 },
  band: { backgroundColor: golf.green, margin: 10, marginTop: 30, borderRadius: radius.xxxl, padding: 20 },
  tiles: { gap: 10, marginHorizontal: 10, marginTop: 20 },
  form: { margin: 10, marginTop: 30, backgroundColor: colors.white, borderRadius: radius.xxxl, padding: 24, gap: 16 },
  colours: { gap: 10 },
  colourRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  check: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: golf.green, borderColor: golf.green },
  done: { gap: 12, paddingVertical: 12 },
})
