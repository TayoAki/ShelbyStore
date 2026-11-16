import { listReleases } from "@/lib/data/catalog"
import { NewsletterForm } from "./newsletter-form"

/**
 * "Join The Shelby List" before every footer (Melin's "Join the family",
 * SITE_SPEC §6.0.6). Drop alerts only: it signs up for the next upcoming
 * release through the notify action. Hidden when nothing is upcoming.
 */
export async function Newsletter() {
  const next =
    (await listReleases())
      .filter((r) => r.phase === "upcoming" && r.release_at)
      .sort((a, b) => Date.parse(a.release_at!) - Date.parse(b.release_at!))[0] ?? null
  if (!next) return null
  return (
    <section className="bg-white px-4 py-[28.432px] text-center lg:px-[159.504px] lg:py-[50.512px]">
      <h2 className="mb-[10px] type-section uppercase">Join The Shelby List</h2>
      <p className="mb-8 type-body">Get an email the moment a drop goes live. Nothing else.</p>
      <NewsletterForm releaseId={next.id} releaseTitle={next.title} />
    </section>
  )
}
