import { Badge, Button, Container, Drawer, Heading, Input, Label, Select, StatusBadge, Table, Text, Textarea } from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Experiment, useCreateExperiment, useExperiments, useSchema } from "../../lib/analytics"

export const STATUS_COLOR: Record<Experiment["status"], "grey" | "green" | "orange"> = {
  draft: "grey",
  running: "green",
  stopped: "orange",
}

export function ExperimentsTab() {
  const { data, isLoading } = useExperiments()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Experiments</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            A/B tests against a control, and the log of what was learned. Results stay "inconclusive" until every variant has enough exposures.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          New experiment
        </Button>
      </div>
      {isLoading ? (
        <Text size="small" className="px-6 pb-4">
          Loading…
        </Text>
      ) : data?.experiments.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Experiment</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Variants</Table.HeaderCell>
              <Table.HeaderCell>Started</Table.HeaderCell>
              <Table.HeaderCell>Decision</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.experiments.map((e) => (
              <Table.Row key={e.id} className="cursor-pointer" onClick={() => navigate(`/analytics/experiments/${e.id}`)}>
                <Table.Cell>
                  <Text size="small" weight="plus">
                    {e.name}
                  </Text>
                  <code className="text-ui-fg-subtle text-xs">{e.key}</code>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge color={STATUS_COLOR[e.status]}>{e.status}</StatusBadge>
                </Table.Cell>
                <Table.Cell>{e.variants.map((v) => `${v.key} (${v.weight})`).join(" · ")}</Table.Cell>
                <Table.Cell>{e.started_at ? new Date(e.started_at).toLocaleDateString() : "—"}</Table.Cell>
                <Table.Cell>{e.decision ? <Badge size="2xsmall">{e.decision.replace("_", " ")}</Badge> : "—"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Text size="small" className="text-ui-fg-subtle px-6 pb-6">
          No experiments yet. Start with one clear hypothesis, such as a hero headline that continues the post visitors came from.
        </Text>
      )}
      <CreateExperimentDrawer open={open} onOpenChange={setOpen} />
    </Container>
  )
}

function CreateExperimentDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateExperiment()
  const navigate = useNavigate()
  const { data: schema } = useSchema()
  const [form, setForm] = useState({
    key: "",
    name: "",
    hypothesis: "",
    audience: "",
    change_description: "",
    variants: "control, b",
    metric: "purchase",
    minimum_sample: "100",
  })
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const variantKeys = form.variants
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const preset = schema?.presets.find((p) => p.key === form.metric)

  const submit = () =>
    create.mutate(
      {
        key: form.key,
        name: form.name,
        hypothesis: form.hypothesis || null,
        audience: form.audience || null,
        change_description: form.change_description || null,
        variants: variantKeys.map((key) => ({ key, weight: 1 })),
        // The primary metric runs after exposure, so drop a leading landing step.
        funnel_steps: preset ? preset.steps.filter((s) => s.event !== "$pageview").slice(-3) : [{ event: "order_completed" }],
        minimum_sample: Number(form.minimum_sample) || 100,
      },
      {
        onSuccess: ({ experiment }) => {
          onOpenChange(false)
          navigate(`/analytics/experiments/${experiment.id}`)
        },
      }
    )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>New experiment</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4 overflow-y-auto">
          <Field label="Key (used in code: getVariant)">
            <Input value={form.key} onChange={(e) => set("key")(e.target.value)} placeholder="hero-headline" />
          </Field>
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Hero headline continues the post" />
          </Field>
          <Field label="Hypothesis">
            <Textarea
              rows={3}
              value={form.hypothesis}
              onChange={(e) => set("hypothesis")(e.target.value)}
              placeholder="If the landing headline repeats the claim from the video, more visitors add to bag, because the page continues what they came for."
            />
          </Field>
          <Field label="Audience">
            <Input value={form.audience} onChange={(e) => set("audience")(e.target.value)} placeholder="Cold TikTok traffic, mobile" />
          </Field>
          <Field label="What changes in the variant">
            <Textarea rows={2} value={form.change_description} onChange={(e) => set("change_description")(e.target.value)} />
          </Field>
          <Field label="Variants (comma-separated, control first, equal split)">
            <Input value={form.variants} onChange={(e) => set("variants")(e.target.value)} />
          </Field>
          <Field label="Primary metric (after exposure)">
            <Select value={form.metric} onValueChange={set("metric")}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {(schema?.presets ?? []).map((p) => (
                  <Select.Item key={p.key} value={p.key}>
                    {p.name} funnel
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field>
          <Field label="Minimum exposures per variant before reading results">
            <Input type="number" value={form.minimum_sample} onChange={(e) => set("minimum_sample")(e.target.value)} />
          </Field>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
          </Drawer.Close>
          <Button size="small" onClick={submit} isLoading={create.isPending} disabled={!form.key || !form.name || variantKeys.length < 2}>
            Create draft
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-2">
    <Label size="small">{label}</Label>
    {children}
  </div>
)
