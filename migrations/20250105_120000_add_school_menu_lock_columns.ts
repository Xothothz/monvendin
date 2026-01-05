import { sql } from "drizzle-orm";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS school_menus_id integer,
      ADD COLUMN IF NOT EXISTS school_menu_settings_id integer;
  `);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE payload_locked_documents_rels
      DROP COLUMN IF EXISTS school_menus_id,
      DROP COLUMN IF EXISTS school_menu_settings_id;
  `);
}
