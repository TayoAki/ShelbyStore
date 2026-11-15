import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115210025 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "content_episode" drop constraint if exists "content_episode_asset_key_unique";`);
    this.addSql(`alter table if exists "content_series" drop constraint if exists "content_series_handle_unique";`);
    this.addSql(`create table if not exists "content_series" ("id" text not null, "title" text not null, "handle" text not null, "goal" text null, "audience" text null, "stance" text null, "competitor_swap_passed" boolean not null default false, "competitor_swap_notes" text null, "proof" text null, "audience_question" text null, "format" text null, "format_source" text null, "beat_sheet" jsonb null, "participation_prompt" text null, "channel" text not null default 'tiktok', "owner" text null, "production_hours_budget" real null, "episode_target" integer not null default 4, "baseline_avg_pct_viewed" real null, "baseline_participation_per_1k" real null, "baseline_orders_per_post" real null, "status" text check ("status" in ('draft', 'piloting', 'continue', 'revise', 'paused')) not null default 'draft', "decision" text check ("decision" in ('continue', 'revise', 'pause')) null, "revision_target" text check ("revision_target" in ('opening', 'topic', 'booking_path')) null, "decision_notes" text null, "next_change" text null, "decided_by" text null, "decided_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_series_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_series_handle_unique" ON "content_series" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_series_deleted_at" ON "content_series" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "content_episode" ("id" text not null, "title" text not null, "subject" text null, "asset_key" text not null, "landing_path" text not null default '/', "post_url" text null, "published_at" timestamptz null, "metrics_recorded_at" timestamptz null, "views" integer null, "avg_pct_viewed" real null, "relevant_comments" integer null, "submissions" integer null, "production_hours" real null, "audience_language" text null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "content_episode_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_content_episode_asset_key_unique" ON "content_episode" ("asset_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_episode_series_id" ON "content_episode" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_content_episode_deleted_at" ON "content_episode" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "content_episode" add constraint "content_episode_series_id_foreign" foreign key ("series_id") references "content_series" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "content_episode" drop constraint if exists "content_episode_series_id_foreign";`);

    this.addSql(`drop table if exists "content_series" cascade;`);

    this.addSql(`drop table if exists "content_episode" cascade;`);
  }

}
