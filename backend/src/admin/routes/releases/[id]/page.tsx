import { Badge, Button, Container, Heading, StatusBadge, Text, usePrompt } from "@medusajs/ui"
import { useNavigate, useParams } from "react-router-dom"
import { AssetsSection } from "../../../components/releases/assets"
import { BriefSection } from "../../../components/releases/brief"
import { EconomicsSection } from "../../../components/releases/economics"
import { GoLiveSection } from "../../../components/releases/go-live"
import { ProductsSection } from "../../../components/releases/products"
import { ScorecardSection } from "../../../components/releases/scorecard"
import {
  formatDate,
  STATUS_COLOR,
  useDeleteRelease,
  useGoLive,
  useRelease,
  useUpdateRelease,
} from "../../../lib/releases"

const ReleaseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { data, isLoading, dataUpdatedAt } = useRelease(id!)
  const update = useUpdateRelease(id!)
  const goLive = useGoLive(id!)
  const remove = useDeleteRelease(id!)

  if (isLoading || !data) {
    return (
      <Container className="px-6 py-4">
        <Text size="small">Loading…</Text>
      </Container>
    )
  }
  const release = data.release
  const isLive = release.status === "live" || release.status === "reviewed"

  const confirmGoLive = async () => {
    const ok = await prompt({
      title: "Run go-live now?",
      description: release.go_live.ready
        ? "Every check passes. The products will be published and reminders sent."
        : "Some checks are failing, so the release will be held.",
      confirmText: "Run checks",
    })
    if (ok) goLive.mutate()
  }

  const confirmDelete = async () => {
    const ok = await prompt({
      title: "Delete this release?",
      description: "Products stay in the catalog. Reminder signups are removed.",
    })
    if (ok) remove.mutate(undefined, { onSuccess: () => navigate("/releases") })
  }

  // Remount forms when fresh data arrives so they show saved values.
  const k = `${release.id}-${dataUpdatedAt}`

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Heading level="h1">{release.title}</Heading>
            <StatusBadge color={STATUS_COLOR[release.status]}>{release.status}</StatusBadge>
            <Badge size="2xsmall" color={release.tier === "major" ? "purple" : "grey"}>
              {release.tier}
            </Badge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {release.published_at
              ? `Live since ${formatDate(release.published_at)}`
              : `Release date: ${formatDate(release.release_at)}`}{" "}
            · {release.reminder_count} “notify me” signup{release.reminder_count === 1 ? "" : "s"} · /{release.handle}
          </Text>
        </div>
        <div className="flex gap-x-2">
          {release.status === "draft" && (
            <Button size="small" variant="secondary" onClick={() => update.mutate({ status: "scheduled" })}>
              Schedule
            </Button>
          )}
          {release.status === "held" && (
            <Button size="small" variant="secondary" onClick={() => update.mutate({ status: "scheduled" })}>
              Reschedule
            </Button>
          )}
          {release.status === "scheduled" && (
            <Button size="small" variant="secondary" onClick={() => update.mutate({ status: "draft" })}>
              Back to draft
            </Button>
          )}
          {!isLive && (
            <Button size="small" onClick={confirmGoLive} isLoading={goLive.isPending}>
              Go live now
            </Button>
          )}
          {!isLive && (
            <Button size="small" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          )}
        </div>
      </Container>

      {isLive && <ScorecardSection key={`sc-${k}`} release={release} />}
      {!isLive && <GoLiveSection release={release} />}
      <BriefSection key={`brief-${k}`} release={release} />
      <ProductsSection release={release} />
      <AssetsSection key={`assets-${k}`} release={release} />
      <EconomicsSection key={`econ-${k}`} release={release} />
      {!isLive && <ScorecardSection key={`sc-${k}`} release={release} />}
    </div>
  )
}

export const handle = {
  breadcrumb: () => "Release",
}

export default ReleaseDetailPage
