import { Alert, Badge, Button, Input, Select, Text, Textarea } from "@medusajs/ui"
import { useState } from "react"
import {
  DECISION_COLOR,
  REVISION_LABEL,
  RevisionTarget,
  SeriesDecision,
  SeriesDetail,
  useRecordSeriesDecision,
} from "../../lib/content"
import { formatDate, formatMoney } from "../../lib/releases"
import { Section, Stat } from "../releases/section"

/** The two-week pilot scorecard and the continue / revise / pause decision. */
export const SeriesScorecardSection = ({ detail }: { detail: SeriesDetail }) => {
  const { series, scorecard: s, analytics } = detail
  const record = useRecordSeriesDecision(series.id)
  const rec = s.recommendation
  const [decision, setDecision] = useState<SeriesDecision | "">(series.decision ?? rec.decision ?? "")
  const [target, setTarget] = useState<RevisionTarget | "">(series.revision_target ?? rec.revision_target ?? "")
  const [nextChange, setNextChange] = useState(series.next_change ?? "")
  const [notes, setNotes] = useState(series.decision_notes ?? "")

  const tone = (good: boolean | null) => (good === null ? "neutral" : good ? "good" : "bad")

  return (
    <Section
      title="Pilot scorecard"
      subtitle={`${s.published_episodes} of ${s.target_episodes} episodes published · ${s.measured_episodes} measured${
        s.baseline_set ? " · against baseline" : " · this batch sets the baseline"
      }`}
    >
      <div className="flex flex-col gap-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Attention"
            value={s.attention.avg_pct_viewed === null ? "—" : `${s.attention.avg_pct_viewed}%`}
            tone={tone(s.attention.delta === null ? null : s.attention.delta >= 0)}
            hint={
              s.attention.baseline === null
                ? "Avg % viewed"
                : `Baseline ${s.attention.baseline}% (${s.attention.delta! >= 0 ? "+" : ""}${s.attention.delta})`
            }
          />
          <Stat
            label="Participation"
            value={s.participation.per_1k_views === null ? s.participation.total : `${s.participation.per_1k_views} / 1k`}
            hint={`${s.participation.episodes_with_participation} of ${s.published_episodes} episodes drew replies${
              s.participation.volume_ok ? "" : " · low volume, shown as a count"
            }`}
          />
          <Stat
            label="Business response"
            value={`${s.business.orders} order${s.business.orders === 1 ? "" : "s"}`}
            hint={`${formatMoney(s.business.net_sales)} · ${
              analytics === "connected" ? `${s.business.landing_sessions ?? 0} tracked sessions` : "sessions: connect Umami"
            }`}
          />
          <Stat
            label="Production effort"
            value={s.effort.hours_per_episode === null ? "—" : `${s.effort.hours_per_episode} h / ep`}
            tone={tone(s.effort.within_budget)}
            hint={s.effort.budget === null ? "No budget set" : `Budget ${s.effort.budget} h`}
          />
        </div>

        <Alert variant={rec.decision === "pause" ? "error" : rec.decision ? "info" : "warning"}>
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Recommendation:{" "}
              {rec.decision ? (
                <Badge size="2xsmall" color={DECISION_COLOR[rec.decision]}>
                  {rec.decision}
                  {rec.revision_target ? `: ${rec.revision_target.replace("_", " ")}` : ""}
                </Badge>
              ) : (
                "not yet"
              )}
            </Text>
            {[...rec.reasons, ...rec.notes].map((line) => (
              <Text key={line} size="small">
                {line}
              </Text>
            ))}
          </div>
        </Alert>

        <div className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Batch decision
          </Text>
          {series.decided_at && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              Recorded {series.decision} by {series.decided_by ?? "unknown"} on {formatDate(series.decided_at)}.
              {series.next_change ? ` Next change: ${series.next_change}` : ""}
            </Text>
          )}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Select value={decision} onValueChange={(v) => setDecision(v as SeriesDecision)}>
              <Select.Trigger>
                <Select.Value placeholder="Decision…" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="continue">Continue</Select.Item>
                <Select.Item value="revise">Revise</Select.Item>
                <Select.Item value="pause">Pause</Select.Item>
              </Select.Content>
            </Select>
            {decision === "revise" && (
              <Select value={target} onValueChange={(v) => setTarget(v as RevisionTarget)}>
                <Select.Trigger>
                  <Select.Value placeholder="What to revise…" />
                </Select.Trigger>
                <Select.Content>
                  {(Object.keys(REVISION_LABEL) as RevisionTarget[]).map((k) => (
                    <Select.Item key={k} value={k}>
                      {REVISION_LABEL[k]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
            <Input
              placeholder="The one change for the next batch"
              value={nextChange}
              onChange={(e) => setNextChange(e.target.value)}
            />
          </div>
          <Textarea rows={2} placeholder="Why?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div>
            <Button
              size="small"
              disabled={!decision || (decision === "revise" && !target) || series.status === "draft"}
              isLoading={record.isPending}
              onClick={() =>
                decision &&
                record.mutate({
                  decision,
                  revision_target: decision === "revise" ? target || null : null,
                  next_change: nextChange || null,
                  notes: notes || null,
                })
              }
            >
              Record decision
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
