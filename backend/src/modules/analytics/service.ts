import { Context } from "@medusajs/framework/types"
import { generateEntityId, InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils"
import type { EntityManager } from "@medusajs/framework/mikro-orm/knex"
import AnalyticsEvent from "./models/analytics-event"
import AnalyticsExperiment from "./models/analytics-experiment"
import { insertEventsQuery } from "../../lib/analytics/sql"
import type { EventRow } from "../../lib/analytics/ingest"

export type SqlQuery = { sql: string; params: unknown[] }

class AnalyticsModuleService extends MedusaService({
  AnalyticsEvent,
  AnalyticsExperiment,
}) {
  /**
   * Stores normalized events, skipping `$insert_id`s already present (clients
   * deliver at-least-once). Returns how many rows were inserted.
   */
  async ingestEvents(rows: EventRow[]): Promise<number> {
    let inserted = 0
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100).map((r) => ({ ...r, id: generateEntityId(undefined, "aev") }))
      inserted += (await this.runQuery(insertEventsQuery(chunk))).length
    }
    return inserted
  }

  /**
   * Runs a query built by src/lib/analytics/sql.
   * SQL text never contains user input; values travel as `?` bindings.
   */
  @InjectManager()
  async runQuery<T = Record<string, unknown>>(
    query: SqlQuery,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<T[]> {
    const rows = await sharedContext!.manager!.execute(query.sql, query.params as any[])
    return rows as T[]
  }
}

export default AnalyticsModuleService
