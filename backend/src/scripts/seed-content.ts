import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../modules/content"
import ContentModuleService from "../modules/content/service"

const DAY = 24 * 60 * 60 * 1000

/**
 * Seeds one hypothetical content series that walks the social-content
 * playbook for The Rope Cap (web SITE_SPEC G.8 item 8): a provable stance
 * about the crown height, a borrowed format, and a four-episode pilot with
 * platform metrics read at day 3. Earlier series ("wash-test" for the tee,
 * "crush-test" for the hats) are paused if present.
 *
 * The numbers are SAMPLE DATA for the admin demo. Replace them with real
 * platform analytics before using the scorecard to make a decision.
 *
 *   npx medusa exec ./src/scripts/seed-content.ts
 */
export default async function seedContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: ContentModuleService = container.resolve(CONTENT_MODULE)

  for (const handle of ["wash-test", "crush-test"]) {
    const [old] = await service.listContentSeries({ handle })
    if (old && old.status !== "paused") {
      await service.updateContentSeries({ id: old.id, status: "paused" })
      logger.info(`Paused the earlier content series '${handle}'.`)
    }
  }

  const existing = await service.listContentSeries({ handle: "crown-test" })
  if (existing.length) {
    logger.info("Content series 'crown-test' already exists. Skipping.")
    return
  }

  const series = await service.createContentSeries({
    title: "The Crown Test",
    handle: "crown-test",
    goal: "Orders of The Rope Cap from people who found us on TikTok.",
    audience: "People whose rope caps sit like a stack on their head.",
    stance: "We measure the crown of every rope cap we sign off. Ours sits at 11–11.5 cm.",
    competitor_swap_passed: true,
    competitor_swap_notes:
      "\"Our rope caps fit great\" works for anyone. A ruler on the crown with the number on screen doesn't, so it passes.",
    proof: "A ruler on the crown of a typical tall rope cap and on ours, side by side, then both worn.",
    audience_question: "Why does every rope cap sit so tall?",
    format: "Before / after reveal",
    format_source: "Borrowed from home-renovation videos: the clue, the measurement, the reveal.",
    beat_sheet: [
      "Hook: two rope caps on a table. Ask which one sits like a stack.",
      "Clue: the ruler goes up against the tall one.",
      "Measure: both crowns, ruler in frame, numbers on screen.",
      "Reveal: both caps worn, side by side, same head.",
      "Prompt: ask viewers to show the tallest cap they own, ruler optional.",
    ],
    participation_prompt: "Show us the tallest cap you own, ruler optional.",
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
      title: "Which one sits like a stack?",
      subject: "Tour White vs a typical tall rope cap: crown height",
      views: 5100,
      avg_pct_viewed: 54,
      relevant_comments: 44,
      submissions: 12,
      production_hours: 3.5,
      audience_language: "\"rope hats always look like a chef's hat on me\"",
    },
    {
      title: "The chef's-hat check",
      subject: "Viewer question: does the crown flatten after a round?",
      views: 6900,
      avg_pct_viewed: 49,
      relevant_comments: 61,
      submissions: 18,
      production_hours: 3,
      audience_language: "\"chef's hat\" (use it in the next hook)",
    },
    {
      title: "Rope colors, side by side",
      subject: "Navy, white and cream ropes on the four core colors",
      views: 3700,
      avg_pct_viewed: 46,
      relevant_comments: 26,
      submissions: 8,
      production_hours: 4.5,
      audience_language: "\"does the white rope get dirty?\"",
    },
    {
      title: "Your tallest caps, measured",
      subject: "Viewer submissions vs The Rope Cap's 11.5 cm crown",
      views: 5600,
      avg_pct_viewed: 51,
      relevant_comments: 70,
      submissions: 26,
      production_hours: 4,
      audience_language: "\"mine is 13 cm and I never knew why it looked off\"",
    },
  ]

  for (let i = 0; i < episodes.length; i++) {
    const published = new Date(now - (16 - i * 3) * DAY)
    await service.createContentEpisodes({
      ...episodes[i],
      series_id: series.id,
      asset_key: `crown-test-${i + 1}`,
      landing_path: "/stories/crown-test",
      published_at: published,
      metrics_recorded_at: new Date(published.getTime() + 3 * DAY),
    })
  }
  await service.createContentEpisodes({
    series_id: series.id,
    title: "The sweat-line wash test",
    subject: "Next batch: the question viewers asked in episode 3",
    asset_key: "crown-test-5",
    landing_path: "/stories/crown-test",
  })

  logger.info(`Seeded content series "${series.title}" with 4 published episodes (sample metrics).`)
}
