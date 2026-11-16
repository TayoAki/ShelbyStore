import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  AdminCreateRelease,
  AdminReleaseDecision,
  AdminUpdateRelease,
  StoreCreateReminder,
} from "./validators"
import {
  AdminCreateEpisode,
  AdminCreateSeries,
  AdminSeriesDecision,
  AdminUpdateEpisode,
  AdminUpdateSeries,
} from "./admin/content-series/validators"
import {
  AdminCreateExperiment,
  AdminExperimentDecision,
  AdminExperimentStatus,
  AdminFunnelQuery,
  AdminTrendsQuery,
  AdminUpdateExperiment,
} from "./admin/analytics/validators"
import { StoreAnalyticsBatch } from "./store/analytics/validators"
import { AdminUpdateCustomQuote, StoreCreateCustomQuote } from "./store/custom-quotes/validators"

export default defineMiddlewares({
  routes: [
    // Custom club and outing orders (/custom)
    {
      matcher: "/store/custom-quotes",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(StoreCreateCustomQuote)],
    },
    {
      matcher: "/admin/custom-quotes/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminUpdateCustomQuote)],
    },
    // First-party analytics
    { matcher: "/admin/analytics/funnel", methods: ["POST"], middlewares: [validateAndTransformBody(AdminFunnelQuery)] },
    { matcher: "/admin/analytics/trends", methods: ["POST"], middlewares: [validateAndTransformBody(AdminTrendsQuery)] },
    {
      matcher: "/admin/analytics/experiments",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateExperiment)],
    },
    {
      matcher: "/admin/analytics/experiments/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminUpdateExperiment)],
    },
    {
      matcher: "/admin/analytics/experiments/:id/status",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminExperimentStatus)],
    },
    {
      matcher: "/admin/analytics/experiments/:id/decision",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminExperimentDecision)],
    },
    {
      matcher: "/store/analytics/events",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(StoreAnalyticsBatch)],
    },
    {
      matcher: "/admin/releases",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateRelease)],
    },
    {
      matcher: "/admin/releases/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminUpdateRelease)],
    },
    {
      matcher: "/admin/releases/:id/decision",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminReleaseDecision)],
    },
    {
      matcher: "/admin/content-series",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateSeries)],
    },
    {
      matcher: "/admin/content-series/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminUpdateSeries)],
    },
    {
      matcher: "/admin/content-series/:id/episodes",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateEpisode)],
    },
    {
      matcher: "/admin/content-series/:id/episodes/:episodeId",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminUpdateEpisode)],
    },
    {
      matcher: "/admin/content-series/:id/decision",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(AdminSeriesDecision)],
    },
    {
      matcher: "/store/releases/:handle/reminders",
      methods: ["POST"],
      middlewares: [
        // Signed-in customers get their reminder linked to their account.
        authenticate("customer", ["session", "bearer"], { allowUnauthenticated: true }),
        validateAndTransformBody(StoreCreateReminder),
      ],
    },
  ],
})
