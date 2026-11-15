import { Button, Input } from "@medusajs/ui"
import { useState } from "react"
import { AdminRelease, useUpdateRelease } from "../../lib/releases"
import { Field, Section } from "./section"

const FIELDS: { key: keyof AdminRelease; label: string; hint?: string; percent?: boolean; nullable?: boolean; int?: boolean }[] = [
  { key: "contribution_floor", label: "Contribution floor ($)", hint: "Agree this before launch.", nullable: true },
  { key: "capacity_hours", label: "Capacity cap (hours)", hint: "Prep + launch hours the team can give.", nullable: true },
  { key: "actual_hours", label: "Actual hours", hint: "Log from the release log by day 7.", nullable: true },
  { key: "launch_spend", label: "Incremental launch spend ($)" },
  { key: "fulfillment_cost_per_order", label: "Fulfillment cost per order ($)" },
  { key: "selling_cost_rate", label: "Variable selling cost (%)", hint: "Payment fees, marketplace fees.", percent: true },
  { key: "units_added", label: "Units added during window", int: true },
  { key: "returns_window_days", label: "Returns window (days)", int: true },
]

export const EconomicsSection = ({ release }: { release: AdminRelease }) => {
  const update = useUpdateRelease(release.id)
  const initial = Object.fromEntries(
    FIELDS.map((f) => {
      const v = release[f.key] as number | null
      return [f.key, v === null || v === undefined ? "" : String(f.percent ? +(v * 100).toFixed(2) : v)]
    })
  )
  const [form, setForm] = useState<Record<string, string>>(initial)

  const save = () => {
    const body: Record<string, number | null> = {}
    for (const f of FIELDS) {
      const raw = form[f.key as string]
      if (raw === "") {
        if (f.nullable) body[f.key as string] = null
        continue
      }
      const n = Number(raw)
      if (!Number.isFinite(n)) continue
      body[f.key as string] = f.percent ? n / 100 : f.int ? Math.round(n) : n
    }
    update.mutate(body)
  }

  return (
    <Section
      title="Economics and capacity"
      subtitle="Inputs for the launch scorecard. Starting units are captured automatically at go-live."
      actions={
        <Button size="small" variant="secondary" onClick={save} isLoading={update.isPending}>
          Save
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {FIELDS.map((f) => (
          <Field key={f.key as string} label={f.label} hint={f.hint}>
            <Input
              type="number"
              size="small"
              value={form[f.key as string]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key as string]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
    </Section>
  )
}
