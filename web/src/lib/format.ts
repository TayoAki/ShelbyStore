export function formatMoney(amount: number | null | undefined, currency = "usd") {
  if (amount === null || amount === undefined) return ""
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}
