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

export default defineMiddlewares({
  routes: [
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
