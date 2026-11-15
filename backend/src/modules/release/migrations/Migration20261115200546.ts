import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115200546 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "release" drop constraint if exists "release_handle_unique";`);
    this.addSql(`create table if not exists "release" ("id" text not null, "title" text not null, "handle" text not null, "tier" text check ("tier" in ('major', 'light')) not null default 'light', "status" text check ("status" in ('draft', 'scheduled', 'held', 'live', 'reviewed')) not null default 'draft', "release_at" timestamptz null, "published_at" timestamptz null, "story" text null, "product_promise" text null, "proof" text null, "hero_image" text null, "owner" text null, "backup_approver" text null, "assets" jsonb null, "check_mobile_pdp" boolean not null default false, "check_fulfillment" boolean not null default false, "check_channel_links" boolean not null default false, "check_tracking" boolean not null default false, "hold_reason" text null, "capacity_hours" real null, "actual_hours" real null, "launch_spend" real not null default 0, "fulfillment_cost_per_order" real not null default 0, "selling_cost_rate" real not null default 0, "contribution_floor" real null, "starting_units" integer null, "units_added" integer not null default 0, "returns_window_days" integer not null default 30, "decision" text check ("decision" in ('repeat', 'simplify', 'pause')) null, "decision_notes" text null, "decided_by" text null, "decided_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "release_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_release_handle_unique" ON "release" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_release_deleted_at" ON "release" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_release_status_release_at" ON "release" ("status", "release_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "release_reminder" ("id" text not null, "email" text null, "push_token" text null, "customer_id" text null, "notified_at" timestamptz null, "release_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "release_reminder_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_release_reminder_release_id" ON "release_reminder" ("release_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_release_reminder_deleted_at" ON "release_reminder" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "release_reminder" add constraint "release_reminder_release_id_foreign" foreign key ("release_id") references "release" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "release_reminder" drop constraint if exists "release_reminder_release_id_foreign";`);

    this.addSql(`drop table if exists "release" cascade;`);

    this.addSql(`drop table if exists "release_reminder" cascade;`);
  }

}
