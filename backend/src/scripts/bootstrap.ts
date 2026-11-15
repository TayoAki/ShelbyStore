import { MedusaModule } from "@medusajs/framework/modules-sdk"
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, RBAC_SUPER_ADMIN_ROLE_ID } from "@medusajs/framework/utils"
import { createUsersWorkflow, updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import seedContent from "./seed-content"
import seedShelby from "./seed"

/**
 * Runs as the Railway pre-deploy step, after migrations:
 *
 *   cd .medusa/server && npm run predeploy && npx medusa exec ./src/scripts/bootstrap.js
 *
 * Every step is idempotent, so it is safe on every deploy:
 * 1. SEED_DEMO_DATA=true seeds the demo catalog, releases and content series
 *    (both seeds skip themselves if their data already exists).
 * 2. With STRIPE_API_KEY set, makes sure every region offers Stripe.
 * 3. ADMIN_EMAIL + ADMIN_PASSWORD create the first admin user if it doesn't exist.
 */
export default async function bootstrap(args: ExecArgs) {
  const { container } = args
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (process.env.SEED_DEMO_DATA === "true") {
    await seedShelby(args)
    await seedContent(args)
  }

  if (process.env.STRIPE_API_KEY) {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name", "payment_providers.id"],
    })
    for (const region of regions as any[]) {
      const providers: string[] = (region.payment_providers ?? []).map((p: { id: string }) => p.id)
      if (!providers.includes("pp_stripe_stripe")) {
        await updateRegionsWorkflow(container).run({
          input: {
            selector: { id: region.id },
            update: { payment_providers: [...providers, "pp_stripe_stripe"] },
          },
        })
        logger.info(`[bootstrap] Enabled Stripe in region ${region.name}`)
      }
    }
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (email && password) {
    const userService = container.resolve(Modules.USER)
    const [existing] = await userService.listUsers({ email })
    if (existing) {
      logger.info(`[bootstrap] Admin ${email} already exists`)
    } else {
      // Same steps as `medusa user`: super-admin role when RBAC is on, then the
      // user, then an emailpass identity linked to it.
      let roles: { role_id: string }[] = []
      if (MedusaModule.isInstalled(Modules.RBAC)) {
        const rbac = container.resolve(Modules.RBAC) as any
        const superAdmin = await rbac.listRbacRoles({ id: RBAC_SUPER_ADMIN_ROLE_ID })
        if (superAdmin.length) roles = [{ role_id: superAdmin[0].id }]
      }
      const { result: users } = await createUsersWorkflow(container).run({
        input: { users: [{ email, roles } as any] },
      })
      const auth = container.resolve(Modules.AUTH)
      const { authIdentity, error } = await auth.register("emailpass", {
        body: { email, password },
      } as any)
      if (error || !authIdentity) {
        throw new Error(`[bootstrap] Could not create admin identity: ${error}`)
      }
      await auth.updateAuthIdentities({ id: authIdentity.id, app_metadata: { user_id: users[0].id } })
      logger.info(`[bootstrap] Created admin ${email}`)
    }
  }
}
