import { Image } from "expo-image"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"

import { BEAT, colourwayOf } from "@/constants/theme"
import { formatMoney } from "@/lib/format"
import type { StockState } from "@/lib/product"

import { confirmHaptic, Digits, Face, InkStripes, InkText, useBeatIn, usePanelInk, type Ink } from "./box"
import { Button } from "./button"
import { StockLine } from "./stock-line"

/**
 * The box's front face (APP_SPEC v7 §5.1): a die-cut window about half the
 * screen tall onto the chosen colourway, the model name, its meta line (number,
 * status and the measured spec, never a label above the heading), the ink
 * stripes that choose the colour, then the price and Add to bag printed on the
 * face. Choosing a colour re-inks the face and swaps the window photo on one beat.
 */
export function FrontFace({
  title,
  meta,
  colourways,
  colour,
  onSelect,
  images,
  ink,
  price,
  stock,
  soldOut = [],
  onAdd,
  pending = false,
  action,
  addLabel,
  children,
  onCtaLayout,
}: {
  title: string
  /** The meta line under the heading, e.g. "No. 01 · Core · Mid crown 11–11.5 cm · One size". */
  meta: string
  colourways: readonly string[]
  colour: string | null
  onSelect: (c: string) => void
  images: string[]
  ink: Ink
  price: { amount: number; currency: string } | null
  stock: { state: StockState; quantity: number | null } | null
  soldOut?: string[]
  onAdd?: () => void
  pending?: boolean
  /** Replaces the price and Add to bag (an upcoming edition's tee sheet). */
  action?: ReactNode
  addLabel?: string
  /** Printed under the stock line: shipping, the Pair, fit links. */
  children?: ReactNode
  onCtaLayout?: (y: number, h: number) => void
}) {
  const rope = colourwayOf(colour)
  const out = stock?.state === "sold_out"
  return (
    <Face ink={ink}>
      <WindowGallery images={images} colour={colour} title={title} />
      <View style={styles.heading}>
        <InkText variant="model" accessibilityRole="header">
          {title}
        </InkText>
        <InkText variant="specLine">{meta}</InkText>
      </View>
      {colourways.length > 1 ? (
        <View style={styles.colour}>
          <InkText variant="meta">
            <InkText variant="label">Color </InkText>
            {colour}
            {rope.ropeName ? `, ${rope.ropeName.toLowerCase()} rope` : ""}
          </InkText>
          <InkStripes colourways={colourways} selected={colour} onSelect={onSelect} soldOut={soldOut} />
        </View>
      ) : null}
      <View style={styles.buy} onLayout={onCtaLayout ? (e) => onCtaLayout(e.nativeEvent.layout.y, e.nativeEvent.layout.height) : undefined}>
        {action ?? (
          <View style={styles.priceRow}>
            {price ? (
              <Digits value={formatMoney(price.amount, price.currency)} label={`Price ${formatMoney(price.amount, price.currency)}`} />
            ) : null}
            <Button
              title={out ? "Sold out" : (addLabel ?? "Add to bag")}
              variant="ink"
              size="atc"
              style={styles.flex}
              disabled={out || !onAdd}
              loading={pending}
              onPress={() => {
                confirmHaptic()
                onAdd?.()
              }}
            />
          </View>
        )}
        {stock && !action ? <StockLine state={stock.state} quantity={stock.quantity} /> : null}
      </View>
      {children}
    </Face>
  )
}

/** The die-cut window: swipe through the colourway's photos; a new colour starts at photo one. */
function WindowGallery({ images, colour, title }: { images: string[]; colour: string | null; title: string }) {
  const ink = usePanelInk()
  const { height } = useWindowDimensions()
  const reduce = useReducedMotion()
  const [w, setW] = useState(0)
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState(colour)
  const list = useRef<FlatList<string>>(null)
  if (seen !== colour) {
    setSeen(colour)
    setIndex(0)
  }
  useEffect(() => {
    list.current?.scrollToOffset({ offset: 0, animated: false })
  }, [colour])
  const fade = useBeatIn(colour)
  const h = Math.round(Math.max(260, Math.min(460, height * 0.44)))
  return (
    <Animated.View style={[styles.window, { height: h, borderColor: ink.edge }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w ? (
        <Animated.View style={[styles.fill, fade]}>
          <FlatList
            ref={list}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(src, i) => `${src}-${i}`}
            onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, w)))}
            getItemLayout={(_, i) => ({ length: w, offset: w * i, index: i })}
            renderItem={({ item, index: i }) => (
              <View style={{ width: w, height: h }}>
                <Image
                  source={item}
                  style={styles.photo}
                  contentFit="contain"
                  accessibilityLabel={`${title}${colour ? ` in ${colour}` : ""}, photo ${i + 1} of ${images.length}`}
                  accessible
                  transition={reduce ? 0 : BEAT}
                />
              </View>
            )}
          />
        </Animated.View>
      ) : null}
      {images.length > 1 ? (
        <View style={styles.counter} pointerEvents="none">
          <Digits
            value={`${index + 1}/${images.length}`}
            variant="scoreNumber"
            tone="#14213D"
            label={`Photo ${index + 1} of ${images.length}`}
          />
        </View>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { flex: 1 },
  heading: { gap: 6 },
  colour: { gap: 10 },
  buy: { gap: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  window: { width: "100%", borderRadius: 28, borderWidth: 2, backgroundColor: "#FFFFFF", overflow: "hidden" },
  photo: { position: "absolute", top: "6%", left: "6%", right: "6%", bottom: "6%" },
  counter: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    paddingHorizontal: 8,
    minHeight: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#14213D",
  },
})
