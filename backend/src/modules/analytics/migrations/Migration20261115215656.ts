import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115215656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "analytics_experiment" drop constraint if exists "analytics_experiment_key_unique";`);
    this.addSql(`create table if not exists "analytics_event" ("id" text not null, "event" text not null, "distinct_id" text not null, "session_id" text null, "occurred_at" timestamptz not null, "received_at" timestamptz not null, "path" text null, "url" text null, "referrer" text null, "asset" text null, "utm_source" text null, "utm_medium" text null, "utm_campaign" text null, "device_type" text null, "platform" text not null default 'web', "properties" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "analytics_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_event_deleted_at" ON "analytics_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_event_event_occurred_at" ON "analytics_event" ("event", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_event_distinct_id_occurred_at" ON "analytics_event" ("distinct_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_event_session_id" ON "analytics_event" ("session_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_event_asset" ON "analytics_event" ("asset") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "analytics_experiment" ("id" text not null, "key" text not null, "name" text not null, "hypothesis" text null, "audience" text null, "change_description" text null, "status" text check ("status" in ('draft', 'running', 'stopped')) not null default 'draft', "variants" jsonb not null, "funnel_steps" jsonb null, "minimum_sample" integer not null default 100, "started_at" timestamptz null, "ended_at" timestamptz null, "decision" text check ("decision" in ('ship', 'keep_control', 'iterate')) null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "analytics_experiment_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_analytics_experiment_key_unique" ON "analytics_experiment" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_analytics_experiment_deleted_at" ON "analytics_experiment" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "analytics_event" cascade;`);

    this.addSql(`drop table if exists "analytics_experiment" cascade;`);
  }

}
