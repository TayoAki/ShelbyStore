/** Standard normal CDF (Abramowitz–Stegun 7.1.26 erf approximation, |error| < 1.5e-7). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2)
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-(z * z) / 2)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

/** Two-sided two-proportion z-test. Returns null when it can't be computed. */
export function twoProportionTest(control: { n: number; x: number }, variant: { n: number; x: number }) {
  if (control.n <= 0 || variant.n <= 0) return null
  const p1 = control.x / control.n
  const p2 = variant.x / variant.n
  const pooled = (control.x + variant.x) / (control.n + variant.n)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / control.n + 1 / variant.n))
  if (se === 0) return { z: 0, p_value: 1 }
  const z = (p2 - p1) / se
  return { z, p_value: Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))) }
}

export type VariantResult = {
  variant: string
  is_control: boolean
  exposures: number
  conversions: number
  conversion_rate: number | null
  /** Relative change vs control, e.g. 0.12 = +12%. */
  uplift: number | null
  p_value: number | null
  steps: number[]
}

export type ExperimentVerdict =
  | { status: "inconclusive"; reason: string }
  | { status: "no_difference"; reason: string }
  | { status: "significant"; reason: string; better: string[]; worse: string[] }

/**
 * Turns per-variant funnel counts into results and a cautious verdict:
 * below the minimum sample per variant it is always "inconclusive" — no early
 * winners. Significance is p < alpha on a two-proportion z-test against control.
 */
export function experimentResults(
  variants: string[],
  counts: Record<string, number[]>,
  opts: { minimumSample: number; alpha?: number }
): { variants: VariantResult[]; verdict: ExperimentVerdict } {
  const alpha = opts.alpha ?? 0.05
  const control = variants[0]
  const base = counts[control] ?? []
  const cN = base[0] ?? 0
  const cX = base[base.length - 1] ?? 0
  const results: VariantResult[] = variants.map((v, i) => {
    const steps = counts[v] ?? []
    const n = steps[0] ?? 0
    const x = steps[steps.length - 1] ?? 0
    const rate = n > 0 ? x / n : null
    const cRate = cN > 0 ? cX / cN : null
    const test = i === 0 ? null : twoProportionTest({ n: cN, x: cX }, { n, x })
    return {
      variant: v,
      is_control: i === 0,
      exposures: n,
      conversions: x,
      conversion_rate: rate,
      uplift: i === 0 || rate === null || !cRate ? null : rate / cRate - 1,
      p_value: test ? test.p_value : null,
      steps,
    }
  })

  const small = results.filter((r) => r.exposures < opts.minimumSample)
  if (small.length) {
    return {
      variants: results,
      verdict: {
        status: "inconclusive",
        reason: `Not enough data yet: every variant needs at least ${opts.minimumSample} exposures (${small
          .map((r) => `${r.variant}: ${r.exposures}`)
          .join(", ")}).`,
      },
    }
  }
  const sig = results.filter((r) => !r.is_control && r.p_value !== null && r.p_value < alpha)
  if (!sig.length) {
    return {
      variants: results,
      verdict: {
        status: "no_difference",
        reason: `No variant differs from ${control} at p < ${alpha}. Keep the control or test a bigger change.`,
      },
    }
  }
  return {
    variants: results,
    verdict: {
      status: "significant",
      reason: `Significant at p < ${alpha} against ${control}. Check the result holds across devices and traffic sources before shipping.`,
      better: sig.filter((r) => (r.uplift ?? 0) > 0).map((r) => r.variant),
      worse: sig.filter((r) => (r.uplift ?? 0) < 0).map((r) => r.variant),
    },
  }
}
