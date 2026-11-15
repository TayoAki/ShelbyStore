import { useNow } from "@/hooks/use-now"
import { countdownParts, formatCountdown, formatReleaseDate } from "@/lib/format"

import { Text } from "./text"

/** "Drops in 2d 04h 12m" while counting; "Dropping now" once the clock passes the date. */
export function Countdown({
  releaseAt,
  prefix = "Drops in",
  tone = "accent",
  variant = "bodyStrong",
}: {
  releaseAt: string | null
  prefix?: string
  tone?: "accent" | "inverse" | "default"
  variant?: "bodyStrong" | "heading" | "small"
}) {
  const now = useNow(1000)
  const parts = countdownParts(releaseAt, now)
  if (!parts) {
    return (
      <Text variant={variant} tone={tone}>
        {formatReleaseDate(null)}
      </Text>
    )
  }
  return (
    <Text variant={variant} tone={tone} style={{ fontVariant: ["tabular-nums"] }}>
      {parts.done ? "Dropping now" : `${prefix} ${formatCountdown(parts)}`}
    </Text>
  )
}
