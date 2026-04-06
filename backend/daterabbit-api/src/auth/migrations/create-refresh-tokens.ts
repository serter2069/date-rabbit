import { DataSource } from 'typeorm';

/**
 * Idempotent bootstrap migration: creates refresh_tokens table if it doesn't exist.
 * Called from main.ts before the app starts listening.
 * Needed because synchronize=false in production (TypeORM auto-sync disabled).
 */
export async function runRefreshTokensMigration(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" UUID NOT NULL,
      "tokenHash" VARCHAR(64) NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "isRevoked" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "UQ_refresh_tokens_tokenHash" UNIQUE ("tokenHash")
    );
    CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_userId" ON refresh_tokens ("userId");
  `);
}
