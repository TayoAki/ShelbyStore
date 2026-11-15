import { CheckCircleSolid, XCircleSolid } from "@medusajs/icons"
import { Button, Checkbox, Input, Label, Text, Textarea } from "@medusajs/ui"
import { useState } from "react"
import { SeriesDetail, toNumberOrNull, useUpdateSeries } from "../../lib/content"
import { Field, Section } from "../releases/section"

const nullable = (v: string) => (v.trim() ? v.trim() : null)

/** SOP 1: find and approve the stance. */
export const StanceSection = ({ detail }: { detail: SeriesDetail }) => {
  const { series, readiness } = detail
  const update = useUpdateSeries(series.id)
  const [f, setF] = useState({
    goal: series.goal ?? "",
    audience: series.audience ?? "",
    stance: series.stance ?? "",
    competitor_swap_passed: series.competitor_swap_passed,
    competitor_swap_notes: series.competitor_swap_notes ?? "",
    proof: series.proof ?? "",
    audience_question: series.audience_question ?? "",
  })
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  return (
    <Section
      title="Stance"
      subtitle="One defensible belief, one audience question, one thing to film."
      actions={
        <Button
          size="small"
          variant="secondary"
          isLoading={update.isPending}
          onClick={() =>
            update.mutate({
              goal: nullable(f.goal),
              audience: nullable(f.audience),
              stance: nullable(f.stance),
              competitor_swap_passed: f.competitor_swap_passed,
              competitor_swap_notes: nullable(f.competitor_swap_notes),
              proof: nullable(f.proof),
              audience_question: nullable(f.audience_question),
            })
          }
        >
          Save stance
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Business goal">
            <Input value={f.goal} onChange={(e) => set("goal")(e.target.value)} />
          </Field>
          <Field label="Audience">
            <Input value={f.audience} onChange={(e) => set("audience")(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Stance" hint="One sentence that explains what we do differently.">
              <Textarea rows={2} value={f.stance} onChange={(e) => set("stance")(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2 bg-ui-bg-subtle flex flex-col gap-y-2 rounded-lg p-4">
            <div className="flex items-center gap-x-2">
              <Checkbox
                id="swap"
                checked={f.competitor_swap_passed}
                onCheckedChange={(v) => setF((s) => ({ ...s, competitor_swap_passed: v === true }))}
              />
              <Label htmlFor="swap" size="small" weight="plus">
                Passes the competitor-swap test
              </Label>
            </div>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Swap in a competitor's name. If the sentence still works, make it more specific.
            </Text>
            <Input
              size="small"
              placeholder="What happened when you swapped the name?"
              value={f.competitor_swap_notes}
              onChange={(e) => set("competitor_swap_notes")(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Field
              label="Proof we can show on camera"
              hint="Footage, an artifact or a first-hand example. If you can't show it, narrow the stance."
            >
              <Textarea rows={2} value={f.proof} onChange={(e) => set("proof")(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Audience question" hint="A question the audience repeatedly asks.">
              <Input value={f.audience_question} onChange={(e) => set("audience_question")(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Ready to film?
          </Text>
          {readiness.checks.map((c) => (
            <div key={c.key} className="flex items-start gap-x-2">
              {c.passed ? (
                <CheckCircleSolid className="text-ui-tag-green-icon mt-0.5 shrink-0" />
              ) : (
                <XCircleSolid className="text-ui-tag-red-icon mt-0.5 shrink-0" />
              )}
              <div>
                <Text size="small">{c.label}</Text>
                {c.detail && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {c.detail}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/** SOP 2: turn the stance into a repeatable episode. Plus pilot settings. */
export const FormatSection = ({ detail }: { detail: SeriesDetail }) => {
  const { series } = detail
  const update = useUpdateSeries(series.id)
  const [f, setF] = useState({
    format: series.format ?? "",
    format_source: series.format_source ?? "",
    beats: (series.beat_sheet ?? []).join("\n"),
    participation_prompt: series.participation_prompt ?? "",
    channel: series.channel,
    owner: series.owner ?? "",
    production_hours_budget: series.production_hours_budget?.toString() ?? "",
    episode_target: String(series.episode_target),
    baseline_avg_pct_viewed: series.baseline_avg_pct_viewed?.toString() ?? "",
    baseline_participation_per_1k: series.baseline_participation_per_1k?.toString() ?? "",
    baseline_orders_per_post: series.baseline_orders_per_post?.toString() ?? "",
  })
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  const save = () =>
    update.mutate({
      format: nullable(f.format),
      format_source: nullable(f.format_source),
      beat_sheet: f.beats
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      participation_prompt: nullable(f.participation_prompt),
      channel: f.channel.trim() || "tiktok",
      owner: nullable(f.owner),
      production_hours_budget: toNumberOrNull(f.production_hours_budget),
      episode_target: Math.max(1, Math.round(toNumberOrNull(f.episode_target) ?? 4)),
      baseline_avg_pct_viewed: toNumberOrNull(f.baseline_avg_pct_viewed),
      baseline_participation_per_1k: toNumberOrNull(f.baseline_participation_per_1k),
      baseline_orders_per_post: toNumberOrNull(f.baseline_orders_per_post),
    })

  return (
    <Section
      title="Format and pilot"
      subtitle="Borrow a format the audience already understands. Keep the structure; change the job or problem each episode."
      actions={
        <Button size="small" variant="secondary" onClick={save} isLoading={update.isPending}>
          Save
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Format">
          <Input value={f.format} onChange={(e) => set("format")(e.target.value)} placeholder="Before / after reveal" />
        </Field>
        <Field label="Borrowed from">
          <Input
            value={f.format_source}
            onChange={(e) => set("format_source")(e.target.value)}
            placeholder="Home-inspection videos: clue, diagnosis, reveal"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Beat sheet (one beat per line)" hint="Watch the draft on a phone: the opening must make sense immediately.">
            <Textarea rows={5} value={f.beats} onChange={(e) => set("beats")(e.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Participation prompt" hint="End with a question the audience can answer.">
            <Input value={f.participation_prompt} onChange={(e) => set("participation_prompt")(e.target.value)} />
          </Field>
        </div>
        <Field label="Channel">
          <Input value={f.channel} onChange={(e) => set("channel")(e.target.value)} />
        </Field>
        <Field label="Owner">
          <Input value={f.owner} onChange={(e) => set("owner")(e.target.value)} />
        </Field>
        <Field label="Time budget per episode (hours)">
          <Input type="number" value={f.production_hours_budget} onChange={(e) => set("production_hours_budget")(e.target.value)} />
        </Field>
        <Field label="Episodes in the pilot batch">
          <Input type="number" value={f.episode_target} onChange={(e) => set("episode_target")(e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Text size="small" weight="plus">
            Baseline (last 4 comparable posts, same age)
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle mb-2">
            Leave empty if the channel has no history: this batch sets the baseline.
          </Text>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Avg % viewed">
              <Input type="number" value={f.baseline_avg_pct_viewed} onChange={(e) => set("baseline_avg_pct_viewed")(e.target.value)} />
            </Field>
            <Field label="Participation per 1,000 views">
              <Input type="number" value={f.baseline_participation_per_1k} onChange={(e) => set("baseline_participation_per_1k")(e.target.value)} />
            </Field>
            <Field label="Orders per post">
              <Input type="number" value={f.baseline_orders_per_post} onChange={(e) => set("baseline_orders_per_post")(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>
    </Section>
  )
}
