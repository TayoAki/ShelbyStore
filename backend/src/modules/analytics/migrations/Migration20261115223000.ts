import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Hand-written: one row per client/server `$insert_id`. Clients deliver
 * at-least-once (beacon on page hide + resend from the next page), so the
 * database is the final dedupe. Expression indexes can't be declared in the
 * data model, which is why this migration isn't generated.
 */
export class Migration20261115223000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`DELETE FROM "analytics_event" a USING "analytics_event" b
      WHERE a.id > b.id
        AND (a.properties ->> '$insert_id') IS NOT NULL
        AND (a.properties ->> '$insert_id') = (b.properties ->> '$insert_id');`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_analytics_event_insert_id_unique"
      ON "analytics_event" ((properties ->> '$insert_id'))
      WHERE deleted_at IS NULL AND (properties ->> '$insert_id') IS NOT NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_analytics_event_insert_id_unique";`)
  }
}
