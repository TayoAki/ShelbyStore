import { Plus, SquareTwoStack, Trash } from "@medusajs/icons"
import { Button, Drawer, IconButton, Input, Table, Text, Textarea, toast } from "@medusajs/ui"
import { useState } from "react"
import {
  ContentEpisode,
  EpisodeRow,
  SeriesDetail,
  fromLocalInput,
  toLocalInput,
  toNumberOrNull,
  useAddEpisode,
  useDeleteEpisode,
  useUpdateEpisode,
} from "../../lib/content"
import { formatMoney } from "../../lib/releases"
import { Field, Section } from "../releases/section"

const dash = (v: number | null | undefined, suffix = "") => (v === null || v === undefined ? "—" : `${v}${suffix}`)

export const EpisodesSection = ({ detail }: { detail: SeriesDetail }) => {
  const { series, scorecard, analytics } = detail
  const [editing, setEditing] = useState<ContentEpisode | "new" | null>(null)
  const remove = useDeleteEpisode(series.id)
  const rowFor = (id: string): EpisodeRow | undefined => scorecard.episodes.find((r) => r.id === id)

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Tracked link copied")
    } catch {
      toast.info(link)
    }
  }

  return (
    <Section
      title="Episodes"
      subtitle="Each episode gets a tracked link. Read platform metrics at the same age for every post (e.g. day 3)."
      actions={
        <Button size="small" variant="secondary" onClick={() => setEditing("new")}>
          <Plus /> Add episode
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Episode</Table.HeaderCell>
              <Table.HeaderCell>Tracked link</Table.HeaderCell>
              <Table.HeaderCell>Age</Table.HeaderCell>
              <Table.HeaderCell>Views</Table.HeaderCell>
              <Table.HeaderCell>% viewed</Table.HeaderCell>
              <Table.HeaderCell>Joined in</Table.HeaderCell>
              <Table.HeaderCell>Sessions</Table.HeaderCell>
              <Table.HeaderCell>Orders</Table.HeaderCell>
              <Table.HeaderCell>Hours</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {series.episodes.map((e) => {
              const row = rowFor(e.id)
              return (
                <Table.Row key={e.id} className="cursor-pointer" onClick={() => setEditing(e)}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {e.title}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {e.published_at ? new Date(e.published_at).toLocaleDateString() : "Not published"}
                      {e.subject ? ` · ${e.subject}` : ""}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      type="button"
                      className="flex items-center gap-x-1"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        copy(e.tracked_link)
                      }}
                    >
                      <code className="text-ui-fg-subtle">?asset={e.asset_key}</code>
                      <SquareTwoStack className="text-ui-fg-muted" />
                    </button>
                  </Table.Cell>
                  <Table.Cell>{row?.age_days === null || !row ? "—" : `day ${row.age_days}`}</Table.Cell>
                  <Table.Cell>{dash(e.views)}</Table.Cell>
                  <Table.Cell>{dash(e.avg_pct_viewed, "%")}</Table.Cell>
                  <Table.Cell>
                    {row ? row.participation : "—"}
                    {row?.participation_per_1k !== null && row ? (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {row.participation_per_1k} / 1k
                      </Text>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>
                    {analytics === "connected" && row
                      ? `${dash(row.landing_sessions)} · ${dash(row.product_view_sessions)} PDP`
                      : "—"}
                  </Table.Cell>
                  <Table.Cell>
                    {row ? row.orders : "—"}
                    {row && row.orders > 0 ? (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {formatMoney(row.net_sales)}
                      </Text>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell className={row?.over_budget ? "text-ui-fg-error" : undefined}>
                    {dash(e.production_hours, " h")}
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton
                      size="small"
                      variant="transparent"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        remove.mutate({ episodeId: e.id })
                      }}
                    >
                      <Trash />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
      {!series.episodes.length && (
        <Text size="small" className="text-ui-fg-subtle mt-2">
          No episodes yet.
        </Text>
      )}
      {analytics !== "connected" && (
        <Text size="xsmall" className="text-ui-fg-subtle mt-2">
          {analytics === "not_configured"
            ? "Connect Umami to count sessions from each tracked link. Orders are counted either way."
            : "Umami didn't respond, so session counts are missing."}
        </Text>
      )}
      {editing && (
        <EpisodeDrawer
          seriesId={series.id}
          episode={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </Section>
  )
}

const EpisodeDrawer = ({
  seriesId,
  episode,
  onClose,
}: {
  seriesId: string
  episode: ContentEpisode | null
  onClose: () => void
}) => {
  const add = useAddEpisode(seriesId)
  const update = useUpdateEpisode(seriesId)
  const [f, setF] = useState({
    title: episode?.title ?? "",
    subject: episode?.subject ?? "",
    asset_key: episode?.asset_key ?? "",
    landing_path: episode?.landing_path ?? "/",
    post_url: episode?.post_url ?? "",
    published_at: toLocalInput(episode?.published_at ?? null),
    metrics_recorded_at: toLocalInput(episode?.metrics_recorded_at ?? null),
    views: episode?.views?.toString() ?? "",
    avg_pct_viewed: episode?.avg_pct_viewed?.toString() ?? "",
    relevant_comments: episode?.relevant_comments?.toString() ?? "",
    submissions: episode?.submissions?.toString() ?? "",
    production_hours: episode?.production_hours?.toString() ?? "",
    audience_language: episode?.audience_language ?? "",
  })
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))
  const int = (v: string) => {
    const n = toNumberOrNull(v)
    return n === null ? null : Math.round(n)
  }

  const body = {
    title: f.title,
    subject: f.subject.trim() || null,
    ...(f.asset_key.trim() ? { asset_key: f.asset_key.trim() } : {}),
    landing_path: f.landing_path.trim() || "/",
    post_url: f.post_url.trim() || null,
    published_at: fromLocalInput(f.published_at),
    metrics_recorded_at: fromLocalInput(f.metrics_recorded_at),
    views: int(f.views),
    avg_pct_viewed: toNumberOrNull(f.avg_pct_viewed),
    relevant_comments: int(f.relevant_comments),
    submissions: int(f.submissions),
    production_hours: toNumberOrNull(f.production_hours),
    audience_language: f.audience_language.trim() || null,
  }

  const save = () => {
    const done = { onSuccess: onClose }
    if (episode) update.mutate({ episodeId: episode.id, body }, done)
    else add.mutate(body, done)
  }

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{episode ? "Edit episode" : "New episode"}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <Field label="Title">
            <Input value={f.title} onChange={(e) => set("title")(e.target.value)} />
          </Field>
          <Field label="Job or problem featured" hint="Same structure every episode; change this.">
            <Input value={f.subject} onChange={(e) => set("subject")(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset key" hint="Blank = generated">
              <Input value={f.asset_key} onChange={(e) => set("asset_key")(e.target.value)} />
            </Field>
            <Field label="Landing path">
              <Input value={f.landing_path} onChange={(e) => set("landing_path")(e.target.value)} />
            </Field>
          </div>
          <Field label="Post URL">
            <Input value={f.post_url} onChange={(e) => set("post_url")(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Published">
              <Input type="datetime-local" value={f.published_at} onChange={(e) => set("published_at")(e.target.value)} />
            </Field>
            <Field label="Metrics read at">
              <Input
                type="datetime-local"
                value={f.metrics_recorded_at}
                onChange={(e) => set("metrics_recorded_at")(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Views">
              <Input type="number" value={f.views} onChange={(e) => set("views")(e.target.value)} />
            </Field>
            <Field label="Avg % viewed">
              <Input type="number" value={f.avg_pct_viewed} onChange={(e) => set("avg_pct_viewed")(e.target.value)} />
            </Field>
            <Field label="Relevant comments / questions">
              <Input type="number" value={f.relevant_comments} onChange={(e) => set("relevant_comments")(e.target.value)} />
            </Field>
            <Field label="Viewer submissions">
              <Input type="number" value={f.submissions} onChange={(e) => set("submissions")(e.target.value)} />
            </Field>
            <Field label="Production hours" hint="Concept to publish">
              <Input type="number" value={f.production_hours} onChange={(e) => set("production_hours")(e.target.value)} />
            </Field>
          </div>
          <Field label="Audience language" hint="Words viewers used. Feed them into the next episode.">
            <Textarea rows={2} value={f.audience_language} onChange={(e) => set("audience_language")(e.target.value)} />
          </Field>
        </Drawer.Body>
        <Drawer.Footer>
          <Button size="small" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" disabled={!f.title.trim()} isLoading={add.isPending || update.isPending} onClick={save}>
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
