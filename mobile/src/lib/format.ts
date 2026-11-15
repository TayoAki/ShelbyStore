const moneyFormatters = new Map<string, Intl.NumberFormat>()

/** Medusa v2 amounts are major units (32 = $32.00). */
export function formatMoney(amount: number | null | undefined, currencyCode = "usd"): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return ""
  const code = currencyCode.toUpperCase()
  let formatter = moneyFormatters.get(code)
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: code })
    moneyFormatters.set(code, formatter)
  }
  return formatter.format(Number(amount))
}

export function formatReleaseDate(iso: string | null | undefined): string {
  if (!iso) return "Date coming soon"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Date coming soon"
  const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return `${day} · ${time}`
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

export function countdownParts(targetIso: string | null | undefined, now: number): CountdownParts | null {
  if (!targetIso) return null
  const target = new Date(targetIso).getTime()
  if (Number.isNaN(target)) return null
  const diff = Math.max(0, target - now)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff === 0,
  }
}

export function formatCountdown(parts: CountdownParts): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  if (parts.days > 0) return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
}
