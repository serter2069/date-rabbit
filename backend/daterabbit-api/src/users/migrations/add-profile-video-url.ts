import { DataSource } from 'typeorm';

/**
 * Idempotent migration: adds profileVideoUrl column to users table.
 * Called from main.ts before the app starts listening.
 */
export async function runAddProfileVideoUrlMigration(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profileVideoUrl" VARCHAR;
  `);
}
