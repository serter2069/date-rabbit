import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * UC-048: Post-date time confirmation flow
 * - Adds 'pending_completion' to the booking_status enum
 * - Adds 3 new columns to the bookings table:
 *   completion_requested_at, completion_actual_hours, completion_confirmed_at
 */
export class AddPendingCompletionStatus1743763200000 implements MigrationInterface {
  name = 'AddPendingCompletionStatus1743763200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum value — PostgreSQL requires this to be done before ALTER TABLE
    await queryRunner.query(`
      ALTER TYPE "bookings_status_enum" ADD VALUE IF NOT EXISTS 'pending_completion'
    `);

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD COLUMN IF NOT EXISTS "completion_requested_at" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "completion_actual_hours" DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS "completion_confirmed_at" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns (reversible)
    await queryRunner.query(`
      ALTER TABLE "bookings"
        DROP COLUMN IF EXISTS "completion_requested_at",
        DROP COLUMN IF EXISTS "completion_actual_hours",
        DROP COLUMN IF EXISTS "completion_confirmed_at"
    `);

    // Note: PostgreSQL does not support DROP VALUE from enum.
    // To fully revert the enum, a full enum recreation would be needed.
    // For safety, we leave the enum value in place on rollback.
  }
}
