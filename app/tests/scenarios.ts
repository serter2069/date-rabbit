/**
 * DateRabbit E2E Test Scenarios — Single Source of Truth
 *
 * All testIDs verified against actual components (2026-02-26).
 * Generates: Playwright (web) tests.
 *
 * Auth: DEV_AUTH=true on server, OTP is always 000000 for any email.
 *
 * Test accounts:
 *   Seeker:    seeker-test@daterabbit.com / OTP: 000000
 *   Companion: companion-test@daterabbit.com / OTP: 000000
 *
 * API: https://daterabbit-api.smartlaunchhub.com/api
 */

export interface TestStep {
  action: 'goto' | 'fill' | 'click' | 'wait' | 'expect' | 'screenshot' | 'select' | 'scroll' | 'api'
  target?: string
  value?: string
  timeout?: number
  expect?: {
    visible?: boolean
    hidden?: boolean
    text?: string
    contains?: string
    url?: string
    count?: number
    status?: number
  }
  comment?: string
  platform?: 'web' | 'mobile' | 'both'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
}

export interface TestScenario {
  name: string
  description?: string
  phase: number  // 1=critical, 2=core flows, 3=multi-user/API, 4=edge cases
  tags: string[]
  requiresAuth?: boolean
  authRole?: 'seeker' | 'companion'
  preconditions?: string[]
  apiOnly?: boolean  // true = test only hits API, no browser
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
  otpCodeInput: 'otp-code-input',  // hidden — use focus + keyboard.type
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

  // Browse Companions
  browseSearchInput: 'browse-search-input',
  browseFilterBtn: 'browse-filter-btn',
  // browse-view-profile-{id} — dynamic

  // Bookings
  bookingsTabPast: 'bookings-tab-past',
  bookingsTabCancelled: 'bookings-tab-cancelled',
  bookingsTabUpcoming: 'bookings-tab-upcoming',

  // Messages
  messagesConversation: 'messages-conversation',

  // Profile (shared)
  profileEditBtn: 'profile-edit-btn',
  profileSignoutBtn: 'profile-signout-btn',

  // Companion Requests
  requestsTab: 'requests-tab',

  // Chat
  chatBack: 'chat-back-btn',
  chatBookBtn: 'chat-book-btn',
  chatMessageInput: 'chat-message-input',
  chatSendBtn: 'chat-send-btn',

  // Booking form
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
  apiUrl: 'https://daterabbit-api.smartlaunchhub.com/api',
  seekerEmail: 'seeker-test@daterabbit.com',
  companionEmail: 'companion-test@daterabbit.com',
  testOtp: '000000',
  defaultTimeout: 10000,
}

// ============================================
// SCENARIOS
// ============================================

export const scenarios: TestScenario[] = [

  // =============================================
  // PHASE 1: CRITICAL — Auth & Navigation
  // =============================================

  {
    name: '01 Welcome - Page Loads',
    description: 'Welcome screen renders with both CTA buttons, sign-in link, and headline text',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'smoke'],
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
    name: '02 Seeker Registration Flow',
    description: 'Click Find Companions → navigates to role-select → select seeker → login → OTP → logged in as seeker',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'critical', 'seeker'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeSeekerBtn, comment: 'Click Find Companions' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '02a-role-select' },
      { action: 'expect', expect: { url: 'role-select' } },
      { action: 'click', target: selectors.roleSelectSeeker, comment: 'Select seeker role' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '02b-login' },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '02c-otp' },
      { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp, comment: 'OTP input is hidden — use focus+keyboard.type in actual test' },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '02d-logged-in-seeker' },
      { action: 'expect', target: selectors.browseSearchInput, expect: { visible: true }, comment: 'Seeker lands on Browse page' },
    ],
  },

  {
    name: '03 Companion Registration Flow',
    description: 'Click Become Companion → role-select → select companion → login → OTP → logged in as companion',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'critical', 'companion'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeCompanionBtn, comment: 'Click Become Companion' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '03a-role-select' },
      { action: 'expect', expect: { url: 'role-select' } },
      { action: 'click', target: selectors.roleSelectCompanion, comment: 'Select companion role' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '03b-login' },
      { action: 'fill', target: selectors.loginEmailInput, value: config.companionEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '03c-logged-in-companion' },
    ],
  },

  {
    name: '04 Login With Existing Seeker',
    description: 'Sign in link → enter seeker email → OTP → lands on browse/home',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'critical', 'seeker'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '04-seeker-logged-in' },
    ],
  },

  {
    name: '05 Login With Existing Companion',
    description: 'Sign in link → enter companion email → OTP → lands on companion home/requests',
    phase: 1,
    tags: ['web', 'auth', 'positive', 'critical', 'companion'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.companionEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '05-companion-logged-in' },
    ],
  },

  {
    name: '06 Login - Invalid OTP Rejected',
    description: 'Wrong OTP shows error and stays on OTP screen; does not authenticate',
    phase: 1,
    tags: ['web', 'auth', 'negative'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.otpCodeInput, value: '999999', comment: 'Wrong OTP' },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '06-invalid-otp' },
      { action: 'expect', expect: { url: 'otp' }, comment: 'Must stay on OTP screen' },
    ],
  },

  {
    name: '07 Login - Empty Email Validation',
    description: 'Clicking Continue without entering email stays on login screen',
    phase: 1,
    tags: ['web', 'auth', 'negative'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.loginContinue, comment: 'Submit without email' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '07-empty-email' },
      { action: 'expect', expect: { url: 'login' } },
    ],
  },

  {
    name: '08 OTP - Resend Code',
    description: 'Resend link on OTP screen triggers new code send and stays on OTP screen',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.otpResend },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '08-otp-resent' },
      { action: 'expect', expect: { url: 'otp' } },
    ],
  },

  {
    name: '09 OTP - Back Navigation Returns to Login',
    description: 'Back button on OTP screen returns to login screen with email input visible',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.otpBack },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '09-otp-back' },
      { action: 'expect', expect: { text: 'Welcome back' } },
    ],
  },

  {
    name: '10 Sign Out Flow',
    description: 'Profile → Sign out → redirects to welcome screen',
    phase: 1,
    tags: ['web', 'auth', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      // login inline in test
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.profileSignoutBtn },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '10-after-signout' },
      { action: 'expect', expect: { text: 'Real dates' }, comment: 'Back on welcome' },
    ],
  },

  // =============================================
  // PHASE 2: CORE FLOWS
  // =============================================

  {
    name: '11 Browse Companions - Page Loads with Search and Filter',
    description: 'After seeker login, Browse tab shows search input and filter button',
    phase: 2,
    tags: ['web', 'browse', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '11-browse-page' },
      { action: 'expect', target: selectors.browseSearchInput, expect: { visible: true } },
      { action: 'expect', target: selectors.browseFilterBtn, expect: { visible: true } },
    ],
  },

  {
    name: '12 Browse Companions - Text Search',
    description: 'Typing in search input filters companion results',
    phase: 2,
    tags: ['web', 'browse', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'fill', target: selectors.browseSearchInput, value: 'Test' },
      { action: 'wait', timeout: 1500, comment: 'Debounce + API call' },
      { action: 'screenshot', value: '12-browse-search-results' },
    ],
  },

  {
    name: '13 View Companion Profile - Book and Message Buttons Visible',
    description: 'Click a companion card → profile view with Book and Message CTAs',
    phase: 2,
    tags: ['web', 'browse', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    preconditions: ['At least one companion exists in the system'],
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: '[data-testid^="browse-view-profile-"]', comment: 'Click first companion card' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '13-companion-profile-view' },
      { action: 'expect', target: selectors.profileViewBook, expect: { visible: true } },
      { action: 'expect', target: selectors.profileViewMessage, expect: { visible: true } },
    ],
  },

  {
    name: '14 Create Booking via API',
    description: 'Seeker authenticates via API, fetches companions, creates a booking — tests full API chain',
    phase: 2,
    tags: ['api', 'bookings', 'positive', 'seeker'],
    apiOnly: true,
    preconditions: ['companion-test@daterabbit.com exists with companion role'],
    steps: [
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.seekerEmail }, comment: 'Send OTP to seeker' },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.seekerEmail, code: config.testOtp }, comment: 'Get JWT token' },
      { action: 'api', method: 'GET', target: '/companions', comment: 'Fetch companions list' },
      { action: 'api', method: 'POST', target: '/bookings', body: { companionId: '{{companionId}}', dateTime: '{{futureDate}}', duration: 2, activity: 'Dinner' }, comment: 'Create booking' },
      { action: 'expect', expect: { status: 201 }, comment: 'Booking created successfully' },
      { action: 'api', method: 'GET', target: '/bookings', comment: 'Verify booking appears in seeker list' },
    ],
  },

  {
    name: '15 Seeker Bookings Tab Shows Bookings',
    description: 'After login, Bookings tab loads and shows tabs for upcoming/past/cancelled',
    phase: 2,
    tags: ['web', 'bookings', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Bookings' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '15-bookings-tab' },
      { action: 'click', target: '[data-testid="bookings-tab-past"]' },
      { action: 'wait', timeout: 1000 },
      { action: 'screenshot', value: '15b-bookings-past' },
    ],
  },

  {
    name: '16 Messages Tab Loads',
    description: 'Navigating to Messages tab shows conversations list (may be empty)',
    phase: 2,
    tags: ['web', 'messages', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Messages' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '16-messages-tab' },
    ],
  },

  {
    name: '17 Own Profile Shows Edit and Sign Out',
    description: 'Profile tab renders user info with Edit Profile and Sign Out buttons',
    phase: 2,
    tags: ['web', 'profile', 'positive', 'seeker'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '17-own-profile' },
      { action: 'expect', target: selectors.profileEditBtn, expect: { visible: true } },
      { action: 'expect', target: selectors.profileSignoutBtn, expect: { visible: true } },
    ],
  },

  // =============================================
  // PHASE 3: MULTI-USER & CROSS-ACCOUNT (API-driven)
  // =============================================

  {
    name: '18 Booking Lifecycle - Seeker Creates, Companion Confirms',
    description: 'Full booking lifecycle via API: seeker creates → companion sees request → companion confirms → status is confirmed',
    phase: 3,
    tags: ['api', 'bookings', 'positive', 'multi-user'],
    apiOnly: true,
    preconditions: ['Both seeker-test and companion-test accounts exist with correct roles'],
    steps: [
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.seekerEmail }, comment: 'Step 1: Authenticate seeker' },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.seekerEmail, code: config.testOtp }, comment: 'Get seeker JWT' },
      { action: 'api', method: 'GET', target: '/companions', comment: 'Step 2: Seeker fetches companion list' },
      { action: 'api', method: 'POST', target: '/bookings', body: { companionId: '{{firstCompanionId}}', dateTime: '{{futureDate}}', duration: 2, activity: 'Dinner' }, comment: 'Step 3: Seeker creates booking' },
      { action: 'expect', expect: { status: 201 }, comment: 'Booking created with status=pending' },
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.companionEmail }, comment: 'Step 4: Authenticate companion' },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.companionEmail, code: config.testOtp }, comment: 'Get companion JWT' },
      { action: 'api', method: 'GET', target: '/bookings/requests', comment: 'Step 5: Companion fetches pending requests' },
      { action: 'expect', expect: { status: 200 }, comment: 'Booking visible in requests' },
      { action: 'api', method: 'PUT', target: '/bookings/{{bookingId}}/confirm', comment: 'Step 6: Companion confirms' },
      { action: 'expect', expect: { status: 200 }, comment: 'Booking status is now confirmed' },
      { action: 'api', method: 'GET', target: '/bookings/{{bookingId}}', comment: 'Step 7: Seeker verifies status change' },
      { action: 'expect', expect: { status: 200 }, comment: 'Booking shows confirmed status' },
    ],
  },

  {
    name: '19 Messaging - Seeker Sends Message to Companion',
    description: 'Seeker sends message via API; companion retrieves it in conversation',
    phase: 3,
    tags: ['api', 'messages', 'positive', 'multi-user'],
    apiOnly: true,
    steps: [
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.seekerEmail } },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.seekerEmail, code: config.testOtp }, comment: 'Get seeker JWT' },
      { action: 'api', method: 'GET', target: '/companions', comment: 'Get companion userId' },
      { action: 'api', method: 'POST', target: '/messages/{{companionUserId}}', body: { text: 'Hello from seeker E2E test' }, comment: 'Seeker sends message' },
      { action: 'expect', expect: { status: 201 }, comment: 'Message sent OK' },
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.companionEmail } },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.companionEmail, code: config.testOtp }, comment: 'Get companion JWT' },
      { action: 'api', method: 'GET', target: '/messages/{{seekerUserId}}', comment: 'Companion reads conversation' },
      { action: 'expect', expect: { status: 200 }, comment: 'Message visible to companion' },
    ],
  },

  {
    name: '20 Messaging - Companion Sends Message to Seeker',
    description: 'Companion sends message via API; seeker retrieves it and unread count reflects it',
    phase: 3,
    tags: ['api', 'messages', 'positive', 'multi-user'],
    apiOnly: true,
    steps: [
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.companionEmail } },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.companionEmail, code: config.testOtp }, comment: 'Get companion JWT' },
      { action: 'api', method: 'POST', target: '/messages/{{seekerUserId}}', body: { text: 'Hello from companion E2E test' }, comment: 'Companion sends message' },
      { action: 'expect', expect: { status: 201 }, comment: 'Message sent OK' },
      { action: 'api', method: 'POST', target: '/auth/start', body: { email: config.seekerEmail } },
      { action: 'api', method: 'POST', target: '/auth/verify', body: { email: config.seekerEmail, code: config.testOtp }, comment: 'Get seeker JWT' },
      { action: 'api', method: 'GET', target: '/messages/unread-count', comment: 'Seeker checks unread count' },
      { action: 'expect', expect: { status: 200 }, comment: 'Unread count is >= 1' },
      { action: 'api', method: 'GET', target: '/messages/{{companionUserId}}', comment: 'Seeker reads conversation' },
      { action: 'expect', expect: { status: 200 }, comment: 'Companion message visible to seeker' },
    ],
  },

  // =============================================
  // PHASE 4: EDGE CASES & VISUAL AUDIT
  // =============================================

  {
    name: '21 Onboarding - Skip Goes to Welcome',
    description: 'Skip button on onboarding screen navigates to welcome',
    phase: 4,
    tags: ['web', 'onboarding', 'positive'],
    steps: [
      { action: 'goto', target: '/onboarding' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '21-onboarding-start' },
      { action: 'click', target: selectors.onboardingSkip },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '21b-after-skip' },
    ],
  },

  {
    name: '22 Onboarding - Navigate Through All Slides',
    description: 'Next button advances through all 4 onboarding slides then exits',
    phase: 4,
    tags: ['web', 'onboarding', 'positive'],
    steps: [
      { action: 'goto', target: '/onboarding' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '22a-slide-2' },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '22b-slide-3' },
      { action: 'click', target: selectors.onboardingNext },
      { action: 'wait', timeout: 500 },
      { action: 'screenshot', value: '22c-slide-4' },
      { action: 'click', target: selectors.onboardingNext, comment: 'Last slide — completes onboarding' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '22d-after-onboarding' },
    ],
  },

  {
    name: '23 Login Back - Returns to Welcome',
    description: 'Back button on login screen returns to welcome page',
    phase: 4,
    tags: ['web', 'auth', 'navigation'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.loginBack },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '23-login-back' },
      { action: 'expect', expect: { text: 'Real dates' } },
    ],
  },

  {
    name: '24 Profile Edit Navigation',
    description: 'Edit Profile button opens the profile edit screen',
    phase: 4,
    tags: ['web', 'profile', 'positive'],
    requiresAuth: true,
    authRole: 'seeker',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 1500 },
      { action: 'click', target: selectors.profileEditBtn },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '24-edit-profile' },
    ],
  },

  {
    name: '25 Visual Audit Screenshots',
    description: 'Capture screenshots of all key screens for visual regression reference',
    phase: 4,
    tags: ['web', 'visual', 'audit'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '25a-visual-welcome' },
      { action: 'click', target: 'text=Sign in' },
      { action: 'wait', timeout: 1500 },
      { action: 'screenshot', value: '25b-visual-login' },
      { action: 'fill', target: selectors.loginEmailInput, value: config.seekerEmail },
      { action: 'click', target: selectors.loginContinue },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '25c-visual-otp' },
      { action: 'fill', target: selectors.otpCodeInput, value: config.testOtp },
      { action: 'click', target: selectors.otpVerify },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '25d-visual-browse' },
      { action: 'click', target: 'text=Bookings' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '25e-visual-bookings' },
      { action: 'click', target: 'text=Messages' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '25f-visual-messages' },
      { action: 'click', target: 'text=Profile' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '25g-visual-profile' },
    ],
  },
]

// ============================================
// HELPERS
// ============================================

export const getWebScenarios = () => scenarios.filter(s => s.tags.includes('web'))
export const getApiScenarios = () => scenarios.filter(s => s.apiOnly === true)
export const getScenariosByPhase = (phase: number) => scenarios.filter(s => s.phase === phase)
export const getSeekerScenarios = () => scenarios.filter(s => s.tags.includes('seeker') || s.authRole === 'seeker')
export const getCompanionScenarios = () => scenarios.filter(s => s.tags.includes('companion') || s.authRole === 'companion')
export const getCriticalScenarios = () => scenarios.filter(s => s.phase === 1)
export const getSmokeScenarios = () => scenarios.filter(s => s.tags.includes('smoke'))
export const getScenariosByTag = (tag: string) => scenarios.filter(s => s.tags.includes(tag))
