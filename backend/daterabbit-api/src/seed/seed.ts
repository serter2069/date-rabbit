import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User, UserRole, UserVerificationStatus } from '../users/entities/user.entity';
import { Booking, BookingStatus, ActivityType } from '../bookings/entities/booking.entity';
import { Message, Conversation } from '../messages/entities/message.entity';
import { Verification } from '../verification/entities/verification.entity';

// Load .env — try backend root first, then project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'daterabbit',
  entities: [User, Booking, Message, Conversation, Verification],
  synchronize: false,
  logging: false,
});

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

interface CompanionSeed {
  name: string;
  email: string;
  age: number;
  location: string;
  bio: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: UserVerificationStatus;
}

const companionSeeds: CompanionSeed[] = [
  {
    name: 'Sophia Chen',
    email: 'sophia.chen@seed.daterabbit.com',
    age: 26,
    location: 'Manhattan, NYC',
    bio: "Art lover and museum enthusiast. I studied fine arts at NYU and love exploring galleries, discussing philosophy over coffee, and trying new restaurants. I'm warm, witty, and great at making people feel comfortable.",
    hourlyRate: 120,
    rating: 4.9,
    reviewCount: 47,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Isabella Romano',
    email: 'isabella.romano@seed.daterabbit.com',
    age: 29,
    location: 'Brooklyn, NYC',
    bio: 'Former dancer turned yoga instructor. I bring energy, laughter, and genuine curiosity to every conversation. Passionate about food, travel, and live music.',
    hourlyRate: 95,
    rating: 4.7,
    reviewCount: 31,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Mia Thompson',
    email: 'mia.thompson@seed.daterabbit.com',
    age: 24,
    location: 'West Village, NYC',
    bio: "Graduate student studying literature at Columbia. I love bookshops, rooftop bars, long walks in Central Park, and meaningful conversations. Let's explore the city together.",
    hourlyRate: 75,
    rating: 4.8,
    reviewCount: 22,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Ava Williams',
    email: 'ava.williams@seed.daterabbit.com',
    age: 31,
    location: 'Upper East Side, NYC',
    bio: 'Finance professional by day, jazz enthusiast by night. I know every great cocktail bar and jazz club in the city. Sophisticated, warm, and always up for an adventure.',
    hourlyRate: 160,
    rating: 5.0,
    reviewCount: 63,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@seed.daterabbit.com',
    age: 27,
    location: 'SoHo, NYC',
    bio: 'Fashion photographer with a passion for storytelling. I can recommend the best hidden gems in the city and make any evening feel special and memorable.',
    hourlyRate: 110,
    rating: 4.6,
    reviewCount: 18,
    isVerified: false,
    verificationStatus: UserVerificationStatus.PENDING_REVIEW,
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@seed.daterabbit.com',
    age: 25,
    location: 'Santa Monica, LA',
    bio: "Actress and improv comedian. Every date with me is an adventure — I bring spontaneity, humor, and heart. I love beach walks, comedy shows, and discovering LA's best tacos.",
    hourlyRate: 90,
    rating: 4.9,
    reviewCount: 29,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Charlotte Lee',
    email: 'charlotte.lee@seed.daterabbit.com',
    age: 30,
    location: 'Silver Lake, LA',
    bio: 'Music producer and vinyl collector. I know every hidden record shop and intimate music venue in LA. Creative, funny, and passionate about authentic experiences.',
    hourlyRate: 130,
    rating: 4.8,
    reviewCount: 35,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Luna Vasquez',
    email: 'luna.vasquez@seed.daterabbit.com',
    age: 23,
    location: 'Venice Beach, LA',
    bio: "Recent UCLA grad passionate about sustainability and wellness. Love paddleboarding, farmers markets, and rooftop dinners with city views. I'm adventurous, positive, and easy to talk to.",
    hourlyRate: 70,
    rating: 4.5,
    reviewCount: 11,
    isVerified: false,
    verificationStatus: UserVerificationStatus.IN_PROGRESS,
  },
  {
    name: 'Zoe Anderson',
    email: 'zoe.anderson@seed.daterabbit.com',
    age: 28,
    location: 'Los Feliz, LA',
    bio: 'Screenwriter with a thing for vintage cinema. I love dinner conversations about movies, life, and ideas. Warm, thoughtful, and genuinely interested in people.',
    hourlyRate: 105,
    rating: 4.7,
    reviewCount: 24,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Natalie Kim',
    email: 'natalie.kim@seed.daterabbit.com',
    age: 33,
    location: 'Beverly Hills, LA',
    bio: 'Interior designer and travel enthusiast who has been to 40+ countries. I love fine dining, gallery openings, and conversations that go late into the night.',
    hourlyRate: 175,
    rating: 4.9,
    reviewCount: 58,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Chloe Johnson',
    email: 'chloe.johnson@seed.daterabbit.com',
    age: 26,
    location: 'South Beach, Miami',
    bio: 'Marine biologist turned dive instructor. I love sunset sails, seafood dinners, and introducing people to the magic of the ocean. Fun, adventurous, and full of stories.',
    hourlyRate: 85,
    rating: 4.6,
    reviewCount: 20,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Aria Patel',
    email: 'aria.patel@seed.daterabbit.com',
    age: 29,
    location: 'Wynwood, Miami',
    bio: 'Street art curator and salsa dancer. I know every mural, gallery, and late-night spot in Miami. Vibrant, passionate, and always up for something unexpected.',
    hourlyRate: 100,
    rating: 4.8,
    reviewCount: 27,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Grace Wilson',
    email: 'grace.wilson@seed.daterabbit.com',
    age: 35,
    location: 'Brickell, Miami',
    bio: 'Investment banker who lives for weekend adventures. Love yacht parties, rooftop bars, and discovering new chef-driven restaurants. Sophisticated, sharp, and great fun.',
    hourlyRate: 200,
    rating: 4.9,
    reviewCount: 71,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Lily Taylor',
    email: 'lily.taylor@seed.daterabbit.com',
    age: 22,
    location: 'Miami Beach, Miami',
    bio: "Fashion design student with an eye for beauty and style. I love exploring art deco architecture, trying fusion cuisine, and making every moment feel effortlessly chic.",
    hourlyRate: 65,
    rating: 4.4,
    reviewCount: 8,
    isVerified: false,
    verificationStatus: UserVerificationStatus.NOT_STARTED,
  },
  {
    name: 'Harper Brown',
    email: 'harper.brown@seed.daterabbit.com',
    age: 32,
    location: 'Midtown, NYC',
    bio: 'Broadway actress and vocal coach. I bring drama (the fun kind), warmth, and incredible restaurant knowledge to every date. Love theater, karaoke, and honest conversations.',
    hourlyRate: 140,
    rating: 4.8,
    reviewCount: 42,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Scarlett Nguyen',
    email: 'scarlett.nguyen@seed.daterabbit.com',
    age: 27,
    location: 'Chelsea, NYC',
    bio: 'Tech startup founder who unwinds through cooking classes and hiking. I love balancing ambition with adventure — great at making people feel seen and heard.',
    hourlyRate: 115,
    rating: 4.7,
    reviewCount: 19,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Maya Robinson',
    email: 'maya.robinson@seed.daterabbit.com',
    age: 24,
    location: 'Astoria, NYC',
    bio: 'Pastry chef who moonlights as a food tour guide. I know the best hidden bakeries, wine bars, and dinner spots in every neighborhood. Sweet, funny, and easy to be around.',
    hourlyRate: 80,
    rating: 4.6,
    reviewCount: 15,
    isVerified: false,
    verificationStatus: UserVerificationStatus.PENDING_REVIEW,
  },
  {
    name: 'Stella Garcia',
    email: 'stella.garcia@seed.daterabbit.com',
    age: 31,
    location: 'Coral Gables, Miami',
    bio: 'Cultural diplomat and bilingual (Spanish/English) art historian. Love museum evenings, Latin jazz nights, and deep conversations about art and life over Cuban coffee.',
    hourlyRate: 125,
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
  {
    name: 'Penelope Clarke',
    email: 'penelope.clarke@seed.daterabbit.com',
    age: 34,
    location: 'Malibu, LA',
    bio: 'Wellness coach and surfer. I believe every great evening starts with being fully present. Love sunset dinners, breathwork sessions, and stargazing conversations.',
    hourlyRate: 155,
    rating: 3.8,
    reviewCount: 6,
    isVerified: false,
    verificationStatus: UserVerificationStatus.IN_PROGRESS,
  },
  {
    name: 'Victoria Scott',
    email: 'victoria.scott@seed.daterabbit.com',
    age: 28,
    location: 'Downtown LA',
    bio: 'Architect with a love for urban exploration and cocktail culture. I know the most beautiful rooftops, speakeasies, and architectural wonders across LA.',
    hourlyRate: 135,
    rating: 4.7,
    reviewCount: 26,
    isVerified: true,
    verificationStatus: UserVerificationStatus.APPROVED,
  },
];

interface SeekerSeed {
  name: string;
  email: string;
  age: number;
  location: string;
}

const seekerSeeds: SeekerSeed[] = [
  {
    name: 'James Mitchell',
    email: 'james.mitchell@seed.daterabbit.com',
    age: 38,
    location: 'Manhattan, NYC',
  },
  {
    name: 'David Park',
    email: 'david.park@seed.daterabbit.com',
    age: 31,
    location: 'West Hollywood, LA',
  },
  {
    name: 'Michael Torres',
    email: 'michael.torres@seed.daterabbit.com',
    age: 45,
    location: 'Brickell, Miami',
  },
  {
    name: "Ryan O'Brien",
    email: 'ryan.obrien@seed.daterabbit.com',
    age: 29,
    location: 'Brooklyn, NYC',
  },
  {
    name: 'Daniel Hoffman',
    email: 'daniel.hoffman@seed.daterabbit.com',
    age: 42,
    location: 'Century City, LA',
  },
];

// ---------------------------------------------------------------------------
// Realistic message conversations
// ---------------------------------------------------------------------------

interface ConversationScript {
  companionIdx: number;
  seekerIdx: number;
  messages: { fromCompanion: boolean; content: string }[];
}

const conversationScripts: ConversationScript[] = [
  {
    companionIdx: 0, // Sophia Chen
    seekerIdx: 0,   // James Mitchell
    messages: [
      { fromCompanion: false, content: "Hi Sophia! I came across your profile and I'm really impressed. I'd love to book an evening at MoMA — would that interest you?" },
      { fromCompanion: true, content: "Hi James! That sounds wonderful. MoMA is one of my favorite places — I was literally there last weekend for the new Basquiat exhibit. Would love to go!" },
      { fromCompanion: false, content: "Perfect! How does Friday evening look for you? Say around 6pm?" },
      { fromCompanion: true, content: "Friday at 6 works great. I'd suggest we start at MoMA, then maybe grab dinner at Le Bernardin after? It's a short walk and the food is incredible." },
      { fromCompanion: false, content: "Le Bernardin sounds perfect, I've been wanting to go there. Should I make a reservation?" },
      { fromCompanion: true, content: "Definitely make one — it books out fast. Ask for a table near the window if you can. I'll meet you at the MoMA entrance on 53rd Street at 6pm sharp!" },
      { fromCompanion: false, content: "Done! Reservation confirmed for 8:30pm. Looking forward to Friday, Sophia." },
      { fromCompanion: true, content: "Me too! I'll send you a few highlights to look out for at the exhibit beforehand. See you Friday!" },
    ],
  },
  {
    companionIdx: 3, // Ava Williams
    seekerIdx: 0,   // James Mitchell
    messages: [
      { fromCompanion: false, content: "Hey Ava, your jazz expertise caught my attention. Any chance you'd be up for a cocktail bar crawl this weekend?" },
      { fromCompanion: true, content: "Now you're speaking my language! I know exactly three spots that would make for a perfect evening. Are you a whiskey or gin person?" },
      { fromCompanion: false, content: "Whiskey, definitely. Old Fashioneds are my go-to." },
      { fromCompanion: true, content: "Then we start at Attaboy on Eldridge — they make them differently every time based on your mood. Then the Flatiron Room for jazz, and we end at Dear Irving if you're still standing." },
      { fromCompanion: false, content: "That sounds like an incredible night. Saturday evening?" },
      { fromCompanion: true, content: "Saturday's perfect. Meet me at Attaboy at 8pm — it's a speakeasy so no sign on the door, just knock." },
    ],
  },
  {
    companionIdx: 5, // Olivia Martinez
    seekerIdx: 1,   // David Park
    messages: [
      { fromCompanion: false, content: "Hi Olivia! Your improv comedy background is really cool. Would you be up for dinner and maybe a comedy show?" },
      { fromCompanion: true, content: "I love this idea! The Groundlings has a show this weekend that's genuinely hilarious — I know a couple of the performers. Want to do dinner first?" },
      { fromCompanion: false, content: "That'd be amazing! Do you have a restaurant in mind?" },
      { fromCompanion: true, content: "Republique on La Brea — their Saturday brunch is legendary but dinner is even better. We can eat around 7, show starts at 9:30. Perfect timing." },
      { fromCompanion: false, content: "Sold! I'll book Republique. This is already sounding like a great Saturday." },
      { fromCompanion: true, content: "It will be! Fair warning: I might make you do one improv exercise before the show. Don't worry, it's painless." },
      { fromCompanion: false, content: "Now I'm mildly terrified but also intrigued. See you Saturday!" },
    ],
  },
  {
    companionIdx: 9, // Natalie Kim
    seekerIdx: 4,   // Daniel Hoffman
    messages: [
      { fromCompanion: false, content: "Natalie, 40+ countries — that's incredible. I travel a lot for work but always feel like I miss the real experience. Would love your company for dinner." },
      { fromCompanion: true, content: "I completely understand that feeling! There's a difference between visiting a place and actually experiencing it. What kind of cuisine are you in the mood for?" },
      { fromCompanion: false, content: "I'm open to anything. What's been your favorite culinary experience from your travels?" },
      { fromCompanion: true, content: "Morocco, without question. There's a Moroccan place in Beverly Hills called Tagine that genuinely transports you there. Low lighting, handmade ceramics, live oud music on weekends. Interested?" },
      { fromCompanion: false, content: "That sounds incredible. Thursday evening works for me?" },
      { fromCompanion: true, content: "Thursday's perfect. Book for 7:30, ask for the garden patio — they have heaters and it's magical at night. I'll tell you about the souks in Marrakech over dessert." },
      { fromCompanion: false, content: "Can't wait. Thank you for putting so much thought into this." },
      { fromCompanion: true, content: "That's genuinely what I love about this — curating experiences. See you Thursday, Daniel!" },
    ],
  },
  {
    companionIdx: 11, // Aria Patel
    seekerIdx: 2,    // Michael Torres
    messages: [
      { fromCompanion: false, content: "Hey Aria! The Wynwood art scene and salsa dancing combo on your profile is very cool. I'm visiting Miami next week — would love a local guide." },
      { fromCompanion: true, content: "Welcome to Miami! You picked the perfect week — there's a street art festival in Wynwood AND a salsa night at Ball & Chain in Little Havana. We could hit both!" },
      { fromCompanion: false, content: "That sounds perfect. I've never actually salsa danced though — will I embarrass myself?" },
      { fromCompanion: true, content: "Everyone's a beginner once! I can teach you the basic steps over dinner before we go. By the time we get to Ball & Chain you'll be holding your own, I promise." },
      { fromCompanion: false, content: "Deal. You're a braver person than me for offering. What day works best?" },
      { fromCompanion: true, content: "Friday — the festival is open late and Ball & Chain really gets going around 10pm. Start with dinner at 7?" },
      { fromCompanion: false, content: "Friday at 7. Looking forward to it!" },
      { fromCompanion: true, content: "Wear comfortable shoes! See you then." },
    ],
  },
  {
    companionIdx: 14, // Harper Brown
    seekerIdx: 3,    // Ryan O'Brien
    messages: [
      { fromCompanion: false, content: "Harper, Broadway actress AND you know great restaurants? You might be exactly the kind of company I've been looking for. Drinks sometime?" },
      { fromCompanion: true, content: "Ha! Well when you put it that way, how could I say no? What neighborhood are you in? I have strong opinions about where to drink depending on the borough." },
      { fromCompanion: false, content: "I'm in Williamsburg but I'm flexible. Happy to come to wherever you think is best." },
      { fromCompanion: true, content: "Then I'm taking you to the Dead Rabbit in FiDi — best cocktail bar in the world according to basically everyone who knows cocktails. It's an experience." },
      { fromCompanion: false, content: "Bold claim! I accept the challenge. When are you free?" },
      { fromCompanion: true, content: "Wednesday after 8 — I have a matinee that day. Fair warning: I will absolutely recite lines from the show if you ask me nicely." },
      { fromCompanion: false, content: "Wednesday at 8 it is. And I'm definitely asking." },
      { fromCompanion: true, content: "Perfect! See you at the Dead Rabbit. It's on Water Street — look for the Irish pub sign." },
    ],
  },
  {
    companionIdx: 1, // Isabella Romano
    seekerIdx: 3,   // Ryan O'Brien
    messages: [
      { fromCompanion: false, content: "Hi Isabella! I'm really into wellness lately and your yoga instructor background caught my eye. Would you be up for coffee?" },
      { fromCompanion: true, content: "Hi Ryan! Absolutely — though I'd suggest we do a short walk in Prospect Park first, then coffee after. I find people open up much more after moving a bit. Sound good?" },
      { fromCompanion: false, content: "I love that idea. I actually run in Prospect Park — it's one of my favorite places in the city." },
      { fromCompanion: true, content: "Then you know how magical it is! Let's meet at the boathouse at 10am on Sunday — walk for an hour, then coffee at Olmsted nearby. Their cortado is life-changing." },
      { fromCompanion: false, content: "Sunday at 10 works perfectly. The cortado alone has me sold." },
      { fromCompanion: true, content: "Ha! See you Sunday. It's going to be a beautiful day." },
    ],
  },
  {
    companionIdx: 6, // Charlotte Lee
    seekerIdx: 1,   // David Park
    messages: [
      { fromCompanion: false, content: "Charlotte — music producer and vinyl collector? That's a combination I need to know more about. Coffee or drinks?" },
      { fromCompanion: true, content: "Drinks, definitely. And if you're into music at all I want to take you to Origami Vinyl in Echo Park first — they have a listening room in the back. It's a whole experience." },
      { fromCompanion: false, content: "I grew up on vinyl. My dad had a huge collection. I'm 100% in — when?" },
      { fromCompanion: true, content: "Saturday afternoon? Origami at 3pm, dig through records for an hour, then we walk to Cha Cha Lounge for drinks at sunset. Very Silver Lake." },
      { fromCompanion: false, content: "That is the most Silver Lake itinerary I've ever heard, and I mean that as a huge compliment." },
      { fromCompanion: true, content: "Ha! I'll take it. See you Saturday at Origami — it's on Sunset, can't miss it." },
    ],
  },
  {
    companionIdx: 17, // Stella Garcia
    seekerIdx: 2,    // Michael Torres
    messages: [
      { fromCompanion: false, content: "Hola Stella! Your profile is exactly what I was looking for — Latin jazz and Cuban coffee sounds like my kind of evening." },
      { fromCompanion: true, content: "Hola Michael! Then you're in for a treat. Calle Ocho on a Thursday night is electric — there's a Cuban band that plays at Versailles restaurant until midnight. Interested?" },
      { fromCompanion: false, content: "Versailles! I've driven past it a hundred times but never went in. Thursday works perfectly." },
      { fromCompanion: true, content: "You'll love it. We'll start with a cafe con leche and pastelitos at 7, the music starts at 9. I'll give you a crash course in Cuban cultural history between bites." },
      { fromCompanion: false, content: "I could not ask for a better evening. Thank you for planning this, Stella." },
      { fromCompanion: true, content: "This is genuinely what I love to do. See you Thursday at Versailles on Calle Ocho — just say you're looking for Stella at the door!" },
    ],
  },
  {
    companionIdx: 2, // Mia Thompson
    seekerIdx: 4,   // Daniel Hoffman
    messages: [
      { fromCompanion: false, content: "Hi Mia! A Columbia lit student who loves bookshops? I feel like you might restore my faith in conversation. Coffee?" },
      { fromCompanion: true, content: "Ha! High praise and high stakes — I'll try to live up to it. Have you been to the Strand? New York's best bookshop, and they have great events." },
      { fromCompanion: false, content: "I used to go years ago when I lived in the city. Would love to revisit it with someone who actually knows books." },
      { fromCompanion: true, content: "Then Sunday is perfect — they have a reading at 2pm and their rare books room is open. We browse, attend the reading, then coffee at Think Coffee down the street?" },
      { fromCompanion: false, content: "That's a wonderful Sunday. What's the reading?" },
      { fromCompanion: true, content: "A debut novelist — I've read advance pages, it's genuinely good. You'll have plenty to critique afterward. See you at the Strand at 1:30?" },
      { fromCompanion: false, content: "1:30 at the Strand. Looking forward to it, Mia." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Connecting to database...');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'daterabbit'}`);

  await AppDataSource.initialize();
  console.log('Connected.\n');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // -----------------------------------------------------------------------
    // 1. Clear existing seed data (idempotent — only deletes seed rows)
    // -----------------------------------------------------------------------
    console.log('Clearing existing seed data...');

    const existingSeedUsers: { id: string }[] = await queryRunner.query(
      `SELECT id FROM users WHERE email LIKE '%@seed.daterabbit.com'`,
    );
    const seedUserIds = existingSeedUsers.map((u) => u.id);

    if (seedUserIds.length > 0) {
      const ids = seedUserIds.map((id) => `'${id}'`).join(',');
      await queryRunner.query(
        `DELETE FROM messages WHERE "senderId" IN (${ids}) OR "receiverId" IN (${ids})`,
      );
      await queryRunner.query(
        `DELETE FROM conversations WHERE "user1Id" IN (${ids}) OR "user2Id" IN (${ids})`,
      );
      await queryRunner.query(
        `DELETE FROM bookings WHERE "seekerId" IN (${ids}) OR "companionId" IN (${ids})`,
      );
      await queryRunner.query(`DELETE FROM verifications WHERE "userId" IN (${ids})`);
      await queryRunner.query(`DELETE FROM users WHERE id IN (${ids})`);
    }

    console.log('Done.\n');

    // -----------------------------------------------------------------------
    // 2. Create companion users
    // -----------------------------------------------------------------------
    console.log('Creating 20 companion users...');

    const userRepo = AppDataSource.getRepository(User);
    const companions: User[] = [];

    for (const c of companionSeeds) {
      const avatarSeed = c.name.replace(/\s+/g, '');
      const user = Object.assign(new User(), {
        email: c.email,
        name: c.name,
        role: UserRole.COMPANION,
        age: c.age,
        location: c.location,
        bio: c.bio,
        photos: [
          {
            id: crypto.randomUUID(),
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
            order: 0,
            isPrimary: true,
          },
          {
            id: crypto.randomUUID(),
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}Alt`,
            order: 1,
            isPrimary: false,
          },
        ],
        hourlyRate: c.hourlyRate,
        rating: c.rating,
        reviewCount: c.reviewCount,
        isVerified: c.isVerified,
        verificationStatus: c.verificationStatus,
        isActive: true,
      });

      const saved = await userRepo.save(user);
      companions.push(saved);
    }

    console.log(`  Created ${companions.length} companions.\n`);

    // -----------------------------------------------------------------------
    // 3. Create seeker users
    // -----------------------------------------------------------------------
    console.log('Creating 5 seeker users...');

    const seekers: User[] = [];

    for (const s of seekerSeeds) {
      const avatarSeed = s.name.replace(/['\s]+/g, '');
      const user = Object.assign(new User(), {
        email: s.email,
        name: s.name,
        role: UserRole.SEEKER,
        age: s.age,
        location: s.location,
        photos: [
          {
            id: crypto.randomUUID(),
            url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}Seeker`,
            order: 0,
            isPrimary: true,
          },
        ],
        rating: 5.0,
        reviewCount: 0,
        isVerified: false,
        verificationStatus: UserVerificationStatus.NOT_STARTED,
        isActive: true,
      });

      const saved = await userRepo.save(user);
      seekers.push(saved);
    }

    console.log(`  Created ${seekers.length} seekers.\n`);

    // -----------------------------------------------------------------------
    // 4. Create bookings
    // -----------------------------------------------------------------------
    console.log('Creating 15 bookings...');

    const bookingRepo = AppDataSource.getRepository(Booking);

    interface BookingDef {
      seekerIdx: number;
      companionIdx: number;
      daysOffset: number;
      duration: number;
      activity: ActivityType;
      location: string;
      notes?: string;
      status: BookingStatus;
      cancellationReason?: string;
    }

    const bookingDefs: BookingDef[] = [
      // Pending (5)
      {
        seekerIdx: 0, companionIdx: 0, daysOffset: 3,
        duration: 3, activity: ActivityType.MUSEUMS,
        location: 'MoMA, 11 W 53rd St, New York',
        notes: 'Looking forward to the Basquiat exhibit followed by dinner.',
        status: BookingStatus.PENDING,
      },
      {
        seekerIdx: 1, companionIdx: 5, daysOffset: 5,
        duration: 4, activity: ActivityType.DINNER,
        location: 'Republique, 624 S La Brea Ave, Los Angeles',
        notes: 'Dinner then Groundlings show. Very excited!',
        status: BookingStatus.PENDING,
      },
      {
        seekerIdx: 3, companionIdx: 14, daysOffset: 2,
        duration: 3, activity: ActivityType.DRINKS,
        location: 'Dead Rabbit, 30 Water St, New York',
        notes: 'Broadway recommendation for cocktails.',
        status: BookingStatus.PENDING,
      },
      {
        seekerIdx: 2, companionIdx: 11, daysOffset: 6,
        duration: 5, activity: ActivityType.EVENTS,
        location: 'Wynwood Arts District, Miami',
        notes: 'Street art festival and salsa night at Ball & Chain.',
        status: BookingStatus.PENDING,
      },
      {
        seekerIdx: 4, companionIdx: 9, daysOffset: 4,
        duration: 3, activity: ActivityType.DINNER,
        location: 'Tagine, 132 N Robertson Blvd, Beverly Hills',
        notes: 'Moroccan dinner — I love the sound of the garden patio.',
        status: BookingStatus.PENDING,
      },
      // Confirmed (4)
      {
        seekerIdx: 0, companionIdx: 3, daysOffset: 1,
        duration: 4, activity: ActivityType.DRINKS,
        location: 'Attaboy, 134 Eldridge St, New York',
        notes: 'Whiskey cocktail crawl: Attaboy, Flatiron Room, Dear Irving',
        status: BookingStatus.CONFIRMED,
      },
      {
        seekerIdx: 3, companionIdx: 1, daysOffset: 7,
        duration: 3, activity: ActivityType.WALK,
        location: 'Prospect Park Boathouse, Brooklyn',
        notes: 'Morning walk then coffee at Olmsted.',
        status: BookingStatus.CONFIRMED,
      },
      {
        seekerIdx: 1, companionIdx: 6, daysOffset: 2,
        duration: 4, activity: ActivityType.EVENTS,
        location: 'Origami Vinyl, 1816 W Sunset Blvd, Echo Park',
        notes: 'Vinyl browsing and listening room, then drinks at Cha Cha Lounge.',
        status: BookingStatus.CONFIRMED,
      },
      {
        seekerIdx: 2, companionIdx: 17, daysOffset: 3,
        duration: 4, activity: ActivityType.DINNER,
        location: 'Versailles, 3555 SW 8th St, Miami',
        notes: 'Cuban dinner and jazz on Calle Ocho Thursday.',
        status: BookingStatus.CONFIRMED,
      },
      // Completed (3)
      {
        seekerIdx: 4, companionIdx: 2, daysOffset: -7,
        duration: 3, activity: ActivityType.COFFEE,
        location: 'The Strand, 828 Broadway, New York',
        notes: 'Bookshop visit + reading event + Think Coffee',
        status: BookingStatus.COMPLETED,
      },
      {
        seekerIdx: 2, companionIdx: 12, daysOffset: -14,
        duration: 4, activity: ActivityType.DINNER,
        location: 'STK Miami, 1 SE 3rd Ave, Miami',
        notes: 'Great dinner, Grace had amazing recommendations!',
        status: BookingStatus.COMPLETED,
      },
      {
        seekerIdx: 0, companionIdx: 15, daysOffset: -10,
        duration: 3, activity: ActivityType.DRINKS,
        location: 'Apotheke, 9 Doyers St, New York',
        notes: 'Cocktail night in Chinatown. Stellar experience.',
        status: BookingStatus.COMPLETED,
      },
      // Cancelled (3)
      {
        seekerIdx: 1, companionIdx: 7, daysOffset: -5,
        duration: 2, activity: ActivityType.COFFEE,
        location: 'Venice Beach Boardwalk, Los Angeles',
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Change of plans, will rebook next week.',
      },
      {
        seekerIdx: 3, companionIdx: 4, daysOffset: -3,
        duration: 3, activity: ActivityType.DINNER,
        location: 'Lure Fishbar, 142 Mercer St, New York',
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Work emergency came up.',
      },
      {
        seekerIdx: 4, companionIdx: 18, daysOffset: -2,
        duration: 2, activity: ActivityType.WALK,
        location: 'Will Rogers State Beach, Malibu',
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Weather was terrible, rescheduling.',
      },
    ];

    const bookings: Booking[] = [];

    for (const def of bookingDefs) {
      const seeker = seekers[def.seekerIdx];
      const companion = companions[def.companionIdx];
      const dateTime = def.daysOffset >= 0 ? daysFromNow(def.daysOffset) : daysAgo(-def.daysOffset);
      dateTime.setHours(19, 0, 0, 0);

      const totalPrice = Number(companion.hourlyRate) * def.duration;

      const booking = Object.assign(new Booking(), {
        seekerId: seeker.id,
        companionId: companion.id,
        dateTime,
        duration: def.duration,
        activity: def.activity,
        location: def.location,
        notes: def.notes,
        totalPrice,
        status: def.status,
        cancellationReason: def.cancellationReason,
      });

      const saved = await bookingRepo.save(booking);
      bookings.push(saved);
    }

    console.log(`  Created ${bookings.length} bookings.\n`);

    // -----------------------------------------------------------------------
    // 5. Create conversations and messages
    // -----------------------------------------------------------------------
    console.log('Creating conversations with messages...');

    const messageRepo = AppDataSource.getRepository(Message);
    const conversationRepo = AppDataSource.getRepository(Conversation);

    let totalMessages = 0;

    for (const script of conversationScripts) {
      const companion = companions[script.companionIdx];
      const seeker = seekers[script.seekerIdx];

      // Create conversation (seeker = user1, companion = user2)
      const conversation = Object.assign(new Conversation(), {
        user1Id: seeker.id,
        user2Id: companion.id,
        lastMessageAt: new Date(),
      });
      const savedConversation = await conversationRepo.save(conversation);

      // Create messages with staggered timestamps (15 min apart)
      const baseTime = daysAgo(randomBetween(1, 14));
      let lastMessageId: string | undefined;

      for (let i = 0; i < script.messages.length; i++) {
        const msgDef = script.messages[i];
        const msgTime = new Date(baseTime.getTime() + i * 15 * 60 * 1000);

        const msg = Object.assign(new Message(), {
          senderId: msgDef.fromCompanion ? companion.id : seeker.id,
          receiverId: msgDef.fromCompanion ? seeker.id : companion.id,
          content: msgDef.content,
          isRead: i < script.messages.length - 1, // last message unread
          createdAt: msgTime,
        });

        const savedMsg = await messageRepo.save(msg);
        lastMessageId = savedMsg.id;
        totalMessages++;
      }

      // Update conversation with last message reference
      if (lastMessageId) {
        await conversationRepo.update(savedConversation.id, {
          lastMessageId,
          lastMessageAt: new Date(baseTime.getTime() + (script.messages.length - 1) * 15 * 60 * 1000),
        });
      }
    }

    console.log(`  Created ${conversationScripts.length} conversations with ${totalMessages} messages.\n`);

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    const pendingCount = bookings.filter((b) => b.status === BookingStatus.PENDING).length;
    const confirmedCount = bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length;
    const completedCount = bookings.filter((b) => b.status === BookingStatus.COMPLETED).length;
    const cancelledCount = bookings.filter((b) => b.status === BookingStatus.CANCELLED).length;

    console.log('='.repeat(50));
    console.log('Seed completed successfully!');
    console.log('='.repeat(50));
    console.log(`  Companions:    ${companions.length}`);
    console.log(`  Seekers:       ${seekers.length}`);
    console.log(`  Bookings:      ${bookings.length}`);
    console.log(`    Pending:     ${pendingCount}`);
    console.log(`    Confirmed:   ${confirmedCount}`);
    console.log(`    Completed:   ${completedCount}`);
    console.log(`    Cancelled:   ${cancelledCount}`);
    console.log(`  Conversations: ${conversationScripts.length}`);
    console.log(`  Messages:      ${totalMessages}`);
    console.log('='.repeat(50));
    console.log('\nSample test accounts (OTP: 000000 in DEV mode):');
    console.log('  Seeker:    james.mitchell@seed.daterabbit.com');
    console.log('  Companion: sophia.chen@seed.daterabbit.com');
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
