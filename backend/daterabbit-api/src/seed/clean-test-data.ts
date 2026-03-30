import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Message, Conversation } from '../messages/entities/message.entity';
import { Verification } from '../verification/entities/verification.entity';
import { Review } from '../reviews/entities/review.entity';

// Load .env -- try backend root first, then project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'daterabbit',
  entities: [User, Booking, Message, Conversation, Verification, Review],
  synchronize: false,
  logging: false,
});

// ---------------------------------------------------------------------------
// Patterns that indicate test/garbage data
// ---------------------------------------------------------------------------

const GARBAGE_NAME_PATTERNS = [
  'NCC', 'DblC', 'Comp4', 'Debug', 'NoConf',
  'Test Companion', 'Test User', 'test',
];

const GARBAGE_BIO_VALUES = ['t', 'test', 'null', '', 'n', 'a', 'asdf'];

// ---------------------------------------------------------------------------
// Detection logic
// ---------------------------------------------------------------------------

function isGarbageCompanion(user: {
  name: string;
  bio: string | null;
  photos: any[];
  email: string;
}): { isGarbage: boolean; reason: string } {
  // Never touch seed data -- it has proper structure
  if (user.email?.endsWith('@seed.daterabbit.com')) {
    return { isGarbage: false, reason: '' };
  }

  // Check name against known garbage patterns
  for (const pattern of GARBAGE_NAME_PATTERNS) {
    if (user.name && user.name.toLowerCase().includes(pattern.toLowerCase())) {
      return { isGarbage: true, reason: `name matches pattern "${pattern}"` };
    }
  }

  // Check for garbage bio values
  const bioTrimmed = (user.bio || '').trim().toLowerCase();
  if (GARBAGE_BIO_VALUES.includes(bioTrimmed)) {
    return { isGarbage: true, reason: `bio is garbage value "${user.bio}"` };
  }

  // No photos AND name is very short (< 4 chars) or looks like abbreviation
  const hasPhotos = user.photos && user.photos.length > 0 &&
    user.photos.some((p: any) => p.url);
  if (!hasPhotos && user.name && user.name.length < 5) {
    return { isGarbage: true, reason: `no photos and short name "${user.name}"` };
  }

  return { isGarbage: false, reason: '' };
}

// ---------------------------------------------------------------------------
// Main cleanup
// ---------------------------------------------------------------------------

async function cleanTestData() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log(dryRun ? 'DRY RUN -- no data will be deleted' : 'LIVE RUN -- will delete garbage data');
  console.log('='.repeat(60));
  console.log(`Connecting to database...`);
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'daterabbit'}\n`);

  await AppDataSource.initialize();
  console.log('Connected.\n');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // -----------------------------------------------------------------------
    // 1. Find all companion users
    // -----------------------------------------------------------------------
    const allCompanions: any[] = await queryRunner.query(
      `SELECT id, name, email, bio, photos, rating, "reviewCount"
       FROM users
       WHERE role = 'companion' AND "deletedAt" IS NULL
       ORDER BY "createdAt" ASC`,
    );

    console.log(`Total companions in database: ${allCompanions.length}\n`);

    const garbageIds: string[] = [];
    const keepIds: string[] = [];

    for (const c of allCompanions) {
      const photos = typeof c.photos === 'string' ? JSON.parse(c.photos) : (c.photos || []);
      const { isGarbage, reason } = isGarbageCompanion({
        name: c.name,
        bio: c.bio,
        photos,
        email: c.email,
      });

      if (isGarbage) {
        garbageIds.push(c.id);
        console.log(`  [DELETE] "${c.name}" (${c.email || 'no email'}) -- ${reason}`);
      } else {
        keepIds.push(c.id);
        console.log(`  [KEEP]   "${c.name}" (${c.email || 'no email'})`);
      }
    }

    console.log(`\nGarbage companions: ${garbageIds.length}`);
    console.log(`Keeping companions: ${keepIds.length}\n`);

    // -----------------------------------------------------------------------
    // 2. Delete garbage companions and their related data
    // -----------------------------------------------------------------------
    if (garbageIds.length > 0 && !dryRun) {
      const ids = garbageIds.map((id) => `'${id}'`).join(',');

      console.log('Deleting related data...');

      // Delete messages where garbage user is sender or receiver
      const msgResult = await queryRunner.query(
        `DELETE FROM messages WHERE "senderId" IN (${ids}) OR "receiverId" IN (${ids})`,
      );
      console.log(`  Deleted ${msgResult?.[1] || 0} messages`);

      // Delete conversations
      const convResult = await queryRunner.query(
        `DELETE FROM conversations WHERE "user1Id" IN (${ids}) OR "user2Id" IN (${ids})`,
      );
      console.log(`  Deleted ${convResult?.[1] || 0} conversations`);

      // Delete bookings
      const bookResult = await queryRunner.query(
        `DELETE FROM bookings WHERE "seekerId" IN (${ids}) OR "companionId" IN (${ids})`,
      );
      console.log(`  Deleted ${bookResult?.[1] || 0} bookings`);

      // Delete reviews
      const revResult = await queryRunner.query(
        `DELETE FROM reviews WHERE "reviewerId" IN (${ids}) OR "revieweeId" IN (${ids})`,
      );
      console.log(`  Deleted ${revResult?.[1] || 0} reviews`);

      // Delete verifications
      const verResult = await queryRunner.query(
        `DELETE FROM verifications WHERE "userId" IN (${ids})`,
      );
      console.log(`  Deleted ${verResult?.[1] || 0} verifications`);

      // Delete favorites referencing garbage users
      try {
        await queryRunner.query(
          `DELETE FROM favorites WHERE "userId" IN (${ids}) OR "companionId" IN (${ids})`,
        );
      } catch {
        // Table may not exist
      }

      // Delete notifications
      try {
        await queryRunner.query(
          `DELETE FROM notifications WHERE "userId" IN (${ids})`,
        );
      } catch {
        // Table may not exist
      }

      // Finally delete the garbage users
      const userResult = await queryRunner.query(
        `DELETE FROM users WHERE id IN (${ids})`,
      );
      console.log(`  Deleted ${userResult?.[1] || 0} garbage companion users`);
    }

    // -----------------------------------------------------------------------
    // 3. Fix fake ratings: rating > 0 but reviewCount = 0
    // -----------------------------------------------------------------------
    console.log('\nFixing fake ratings (rating > 0 with 0 reviews)...');

    if (!dryRun) {
      const fixResult = await queryRunner.query(
        `UPDATE users SET rating = 0
         WHERE "reviewCount" = 0 AND rating > 0 AND "deletedAt" IS NULL`,
      );
      console.log(`  Fixed ${fixResult?.[1] || 0} users with fake ratings`);
    } else {
      const fakeRatings: any[] = await queryRunner.query(
        `SELECT id, name, rating, "reviewCount"
         FROM users
         WHERE "reviewCount" = 0 AND rating > 0 AND "deletedAt" IS NULL`,
      );
      for (const u of fakeRatings) {
        console.log(`  [WOULD FIX] "${u.name}" rating ${u.rating} -> 0 (0 reviews)`);
      }
      console.log(`  Would fix ${fakeRatings.length} users`);
    }

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    const remaining: any[] = await queryRunner.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'companion' AND "deletedAt" IS NULL`,
    );

    console.log('\n' + '='.repeat(60));
    console.log(dryRun ? 'DRY RUN COMPLETE' : 'CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`  Garbage removed: ${garbageIds.length}`);
    console.log(`  Companions remaining: ${remaining[0]?.count || '?'}`);
    console.log(`  Ratings fixed: reviewCount=0 -> rating=0`);

    if (dryRun) {
      console.log('\nRun without --dry-run to execute the cleanup.');
    }
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

cleanTestData().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
