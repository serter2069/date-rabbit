type PageGroup = 'Brand' | 'Landing' | 'Auth' | 'SeekerVerify' | 'CompanionOnboard' | 'SeekerDashboard' | 'CompanionDashboard' | 'Booking' | 'Date' | 'Chat' | 'Reviews' | 'Settings' | 'Admin';
type NavVariant = 'none' | 'public' | 'auth' | 'seeker' | 'companion' | 'admin';
type ProtoStatus = 'none' | 'proto' | 'approved';

interface PageNote {
  date: string;
  state?: string;
  text: string;
}

export interface PageEntry {
  id: string;
  title: string;
  group: PageGroup;
  route: string;
  stateCount: number;
  nav: NavVariant;
  status: ProtoStatus;
  activeTab?: string;
  navFrom?: string[];
  navTo?: string[];
  notes?: PageNote[];
}

export const pageRegistry: PageEntry[] = [
  // BRAND
  { id: 'brand', title: 'Brand & Styles', group: 'Brand', route: '/proto/brand', stateCount: 1, nav: 'none', status: 'none' },
  { id: 'overview', title: 'Proto Overview', group: 'Brand', route: '/proto/overview', stateCount: 1, nav: 'none', status: 'none' },

  // LANDING
  { id: 'landing', title: 'Landing Page', group: 'Landing', route: '/landing', stateCount: 3, nav: 'public', status: 'none', navTo: ['auth-login', 'auth-welcome'], notes: [{ date: '2026-04-09', text: 'Gender splash shown on first visit (UC-L01). Web-only.' }] },

  // AUTH
  { id: 'auth-welcome', title: 'Welcome', group: 'Auth', route: '/(auth)/welcome', stateCount: 2, nav: 'auth', status: 'none', navFrom: ['landing'], navTo: ['auth-login'] },
  { id: 'auth-login', title: 'Email Login', group: 'Auth', route: '/(auth)/login', stateCount: 3, nav: 'auth', status: 'none', navFrom: ['landing', 'auth-welcome'], navTo: ['auth-otp'], notes: [{ date: '2026-04-09', text: 'OTP-only auth. No passwords. Dev OTP: 000000.' }] },
  { id: 'auth-otp', title: 'OTP Verification', group: 'Auth', route: '/(auth)/otp', stateCount: 3, nav: 'auth', status: 'none', navFrom: ['auth-login'], navTo: ['auth-role-select'] },
  { id: 'auth-role-select', title: 'Role Selection', group: 'Auth', route: '/(auth)/role-select', stateCount: 1, nav: 'auth', status: 'none', navFrom: ['auth-otp'], navTo: ['auth-profile-setup'], notes: [{ date: '2026-04-09', text: 'Seeker = man, Companion = woman. 21+ only.' }] },
  { id: 'auth-profile-setup', title: 'Profile Setup', group: 'Auth', route: '/(auth)/profile-setup', stateCount: 2, nav: 'auth', status: 'none', navFrom: ['auth-role-select'], navTo: ['verify-intro', 'comp-onboard-step2'] },

  // SEEKER VERIFICATION
  { id: 'verify-intro', title: 'Verification Intro', group: 'SeekerVerify', route: '/(seeker-verify)/intro', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['auth-profile-setup'], navTo: ['verify-photo-id'], notes: [{ date: '2026-04-09', text: 'Stripe Identity + fingerprint check (UC-019, UC-020).' }] },
  { id: 'verify-photo-id', title: 'Photo ID Upload', group: 'SeekerVerify', route: '/(seeker-verify)/photo-id', stateCount: 3, nav: 'seeker', status: 'none', navFrom: ['verify-intro'], navTo: ['verify-selfie'] },
  { id: 'verify-selfie', title: 'Selfie Capture', group: 'SeekerVerify', route: '/(seeker-verify)/selfie', stateCount: 2, nav: 'seeker', status: 'none', navFrom: ['verify-photo-id'], navTo: ['verify-consent'] },
  { id: 'verify-consent', title: 'Consent Form', group: 'SeekerVerify', route: '/(seeker-verify)/consent', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['verify-selfie'], navTo: ['verify-pending'] },
  { id: 'verify-pending', title: 'Verification Pending', group: 'SeekerVerify', route: '/(seeker-verify)/pending', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['verify-consent'], navTo: ['verify-approved'] },
  { id: 'verify-approved', title: 'Verification Approved', group: 'SeekerVerify', route: '/(seeker-verify)/approved', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['verify-pending'], navTo: ['seeker-home'] },

  // COMPANION ONBOARD
  { id: 'comp-onboard-step2', title: 'Companion Setup', group: 'CompanionOnboard', route: '/(comp-onboard)/step2', stateCount: 3, nav: 'companion', status: 'none', navFrom: ['auth-profile-setup'], navTo: ['comp-onboard-verify'], notes: [{ date: '2026-04-09', text: 'Min 4 photos required (UC-022). Video picker in this step.' }] },
  { id: 'comp-onboard-verify', title: 'Companion Verify', group: 'CompanionOnboard', route: '/(comp-onboard)/verify', stateCount: 2, nav: 'companion', status: 'none', navFrom: ['comp-onboard-step2'], navTo: ['comp-onboard-pending'] },
  { id: 'comp-onboard-pending', title: 'Approval Pending', group: 'CompanionOnboard', route: '/(comp-onboard)/pending', stateCount: 1, nav: 'companion', status: 'none', navFrom: ['comp-onboard-verify'], navTo: ['comp-onboard-approved'] },
  { id: 'comp-onboard-approved', title: 'Companion Approved', group: 'CompanionOnboard', route: '/(comp-onboard)/approved', stateCount: 1, nav: 'companion', status: 'none', navFrom: ['comp-onboard-pending'], navTo: ['comp-stripe-connect', 'comp-home'] },

  // SEEKER DASHBOARD
  { id: 'seeker-home', title: 'Browse Companions', group: 'SeekerDashboard', route: '/(tabs)/male/index', stateCount: 4, nav: 'seeker', activeTab: 'home', status: 'none', navFrom: ['verify-approved'], navTo: ['booking-detail', 'seeker-profile', 'seeker-favorites', 'seeker-bookings', 'seeker-messages'], notes: [{ date: '2026-04-09', text: 'Filter by city, age, price. UC-031.' }] },
  { id: 'seeker-bookings', title: 'My Bookings', group: 'SeekerDashboard', route: '/(tabs)/male/bookings', stateCount: 3, nav: 'seeker', activeTab: 'bookings', status: 'none', navFrom: ['seeker-home', 'booking-request-sent'], navTo: ['booking-detail', 'reviews-write'] },
  { id: 'seeker-messages', title: 'Messages', group: 'SeekerDashboard', route: '/(tabs)/male/messages', stateCount: 2, nav: 'seeker', activeTab: 'messages', status: 'none', navFrom: ['seeker-home'] },
  { id: 'seeker-profile', title: 'Seeker Profile', group: 'SeekerDashboard', route: '/(tabs)/male/profile', stateCount: 2, nav: 'seeker', activeTab: 'profile', status: 'none', navFrom: ['seeker-home'], navTo: ['settings', 'settings-edit-profile'] },
  { id: 'seeker-favorites', title: 'Favorites', group: 'SeekerDashboard', route: '/favorites', stateCount: 2, nav: 'seeker', status: 'none', navFrom: ['seeker-home'], navTo: ['booking-detail'] },

  // COMPANION DASHBOARD
  { id: 'comp-home', title: 'Companion Home', group: 'CompanionDashboard', route: '/(tabs)/female/index', stateCount: 3, nav: 'companion', activeTab: 'home', status: 'none', navFrom: ['comp-onboard-approved'], navTo: ['comp-requests', 'comp-calendar', 'comp-earnings', 'comp-profile'] },
  { id: 'comp-requests', title: 'Booking Requests', group: 'CompanionDashboard', route: '/(tabs)/female/requests', stateCount: 3, nav: 'companion', activeTab: 'requests', status: 'none', navFrom: ['comp-home'], navTo: ['booking-detail'] },
  { id: 'comp-calendar', title: 'Availability Calendar', group: 'CompanionDashboard', route: '/(tabs)/female/calendar', stateCount: 2, nav: 'companion', activeTab: 'calendar', status: 'none', navFrom: ['comp-home'] },
  { id: 'comp-earnings', title: 'Earnings', group: 'CompanionDashboard', route: '/(tabs)/female/earnings', stateCount: 2, nav: 'companion', activeTab: 'earnings', status: 'none', navFrom: ['comp-home'], navTo: ['comp-stripe-connect'] },
  { id: 'comp-profile', title: 'Companion Profile', group: 'CompanionDashboard', route: '/(tabs)/female/profile', stateCount: 2, nav: 'companion', activeTab: 'profile', status: 'none', navFrom: ['comp-home'], navTo: ['settings', 'settings-edit-profile'] },
  { id: 'comp-stripe-connect', title: 'Connect Bank Account', group: 'CompanionDashboard', route: '/stripe/connect', stateCount: 2, nav: 'companion', status: 'none', navFrom: ['comp-onboard-approved'], navTo: ['comp-earnings'], notes: [{ date: '2026-04-09', text: 'Stripe Connect Express. Companion must connect to receive payouts.' }] },

  // BOOKING
  { id: 'booking-detail', title: 'Booking Detail', group: 'Booking', route: '/booking/[id]', stateCount: 4, nav: 'seeker', status: 'none', navFrom: ['seeker-home', 'seeker-bookings'], navTo: ['booking-payment', 'seeker-messages'] },
  { id: 'booking-payment', title: 'Payment', group: 'Booking', route: '/payment/[bookingId]', stateCount: 3, nav: 'seeker', status: 'none', navFrom: ['booking-detail'], navTo: ['booking-request-sent'], notes: [{ date: '2026-04-09', text: 'Show cost breakdown: date cost + platform fee + Stripe fee = total (UC-351).' }] },
  { id: 'booking-request-sent', title: 'Request Sent', group: 'Booking', route: '/booking/request-sent/[id]', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['booking-payment'], navTo: ['seeker-bookings'] },
  { id: 'booking-declined', title: 'Request Declined', group: 'Booking', route: '/booking/declined/[id]', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['comp-requests'], navTo: ['seeker-bookings'] },

  // REVIEWS
  { id: 'reviews-view', title: 'Reviews', group: 'Reviews', route: '/reviews/[id]', stateCount: 2, nav: 'seeker', status: 'none', navFrom: ['booking-detail'] },
  { id: 'reviews-write', title: 'Write Review', group: 'Reviews', route: '/reviews/write/[bookingId]', stateCount: 2, nav: 'seeker', status: 'none', navFrom: ['seeker-bookings'], navTo: ['seeker-bookings'] },

  // SETTINGS
  { id: 'settings', title: 'Settings', group: 'Settings', route: '/settings', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['seeker-profile', 'comp-profile'], navTo: ['settings-edit-profile', 'settings-notifications'] },
  { id: 'settings-edit-profile', title: 'Edit Profile', group: 'Settings', route: '/settings/edit-profile', stateCount: 2, nav: 'seeker', status: 'none', navFrom: ['settings', 'seeker-profile', 'comp-profile'] },
  { id: 'settings-notifications', title: 'Notification Preferences', group: 'Settings', route: '/settings/notifications', stateCount: 1, nav: 'seeker', status: 'none', navFrom: ['settings'] },

  // ADMIN
  { id: 'admin-cities', title: 'Admin: Cities', group: 'Admin', route: '/(admin)/cities', stateCount: 2, nav: 'admin', status: 'none' },
];
