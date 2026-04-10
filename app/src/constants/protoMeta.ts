export const protoMeta = {
  projectName: 'DateRabbit',
  tagline: 'Real dates. Real connection.',
  description: 'Paid dating platform. Real offline dates. Companions set their price, Seekers book and pay.',
  market: 'USA, 21+ only',
  status: 'QA Stage — 87.5% MVP coverage',

  roles: [
    {
      id: 'seeker',
      name: 'Seeker',
      description: 'Man looking for a companion date. Pays, books, verified via Stripe Identity + fingerprint.',
      color: '#4DF0FF',
    },
    {
      id: 'companion',
      name: 'Companion',
      description: 'Woman offering paid dates. Sets price, controls schedule, receives same-day Stripe payouts.',
      color: '#FF2A5F',
    },
    {
      id: 'guest',
      name: 'Guest',
      description: 'Unauthenticated visitor. Can browse landing page only.',
      color: '#999999',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Platform moderator. Manages users, cities, verifications, disputes.',
      color: '#F9A825',
    },
  ],

  flows: [
    {
      id: 'seeker-happy-path',
      name: 'Seeker Happy Path',
      steps: ['landing', 'auth-login', 'auth-otp', 'auth-role-select', 'auth-profile-setup', 'verify-intro', 'verify-photo-id', 'verify-selfie', 'verify-consent', 'verify-approved', 'seeker-home', 'booking-detail', 'booking-payment', 'booking-request-sent', 'seeker-bookings'],
    },
    {
      id: 'companion-happy-path',
      name: 'Companion Happy Path',
      steps: ['landing', 'auth-login', 'auth-otp', 'auth-role-select', 'comp-onboard-step2', 'comp-onboard-verify', 'comp-onboard-pending', 'comp-onboard-approved', 'comp-stripe-connect', 'comp-home', 'comp-requests', 'comp-calendar', 'comp-earnings'],
    },
  ],

  techStack: {
    frontend: 'React Native + Expo 52 + expo-router 4',
    backend: 'NestJS + PostgreSQL',
    payments: 'Stripe Connect Express',
    auth: 'Email OTP (dev: 000000)',
    icons: '@expo/vector-icons Feather only',
    styling: 'StyleSheet API — Neo-Brutalism',
  },
};
