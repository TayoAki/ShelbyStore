import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Camera, Plus } from "@medusajs/icons"
import { Badge, Button, Container, Drawer, Heading, Input, Label, StatusBadge, Table, Text } from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  DECISION_COLOR,
  SERIES_STATUS_COLOR,
  useCreateSeries,
  useSeriesList,
} from "../../lib/content"

const ContentPage = () => {
  const { data, isLoading } = useSeriesList()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const series = data?.series ?? []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Content series</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Pick a belief you can prove, put it in a format your audience already knows, and repeat it until
            they recognize it and join in.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          <Plus /> New series
        </Button>
      </Container>

      <Container className="divide-y p-0">
        {isLoading ? (
          <Text size="small" className="px-6 py-4">
            Loading…
          </Text>
        ) : !series.length ? (
          <Text size="small" className="text-ui-fg-subtle px-6 py-8 text-center">
            No series yet. Start by writing the one sentence that explains what Shelby does differently.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Series</Table.HeaderCell>
                <Table.HeaderCell>Channel</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Episodes</Table.HeaderCell>
                <Table.HeaderCell>Last decision</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {series.map((s) => (
                <Table.Row key={s.id} className="cursor-pointer" onClick={() => navigate(`/content/${s.id}`)}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {s.title}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle line-clamp-1 max-w-[420px]">
                      {s.stance ?? "No stance yet"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{s.channel}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={SERIES_STATUS_COLOR[s.status]}>{s.status}</StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    {s.published_count} / {s.episode_target} published
                  </Table.Cell>
                  <Table.Cell>
                    {s.decision ? (
                      <Badge size="2xsmall" color={DECISION_COLOR[s.decision]}>
                        {s.decision}
                        {s.revision_target ? `: ${s.revision_target.replace("_", " ")}` : ""}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
      <CreateSeriesDrawer open={open} onOpenChange={setOpen} />
    </div>
  )
}

const CreateSeriesDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const create = useCreateSeries()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [stance, setStance] = useState("")
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>New content series</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The 30-Wash Test" />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small">Stance (one sentence)</Label>
            <Input
              value={stance}
              onChange={(e) => setStance(e.target.value)}
              placeholder="What do we do differently, that we can show on camera?"
            />
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            Test it: swap in a competitor's name. If the sentence still works, make it more specific.
          </Text>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={!title.trim()}
            isLoading={create.isPending}
            onClick={() =>
              create.mutate(
                { title, stance: stance.trim() || null },
                {
                  onSuccess: (d) => {
                    onOpenChange(false)
                    navigate(`/content/${d.series.id}`)
                  },
                }
              )
            }
          >
            Create
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export const config = defineRouteConfig({ label: "Content", icon: Camera })
export default ContentPage
