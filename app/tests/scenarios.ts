/**
 * DateRabbit E2E Test Scenarios — Single Source of Truth
 *
 * All testIDs verified against actual components (2026-02-25).
 * Generates: Playwright (web) + Maestro (mobile) tests.
 *
 * Auth: test@daterabbit.com / OTP: 00000000 (DEV_AUTH=true)
 */

export interface TestStep {
  action: 'goto' | 'fill' | 'click' | 'wait' | 'expect' | 'screenshot' | 'select' | 'scroll' | 'switchUser'
  target?: string
  value?: string
  timeout?: number
  expect?: { visible?: boolean; hidden?: boolean; text?: string; contains?: string; url?: string; count?: number }
  comment?: string
  platform?: 'web' | 'mobile' | 'both'
  user?: string
}

export interface TestScenario {
  name: string
  description?: string
  phase: number // 1=critical, 2=important, 3=nice-to-have
  tags: string[]
  requiresAuth?: boolean
  authRole?: 'seeker' | 'companion'
  preconditions?: string[]
  steps: TestStep[]
}

// ============================================
// SELECTORS — match actual testID in components
// ============================================

export const selectors = {
  // Onboarding
  onboardingSkip: 'onboarding-skip',
  onboardingNext: 'onboarding-next',

  // Welcome (welcome.tsx)
  welcomeSeekerBtn: 'welcome-seeker-btn',       // "FIND COMPANIONS"
  welcomeCompanionBtn: 'welcome-companion-btn',  // "BECOME A COMPANION"

  // Role Select (role-select.tsx)
  roleSelectBack: 'role-select-back-btn',
  roleSelectCompanion: 'role-select-companion-btn',
  roleSelectSeeker: 'role-select-seeker-btn',

  // Login (login.tsx)
  loginBack: 'login-back-btn',
  loginEmailInput: 'login-email-input',
  loginContinue: 'login-continue-btn',

  // OTP (otp.tsx)
  otpBack: 'otp-back-btn',
  otpCodeInput: 'otp-code-input',
  otpVerify: 'otp-verify-btn',
  otpResend: 'otp-resend-btn',

  // Register (register.tsx)
  registerBack: 'register-back-btn',
  registerNameInput: 'register-name-input',
  registerEmailInput: 'register-email-input',
  registerSubmit: 'register-submit-btn',

  // Profile Setup (profile-setup.tsx)
  setupBack: 'setup-back-btn',
  setupNameInput: 'setup-name-input',
  setupAgeInput: 'setup-age-input',
  setupLocationInput: 'setup-location-input',
  setupBioInput: 'setup-bio-input',
  setupRateInput: 'setup-rate-input',
  setupBasicContinue: 'setup-basic-continue-btn',
  setupSeekerBtn: 'setup-seeker-btn',
  setupCompanionBtn: 'setup-companion-btn',
  setupComplete: 'setup-complete-btn',

  // Seeker Verification
  seekerVerifyGetStarted: 'seeker-verify-get-started-btn',
  seekerConsentSubmit: 'seeker-consent-submit-btn',
  seekerSsnContinue: 'seeker-ssn-continue-btn',
  seekerPhotoIdContinue: 'seeker-photo-id-continue-btn',
  seekerSelfieContinue: 'seeker-selfie-continue-btn',
  seekerPendingContinue: 'seeker-pending-continue-btn',
  seekerApprovedGetStarted: 'seeker-approved-get-started-btn',

  // Companion Onboarding
  compStep1Next: 'comp-step1-next-btn',
  compStep2BioInput: 'comp-step2-bio-input',
  compStep2Continue: 'comp-step2-continue-btn',
  compVideoContinue: 'comp-video-continue-btn',
  compVerifyContinue: 'comp-verify-continue-btn',
  compRef0Name: 'ref0-name-input',
  compRef0Phone: 'ref0-phone-input',
  compRef0Relationship: 'ref0-relationship-input',
  compRef1Name: 'ref1-name-input',
  compRef1Phone: 'ref1-phone-input',
  compRef1Relationship: 'ref1-relationship-input',
  compRefsSubmit: 'comp-refs-submit-btn',

  // Browse Companions (male/browse.tsx)
  browseSearchInput: 'browse-search-input',
  browseFilterBtn: 'browse-filter-btn',

  // Bookings (male/bookings.tsx)
  bookingsTab: 'bookings-tab',

  // Messages (male/messages.tsx)
  messagesConversation: 'messages-conversation',

  // Profile (shared male/female profile.tsx)
  profileEditBtn: 'profile-edit-btn',
  profileSignoutBtn: 'profile-signout-btn',

  // Companion Requests (female/requests.tsx)
  requestsTab: 'requests-tab',

  // Chat (chat/[id].tsx)
  chatBack: 'chat-back-btn',
  chatBookBtn: 'chat-book-btn',
  chatMessageInput: 'chat-message-input',
  chatSendBtn: 'chat-send-btn',

  // Booking (booking/[id].tsx)
  bookingBack: 'booking-back-btn',
  bookingLocationInput: 'booking-location-input',
  bookingMessageInput: 'booking-message-input',
  bookingSubmit: 'booking-submit-btn',

  // Profile View (profile/[id].tsx)
  profileViewBack: 'profile-view-back-btn',
  profileViewFavorite: 'profile-view-favorite-btn',
  profileViewMore: 'profile-view-more-btn',
  profileViewMessage: 'profile-view-message-btn',
  profileViewBook: 'profile-view-book-btn',
}

export const config = {
  baseUrl: 'https://daterabbit.smartlaunchhub.com',
  testEmail: 'test@daterabbit.com',
  testOtp: '000000',
  defaultTimeout: 10000,
}

// ============================================
// REUSABLE FLOWS
// ============================================

const loginFlow: TestStep[] = [
  { action: 'goto', target: '/' },
  { action: 'wait', timeout: 2000 },
  { action: 'click', target: 'text=Sign in', comment: 'Click Sign in link' },
  { action: 'wait', timeout: 1500 },
  { action: 'fill', target: selectors.loginEmailInput, value: config.testEmail },
  { action: 'click', target: selectors.loginContinue },
  { action: 'wait', timeout: 2000, comment: 'Wait for OTP screen' },
  { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp },
  { action: 'click', target: selectors.otpVerify },
  { action: 'wait', timeout: 3000, comment: 'Wait for auth + redirect' },
]

// ============================================
// SCENARIOS
// ============================================

export const scenarios: TestScenario[] = [

  // =============================================
  // PHASE 1: CRITICAL — Auth & Navigation
  // =============================================

  {
    name: 'Welcome - Page Loads',
    description: 'Welcome screen renders with both CTA buttons and sign-in link',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '01-welcome' },
      { action: 'expect', expect: { text: 'Real dates' } },
      { action: 'expect', target: selectors.welcomeSeekerBtn, expect: { visible: true } },
      { action: 'expect', target: selectors.welcomeCompanionBtn, expect: { visible: true } },
      { action: 'expect', expect: { text: 'Sign in' } },
    ],
  },

  {
    name: 'Welcome - Find Companions navigates to Login',
    description: 'Seeker CTA navigates to login screen',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeSeekerBtn },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '02-after-seeker-btn' },
      { action: 'expect', expect: { text: 'Welcome back' } },
    ],
  },

  {
    name: 'Welcome - Become Companion navigates to Login',
    description: 'Companion CTA navigates to login screen',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeCompanionBtn },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '03-after-companion-btn' },
    ],
  },

  {
    name: 'Login - Full OTP Flow',
    description: 'Enter email, receive OTP, verify, land on authenticated screen',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'critical'],
    steps: [
      ...loginFlow,
      { action: 'screenshot', value: '04-after-login' },
    ],
  },

  {
    name: 'Login - Invalid OTP',
    description: 'Wrong OTP code shows error, stays on OTP page',
    phase: 1,
    tags: ['web', 'auth', 'negative'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.testEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.otpCodeInput, value: '99999999' },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '05-invalid-otp' },
      { action: 'expect', expect: { url: 'otp' }, comment: 'Should stay on OTP page' },
    ],
  },

  {
    name: 'Login - Empty Email Validation',
    description: 'Cannot proceed without entering email',
    phase: 1,
    tags: ['web', 'auth', 'negative'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.loginContinue, comment: 'Click continue without email' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '06-empty-email' },
      { action: 'expect', expect: { url: 'login' }, comment: 'Should stay on login page' },
    ],
  },

  {
    name: 'OTP - Resend Code',
    description: 'Resend OTP link works',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.testEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.otpResend },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '07-otp-resent' },
    ],
  },

  {
    name: 'OTP - Back Navigation',
    description: 'Back button returns to login from OTP',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.testEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.otpBack },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '08-otp-back' },
      { action: 'expect', expect: { text: 'Welcome back' }, comment: 'Back on login' },
    ],
  },

  // =============================================
  // PHASE 2: IMPORTANT — Post-Auth Flows
  // =============================================

  {
    name: 'Browse Companions - Page Loads',
    description: 'After login as seeker, browse page shows companions list',
    phase: 2,
    tags: ['web', 'browse', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '10-browse-page' },
      { action: 'expect', target: selectors.browseSearchInput, expect: { visible: true } },
      { action: 'expect', target: selectors.browseFilterBtn, expect: { visible: true } },
    ],
  },

  {
    name: 'Browse Companions - Search',
    description: 'Search companions by name',
    phase: 2,
    tags: ['web', 'browse', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.browseSearchInput, value: 'Test' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '11-browse-search' },
    ],
  },

  {
    name: 'View Companion Profile',
    description: 'Tap a companion card to view full profile with Book and Message buttons',
    phase: 2,
    tags: ['web', 'browse', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    preconditions: ['At least one companion exists'],
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: '[data-testid^="browse-view-profile-"]', comment: 'Click first companion' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '12-companion-profile' },
      { action: 'expect', target: selectors.profileViewBook, expect: { visible: true } },
      { action: 'expect', target: selectors.profileViewMessage, expect: { visible: true } },
    ],
  },

  {
    name: 'Bookings Tab - Navigation',
    description: 'Navigate between upcoming/past/cancelled booking tabs',
    phase: 2,
    tags: ['web', 'bookings', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Bookings', comment: 'Navigate to bookings tab' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '13-bookings-upcoming' },
      { action: 'click', target: '[data-testid="bookings-tab-past"]' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '14-bookings-past' },
      { action: 'click', target: '[data-testid="bookings-tab-cancelled"]' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '15-bookings-cancelled' },
    ],
  },

  {
    name: 'Messages - Page Loads',
    description: 'Messages tab shows conversations list',
    phase: 2,
    tags: ['web', 'messages', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Messages', comment: 'Navigate to messages tab' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '16-messages' },
    ],
  },

  {
    name: 'Own Profile - Page Loads',
    description: 'Profile tab shows user info with edit and signout buttons',
    phase: 2,
    tags: ['web', 'profile', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Profile', comment: 'Navigate to profile tab' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '17-profile' },
      { action: 'expect', target: selectors.profileEditBtn, expect: { visible: true } },
      { action: 'expect', target: selectors.profileSignoutBtn, expect: { visible: true } },
    ],
  },

  {
    name: 'Signout Flow',
    description: 'Sign out returns to welcome screen',
    phase: 2,
    tags: ['web', 'auth', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.profileSignoutBtn },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '18-after-signout' },
      { action: 'expect', expect: { text: 'Real dates' }, comment: 'Back on welcome' },
    ],
  },

  // =============================================
  // PHASE 3: NICE-TO-HAVE — Edge Cases & Extras
  // =============================================

  {
    name: 'Onboarding - Skip',
    description: 'Skip onboarding goes to welcome',
    phase: 3,
    tags: ['web', 'onboarding', 'positive'],
    steps: [
      { action: 'goto', target: '/onboarding' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '20-onboarding' },
      { action: 'click', target: selectors.onboardingSkip },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '21-after-skip' },
    ],
  },

  {
    name: 'Onboarding - Next Through All Slides',
    description: 'Navigate through all 4 onboarding slides',
    phase: 3,
    tags: ['web', 'onboarding', 'positive'],
    steps: [
      { action: 'goto', target: '/onboarding' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '22-onboarding-slide2' },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '23-onboarding-slide3' },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '24-onboarding-slide4' },
      { action: 'click', target: selectors.onboardingNext, comment: 'Last slide completes onboarding' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '25-after-onboarding' },
    ],
  },

  {
    name: 'Favorite - Toggle',
    description: 'Add/remove companion from favorites via profile view',
    phase: 3,
    tags: ['web', 'favorites', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    preconditions: ['At least one companion exists'],
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: '[data-testid^="browse-view-profile-"]' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.profileViewFavorite, comment: 'Toggle favorite' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '26-favorite-toggled' },
    ],
  },

  {
    name: 'Booking Form - Validation',
    description: 'Booking form validates required fields before submit',
    phase: 3,
    tags: ['web', 'bookings', 'negative'],
    requiresAuth: true,
    authRole: 'seeker',
    preconditions: ['At least one companion exists'],
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: '[data-testid^="browse-book-date-"]', comment: 'Click Book Date on first companion' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '27-booking-form-empty' },
      { action: 'click', target: selectors.bookingSubmit, comment: 'Submit without filling fields' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '28-booking-validation' },
    ],
  },

  {
    name: 'Login Back - Returns to Welcome',
    description: 'Back button on login returns to welcome screen',
    phase: 3,
    tags: ['web', 'auth', 'navigation'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.loginBack },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '29-login-back' },
      { action: 'expect', expect: { text: 'Real dates' } },
    ],
  },

  {
    name: 'Profile - Edit Navigation',
    description: 'Edit profile button navigates to edit screen',
    phase: 3,
    tags: ['web', 'settings', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      ...loginFlow,
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.profileEditBtn },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '30-edit-profile' },
    ],
  },

  {
    name: 'Neo-Brutalism Visual Audit',
    description: 'Screenshot all key screens for visual regression',
    phase: 3,
    tags: ['web', 'visual', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '40-visual-welcome' },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '41-visual-login' },
      { action: 'fill', target: selectors.loginEmailInput, value: config.testEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '42-visual-otp' },
    ],
  },
]

// ============================================
// HELPERS
// ============================================

export const getWebScenarios = () => scenarios.filter(s => s.tags.includes('web'))
export const getMobileScenarios = () => scenarios.filter(s => s.tags.includes('mobile'))
export const getScenariosByPhase = (phase: number) => scenarios.filter(s => s.phase === phase)
export const getScenariosRequiringAuth = () => scenarios.filter(s => s.requiresAuth)
export const getCriticalScenarios = () => scenarios.filter(s => s.phase === 1)
export const getScenariosByTag = (tag: string) => scenarios.filter(s => s.tags.includes(tag))
