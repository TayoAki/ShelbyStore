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
