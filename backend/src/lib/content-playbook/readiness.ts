import { SeriesLike, present } from "./types"

export type ReadinessCheck = { key: string; label: string; passed: boolean; detail?: string }

/**
 * SOP 1 ("Find and approve the stance") and SOP 2 ("Turn the stance into an
 * episode"), done-when criteria. A series can't start its pilot until these pass.
 */
export function evaluateSeriesReadiness(s: SeriesLike) {
  const beats = (s.beat_sheet ?? []).filter(present)
  const checks: ReadinessCheck[] = [
    {
      key: "stance",
      label: "One stance the brand can back up",
      passed: present(s.stance),
      detail: present(s.stance) ? undefined : "Write one sentence that explains what you do differently.",
    },
    {
      key: "competitor_swap",
      label: "Passes the competitor-swap test",
      passed: !!s.competitor_swap_passed,
      detail: s.competitor_swap_passed
        ? undefined
        : "Swap in a competitor's name. If the sentence still works, make it more specific.",
    },
    {
      key: "proof",
      label: "Proof you can show on camera",
      passed: present(s.proof),
      detail: present(s.proof)
        ? undefined
        : "Name the footage, artifact or first-hand example. No proof, no filming.",
    },
    {
      key: "audience_question",
      label: "A real audience question",
      passed: present(s.audience_question),
      detail: present(s.audience_question) ? undefined : "Use a question the audience repeatedly asks.",
    },
    {
      key: "format",
      label: "A familiar format with a repeatable beat sheet",
      passed: present(s.format) && beats.length >= 3,
      detail:
        present(s.format) && beats.length >= 3
          ? undefined
          : "Pick a format the audience already understands and write at least 3 beats.",
    },
    {
      key: "prompt",
      label: "A prompt the audience can answer",
      passed: present(s.participation_prompt),
      detail: present(s.participation_prompt) ? undefined : "End each episode with a specific way to join in.",
    },
    {
      key: "budget",
      label: "Production time budget per episode",
      passed: typeof s.production_hours_budget === "number" && s.production_hours_budget > 0,
      detail:
        typeof s.production_hours_budget === "number" && s.production_hours_budget > 0
          ? undefined
          : "Set the hours the team can spend per episode.",
    },
  ]
  return { ready: checks.every((c) => c.passed), checks }
}
