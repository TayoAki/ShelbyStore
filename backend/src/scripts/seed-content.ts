import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../modules/content"
import ContentModuleService from "../modules/content/service"

const DAY = 24 * 60 * 60 * 1000

/**
 * Seeds one hypothetical content series that walks the social-content
 * playbook: a provable stance about the core tee, a borrowed format, and a
 * four-episode pilot with platform metrics read at day 3.
 *
 * The numbers are SAMPLE DATA for the admin demo. Replace them with real
 * platform analytics before using the scorecard to make a decision.
 *
 *   npx medusa exec ./src/scripts/seed-content.ts
 */
export default async function seedContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: ContentModuleService = container.resolve(CONTENT_MODULE)

  const existing = await service.listContentSeries({ handle: "wash-test" })
  if (existing.length) {
    logger.info("Content series 'wash-test' already exists. Skipping.")
    return
  }

  const series = await service.createContentSeries({
    title: "The 30-Wash Test",
    handle: "wash-test",
    goal: "Orders of the Everyday Tee from people who found us on TikTok.",
    audience: "People who've had a favourite tee shrink, twist or lose its collar.",
    stance:
      "We don't sign off a tee until it has been through 30 washes and still measures the same at the collar and sleeve.",
    competitor_swap_passed: true,
    competitor_swap_notes:
      "\"Our tees are soft and high quality\" works for anyone. The 30-wash sign-off with measurements doesn't, so it passes.",
    proof:
      "The wash-test rack: a brand-new tee next to one with 30 washes, collar width and sleeve length measured with a tape on camera.",
    audience_question: "Will this tee still look like this after a summer of washing?",
    format: "Before / after reveal",
    format_source: "Borrowed from home-renovation videos: the clue, the measurement, the reveal.",
    beat_sheet: [
      "Hook: hold up two tees and ask which one is new.",
      "Clue: show the wash-count tag on the old one.",
      "Measure: collar width and sleeve length, both tees, tape in frame.",
      "Reveal: side by side on a body. Watch how the sleeve still falls above the elbow.",
      "Prompt: ask viewers to show the oldest tee they still wear.",
    ],
    participation_prompt: "Show us the oldest tee you still wear, and how many years it's been.",
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
      subject: "Black tee: collar after 30 washes",
      views: 4200,
      avg_pct_viewed: 51,
      relevant_comments: 38,
      submissions: 9,
      production_hours: 3.5,
      audience_language: "\"my collars always go wavy\", \"bacon neck\"",
    },
    {
      title: "Bacon-neck check",
      subject: "Viewer question: does the collar ripple?",
      views: 6100,
      avg_pct_viewed: 47,
      relevant_comments: 52,
      submissions: 14,
      production_hours: 3,
      audience_language: "\"bacon neck\" (use it in the next hook)",
    },
    {
      title: "Sleeve fall after 30 washes",
      subject: "White tee: sleeve length and twist",
      views: 3300,
      avg_pct_viewed: 44,
      relevant_comments: 21,
      submissions: 6,
      production_hours: 4.5,
      audience_language: "\"do they twist at the side seam?\"",
    },
    {
      title: "Your oldest tees, measured",
      subject: "Viewer submissions vs a 30-wash Everyday Tee",
      views: 5200,
      avg_pct_viewed: 49,
      relevant_comments: 64,
      submissions: 22,
      production_hours: 4,
      audience_language: "\"10 years and still my favourite\"",
    },
  ]

  for (let i = 0; i < episodes.length; i++) {
    const published = new Date(now - (16 - i * 3) * DAY)
    await service.createContentEpisodes({
      ...episodes[i],
      series_id: series.id,
      asset_key: `wash-test-${i + 1}`,
      landing_path: "/stories/wash-test",
      published_at: published,
      metrics_recorded_at: new Date(published.getTime() + 3 * DAY),
    })
  }
  await service.createContentEpisodes({
    series_id: series.id,
    title: "Side-seam twist test",
    subject: "Next batch: the question viewers asked in episode 3",
    asset_key: "wash-test-5",
    landing_path: "/stories/wash-test",
  })

  logger.info(`Seeded content series "${series.title}" with 4 published episodes (sample metrics).`)
}
