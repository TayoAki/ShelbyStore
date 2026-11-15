import { Alert, Badge, Button, Container, Heading, Select, StatusBadge, Table, Text, Textarea, usePrompt } from "@medusajs/ui"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { STATUS_COLOR } from "../../../../components/analytics/experiments"
import {
  num,
  pct,
  useDeleteExperiment,
  useExperiment,
  useExperimentDecision,
  useExperimentStatus,
} from "../../../../lib/analytics"

const ExperimentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { data, isLoading } = useExperiment(id!)
  const status = useExperimentStatus(id!)
  const decide = useExperimentDecision(id!)
  const remove = useDeleteExperiment(id!)
  const [decision, setDecision] = useState<string>("")
  const [notes, setNotes] = useState<string | null>(null)

  if (isLoading || !data) {
    return (
      <Container className="px-6 py-4">
        <Text size="small">Loading…</Text>
      </Container>
    )
  }
  const { experiment: e, results: r } = data

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h1">{e.name}</Heading>
            <StatusBadge color={STATUS_COLOR[e.status]}>{e.status}</StatusBadge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            <code>{e.key}</code> · {e.variants.map((v) => `${v.key} ${v.weight}`).join(" / ")} · min {e.minimum_sample} exposures per variant
          </Text>
        </div>
        <div className="flex gap-2">
          {e.status !== "running" ? (
            <Button size="small" onClick={() => status.mutate("running")} isLoading={status.isPending}>
              {e.status === "draft" ? "Start" : "Resume"}
            </Button>
          ) : (
            <Button size="small" variant="secondary" onClick={() => status.mutate("stopped")} isLoading={status.isPending}>
              Stop
            </Button>
          )}
          {e.status !== "running" && (
            <Button
              size="small"
              variant="danger"
              onClick={async () => {
                if (await prompt({ title: "Delete this experiment?", description: "Its events stay; the log entry goes." }))
                  remove.mutate(undefined, { onSuccess: () => navigate("/analytics") })
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </Container>

      <Container className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-3">
        <LogField label="Hypothesis" value={e.hypothesis} />
        <LogField label="Audience" value={e.audience} />
        <LogField label="What changes" value={e.change_description} />
      </Container>

      <Container className="flex flex-col gap-4 px-6 py-4">
        <Heading level="h2">Results</Heading>
        {!r ? (
          <Text size="small" className="text-ui-fg-subtle">
            Start the experiment to collect exposures. Place <code>{`getVariant("${e.key}")`}</code> and{" "}
            <code>{`<Exposure experiment="${e.key}" />`}</code> on the page being tested.
          </Text>
        ) : (
          <>
            <Alert variant={r.verdict.status === "significant" ? "success" : r.verdict.status === "inconclusive" ? "warning" : "info"}>
              <Text size="small" weight="plus">
                {r.verdict.status === "significant"
                  ? `Significant: ${"better" in r.verdict && r.verdict.better.length ? `${r.verdict.better.join(", ")} beat control` : "a variant is worse than control"}`
                  : r.verdict.status === "inconclusive"
                    ? "Inconclusive"
                    : "No significant difference"}
              </Text>
              <Text size="small">{r.verdict.reason}</Text>
            </Alert>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Variant</Table.HeaderCell>
                  {r.steps.map((s, i) => (
                    <Table.HeaderCell key={i}>{s}</Table.HeaderCell>
                  ))}
                  <Table.HeaderCell>Conversion</Table.HeaderCell>
                  <Table.HeaderCell>vs control</Table.HeaderCell>
                  <Table.HeaderCell>p-value</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {r.variants.map((v) => (
                  <Table.Row key={v.variant}>
                    <Table.Cell>
                      <code>{v.variant}</code> {v.is_control && <Badge size="2xsmall">control</Badge>}
                    </Table.Cell>
                    {r.steps.map((_, i) => (
                      <Table.Cell key={i}>{num(v.steps[i] ?? 0)}</Table.Cell>
                    ))}
                    <Table.Cell>{pct(v.conversion_rate)}</Table.Cell>
                    <Table.Cell>{v.uplift === null ? "—" : `${v.uplift >= 0 ? "+" : ""}${(v.uplift * 100).toFixed(1)}%`}</Table.Cell>
                    <Table.Cell>{v.p_value === null ? "—" : v.p_value.toFixed(3)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Conversion = people who reached the last step within 7 days of exposure. Two-proportion z-test against control. Compare like-for-like traffic and devices before shipping a change.
            </Text>
          </>
        )}
      </Container>

      {e.status !== "draft" && (
        <Container className="flex flex-col gap-3 px-6 py-4">
          <Heading level="h2">Decision and learnings</Heading>
          {e.decision && (
            <Text size="small" className="text-ui-fg-subtle">
              Recorded: <strong>{e.decision.replace("_", " ")}</strong>
            </Text>
          )}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr_auto]">
            <Select value={decision || e.decision || ""} onValueChange={setDecision}>
              <Select.Trigger>
                <Select.Value placeholder="Choose…" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="ship">Ship the variant</Select.Item>
                <Select.Item value="keep_control">Keep the control</Select.Item>
                <Select.Item value="iterate">Iterate and retest</Select.Item>
              </Select.Content>
            </Select>
            <Textarea
              rows={2}
              placeholder="What did we learn? Under which conditions (audience, traffic source, offer)?"
              value={notes ?? e.notes ?? ""}
              onChange={(ev) => setNotes(ev.target.value)}
            />
            <Button
              size="small"
              disabled={!(decision || e.decision)}
              isLoading={decide.isPending}
              onClick={() => decide.mutate({ decision: decision || e.decision!, notes: notes ?? e.notes ?? undefined })}
            >
              Record
            </Button>
          </div>
        </Container>
      )}
    </div>
  )
}

const LogField = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex flex-col gap-1">
    <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
      {label}
    </Text>
    <Text size="small">{value || "—"}</Text>
  </div>
)

export const handle = { breadcrumb: () => "Experiment" }

export default ExperimentPage
