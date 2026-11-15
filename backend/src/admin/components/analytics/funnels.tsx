import { Trash } from "@medusajs/icons"
import { Button, Container, Heading, IconButton, Input, Select, Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { duration, FunnelStep, num, pct, useFunnel, useSchema } from "../../lib/analytics"
import { HBar } from "./charts"

const OPS = [
  ["eq", "equals"],
  ["neq", "is not"],
  ["contains", "contains"],
  ["is_set", "is set"],
  ["is_not_set", "is not set"],
] as const

export function FunnelsTab() {
  const { data: schema } = useSchema()
  const run = useFunnel()
  const [steps, setSteps] = useState<FunnelStep[]>([])
  const [days, setDays] = useState(30)
  const [windowDays, setWindowDays] = useState(7)
  const [breakdown, setBreakdown] = useState<string>("none")

  useEffect(() => {
    if (!steps.length && schema?.presets[0]) setSteps(schema.presets[0].steps)
  }, [schema, steps.length])

  const submit = () =>
    run.mutate({
      steps,
      from: new Date(Date.now() - days * 86400000).toISOString(),
      window_days: windowDays,
      breakdown: breakdown === "none" ? null : breakdown,
    })

  const setStep = (i: number, patch: Partial<FunnelStep>) =>
    setSteps((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const events = schema?.events.map((e) => e.name) ?? []
  const result = run.data?.funnel

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-col gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Heading level="h2">Funnel</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              People who did each step in order, within the conversion window of their first step.
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {schema?.presets.map((p) => (
              <Button key={p.key} size="small" variant="secondary" onClick={() => setSteps(p.steps)}>
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {steps.map((step, i) => {
            const filter = step.filters?.[0]
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Text size="small" className="text-ui-fg-subtle w-6">
                  {i + 1}.
                </Text>
                <Select value={step.event} onValueChange={(v) => setStep(i, { event: v, label: undefined })} size="small">
                  <Select.Trigger className="w-56">
                    <Select.Value placeholder="Event" />
                  </Select.Trigger>
                  <Select.Content>
                    {[...new Set([step.event, ...events])].filter(Boolean).map((e) => (
                      <Select.Item key={e} value={e}>
                        {e}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Input
                  size="small"
                  className="w-36"
                  placeholder="property (optional)"
                  value={filter?.key ?? ""}
                  onChange={(e) =>
                    setStep(i, {
                      label: undefined,
                      filters: e.target.value ? [{ key: e.target.value, op: filter?.op ?? "eq", value: filter?.value }] : [],
                    })
                  }
                />
                {filter && (
                  <>
                    <Select
                      size="small"
                      value={filter.op}
                      onValueChange={(v) => setStep(i, { label: undefined, filters: [{ ...filter, op: v as any }] })}
                    >
                      <Select.Trigger className="w-32">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {OPS.map(([k, l]) => (
                          <Select.Item key={k} value={k}>
                            {l}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    {filter.op !== "is_set" && filter.op !== "is_not_set" && (
                      <Input
                        size="small"
                        className="w-36"
                        placeholder="value"
                        value={filter.value ?? ""}
                        onChange={(e) => setStep(i, { label: undefined, filters: [{ ...filter, value: e.target.value }] })}
                      />
                    )}
                  </>
                )}
                {steps.length > 2 && (
                  <IconButton size="small" variant="transparent" onClick={() => setSteps((s) => s.filter((_, j) => j !== i))}>
                    <Trash />
                  </IconButton>
                )}
              </div>
            )
          })}
          {steps.length < 8 && (
            <div>
              <Button size="small" variant="transparent" onClick={() => setSteps((s) => [...s, { event: events[0] ?? "$pageview" }])}>
                + Add step
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Text size="xsmall" className="text-ui-fg-subtle">
              First step in
            </Text>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))} size="small">
              <Select.Trigger className="w-36">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {[7, 14, 30, 90].map((d) => (
                  <Select.Item key={d} value={String(d)}>
                    Last {d} days
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Text size="xsmall" className="text-ui-fg-subtle">
              Conversion window
            </Text>
            <Select value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v))} size="small">
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {[
                  [1 / 24, "1 hour"],
                  [1, "1 day"],
                  [7, "7 days"],
                  [14, "14 days"],
                  [30, "30 days"],
                ].map(([v, l]) => (
                  <Select.Item key={String(v)} value={String(v)}>
                    {l}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Text size="xsmall" className="text-ui-fg-subtle">
              Breakdown
            </Text>
            <Select value={breakdown} onValueChange={setBreakdown} size="small">
              <Select.Trigger className="w-44">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">None</Select.Item>
                {(schema?.breakdowns ?? []).map((b) => (
                  <Select.Item key={b} value={b}>
                    {b}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button size="small" onClick={submit} isLoading={run.isPending} disabled={steps.length < 2}>
            Calculate
          </Button>
        </div>
      </Container>

      {result && (
        <Container className="flex flex-col gap-4 px-6 py-4">
          <div className="flex items-baseline justify-between">
            <Heading level="h2">Result</Heading>
            <Text size="small">
              Overall conversion <strong>{pct(result.overall_conversion)}</strong>
            </Text>
          </div>
          {result.steps.map((s) => (
            <HBar
              key={s.index}
              value={s.count}
              max={result.steps[0]?.count ?? 0}
              label={`${s.index}. ${s.label}`}
              right={`${num(s.count)} · ${s.index === 1 ? "100%" : `${pct(s.conversion_from_previous)} of previous`}${
                s.median_seconds_from_start !== null ? ` · median ${duration(s.median_seconds_from_start)}` : ""
              }`}
            />
          ))}
          {breakdown !== "none" && result.breakdown.length > 0 && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{breakdown}</Table.HeaderCell>
                  {result.steps.map((s) => (
                    <Table.HeaderCell key={s.index}>Step {s.index}</Table.HeaderCell>
                  ))}
                  <Table.HeaderCell>Conversion</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {result.breakdown.map((row) => (
                  <Table.Row key={row.value ?? "(none)"}>
                    <Table.Cell>
                      <code>{row.value ?? "(none)"}</code>
                    </Table.Cell>
                    {row.steps.map((c, i) => (
                      <Table.Cell key={i}>{num(c)}</Table.Cell>
                    ))}
                    <Table.Cell>{pct(row.conversion)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Container>
      )}
    </div>
  )
}
