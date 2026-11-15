import { Alert, Badge, Button, Select, Table, Text, Textarea } from "@medusajs/ui"
import { useState } from "react"
import {
  AdminRelease,
  DECISION_COLOR,
  formatDate,
  formatMoney,
  ReleaseDecision,
  useRecordDecision,
  useScorecard,
} from "../../lib/releases"
import { Section, Stat } from "./section"

const PHASE_LABEL = {
  pre_launch: "Not live yet",
  collecting: "Collecting (before day 7)",
  day7_ready: "Day-7 review due · returns window open",
  returns_mature: "Returns window closed · final",
}

/** Pilot scorecard + SOP 4 step 3 decision. */
export const ScorecardSection = ({ release }: { release: AdminRelease }) => {
  const { data, isLoading } = useScorecard(release.id, !!release.published_at)
  const record = useRecordDecision(release.id)
  const [decision, setDecision] = useState<ReleaseDecision | "">(release.decision ?? "")
  const [notes, setNotes] = useState(release.decision_notes ?? "")

  if (!release.published_at) {
    return (
      <Section title="Launch scorecard" subtitle="Available once the release is live.">
        <Text size="small" className="text-ui-fg-subtle">
          Before launch: record a baseline from a recent comparable release if there is one, and agree a
          contribution floor and capacity cap.
        </Text>
      </Section>
    )
  }
  if (isLoading || !data) {
    return (
      <Section title="Launch scorecard">
        <Text size="small">Loading…</Text>
      </Section>
    )
  }

  const s = data.scorecard
  const rec = s.recommendation
  const c = s.contribution

  return (
    <Section
      title="Launch scorecard"
      subtitle={`${PHASE_LABEL[s.phase]} · Day 7: ${formatDate(s.dates.day7_review_at)} · Returns mature: ${formatDate(s.dates.returns_mature_at)}`}
    >
      <div className="flex flex-col gap-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Contribution"
            value={formatMoney(c.contribution)}
            tone={c.meets_floor === null ? "neutral" : c.meets_floor ? "good" : "bad"}
            hint={c.floor === null ? "No floor agreed" : `Floor ${formatMoney(c.floor)}`}
          />
          <Stat
            label="Sell-through"
            value={s.sell_through.rate === null ? "—" : `${Math.round(s.sell_through.rate * 100)}%`}
            hint={`${s.sell_through.net_units} of ${(s.sell_through.starting_units ?? 0) + s.sell_through.units_added} units`}
          />
          <Stat
            label="Core availability"
            value={s.core_availability.interrupted ? `${s.core_availability.out_of_stock.length} sizes out` : "In stock"}
            tone={s.core_availability.interrupted ? "bad" : "good"}
            hint={`${s.core_availability.variants_tracked} core variants tracked`}
          />
          <Stat
            label="Team hours"
            value={
              s.workload.actual_hours === null ? "—" : `${s.workload.actual_hours} / ${s.workload.capacity_hours ?? "?"} h`
            }
            tone={s.workload.within_cap === null ? "neutral" : s.workload.within_cap ? "good" : "bad"}
            hint={s.workload.actual_hours === null ? "Log actual hours" : undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Text size="small" weight="plus" className="mb-2">
              Contribution breakdown
            </Text>
            <Table>
              <Table.Body>
                {[
                  ["Net product sales", c.net_sales],
                  ["Product cost", -c.product_cost],
                  ["Variable selling cost", -c.selling_cost],
                  [`Fulfillment (${c.orders} order${c.orders === 1 ? "" : "s"})`, -c.fulfillment_cost],
                  ["Launch spend", -c.launch_spend],
                ].map(([label, value]) => (
                  <Table.Row key={label as string}>
                    <Table.Cell>{label}</Table.Cell>
                    <Table.Cell className="text-right">{formatMoney(value as number)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {c.variants_missing_cost.length > 0 && (
              <Text size="xsmall" className="text-ui-fg-error mt-2">
                {c.variants_missing_cost.length} variant(s) have no unit cost. Add metadata.unit_cost.
              </Text>
            )}
          </div>
          <div>
            <Text size="small" weight="plus" className="mb-2">
              Channel response (directional)
            </Text>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Asset</Table.HeaderCell>
                  <Table.HeaderCell>Landings</Table.HeaderCell>
                  <Table.HeaderCell>PDP sessions</Table.HeaderCell>
                  <Table.HeaderCell>Orders</Table.HeaderCell>
                  <Table.HeaderCell>Conv.</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Net sales</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {s.channel_response.map((row) => (
                  <Table.Row key={row.asset}>
                    <Table.Cell>
                      <code>{row.asset}</code>
                    </Table.Cell>
                    <Table.Cell>{row.landing_sessions ?? "—"}</Table.Cell>
                    <Table.Cell>{row.product_view_sessions ?? "—"}</Table.Cell>
                    <Table.Cell>{row.orders}</Table.Cell>
                    <Table.Cell>
                      {row.conversion_rate === null ? "—" : `${Math.round(row.conversion_rate * 100)}%`}
                    </Table.Cell>
                    <Table.Cell className="text-right">{formatMoney(row.net_sales)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {!s.channel_response.length && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                No orders yet.
              </Text>
            )}
            {s.analytics.note && (
              <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                {s.analytics.note}
              </Text>
            )}
          </div>
        </div>

        <Alert variant={rec.decision === "pause" ? "error" : rec.decision ? "info" : "warning"}>
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Recommendation:{" "}
              {rec.decision ? (
                <Badge size="2xsmall" color={DECISION_COLOR[rec.decision]}>
                  {rec.decision}
                </Badge>
              ) : (
                "not yet"
              )}
            </Text>
            {[...rec.reasons, ...rec.missing_inputs.map((m) => `• ${m}`), ...rec.notes].map((line) => (
              <Text key={line} size="small">
                {line}
              </Text>
            ))}
          </div>
        </Alert>

        <div className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Next-release decision
          </Text>
          {release.decision && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              Recorded {release.decision} by {release.decided_by ?? "unknown"} on {formatDate(release.decided_at)}.
              {rec.returns_pending ? " Revisit when returns mature." : ""}
            </Text>
          )}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr_auto]">
            <Select value={decision} onValueChange={(v) => setDecision(v as ReleaseDecision)}>
              <Select.Trigger>
                <Select.Value placeholder="Choose…" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="repeat">Repeat</Select.Item>
                <Select.Item value="simplify">Simplify / space out</Select.Item>
                <Select.Item value="pause">Pause</Select.Item>
              </Select.Content>
            </Select>
            <Textarea rows={1} placeholder="Why?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button
              size="small"
              disabled={!decision}
              isLoading={record.isPending}
              onClick={() => decision && record.mutate({ decision, notes: notes || undefined })}
            >
              Record decision
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
