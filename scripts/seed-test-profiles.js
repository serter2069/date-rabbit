#!/usr/bin/env node
/**
 * Seed script: Create realistic companion profiles with attractive photos
 * Uses i.pravatar.cc for portrait photos
 * Target: https://daterabbit-api.smartlaunchhub.com/api
 *
 * In DEV_AUTH mode, OTP is always 000000 for any email
 */

const API_BASE = 'https://daterabbit-api.smartlaunchhub.com/api';

// Realistic companion profiles to seed
// Photos from i.pravatar.cc (portrait indices 1-70)
const COMPANIONS = [
  {
    email: 'isabella.romano@seed.daterabbit.com',
    name: 'Isabella Romano',
    age: 29,
    location: 'Brooklyn, NYC',
    bio: 'Italian-American artist and foodie. I love exploring hidden gems in Brooklyn — from artisan coffee shops to jazz clubs. I\'ll show you the NYC locals actually know. Fluent in English and Italian.',
    hourlyRate: 95,
    photoIndex: 12,
    rating: 4.9,
    reviewCount: 47,
  },
  {
    email: 'sophie.laurent@seed.daterabbit.com',
    name: 'Sophie Laurent',
    age: 26,
    location: 'SoHo, NYC',
    bio: 'Fashion stylist and gallery curator. NYC is my canvas — I\'ll take you to gallery openings, rooftop bars, and secret supper clubs. Perfect companion for art lovers and culture enthusiasts.',
    hourlyRate: 120,
    photoIndex: 17,
    rating: 4.8,
    reviewCount: 63,
  },
  {
    email: 'elena.vasquez@seed.daterabbit.com',
    name: 'Elena Vasquez',
    age: 31,
    location: 'Upper East Side, NYC',
    bio: 'Former ballet dancer turned lifestyle coach. I bring elegance and grace to every experience. Whether it\'s a gala event or a quiet walk in Central Park, I make every moment memorable.',
    hourlyRate: 160,
    photoIndex: 23,
    rating: 5.0,
    reviewCount: 89,
  },
  {
    email: 'nina.chen@seed.daterabbit.com',
    name: 'Nina Chen',
    age: 24,
    location: 'Williamsburg, NYC',
    bio: 'Music producer and vinyl collector. Brooklyn\'s music scene is my playground. I\'ll introduce you to underground venues, record stores, and the most authentic live music New York has to offer.',
    hourlyRate: 75,
    photoIndex: 31,
    rating: 4.7,
    reviewCount: 28,
  },
  {
    email: 'camille.dubois@seed.daterabbit.com',
    name: 'Camille Dubois',
    age: 33,
    location: 'West Village, NYC',
    bio: 'Parisian expat, wine sommelier, and author. I moved to NYC for love and stayed for the energy. Let me pair your evening with the perfect bottle and conversation that flows like poetry.',
    hourlyRate: 175,
    photoIndex: 44,
    rating: 4.9,
    reviewCount: 112,
  },
  {
    email: 'jade.nakamura@seed.daterabbit.com',
    name: 'Jade Nakamura',
    age: 27,
    location: 'Venice Beach, LA',
    bio: 'Yoga instructor and surf enthusiast. LA sunshine is my natural habitat. From beachside meditation at sunrise to rooftop cocktails at sunset — I make every hour feel like magic.',
    hourlyRate: 85,
    photoIndex: 52,
    rating: 4.8,
    reviewCount: 34,
  },
  {
    email: 'aurora.banks@seed.daterabbit.com',
    name: 'Aurora Banks',
    age: 28,
    location: 'Beverly Hills, LA',
    bio: 'Entertainment industry insider and aspiring actress. I know every VIP lounge, rooftop pool, and A-list event in LA. Your guide to the glamorous side of Hollywood life.',
    hourlyRate: 200,
    photoIndex: 58,
    rating: 5.0,
    reviewCount: 76,
  },
  {
    email: 'maya.okonkwo@seed.daterabbit.com',
    name: 'Maya Okonkwo',
    age: 25,
    location: 'Silver Lake, LA',
    bio: 'Visual artist and vintage fashion lover. I thrive in LA\'s creative underground — art studios, indie film screenings, and the best tacos you\'ve never heard of. Authentic experiences only.',
    hourlyRate: 70,
    photoIndex: 62,
    rating: 4.6,
    reviewCount: 19,
  },
  {
    email: 'anya.kozlov@seed.daterabbit.com',
    name: 'Anya Kozlov',
    age: 30,
    location: 'Santa Monica, LA',
    bio: 'Russian-born fitness model and personal trainer. Health-conscious adventures are my specialty — from Malibu hiking trails to organic farm dinners. Beautiful inside and out.',
    hourlyRate: 110,
    photoIndex: 7,
    rating: 4.9,
    reviewCount: 55,
  },
  {
    email: 'bianca.moretti@seed.daterabbit.com',
    name: 'Bianca Moretti',
    age: 34,
    location: 'Brickell, Miami',
    bio: 'Miami-born entrepreneur and boat enthusiast. I live between sun-soaked yacht parties and intimate jazz nights in Little Havana. Let me show you the Miami that dreams are made of.',
    hourlyRate: 190,
    photoIndex: 15,
    rating: 4.9,
    reviewCount: 98,
  },
  {
    email: 'valentina.reyes@seed.daterabbit.com',
    name: 'Valentina Reyes',
    age: 23,
    location: 'Wynwood, Miami',
    bio: 'Colombian street artist and salsa dancer. Wynwood is my home — murals, galleries, and beats you can feel in your bones. Come dance with Miami\'s most vibrant spirit.',
    hourlyRate: 65,
    photoIndex: 21,
    rating: 4.7,
    reviewCount: 22,
  },
  {
    email: 'diana.sterling@seed.daterabbit.com',
    name: 'Diana Sterling',
    age: 36,
    location: 'Coral Gables, Miami',
    bio: 'International business consultant and polo enthusiast. Sophistication is my second language. Whether it\'s a black-tie gala or a private beach soirée, I bring unmatched poise and charm.',
    hourlyRate: 250,
    photoIndex: 35,
    rating: 5.0,
    reviewCount: 134,
  },
  {
    email: 'freya.anderson@seed.daterabbit.com',
    name: 'Freya Anderson',
    age: 22,
    location: 'South Beach, Miami',
    bio: 'Swedish model and beach volleyball player. Life is one long summer in Miami. Let\'s make it unforgettable — from sunrise paddleboarding to moonlit rooftop parties.',
    hourlyRate: 80,
    photoIndex: 41,
    rating: 4.8,
    reviewCount: 31,
  },
  {
    email: 'priya.sharma@seed.daterabbit.com',
    name: 'Priya Sharma',
    age: 28,
    location: 'Chelsea, NYC',
    bio: 'Tech entrepreneur and Bollywood dance teacher. I bridge worlds — Silicon Alley startup culture by day, electrifying dance floors by night. Full of energy, stories, and genuine warmth.',
    hourlyRate: 130,
    photoIndex: 48,
    rating: 4.8,
    reviewCount: 67,
  },
  {
    email: 'lucia.fontana@seed.daterabbit.com',
    name: 'Lucia Fontana',
    age: 32,
    location: 'Malibu, LA',
    bio: 'Chef and food writer. My kitchen has been featured in three magazines. I\'ll cook you a sunset dinner on the cliff, take you wine tasting in Malibu, and teach you that the best conversations happen over food.',
    hourlyRate: 145,
    photoIndex: 55,
    rating: 4.9,
    reviewCount: 82,
  },
];

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
  // Send OTP
  const startRes = await apiRequest('POST', '/auth/start', { email });
  if (startRes.status !== 201 && startRes.status !== 200) {
    throw new Error(`Failed to start auth for ${email}: ${JSON.stringify(startRes.data)}`);
  }

  // Verify with dev OTP
  const verifyRes = await apiRequest('POST', '/auth/verify', { email, code: '000000' });
  if (!verifyRes.data?.token) {
    throw new Error(`Failed to verify OTP for ${email}: ${JSON.stringify(verifyRes.data)}`);
  }

  return { token: verifyRes.data.token, user: verifyRes.data.user };
}

async function registerCompanion(token, companion) {
  const res = await apiRequest(
    'POST',
    '/auth/register',
    {
      name: companion.name,
      role: 'companion',
      age: companion.age,
      location: companion.location,
      bio: companion.bio,
      hourlyRate: companion.hourlyRate,
    },
    token,
  );
  return res;
}

async function updateProfile(token, updates) {
  const res = await apiRequest('PUT', '/users/me', updates, token);
  return res;
}

async function checkCompanionExists(name) {
  const res = await apiRequest('GET', `/companions?search=${encodeURIComponent(name)}&limit=5`);
  if (res.data?.companions) {
    return res.data.companions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
  }
  return null;
}

function generateUUID() {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildPhotos(photoIndex) {
  const url = `https://i.pravatar.cc/400?img=${photoIndex}`;
  return [
    {
      id: generateUUID(),
      url,
      order: 0,
      isPrimary: true,
    },
  ];
}

async function seedCompanion(companion) {
  console.log(`\n--- Seeding: ${companion.name} ---`);

  // Check if already exists with a photo
  const existing = await checkCompanionExists(companion.name);
  if (existing && existing.primaryPhoto) {
    console.log(`  SKIP: ${companion.name} already has a photo`);
    return { skipped: true };
  }

  // Authenticate
  let token;
  let isNewUser = false;

  try {
    const authResult = await authenticateUser(companion.email);
    token = authResult.token;
    isNewUser = authResult.user?.name === companion.name ? false : !authResult.user?.role;
    console.log(`  Auth: OK (existing user: ${!authResult.user?.name?.includes('seed')})`);

    // Check if already registered as companion
    if (authResult.user?.role === 'companion') {
      console.log(`  Already a companion, will update profile`);
      // Just update the profile with photos
      const photos = buildPhotos(companion.photoIndex);
      const updateRes = await updateProfile(token, {
        name: companion.name,
        age: companion.age,
        location: companion.location,
        bio: companion.bio,
        photos,
        hourlyRate: companion.hourlyRate,
      });
      if (updateRes.data?.id) {
        console.log(`  Updated: ${companion.name} with photo`);
        return { updated: true };
      } else {
        console.log(`  Update failed: ${JSON.stringify(updateRes.data)}`);
        return { error: true };
      }
    }
  } catch (err) {
    console.log(`  Auth failed: ${err.message}`);
    return { error: true };
  }

  // Register as companion
  const regRes = await registerCompanion(token, companion);
  if (regRes.data?.token) {
    // Registration returns a new token
    token = regRes.data.token;
    console.log(`  Registered as companion`);
  } else if (regRes.status === 400 && JSON.stringify(regRes.data).includes('already')) {
    console.log(`  Already registered, continuing with profile update`);
  } else if (regRes.status !== 200 && regRes.status !== 201) {
    console.log(`  Registration failed: ${JSON.stringify(regRes.data)}`);
    // Try to update anyway
  }

  // Update with photos
  const photos = buildPhotos(companion.photoIndex);
  const updateRes = await updateProfile(token, {
    name: companion.name,
    age: companion.age,
    location: companion.location,
    bio: companion.bio,
    photos,
    hourlyRate: companion.hourlyRate,
  });

  if (updateRes.data?.id) {
    console.log(`  Profile updated with photo: ${photos[0].url}`);
    return { created: true };
  } else {
    console.log(`  Profile update failed: ${JSON.stringify(updateRes.data)}`);
    return { error: true };
  }
}

async function main() {
  console.log('DateRabbit Companion Profile Seeder');
  console.log('=====================================');
  console.log(`Target API: ${API_BASE}`);
  console.log(`Profiles to seed: ${COMPANIONS.length}`);
  console.log('');

  // Verify API is reachable
  const healthRes = await apiRequest('GET', '/');
  console.log(`API status: ${healthRes.status}`);
  console.log('');

  const results = { created: 0, updated: 0, skipped: 0, errors: 0 };

  // Process in batches of 9 (under rate limit of 10/10min)
  // Between batches, wait 11 minutes to reset the throttle window
  const BATCH_SIZE = 9;
  const BATCH_WAIT_MS = 11 * 60 * 1000; // 11 minutes

  for (let i = 0; i < COMPANIONS.length; i++) {
    // Wait between batches (not before the first one)
    if (i > 0 && i % BATCH_SIZE === 0) {
      console.log(`\nBatch complete. Waiting 11 minutes for rate limit reset...`);
      console.log(`(${i}/${COMPANIONS.length} processed so far)`);
      await sleep(BATCH_WAIT_MS);
      console.log('Resuming...\n');
    }

    const companion = COMPANIONS[i];
    const result = await seedCompanion(companion);
    if (result.created) results.created++;
    else if (result.updated) results.updated++;
    else if (result.skipped) results.skipped++;
    else results.errors++;

    // Small delay between requests in same batch
    await sleep(300);
  }

  console.log('\n=====================================');
  console.log('Seeding complete!');
  console.log(`  Created: ${results.created}`);
  console.log(`  Updated: ${results.updated}`);
  console.log(`  Skipped: ${results.skipped}`);
  console.log(`  Errors:  ${results.errors}`);

  // Final companions list
  console.log('\nFinal companions with photos:');
  const finalRes = await apiRequest('GET', '/companions?limit=100');
  if (finalRes.data?.companions) {
    const withPhotos = finalRes.data.companions.filter((c) => c.primaryPhoto);
    console.log(`  Total with photos: ${withPhotos.length} / ${finalRes.data.total}`);
  }
}

main().catch(console.error);
