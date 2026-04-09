import { DataSource } from 'typeorm';

/**
 * Idempotent bootstrap migration: adds completedAt, durationConfirmedBySeeker,
 * and durationConfirmedAt columns to the bookings table.
 * Called from main.ts before the app starts listening.
 */
export async function runAddCompletionDurationFieldsMigration(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "durationConfirmedBySeeker" BOOLEAN;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "durationConfirmedAt" TIMESTAMP;
  `);
}
