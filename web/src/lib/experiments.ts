import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import { cookies } from "next/headers"
import { DISTINCT_ID_COOKIE, isDistinctId } from "./attribution"
import { sdk } from "./medusa"

type RunningExperiment = { key: string; variants: { key: string; weight: number }[] }

/** Running experiments (key + weights), cached for a minute. */
async function runningExperiments(): Promise<RunningExperiment[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("experiments")
  try {
    const { experiments } = await sdk.client.fetch<{ experiments: RunningExperiment[] }>("/store/analytics/experiments")
    return experiments
  } catch {
    return []
  }
}

/** FNV-1a 32-bit; identical to backend/src/lib/analytics/assign.ts. */
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

/**
 * The visitor's variant for a running experiment, or null if it isn't running
 * (render the control). Deterministic per visitor (`_shelby_id`), so the same
 * person always sees the same variant. Reads cookies, so call it inside a
 * <Suspense> boundary, and render <Exposure experiment={key} variant={v} />
 * next to the variant so the exposure is recorded.
 */
export async function getVariant(key: string): Promise<string | null> {
  const experiment = (await runningExperiments()).find((e) => e.key === key)
  if (!experiment) return null
  const id = (await cookies()).get(DISTINCT_ID_COOKIE)?.value
  // Without an id (proxy skipped), everyone gets the control and isn't counted twice.
  if (!isDistinctId(id)) return experiment.variants[0]?.key ?? null
  return pick(key, id, experiment.variants)
}
