import { ButtonLink } from "../ui/button"
import { Container } from "../container"

/**
 * The quiz entry on home (SITE_SPEC §12.6): for visitors who don't know which
 * shape they want yet, the quiz turns four answers into one match.
 */
export function QuizBand() {
  return (
    <section className="border-y border-line bg-paper">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:py-10">
        <div className="flex flex-col gap-1">
          <p className="text-eyebrow text-accent-ink">Fit quiz · 30 seconds</p>
          <h2 className="font-display text-[26px] leading-none lg:text-[34px]">Not sure which hat? Four questions, one match.</h2>
        </div>
        <ButtonLink href="/quiz" variant="secondary" track="home_quiz">
          Find your hat
        </ButtonLink>
      </Container>
    </section>
  )
}
