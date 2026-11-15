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
  episodes: { title: string; subject: string | null; post_url: string | null; published_at: string }[]
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
