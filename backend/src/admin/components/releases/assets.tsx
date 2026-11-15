import { Trash } from "@medusajs/icons"
import { Badge, Button, Checkbox, IconButton, Input, Select, Table, Text } from "@medusajs/ui"
import { useState } from "react"
import { AdminRelease, AssetKind, ReleaseAsset, useUpdateRelease } from "../../lib/releases"
import { Section } from "./section"

const KIND_LABEL: Record<AssetKind, string> = {
  editorial: "Editorial images",
  product_images: "Product images",
  stories: "Stories",
  short_video: "Native short video",
  email: "Email",
  other: "Other",
}
const REQUIRED: Record<AdminRelease["tier"], AssetKind[]> = {
  major: ["editorial", "short_video"],
  light: ["product_images", "short_video"],
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

/** SOP 3: approved assets that all carry the same product promise. */
export const AssetsSection = ({ release }: { release: AdminRelease }) => {
  const update = useUpdateRelease(release.id)
  const assets = release.assets ?? []
  const [draft, setDraft] = useState<{ key: string; kind: AssetKind; channel: string }>({
    key: "",
    kind: REQUIRED[release.tier][0],
    channel: "",
  })

  const save = (next: ReleaseAsset[]) => update.mutate({ assets: next })
  const patch = (i: number, change: Partial<ReleaseAsset>) =>
    save(assets.map((a, j) => (j === i ? { ...a, ...change } : a)))

  const add = () => {
    const key = slugify(draft.key || `${draft.channel}-${draft.kind}`)
    if (!key || assets.some((a) => a.key === key)) return
    save([...assets, { key, kind: draft.kind, channel: draft.channel || "site", approved: false }])
    setDraft({ ...draft, key: "", channel: "" })
  }

  return (
    <Section
      title="Creative assets"
      subtitle={`A ${release.tier} release needs approved ${REQUIRED[release.tier]
        .map((k) => KIND_LABEL[k].toLowerCase())
        .join(" + ")}. If production overruns, mark extras optional and skip them. The key is the attribution tag: link with ?asset=<key>.`}
    >
      <div className="flex flex-col gap-y-4">
        {assets.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Key / tag</Table.HeaderCell>
                <Table.HeaderCell>Kind</Table.HeaderCell>
                <Table.HeaderCell>Channel</Table.HeaderCell>
                <Table.HeaderCell>Optional</Table.HeaderCell>
                <Table.HeaderCell>Approved</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {assets.map((a, i) => (
                <Table.Row key={a.key}>
                  <Table.Cell>
                    <code className="text-ui-fg-subtle">{a.key}</code>
                  </Table.Cell>
                  <Table.Cell>
                    {KIND_LABEL[a.kind]}{" "}
                    {REQUIRED[release.tier].includes(a.kind) && (
                      <Badge size="2xsmall" color="blue">
                        required
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>{a.channel}</Table.Cell>
                  <Table.Cell>
                    <Checkbox checked={!!a.optional} onCheckedChange={(v) => patch(i, { optional: v === true })} />
                  </Table.Cell>
                  <Table.Cell>
                    <Checkbox checked={a.approved} onCheckedChange={(v) => patch(i, { approved: v === true })} />
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton size="small" variant="transparent" onClick={() => save(assets.filter((_, j) => j !== i))}>
                      <Trash />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {!assets.length && (
          <Text size="small" className="text-ui-fg-subtle">
            No assets planned yet.
          </Text>
        )}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Input
            size="small"
            placeholder="tiktok-tryon"
            value={draft.key}
            onChange={(e) => setDraft({ ...draft, key: e.target.value })}
          />
          <Select size="small" value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as AssetKind })}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(KIND_LABEL) as AssetKind[]).map((k) => (
                <Select.Item key={k} value={k}>
                  {KIND_LABEL[k]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Input
            size="small"
            placeholder="tiktok, instagram, site…"
            value={draft.channel}
            onChange={(e) => setDraft({ ...draft, channel: e.target.value })}
          />
          <Button size="small" variant="secondary" onClick={add} isLoading={update.isPending}>
            Add asset
          </Button>
        </div>
      </div>
    </Section>
  )
}
