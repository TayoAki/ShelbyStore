/**
 * Deterministic experiment assignment, identical on the server (Next.js
 * `getVariant`) and here: FNV-1a 32-bit of `<experiment>:<distinct_id>`
 * mapped onto the cumulative variant weights.
 */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export function assignVariant(
  experimentKey: string,
  distinctId: string,
  variants: { key: string; weight: number }[]
): string | null {
  const valid = variants.filter((v) => v.weight > 0)
  if (!valid.length) return null
  const total = valid.reduce((s, v) => s + v.weight, 0)
  const bucket = (fnv1a(`${experimentKey}:${distinctId}`) / 0x100000000) * total
  let acc = 0
  for (const v of valid) {
    acc += v.weight
    if (bucket < acc) return v.key
  }
  return valid[valid.length - 1].key
}
