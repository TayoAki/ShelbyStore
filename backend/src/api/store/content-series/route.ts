import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Public view of active content series (the Tuan Le playbook): the stance, the
 * proof and the participation prompt, plus published episodes, so the
 * storefront can carry the same story as the social posts. Metrics, baselines,
 * owners and decisions stay admin-only.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "content_series",
    fields: [
      "id",
      "title",
      "handle",
      "stance",
      "proof",
      "audience_question",
      "participation_prompt",
      "channel",
      "status",
      "episodes.title",
      "episodes.subject",
      "episodes.post_url",
      "episodes.published_at",
    ],
    filters: { status: ["piloting", "continue", "revise"] as any },
  })

  const now = Date.now()
  const series = (data as any[]).map((s) => ({
    id: s.id,
    title: s.title,
    handle: s.handle,
    stance: s.stance ?? null,
    proof: s.proof ?? null,
    audience_question: s.audience_question ?? null,
    participation_prompt: s.participation_prompt ?? null,
    channel: s.channel,
    episodes: (s.episodes ?? [])
      .filter((e: any) => e?.published_at && new Date(e.published_at).getTime() <= now)
      .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .map((e: any) => ({
        title: e.title,
        subject: e.subject ?? null,
        post_url: e.post_url ?? null,
        published_at: e.published_at,
      })),
  }))
  res.json({ series })
}
