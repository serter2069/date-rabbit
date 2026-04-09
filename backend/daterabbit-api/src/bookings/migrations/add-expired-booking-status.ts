import { DataSource } from 'typeorm';

/**
 * Idempotent bootstrap migration: adds 'expired' value to bookingstatus_enum in Postgres.
 * Called from main.ts before the app starts listening.
 *
 * NOTE: Postgres does not support removing enum values, so there is no automatic rollback.
 * To roll back manually: you must rename the old enum type, create a new one without 'expired',
 * alter the column, and drop the old type.
 */
export async function runAddExpiredBookingStatusMigration(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    ALTER TYPE bookingstatus_enum ADD VALUE IF NOT EXISTS 'expired'
  `);
}
