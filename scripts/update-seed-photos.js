#!/usr/bin/env node
/**
 * Update existing seed companion profiles to use i.pravatar.cc portrait photos
 * Replaces dicebear SVG avatars with real face photos
 *
 * Run after rate limit resets (20 /start calls per hour limit)
 * Uses batching: 9 users per batch with 11-minute waits between batches
 */

const API_BASE = 'https://daterabbit-api.smartlaunchhub.com/api';

// Photo assignments: companion email -> photo index on i.pravatar.cc/400?img=N
const COMPANION_PHOTO_UPDATES = [
  { email: 'sophia.chen@seed.daterabbit.com',      name: 'Sophia Chen',      photoIndex: 5 },
  { email: 'isabella.romano@seed.daterabbit.com',  name: 'Isabella Romano',  photoIndex: 12 },
  { email: 'mia.thompson@seed.daterabbit.com',     name: 'Mia Thompson',     photoIndex: 19 },
  { email: 'ava.williams@seed.daterabbit.com',     name: 'Ava Williams',     photoIndex: 26 },
  { email: 'emma.davis@seed.daterabbit.com',       name: 'Emma Davis',       photoIndex: 33 },
  { email: 'olivia.martinez@seed.daterabbit.com',  name: 'Olivia Martinez',  photoIndex: 40 },
  { email: 'charlotte.lee@seed.daterabbit.com',    name: 'Charlotte Lee',    photoIndex: 47 },
  { email: 'luna.vasquez@seed.daterabbit.com',     name: 'Luna Vasquez',     photoIndex: 54 },
  { email: 'zoe.anderson@seed.daterabbit.com',     name: 'Zoe Anderson',     photoIndex: 61 },
  { email: 'natalie.kim@seed.daterabbit.com',      name: 'Natalie Kim',      photoIndex: 68 },
  { email: 'chloe.johnson@seed.daterabbit.com',    name: 'Chloe Johnson',    photoIndex: 75 },
  { email: 'aria.patel@seed.daterabbit.com',       name: 'Aria Patel',       photoIndex: 82 },
  { email: 'grace.wilson@seed.daterabbit.com',     name: 'Grace Wilson',     photoIndex: 89 },
  { email: 'lily.taylor@seed.daterabbit.com',      name: 'Lily Taylor',      photoIndex: 9 },
  { email: 'harper.brown@seed.daterabbit.com',     name: 'Harper Brown',     photoIndex: 16 },
  { email: 'scarlett.nguyen@seed.daterabbit.com',  name: 'Scarlett Nguyen',  photoIndex: 22 },
  { email: 'maya.robinson@seed.daterabbit.com',    name: 'Maya Robinson',    photoIndex: 29 },
  { email: 'stella.garcia@seed.daterabbit.com',    name: 'Stella Garcia',    photoIndex: 36 },
  { email: 'penelope.clarke@seed.daterabbit.com',  name: 'Penelope Clarke',  photoIndex: 43 },
  { email: 'victoria.scott@seed.daterabbit.com',   name: 'Victoria Scott',   photoIndex: 50 },
];

// Additional new companions from seed-test-profiles (remaining ones not yet updated)
const NEW_COMPANION_UPDATES = [
  { email: 'jade.nakamura@seed.daterabbit.com',    name: 'Jade Nakamura',    photoIndex: 52 },
  { email: 'maya.okonkwo@seed.daterabbit.com',     name: 'Maya Okonkwo',     photoIndex: 62 },
  { email: 'anya.kozlov@seed.daterabbit.com',      name: 'Anya Kozlov',      photoIndex: 7 },
  { email: 'valentina.reyes@seed.daterabbit.com',  name: 'Valentina Reyes',  photoIndex: 21 },
  { email: 'diana.sterling@seed.daterabbit.com',   name: 'Diana Sterling',   photoIndex: 35 },
  { email: 'freya.anderson@seed.daterabbit.com',   name: 'Freya Anderson',   photoIndex: 41 },
  { email: 'priya.sharma@seed.daterabbit.com',     name: 'Priya Sharma',     photoIndex: 48 },
  { email: 'lucia.fontana@seed.daterabbit.com',    name: 'Lucia Fontana',    photoIndex: 55 },
];

// All updates to process
const ALL_UPDATES = [...COMPANION_PHOTO_UPDATES, ...NEW_COMPANION_UPDATES];

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    return { status: response.status, data: text };
  }
}

async function authenticateUser(email) {
  const startRes = await apiRequest('POST', '/auth/start', { email });
  if (startRes.status === 429) {
    throw new Error(`Rate limited on /start`);
  }
  if (startRes.status !== 201 && startRes.status !== 200) {
    throw new Error(`Failed to start auth: ${JSON.stringify(startRes.data)}`);
  }

  const verifyRes = await apiRequest('POST', '/auth/verify', { email, code: '000000' });
  if (verifyRes.status === 429) {
    throw new Error(`Rate limited on /verify`);
  }
  if (!verifyRes.data?.token) {
    throw new Error(`Failed to verify: ${JSON.stringify(verifyRes.data)}`);
  }

  return { token: verifyRes.data.token, user: verifyRes.data.user };
}

async function checkHasRealPhoto(name) {
  const res = await apiRequest('GET', `/companions?search=${encodeURIComponent(name)}&limit=5`);
  if (res.data?.companions) {
    const match = res.data.companions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (match && match.primaryPhoto && !match.primaryPhoto.includes('dicebear')) {
      return true;
    }
  }
  return false;
}

async function updateCompanionPhoto(companion) {
  // Check if already has a real photo
  const alreadyReal = await checkHasRealPhoto(companion.name);
  if (alreadyReal) {
    return { skipped: true, reason: 'already has real photo' };
  }

  let authResult;
  try {
    authResult = await authenticateUser(companion.email);
  } catch (err) {
    return { error: true, reason: err.message };
  }

  const token = authResult.token;
  const primaryUrl = `https://i.pravatar.cc/400?img=${companion.photoIndex}`;
  const secondaryUrl = `https://i.pravatar.cc/400?img=${companion.photoIndex === 1 ? 70 : companion.photoIndex - 1}`;

  const photos = [
    { id: generateUUID(), url: primaryUrl, order: 0, isPrimary: true },
    { id: generateUUID(), url: secondaryUrl, order: 1, isPrimary: false },
  ];

  const updateRes = await apiRequest('PUT', '/users/me', { photos }, token);

  if (updateRes.data?.id) {
    return { updated: true, photoUrl: primaryUrl };
  }

  return { error: true, reason: JSON.stringify(updateRes.data) };
}

async function main() {
  console.log('DateRabbit Seed Photo Updater');
  console.log('==============================');
  console.log(`Target API: ${API_BASE}`);
  console.log(`Total profiles to check: ${ALL_UPDATES.length}`);
  console.log('');

  const results = { updated: 0, skipped: 0, errors: 0, errorDetails: [] };

  // Process in batches of 9 (under 10/10min verify rate limit)
  const BATCH_SIZE = 9;
  const BATCH_WAIT_MS = 11 * 60 * 1000; // 11 minutes between batches

  for (let i = 0; i < ALL_UPDATES.length; i++) {
    // Wait between batches
    if (i > 0 && i % BATCH_SIZE === 0) {
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE)} complete.`);
      console.log(`Progress: ${i}/${ALL_UPDATES.length}`);
      console.log(`Waiting 11 minutes for rate limit reset...`);
      await sleep(BATCH_WAIT_MS);
      console.log('Resuming...\n');
    }

    const companion = ALL_UPDATES[i];
    process.stdout.write(`[${i + 1}/${ALL_UPDATES.length}] ${companion.name}... `);

    const result = await updateCompanionPhoto(companion);

    if (result.skipped) {
      process.stdout.write(`SKIP (${result.reason})\n`);
      results.skipped++;
    } else if (result.updated) {
      process.stdout.write(`UPDATED -> ${result.photoUrl}\n`);
      results.updated++;
    } else {
      process.stdout.write(`ERROR: ${result.reason}\n`);
      results.errors++;
      results.errorDetails.push(`${companion.name}: ${result.reason}`);
    }

    // Small delay between requests
    await sleep(400);
  }

  console.log('\n==============================');
  console.log('Done!');
  console.log(`  Updated: ${results.updated}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  Errors:  ${results.errors}`);
  if (results.errorDetails.length > 0) {
    console.log('\nErrors:');
    results.errorDetails.forEach((e) => console.log(`  - ${e}`));
  }

  // Final stats
  const finalRes = await apiRequest('GET', '/companions?limit=100');
  if (finalRes.data?.companions) {
    const withReal = finalRes.data.companions.filter(
      (c) => c.primaryPhoto && !c.primaryPhoto.includes('dicebear'),
    );
    const withDicebear = finalRes.data.companions.filter(
      (c) => c.primaryPhoto && c.primaryPhoto.includes('dicebear'),
    );
    const noPhoto = finalRes.data.companions.filter((c) => !c.primaryPhoto);
    console.log(`\nFinal state (${finalRes.data.total} total companions):`);
    console.log(`  With real photos: ${withReal.length}`);
    console.log(`  With dicebear:    ${withDicebear.length}`);
    console.log(`  No photo:         ${noPhoto.length}`);
  }
}

main().catch(console.error);
