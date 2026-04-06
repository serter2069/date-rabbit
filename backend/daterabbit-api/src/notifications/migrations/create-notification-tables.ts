import { DataSource } from 'typeorm';

/**
 * Idempotent bootstrap migration: creates notification_preferences and
 * notification_delivery_logs tables if they don't exist.
 * Called from main.ts before the app starts listening.
 * Needed because synchronize=false in production.
 */
export async function runNotificationTablesMigration(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" VARCHAR NOT NULL,
      "eventType" VARCHAR NOT NULL,
      "emailEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "pushEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "inappEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "UQ_notification_preferences_user_event" UNIQUE ("userId", "eventType")
    );
    CREATE INDEX IF NOT EXISTS "IDX_notification_preferences_userId"
      ON notification_preferences ("userId");

    CREATE TABLE IF NOT EXISTS notification_delivery_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "notificationId" VARCHAR NOT NULL,
      channel VARCHAR(10) NOT NULL,
      status VARCHAR(10) NOT NULL,
      error TEXT,
      "deduplicationKey" VARCHAR,
      "sentAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS "IDX_notif_delivery_logs_notifId_channel"
      ON notification_delivery_logs ("notificationId", channel);
    CREATE INDEX IF NOT EXISTS "IDX_notif_delivery_logs_dedupKey"
      ON notification_delivery_logs ("deduplicationKey")
      WHERE "deduplicationKey" IS NOT NULL;
  `);
}
