import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Plus, RocketLaunch } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Table,
  Text,
} from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  DECISION_COLOR,
  formatDate,
  fromLocalInput,
  ReleaseListItem,
  ReleaseTier,
  STATUS_COLOR,
  useCreateRelease,
  useReleases,
} from "../../lib/releases"

const SECTIONS: { title: string; hint: string; match: (r: ReleaseListItem) => boolean }[] = [
  {
    title: "Needs attention",
    hint: "Held on go-live. Fix the failing checks and move the date.",
    match: (r) => r.status === "held",
  },
  {
    title: "Live",
    hint: "Review sales and workload on day 7, then record a decision.",
    match: (r) => r.status === "live",
  },
  {
    title: "Upcoming",
    hint: "Scheduled releases go live automatically when every go/no-go check passes.",
    match: (r) => r.status === "scheduled" || r.status === "draft",
  },
  {
    title: "Reviewed",
    hint: "Past releases with a recorded repeat / simplify / pause decision.",
    match: (r) => r.status === "reviewed",
  },
]

const ReleasesPage = () => {
  const { data, isLoading } = useReleases()
  const [creating, setCreating] = useState(false)
  const releases = data?.releases ?? []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Releases</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Keep the core in stock. Use small releases to give customers a reason to come back.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setCreating(true)}>
          <Plus /> New release
        </Button>
      </Container>

      {isLoading && (
        <Container className="px-6 py-4">
          <Text size="small">Loading…</Text>
        </Container>
      )}

      {!isLoading && !releases.length && (
        <Container className="px-6 py-8 text-center">
          <Text size="small" className="text-ui-fg-subtle">
            No releases yet. Start with one small follow-on to a SKU customers already buy.
          </Text>
        </Container>
      )}

      {SECTIONS.map((section) => {
        const rows = releases.filter(section.match)
        if (!rows.length) return null
        return (
          <Container key={section.title} className="divide-y p-0">
            <div className="px-6 py-4">
              <Heading level="h2">{section.title}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {section.hint}
              </Text>
            </div>
            <ReleaseTable rows={rows} />
          </Container>
        )
      })}

      <CreateReleaseDrawer open={creating} onOpenChange={setCreating} />
    </div>
  )
}

const ReleaseTable = ({ rows }: { rows: ReleaseListItem[] }) => {
  const navigate = useNavigate()
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Release</Table.HeaderCell>
          <Table.HeaderCell>Tier</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell>Decision</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((r) => (
          <Table.Row
            key={r.id}
            className="cursor-pointer"
            onClick={() => navigate(`/releases/${r.id}`)}
          >
            <Table.Cell>
              <div className="flex items-center gap-x-3">
                {r.hero_image ? (
                  <img src={r.hero_image} alt="" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <div className="bg-ui-bg-subtle h-8 w-8 rounded" />
                )}
                <div>
                  <Text size="small" weight="plus">
                    {r.title}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {r.products.length} product{r.products.length === 1 ? "" : "s"}
                  </Text>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge size="2xsmall" color={r.tier === "major" ? "purple" : "grey"}>
                {r.tier}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <StatusBadge color={STATUS_COLOR[r.status]}>{r.status}</StatusBadge>
            </Table.Cell>
            <Table.Cell>{formatDate(r.published_at ?? r.release_at)}</Table.Cell>
            <Table.Cell>{r.owner ?? "—"}</Table.Cell>
            <Table.Cell>
              {r.decision ? (
                <Badge size="2xsmall" color={DECISION_COLOR[r.decision]}>
                  {r.decision}
                </Badge>
              ) : (
                "—"
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const CreateReleaseDrawer = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const navigate = useNavigate()
  const create = useCreateRelease()
  const [title, setTitle] = useState("")
  const [tier, setTier] = useState<ReleaseTier>("light")
  const [releaseAt, setReleaseAt] = useState("")

  const submit = () =>
    create.mutate(
      { title, tier, release_at: fromLocalInput(releaseAt) },
      {
        onSuccess: ({ release }) => {
          onOpenChange(false)
          setTitle("")
          setReleaseAt("")
          navigate(`/releases/${release.id}`)
        },
      }
    )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>New release</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Washed Tee in Sage" />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small">Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as ReleaseTier)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="light">Light: approved variation, PDP + stories + short video</Select.Item>
                <Select.Item value="major">Major: new silhouette or story with dedicated assets</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small">Release date (optional)</Label>
            <Input type="datetime-local" value={releaseAt} onChange={(e) => setReleaseAt(e.target.value)} />
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            Before you commit a date, confirm the SKU, stock, creative hours, fulfillment coverage and an approver.
          </Text>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
          </Drawer.Close>
          <Button size="small" onClick={submit} disabled={!title.trim()} isLoading={create.isPending}>
            Create
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export const config = defineRouteConfig({
  label: "Releases",
  icon: RocketLaunch,
})

export default ReleasesPage
