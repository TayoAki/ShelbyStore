import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import { sdk } from "../medusa"

export type StoreSeries = {
  id: string
  title: string
  handle: string
  stance: string | null
  proof: string | null
  audience_question: string | null
  participation_prompt: string | null
  channel: string
  /** Who the series is for, in their words: the problem the story page opens on. */
  audience: string | null
  episodes: {
    title: string
    /** The ?asset= value in the episode's tracked link. */
    asset_key: string
    subject: string | null
    post_url: string | null
    published_at: string
  }[]
}

/** Active content series (Tuan Le playbook): stance, proof, prompt, published episodes. */
export async function listSeries(): Promise<StoreSeries[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("content-series")
  try {
    const { series } = await sdk.client.fetch<{ series: StoreSeries[] }>("/store/content-series")
    return series
  } catch {
    return []
  }
}

export async function getSeries(handle: string): Promise<StoreSeries | null> {
  return (await listSeries()).find((s) => s.handle === handle) ?? null
}

/** The episode (and its series) behind a tracked-link asset key, if any. */
export async function episodeForAsset(asset: string | undefined) {
  if (!asset) return null
  for (const series of await listSeries()) {
    const episode = series.episodes.find((e) => e.asset_key === asset)
    if (episode) return { series, episode }
  }
  return null
}
