/**
 * Single Source of Truth for DateRabbit tests
 * Generates: Playwright (web) tests
 * 
 * Platform: Expo (web primary, mobile via Maestro separately)
 */

export interface TestStep {
  action: 'goto' | 'fill' | 'click' | 'wait' | 'expect' | 'screenshot' | 'select' | 'scroll'
  target?: string
  value?: string
  timeout?: number
  expect?: { visible?: boolean; text?: string; url?: string }
  comment?: string
}

export interface TestScenario {
  name: string
  description?: string
  phase: number
  tags: ('web' | 'mobile')[]
  requiresAuth?: boolean
  authRole?: 'seeker' | 'companion'
  steps: TestStep[]
}

export const selectors = {
  // Onboarding
  onboardingSkip: 'onboarding-skip',
  onboardingNext: 'onboarding-next',

  // Auth - Welcome
  welcomeCreateAccount: 'welcome-create-account-btn',
  welcomeLogin: 'welcome-login-btn',

  // Auth - Role Select
  roleSelectBack: 'role-select-back-btn',
  roleSelectCompanion: 'role-select-companion-btn',
  roleSelectSeeker: 'role-select-seeker-btn',

  // Auth - Login
  loginBack: 'login-back-btn',
  loginEmailInput: 'login-email-input',
  loginContinue: 'login-continue-btn',

  // Auth - OTP
  otpBack: 'otp-back-btn',
  otpCodeInput: 'otp-code-input',
  otpVerify: 'otp-verify-btn',
  otpResend: 'otp-resend-btn',

  // Auth - Register/Profile Setup
  registerBack: 'register-back-btn',
  registerNameInput: 'register-name-input',
  registerEmailInput: 'register-email-input',
  registerSubmit: 'register-submit-btn',

  setupBack: 'setup-back-btn',
  setupNameInput: 'setup-name-input',
  setupAgeInput: 'setup-age-input',
  setupLocationInput: 'setup-location-input',
  setupBioInput: 'setup-bio-input',
  setupRateInput: 'setup-rate-input',
  setupBasicContinue: 'setup-basic-continue-btn',
  setupComplete: 'setup-complete-btn',
}

export const scenarios: TestScenario[] = [
  // ===========================================
  // PHASE 1: WELCOME SCREEN (First thing users see)
  // ===========================================
  {
    name: 'Welcome - Load Page',
    description: 'Welcome page loads correctly',
    phase: 1,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', value: '01-welcome' },
      { action: 'expect', expect: { text: 'DateRabbit' } },
      { action: 'expect', expect: { text: 'Create Account' } },
    ],
  },
  {
    name: 'Welcome - Navigate to Login',
    description: 'Click login button',
    phase: 1,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeLogin, comment: 'Go to login' },
      { action: 'wait', timeout: 1000 },
      { action: 'expect', expect: { url: 'login' } },
      { action: 'screenshot', value: '02-login' },
    ],
  },
  {
    name: 'Welcome - Navigate to Register',
    description: 'Click create account',
    phase: 1,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.welcomeCreateAccount, comment: 'Create account' },
      { action: 'wait', timeout: 1000 },
      { action: 'expect', expect: { url: 'role-select' } },
      { action: 'screenshot', value: '03-role-select' },
    ],
  },

  // ===========================================
  // PHASE 2: ROLE SELECTION
  // ===========================================
  {
    name: 'Role Select - Choose Seeker',
    description: 'Select seeker role',
    phase: 2,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/role-select' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '04-role-select-page' },
      { action: 'click', target: selectors.roleSelectSeeker, comment: 'Select seeker' },
      { action: 'wait', timeout: 1000 },
      { action: 'expect', expect: { url: 'register' } },
      { action: 'screenshot', value: '05-register-seeker' },
    ],
  },
  {
    name: 'Role Select - Choose Companion',
    description: 'Select companion role',
    phase: 2,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/role-select' },
      { action: 'wait', timeout: 2000 },
      { action: 'click', target: selectors.roleSelectCompanion, comment: 'Select companion' },
      { action: 'wait', timeout: 1000 },
      { action: 'expect', expect: { url: 'register' } },
      { action: 'screenshot', value: '06-register-companion' },
    ],
  },

  // ===========================================
  // PHASE 3: LOGIN FLOW
  // ===========================================
  {
    name: 'Login - Page Loads',
    description: 'Login page shows form',
    phase: 3,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/login' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '07-login-page' },
      { action: 'expect', expect: { text: 'Welcome' } },
      { action: 'fill', target: selectors.loginEmailInput, value: 'test@example.com' },
      { action: 'screenshot', value: '08-login-email-filled' },
    ],
  },

  // ===========================================
  // PHASE 4: REGISTRATION FORM
  // ===========================================
  {
    name: 'Register - Fill Seeker Form',
    description: 'Fill registration form for seeker',
    phase: 4,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/register?role=male' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '10-register-form-seeker' },
      { action: 'fill', target: selectors.registerNameInput, value: 'Test User' },
      { action: 'fill', target: selectors.registerEmailInput, value: 'test@example.com' },
      { action: 'screenshot', value: '11-register-filled' },
    ],
  },
  {
    name: 'Register - Fill Companion Form',
    description: 'Fill registration form for companion',
    phase: 4,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/register?role=female' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '12-register-form-companion' },
      { action: 'fill', target: selectors.registerNameInput, value: 'Companion User' },
      { action: 'fill', target: selectors.registerEmailInput, value: 'companion@example.com' },
      { action: 'screenshot', value: '13-register-filled' },
    ],
  },

  // ===========================================
  // PHASE 5: OTP PAGE
  // ===========================================
  {
    name: 'OTP - Page Loads',
    description: 'OTP verification page',
    phase: 5,
    tags: ['web'],
    steps: [
      { action: 'goto', target: '/(auth)/otp' },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', value: '14-otp-page' },
      { action: 'expect', expect: { text: 'Verify' } },
    ],
  },
]

// Helpers
export const getWebScenarios = () => scenarios.filter(s => s.tags.includes('web'))
export const getMobileScenarios = () => scenarios.filter(s => s.tags.includes('mobile'))
export const getScenariosByPhase = (phase: number) => scenarios.filter(s => s.phase === phase)
export const getScenariosRequiringAuth = () => scenarios.filter(s => s.requiresAuth)
