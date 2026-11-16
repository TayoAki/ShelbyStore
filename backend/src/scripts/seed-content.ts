import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../modules/content"
import ContentModuleService from "../modules/content/service"

const DAY = 24 * 60 * 60 * 1000

/**
 * Seeds one hypothetical content series that walks the social-content
 * playbook: a provable stance about the core cap, a borrowed format, and a
 * four-episode pilot with platform metrics read at day 3. The apparel-era
 * series ("wash-test") is paused if present.
 *
 * The numbers are SAMPLE DATA for the admin demo. Replace them with real
 * platform analytics before using the scorecard to make a decision.
 *
 *   npx medusa exec ./src/scripts/seed-content.ts
 */
export default async function seedContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: ContentModuleService = container.resolve(CONTENT_MODULE)

  const [old] = await service.listContentSeries({ handle: "wash-test" })
  if (old && old.status !== "paused") {
    await service.updateContentSeries({ id: old.id, status: "paused" })
    logger.info("Paused the apparel-era content series 'wash-test'.")
  }

  const existing = await service.listContentSeries({ handle: "crush-test" })
  if (existing.length) {
    logger.info("Content series 'crush-test' already exists. Skipping.")
    return
  }

  const series = await service.createContentSeries({
    title: "The Crush Test",
    handle: "crush-test",
    goal: "Orders of the Everyday Cap from people who found us on TikTok.",
    audience: "People whose favourite cap went flat, lost its curve or faded after one summer.",
    stance:
      "We don't sign off a cap until it has been folded into a back pocket 100 times and still comes back to the same crown height and brim curve.",
    competitor_swap_passed: true,
    competitor_swap_notes:
      "\"Our caps are high quality and comfortable\" works for anyone. The 100-fold sign-off with a ruler on the crown doesn't, so it passes.",
    proof:
      "The fold rig: a brand-new cap next to one folded 100 times, crown height and brim curve measured with a ruler on camera.",
    audience_question: "Will this cap still look like this after a summer stuffed in my pocket?",
    format: "Before / after reveal",
    format_source: "Borrowed from home-renovation videos: the clue, the measurement, the reveal.",
    beat_sheet: [
      "Hook: hold up two caps and ask which one is new.",
      "Clue: show the fold-count tag on the old one.",
      "Measure: crown height and brim curve, both caps, ruler in frame.",
      "Reveal: both caps on, side by side. Watch how the brim still holds its curve.",
      "Prompt: ask viewers to show the most beat-up cap they still wear.",
    ],
    participation_prompt: "Show us the most beat-up cap you still wear, and how many years it's been.",
    channel: "tiktok",
    owner: "Content lead",
    production_hours_budget: 4,
    episode_target: 4,
    status: "piloting",
    // json() columns are typed as records; an array is valid JSON.
  } as any)

  const now = Date.now()
  const episodes = [
    {
      title: "Which one is new?",
      subject: "Washed black cap: crown after 100 folds",
      views: 4800,
      avg_pct_viewed: 53,
      relevant_comments: 41,
      submissions: 11,
      production_hours: 3.5,
      audience_language: "\"my caps always go flat on top\", \"duck bill\"",
    },
    {
      title: "Duck-bill check",
      subject: "Viewer question: does the brim lose its curve?",
      views: 6600,
      avg_pct_viewed: 48,
      relevant_comments: 57,
      submissions: 16,
      production_hours: 3,
      audience_language: "\"duck bill\" (use it in the next hook)",
    },
    {
      title: "Sweat line after a summer",
      subject: "Bone cap: sweatband and fade after 3 months",
      views: 3500,
      avg_pct_viewed: 45,
      relevant_comments: 24,
      submissions: 7,
      production_hours: 4.5,
      audience_language: "\"do light colours get a sweat ring?\"",
    },
    {
      title: "Your oldest caps, measured",
      subject: "Viewer submissions vs a 100-fold Everyday Cap",
      views: 5400,
      avg_pct_viewed: 50,
      relevant_comments: 66,
      submissions: 24,
      production_hours: 4,
      audience_language: "\"had this one since college\"",
    },
  ]

  for (let i = 0; i < episodes.length; i++) {
    const published = new Date(now - (16 - i * 3) * DAY)
    await service.createContentEpisodes({
      ...episodes[i],
      series_id: series.id,
      asset_key: `crush-test-${i + 1}`,
      landing_path: "/stories/crush-test",
      published_at: published,
      metrics_recorded_at: new Date(published.getTime() + 3 * DAY),
    })
  }
  await service.createContentEpisodes({
    series_id: series.id,
    title: "Sweat-ring wash test",
    subject: "Next batch: the question viewers asked in episode 3",
    asset_key: "crush-test-5",
    landing_path: "/stories/crush-test",
  })

  logger.info(`Seeded content series "${series.title}" with 4 published episodes (sample metrics).`)
}
