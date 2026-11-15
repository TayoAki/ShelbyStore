import { Button, Container, Heading, StatusBadge, Text, usePrompt } from "@medusajs/ui"
import { useNavigate, useParams } from "react-router-dom"
import { EpisodesSection } from "../../../components/content/episodes"
import { SeriesScorecardSection } from "../../../components/content/scorecard"
import { FormatSection, StanceSection } from "../../../components/content/stance"
import { SERIES_STATUS_COLOR, useDeleteSeries, useSeries, useUpdateSeries } from "../../../lib/content"

const SeriesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { data, isLoading, dataUpdatedAt } = useSeries(id!)
  const update = useUpdateSeries(id!)
  const remove = useDeleteSeries(id!)

  if (isLoading || !data) {
    return (
      <Container className="px-6 py-4">
        <Text size="small">Loading…</Text>
      </Container>
    )
  }
  const { series, readiness } = data
  const k = `${series.id}-${dataUpdatedAt}`

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Heading level="h1">{series.title}</Heading>
            <StatusBadge color={SERIES_STATUS_COLOR[series.status]}>{series.status}</StatusBadge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {series.channel} · {series.owner ?? "No owner"} · {series.episodes.length} episode
            {series.episodes.length === 1 ? "" : "s"}
          </Text>
        </div>
        <div className="flex gap-x-2">
          {series.status === "draft" && (
            <Button
              size="small"
              disabled={!readiness.ready}
              onClick={() => update.mutate({ status: "piloting" })}
              isLoading={update.isPending}
            >
              Start pilot
            </Button>
          )}
          {(series.status === "continue" || series.status === "revise") && (
            <Button size="small" onClick={() => update.mutate({ status: "piloting" })}>
              Start next batch
            </Button>
          )}
          {series.status !== "draft" && (
            <Button size="small" variant="secondary" onClick={() => update.mutate({ status: "draft" })}>
              Back to draft
            </Button>
          )}
          <Button
            size="small"
            variant="danger"
            onClick={async () => {
              if (await prompt({ title: "Delete this series?", description: "Episodes and their metrics are removed." })) {
                remove.mutate(undefined, { onSuccess: () => navigate("/content") })
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Container>
      {series.status !== "draft" && <SeriesScorecardSection key={`sc-${k}`} detail={data} />}
      <StanceSection key={`st-${k}`} detail={data} />
      <FormatSection key={`fm-${k}`} detail={data} />
      <EpisodesSection detail={data} />
    </div>
  )
}

export const handle = { breadcrumb: () => "Series" }
export default SeriesPage
