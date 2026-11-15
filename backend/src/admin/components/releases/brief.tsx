import { Button, Input, Select, Textarea } from "@medusajs/ui"
import { useState } from "react"
import {
  AdminRelease,
  fromLocalInput,
  ReleaseTier,
  toLocalInput,
  useUpdateRelease,
} from "../../lib/releases"
import { Field, Section } from "./section"

/** SOP 2 (scope) and SOP 3 step 1 (one customer-facing promise + the proof). */
export const BriefSection = ({ release }: { release: AdminRelease }) => {
  const update = useUpdateRelease(release.id)
  const [form, setForm] = useState({
    title: release.title,
    tier: release.tier,
    release_at: toLocalInput(release.release_at),
    owner: release.owner ?? "",
    backup_approver: release.backup_approver ?? "",
    product_promise: release.product_promise ?? "",
    proof: release.proof ?? "",
    story: release.story ?? "",
    hero_image: release.hero_image ?? "",
  })
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))
  const locked = release.status === "live" || release.status === "reviewed"
  const nullable = (v: string) => (v.trim() ? v.trim() : null)

  const save = () =>
    update.mutate({
      title: form.title,
      tier: form.tier,
      release_at: fromLocalInput(form.release_at),
      owner: nullable(form.owner),
      backup_approver: nullable(form.backup_approver),
      product_promise: nullable(form.product_promise),
      proof: nullable(form.proof),
      story: nullable(form.story),
      hero_image: nullable(form.hero_image),
    })

  return (
    <Section
      title="Release brief"
      subtitle="Creative and operations should work from the same brief."
      actions={
        <Button size="small" variant="secondary" onClick={save} isLoading={update.isPending}>
          Save brief
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => set("title")(e.target.value)} />
        </Field>
        <Field
          label="Tier"
          hint={
            form.tier === "major"
              ? "Major: new silhouette or story. Needs editorial images and a native short video."
              : "Light: approved variation. Needs product images and a try-on or comparison clip."
          }
        >
          <Select value={form.tier} onValueChange={(v) => set("tier")(v as ReleaseTier)} disabled={locked}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="light">Light</Select.Item>
              <Select.Item value="major">Major</Select.Item>
            </Select.Content>
          </Select>
        </Field>
        <Field label="Release date" hint="Scheduled releases go live at this time if every check passes.">
          <Input
            type="datetime-local"
            value={form.release_at}
            disabled={locked}
            onChange={(e) => set("release_at")(e.target.value)}
          />
        </Field>
        <Field label="Hero image URL">
          <Input value={form.hero_image} onChange={(e) => set("hero_image")(e.target.value)} />
        </Field>
        <Field label="Primary owner">
          <Input value={form.owner} onChange={(e) => set("owner")(e.target.value)} placeholder="Merchandising lead" />
        </Field>
        <Field label="Backup approver">
          <Input
            value={form.backup_approver}
            onChange={(e) => set("backup_approver")(e.target.value)}
            placeholder="Founder"
          />
        </Field>
        <Field label="Product promise" hint="One customer-facing sentence. Every asset should carry it.">
          <Input value={form.product_promise} onChange={(e) => set("product_promise")(e.target.value)} />
        </Field>
        <Field label="Proof the camera should show" hint="Sleeve fall, fabric drape, how the garment moves.">
          <Input value={form.proof} onChange={(e) => set("proof")(e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Story (shown in the app)">
            <Textarea rows={3} value={form.story} onChange={(e) => set("story")(e.target.value)} />
          </Field>
        </div>
      </div>
    </Section>
  )
}
