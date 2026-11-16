import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { analyticsId, setAnalyticsContext, track } from "./analytics"
import { sdk } from "./medusa"

type RunningExperiment = { key: string; variants: { key: string; weight: number }[] }

/** FNV-1a 32-bit; identical to backend/src/lib/analytics/assign.ts and the web. */
function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

function pick(key: string, distinctId: string, variants: RunningExperiment["variants"]): string | null {
  const valid = variants.filter((v) => v.weight > 0)
  if (!valid.length) return null
  const total = valid.reduce((s, v) => s + v.weight, 0)
  const bucket = (fnv1a(`${key}:${distinctId}`) / 0x100000000) * total
  let acc = 0
  for (const v of valid) {
    acc += v.weight
    if (bucket < acc) return v.key
  }
  return valid[valid.length - 1].key
}

const seen = new Set<string>()

/**
 * The device's variant for a running experiment (null = not running: render
 * the control). Deterministic per device id, so it matches the backend's
 * assignment, and it records one `$experiment_exposure` per screen visit.
 */
export function useVariant(key: string): string | null {
  const { data } = useQuery({
    queryKey: ["experiments"],
    queryFn: async () => (await sdk.client.fetch<{ experiments: RunningExperiment[] }>("/store/analytics/experiments")).experiments,
    staleTime: 60_000,
  })
  const [id, setId] = useState(analyticsId())
  useEffect(() => {
    if (id) return
    const t = setInterval(() => {
      const next = analyticsId()
      if (next) {
        setId(next)
        clearInterval(t)
      }
    }, 100)
    return () => clearInterval(t)
  }, [id])
  const experiment = data?.find((e) => e.key === key)
  const variant = experiment && id ? pick(key, id, experiment.variants) : null
  useEffect(() => {
    if (!variant) return
    setAnalyticsContext({ [`$exp_${key}`]: variant } as never)
    const k = `${key}:${variant}`
    if (seen.has(k)) return
    seen.add(k)
    track("$experiment_exposure", { experiment: key, variant })
  }, [key, variant])
  return variant
}
