import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261116063655 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "custom_quote" ("id" text not null, "name" text not null, "email" text not null, "organisation" text not null, "quantity" integer not null, "colors" jsonb not null, "needed_by" timestamptz null, "artwork_url" text null, "notes" text null, "rights_confirmed" boolean not null default false, "status" text check ("status" in ('new', 'quoted', 'won', 'lost')) not null default 'new', "source" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "custom_quote_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_quote_deleted_at" ON "custom_quote" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_quote_status_created_at" ON "custom_quote" ("status", "created_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "custom_quote" cascade;`);
  }

}
