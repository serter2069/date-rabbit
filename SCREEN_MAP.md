# SCREEN_MAP.md — DateRabbit

## SDLC Status

<!-- SDLC_STATE_BEGIN -->
```yaml
phase: 4-SCREEN_MAP
started_at: 2026-04-19
updated_at: 2026-04-19T05:05:16Z
phases:
  SA:         {status: DONE, schema_url: "https://diagrams.love/canvas?schema=cmnw53r4l000izmerguf0hp0l"}
  CICD:       {status: DONE, note: "ci.yml + deploy.yml + pr-limit.yml + seed.yml in .github/workflows/"}
  BRAND:      {status: DONE, note: "theme.ts (neo-brutalism) + app/(dev)/brand.tsx + ui/ components"}
  LANDING:    {status: IN_PROGRESS, note: "PR #240 open: feat/landing-1411b — full redesign 9 sections"}
  SCREEN_MAP: {status: TODO, note: "stub only — needs /screen-map DateRabbit to reverse-engineer sections 0-7 from existing code"}
  DEV:        {status: IN_PROGRESS, note: "9 open PRs, 7 active worktrees — pre-SDLC dev already in flight"}
  TEST:       {status: PENDING}
screens:
  total: 42
  done: 0
  in_progress: 0
  todo: 42
cycles:
  audit:
    run_count: 0
    last_commit: null
    last_run: null
  audit_quality:
    run_count: 0
    last_run: null
  test:
    run_count: 0
    last_run: null
  verify:
    total_runs: 0
    escalations_to_opus: 0
    stops: 0
autopilot:
  mode: manual
  paused: true
  gate_grace_min: 10
  last_event_at: null
  last_gate_shown_at: null
  last_gate_phase: null
  tick_count_same_phase: 0
  last_phase_seen: null
  stops:
    critical_bug: false
    auth_broken: false
    verify_3fail: null
    blocker_issue: null
    token_budget: false
```
<!-- SDLC_STATE_END -->

---

## Section 0 — Global Layout Rules + Definition of Done

### 0.1 Responsive Layout Rules
- Single codebase (Expo Router) renders on iOS, Android, Web
- Breakpoints: mobile `<640px`, tablet `640–1024px`, desktop `>1024px`
- FORBIDDEN: hard `maxWidth: 430` on root containers — layout is fluid
- Safe area insets respected on all screens (`useSafeAreaInsets()`)
- Keyboard avoidance via `KeyboardAvoidingView` on forms
- Scroll with `ScrollView` / `FlatList` where content exceeds viewport

### 0.2 Layout Archetypes
- **Auth layout** (`app/(auth)/_layout.tsx`): no tab bar, back arrow header, centered single column, max form width 560px on desktop
- **Seeker tab layout** (`app/(tabs)/male/_layout.tsx`): 5-tab bottom bar, sticky header per screen
- **Companion tab layout** (`app/(tabs)/female/_layout.tsx`): 5-tab bottom bar with pending-request badge
- **Verification layout** (`app/(seeker-verify)/_layout.tsx`): linear step progress (1/5 … 5/5), no tab bar, no back after `pending`
- **Companion onboarding layout** (`app/(comp-onboard)/_layout.tsx`): step progress, no tab bar until approved
- **Detail/modal layout**: push transitions, X-close for modals, back-arrow for pushes
- **Admin layout** (`app/admin/_layout.tsx`): left sidebar (desktop), hamburger drawer (mobile), no public tabs

### 0.3 Transition Taxonomy (see Section 3 for full map)
| Type | Animation | Back button | Use case |
|---|---|---|---|
| push | slide-right-to-left 250ms | yes (back) | iOS default, linear flow |
| modal | slide-bottom-to-top 300ms | close (X) | overlays, confirmations |
| replace | cross-fade 200ms | no | post-action redirect, no return |
| tab | instant | no | tab bar switch |
| deep-link | 150ms | depends | push notification, URL open |

### 0.4 Platform/State Defaults
- Loading: skeleton rows or centered spinner (color: primary)
- Empty: illustration 64px gray + heading + subtext + optional CTA
- Error: retry button, brief message, no stack traces
- Offline: `OfflineBanner` at top, queued writes deferred
- Pull-to-refresh: native indicator on all list screens

### 0.5 Definition of Done (per screen)
1. Route wired in Expo Router, URL matches Section 2 spec
2. Access guard matches Section 4 (Guest/Seeker/Companion/Admin)
3. All 4 states rendered: `loading`, `populated`, `empty`, `error` (where applicable)
4. Uses only Section 1 design tokens + components (no inline hex, no ad-hoc fonts)
5. Forms: client-side validation + server-side validation + error inlines
6. API calls: real endpoint from Section 6 (no mocks in production build)
7. Analytics events fired per business spec (biz-analytics)
8. Acceptance Criteria checklist from the screen block passes
9. TypeScript `tsc --noEmit` clean for this screen's files
10. Lighthouse a11y >= 90 on web (labels, contrast, focus order)
11. Renders correctly at 375px, 768px, 1280px
12. Dev test account `serter2069@gmail.com` can reach the screen via documented flow

---

## Section 1 — Design System

### 1.1 Brand Identity — Neo-Brutalism
Bold, confident, offline-safe. High-contrast, solid borders, flat offset shadows, oversized display type. No skeuomorphism, no gradients on surfaces.

### 1.2 Color Tokens (`app/src/constants/theme.ts`)
| Token | Value | Usage |
|---|---|---|
| `colors.primary` | `#FF2A5F` | Primary CTA, active tab, critical accents |
| `colors.accent` | `#4DF0FF` | Secondary accents, highlights |
| `colors.background` | `#F4F0EA` | App background (cream) |
| `colors.surface` | `#FFFFFF` | Cards, modals, inputs |
| `colors.border` | `#000000` | All borders (thick black) |
| `colors.text` | `#000000` | Primary text |
| `colors.textMuted` | `#6B6B6B` | Secondary text |
| `colors.success` | `#00B37A` | Confirmations, verified badges |
| `colors.danger` | `#E5484D` | Errors, destructive actions |
| `colors.warning` | `#F5A524` | Pending states |

### 1.3 Typography
- Font family: `Space Grotesk` (display), `Inter` fallback for long text
- Scale: `display` 48/700, `h1` 32/700, `h2` 24/600, `h3` 20/600, `body` 16/400, `small` 14/400, `caption` 12/400

### 1.4 Spacing / Radius / Borders
- Spacing scale: `xs=4`, `sm=8`, `md=16`, `lg=24`, `xl=32`, `xxl=48`
- Radius: `sm=4`, `md=8`, `lg=12`, `xl=20`
- Border width: `thin=1`, `normal=3`, `thick=5` (brutalism default is `normal=3`)
- Shadow: solid black 4px x/y offset, 0 blur (brutalism); soft shadow reserved for modals

### 1.5 Component Library (`app/src/components/`)
| Component | File | Purpose |
|---|---|---|
| `Avatar` | `Avatar.tsx` | Circular user image with initials fallback |
| `Badge` | `Badge.tsx` | Status chips (verified, pending, unread count) |
| `Button` | `Button.tsx` | Primary/secondary/destructive/ghost variants, loading state |
| `Card` | `Card.tsx` | Bordered surface with optional offset shadow |
| `CustomTabBar` | `CustomTabBar.tsx` | Bottom tab bar with badges |
| `EmptyState` | `EmptyState.tsx` | Illustration + heading + subtext + CTA |
| `FilterModal` | `FilterModal.tsx` | Bottom-sheet filters (browse, bookings) |
| `Icon` | `Icon.tsx` | Icon wrapper (Feather / Ionicons) |
| `Input` | `Input.tsx` | Text field with label, helper, error, prefix/suffix |
| `OfflineBanner` | `OfflineBanner.tsx` | Top banner when network down |
| `OnboardingTour` | `OnboardingTour.tsx` | Coachmark overlay for first-run |
| `PhotoUpload` | `PhotoUpload.tsx` | Image picker + upload progress |
| `StripePaymentForm` | `StripePaymentForm.tsx` | Stripe Elements wrapper for payment intent |
| `StripeProvider` | `StripeProvider.tsx` | Stripe SDK context |
| `StripeSetupForm` | `StripeSetupForm.tsx` | SetupIntent for saving payment method |
| `UserImage` | `UserImage.tsx` | Profile photo with loading/fallback |
| `VerificationBanner` | `VerificationBanner.tsx` | "Complete verification" sticky banner |

### 1.6 Motion / Animation Defaults
- Screen entry: 200ms ease-out
- Press feedback: opacity 1.0 → 0.7 instant, release 150ms
- List item mount: 150ms stagger
- Badge increment: scale bounce 250ms

### 1.7 Accessibility
- Min tap target 44x44px
- Text contrast >= 4.5:1 (primary text vs background passes)
- `accessibilityLabel` on all Pressables
- Focus order follows visual order
- Supports dynamic type scaling up to 1.3x

---

## Section 2 — Screens (42)

---

### screen-landing
- **Status:** TODO
- **Route:** `/landing`
- **Access:** Guest
- **Layout:** public, no tab bar
- **Type:** marketing
- **Content:** Hero, value props, public companion gallery, testimonials, FAQ, CTA
- **UI Elements:** `Button` (primary CTA), `Card` (testimonials), `UserImage` (gallery), hero media
- **States:** `loading`, `populated`, `error`
- **Data:** `GET /companions?isPublic=true&limit=10`
- **Dependencies:** screen-auth-welcome, screen-onboarding-slides
- **Acceptance Criteria:**
  - [ ] Public gallery renders 10 companions
  - [ ] CTA routes to onboarding slides (with roleHint)
  - [ ] SEO metadata present
  - [ ] Renders on web with no auth token

### screen-onboarding-slides
- **Status:** TODO
- **Route:** `/onboarding?roleHint=seeker|companion`
- **Access:** Guest
- **Layout:** full-screen pager
- **Type:** marketing / onboarding
- **Content:** 3-4 swipeable slides pitching the role
- **UI Elements:** `Button`, pager dots, skip link
- **States:** `ready`
- **Data:** static (no API)
- **Dependencies:** screen-auth-login
- **Acceptance Criteria:**
  - [ ] `roleHint` persisted into signup flow
  - [ ] Skip routes directly to login
  - [ ] Swipe + next button both advance

### screen-auth-welcome
- **Status:** TODO
- **Route:** `/(auth)/welcome`
- **Access:** Guest
- **Layout:** auth layout
- **Type:** marketing / auth entry
- **Content:** Logo, tagline, Sign up / Log in buttons, legal links
- **UI Elements:** `Button`
- **States:** `ready`
- **Data:** static
- **Dependencies:** screen-auth-login
- **Acceptance Criteria:**
  - [ ] Both buttons route to `/login`
  - [ ] Legal links open `/terms`, `/privacy`

### screen-auth-login
- **Status:** TODO
- **Route:** `/(auth)/login`
- **Access:** Guest
- **Layout:** auth layout
- **Type:** form
- **Content:** Email input, Continue button
- **UI Elements:** `Input`, `Button`
- **States:** `idle`, `submitting`, `error`
- **Data:** `POST /auth/start { email }`
- **Dependencies:** screen-auth-otp
- **Acceptance Criteria:**
  - [ ] Invalid email format blocks submit
  - [ ] 429 rate limit shown as friendly message
  - [ ] Success replaces to `/otp` with email in params

### screen-auth-otp
- **Status:** TODO
- **Route:** `/(auth)/otp`
- **Access:** Guest (pending OTP)
- **Layout:** auth layout
- **Type:** form
- **Content:** 6-digit OTP input, Resend link (60s cooldown), Back
- **UI Elements:** `Input` (OTP variant), `Button`
- **States:** `idle`, `submitting`, `error`
- **Data:** `POST /auth/verify { email, code }`
- **Dependencies:** screen-auth-role-select, screen-seeker-home, screen-comp-home
- **Acceptance Criteria:**
  - [ ] Dev OTP `000000` works when `DEV_AUTH=true`
  - [ ] Existing user replaces to home
  - [ ] New user replaces to role select
  - [ ] Tokens stored in SecureStore (native) / httpOnly cookie (web)

### screen-auth-role-select
- **Status:** TODO
- **Route:** `/(auth)/role-select`
- **Access:** New user (post-OTP, pre-registration)
- **Layout:** auth layout
- **Type:** choice
- **Content:** Two cards "I want to book dates" (seeker) / "I want to earn" (companion)
- **UI Elements:** `Card`, `Button`
- **States:** `idle`, `submitting`
- **Data:** none (role held in state, sent with register)
- **Dependencies:** screen-auth-profile-setup
- **Acceptance Criteria:**
  - [ ] Role locked after selection (no switch)
  - [ ] `roleHint` from onboarding auto-selects initial value

### screen-auth-profile-setup
- **Status:** TODO
- **Route:** `/(auth)/register`
- **Access:** New user (post-role-select)
- **Layout:** auth layout
- **Type:** form
- **Content:** Name, age (21+), bio (companion: min 20 chars), city picker, hourlyRate (companion)
- **UI Elements:** `Input`, city picker, `Button`
- **States:** `idle`, `saving`, `error`
- **Data:** `POST /auth/register { name, role, age, bio, location, hourlyRate }`
- **Dependencies:** screen-verify-intro (seeker), screen-comp-onboard-step2 (companion)
- **Acceptance Criteria:**
  - [ ] age < 21 blocked with message "You must be 21 or older"
  - [ ] Companion hourlyRate in [10, 10000]
  - [ ] Companion bio min 20 chars
  - [ ] Routes to seeker verification or companion onboarding based on role

### screen-verify-intro
- **Status:** TODO
- **Route:** `/(seeker-verify)/intro`
- **Access:** Seeker (registered, not verified)
- **Layout:** verification layout
- **Type:** informational
- **Content:** Why we verify, 4-step preview, Start button
- **UI Elements:** `Button`, step preview list
- **States:** `loading`, `ready`, `error`
- **Data:** `GET /verification/status`
- **Dependencies:** screen-verify-photo-id
- **Acceptance Criteria:**
  - [ ] Skipping is not allowed
  - [ ] Exit routes to `/settings` or warns

### screen-verify-photo-id
- **Status:** TODO
- **Route:** `/(seeker-verify)/photo-id`
- **Access:** Seeker (during verification)
- **Layout:** verification layout
- **Type:** capture
- **Content:** Camera / picker, ID guideline overlay, Submit
- **UI Elements:** `PhotoUpload`, `Button`
- **States:** `idle`, `uploading`, `error`
- **Data:** `POST /api/verification/photo-id`
- **Dependencies:** screen-verify-selfie
- **Acceptance Criteria:**
  - [ ] Accepts JPEG/PNG under 10MB
  - [ ] Upload progress shown
  - [ ] Retry on failure

### screen-verify-selfie
- **Status:** TODO
- **Route:** `/(seeker-verify)/selfie`
- **Access:** Seeker (during verification, step 2)
- **Layout:** verification layout
- **Type:** capture
- **Content:** Front camera, oval overlay, Capture button
- **UI Elements:** `Button`, `PhotoUpload`
- **States:** `idle`, `uploading`
- **Data:** `POST /api/verification/selfie`
- **Dependencies:** screen-stripe-identity-seeker
- **Acceptance Criteria:**
  - [ ] Front-facing camera default
  - [ ] Retake allowed

### screen-stripe-identity-seeker
- **Status:** TODO
- **Route:** `/(seeker-verify)/stripe-identity`
- **Access:** Seeker (during verification)
- **Layout:** verification layout
- **Type:** external SDK
- **Content:** Stripe Identity session launcher
- **UI Elements:** `Button`
- **States:** `loading`, `sdk-open`, `processing`, `success`, `rejected`, `error`
- **Data:** `POST /verification/stripe-identity/start` -> `{ clientSecret }`
- **Dependencies:** screen-verify-consent
- **Acceptance Criteria:**
  - [ ] Under-21 rejection routes to blocked state
  - [ ] Success advances to consent

### screen-verify-consent
- **Status:** TODO
- **Route:** `/(seeker-verify)/consent`
- **Access:** Seeker (during verification, step 4)
- **Layout:** verification layout
- **Type:** form / legal
- **Content:** ToS summary, 3 acknowledgement checkboxes, Agree button
- **UI Elements:** `Button`, checkboxes
- **States:** `idle`, `submitting`
- **Data:** `POST /api/verification/consent`
- **Dependencies:** screen-verify-pending
- **Acceptance Criteria:**
  - [ ] Button disabled until all checkboxes ticked
  - [ ] Timestamp recorded server-side

### screen-verify-pending
- **Status:** TODO
- **Route:** `/(seeker-verify)/pending`
- **Access:** Seeker (verification pending)
- **Layout:** verification layout (terminal, no back)
- **Type:** status
- **Content:** "We're reviewing your documents" + ETA + contact support
- **UI Elements:** `Card`, spinner, support link
- **States:** `waiting`
- **Data:** `GET /verification/status` (poll 30s)
- **Dependencies:** screen-seeker-home
- **Acceptance Criteria:**
  - [ ] Poll interval 30s
  - [ ] Approval auto-replaces to home
  - [ ] Rejection shows reason + retry CTA

### screen-comp-onboard-step2
- **Status:** TODO
- **Route:** `/(comp-onboard)/step2`
- **Access:** Companion (onboarding)
- **Layout:** companion onboarding layout
- **Type:** media upload
- **Content:** 4+ photos (min), 0-3 videos, pick main photo
- **UI Elements:** `PhotoUpload`, `Button`
- **States:** `idle`, `uploading`, `error`
- **Data:** `POST /uploads/photo`, `POST /uploads/video`, `PATCH /users/me/media`
- **Dependencies:** screen-comp-onboard-verify
- **Acceptance Criteria:**
  - [ ] Blocks proceed with < 4 photos
  - [ ] Main photo required
  - [ ] Per-file upload progress

### screen-comp-onboard-verify
- **Status:** TODO
- **Route:** `/(comp-onboard)/verify`
- **Access:** Companion (onboarding)
- **Layout:** companion onboarding layout
- **Type:** external SDK
- **Content:** Stripe Identity launcher
- **UI Elements:** `Button`
- **States:** `idle`, `submitting`, `error`
- **Data:** `POST /verification/stripe-identity/start`
- **Dependencies:** screen-stripe-identity-companion
- **Acceptance Criteria:**
  - [ ] Launches Stripe Identity SDK
  - [ ] Under-21 reject handled

### screen-stripe-identity-companion
- **Status:** TODO
- **Route:** `/(comp-onboard)/verify` (SDK host)
- **Access:** Companion (during onboarding)
- **Layout:** companion onboarding layout
- **Type:** external SDK
- **Content:** Identity flow states
- **UI Elements:** `Button`
- **States:** `loading`, `sdk-open`, `processing`, `success`, `rejected`, `error`
- **Data:** `POST /verification/stripe-identity/start`
- **Dependencies:** screen-comp-onboard-pending
- **Acceptance Criteria:**
  - [ ] Success replaces to pending approval
  - [ ] Rejection shows reason

### screen-comp-onboard-pending
- **Status:** TODO
- **Route:** `/(comp-onboard)/pending`
- **Access:** Companion (pending admin approval)
- **Layout:** companion onboarding layout (terminal)
- **Type:** status
- **Content:** Pending message, ETA, support link
- **UI Elements:** `Card`, spinner
- **States:** `waiting`
- **Data:** `GET /companion/status` (poll 30s)
- **Dependencies:** screen-comp-home
- **Acceptance Criteria:**
  - [ ] Approval auto-replaces to comp-home
  - [ ] Rejection shows reason + retry CTA

### screen-seeker-home
- **Status:** TODO
- **Route:** `/(tabs)/male/browse`
- **Access:** Guest (public only), Seeker (all if verified)
- **Layout:** seeker tab layout
- **Type:** list / browse
- **Content:** Search, filters (city, price, date, rating), companion card grid, sort
- **UI Elements:** `Card`, `FilterModal`, `Avatar`, `Badge`, `Input`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /companions?page=&limit=&city=&priceMin=&priceMax=&date=&rating=`
- **Dependencies:** screen-companion-profile
- **Acceptance Criteria:**
  - [ ] Default sort by `lastSeen DESC`
  - [ ] Pagination (page/limit) with infinite scroll
  - [ ] Filters persist across tabs
  - [ ] Unverified seekers see verification banner

### screen-companion-profile
- **Status:** TODO
- **Route:** `/profile/[id]`
- **Access:** Guest (public only), Seeker, Companion (cannot view own as public)
- **Layout:** detail
- **Type:** profile detail
- **Content:** Photo gallery, name/age/city, bio, hourlyRate, reviews, availability, Book / Message CTA
- **UI Elements:** `UserImage`, `Badge`, `Button`, `Card`
- **States:** `loading`, `populated`, `error`, `not-found`
- **Data:** `GET /companions/:id`
- **Dependencies:** screen-booking-detail, screen-chat-conversation
- **Acceptance Criteria:**
  - [ ] Guest sees only isPublic profiles
  - [ ] Unverified seeker sees "verify to book/message"
  - [ ] Pre-chat button respects 5-message limit

### screen-booking-detail
- **Status:** TODO
- **Route:** `/booking/[id]`
- **Access:** Seeker (verified), Companion (own), Admin
- **Layout:** detail
- **Type:** detail / form
- **Content:** Booking form (activity, date, duration, location, notes), price breakdown, Book button
- **UI Elements:** `Input`, `Button`, `Card`
- **States:** `loading`, `loaded`, `error`
- **Data:** `GET /companions/:id`, `POST /bookings { companion_id, ... }`
- **Dependencies:** screen-booking-payment
- **Acceptance Criteria:**
  - [ ] Future dateTime only
  - [ ] Duration >= 0.5h
  - [ ] Price breakdown matches monetization rules
  - [ ] Overlap check errors rendered inline

### screen-booking-payment
- **Status:** TODO
- **Route:** `/payment/[bookingId]`
- **Access:** Seeker (verified, own booking)
- **Layout:** detail
- **Type:** form (Stripe)
- **Content:** Price breakdown, Stripe Payment Element, Pay button
- **UI Elements:** `StripePaymentForm`, `StripeProvider`, `Button`
- **States:** `idle`, `processing`, `error`
- **Data:** `POST /payments/bookings/:bookingId/pay` (Payment Intent, manual capture)
- **Dependencies:** screen-booking-request-sent
- **Acceptance Criteria:**
  - [ ] Manual capture (hold) used
  - [ ] Total charged = date cost + fee + Stripe fee
  - [ ] Error states surfaced from Stripe
  - [ ] Success replaces (no back to payment)

### screen-booking-request-sent
- **Status:** TODO
- **Route:** `/booking/[id]/sent`
- **Access:** Seeker (post-payment)
- **Layout:** detail (replace, no back)
- **Type:** confirmation
- **Content:** "Request sent" illustration, booking summary, "Go home" CTA
- **UI Elements:** `EmptyState`-style illustration, `Button`
- **States:** `success`
- **Data:** none
- **Dependencies:** screen-seeker-home
- **Acceptance Criteria:**
  - [ ] No back-nav to payment
  - [ ] Deep link opens booking detail for future viewing

### screen-seeker-bookings
- **Status:** TODO
- **Route:** `/(tabs)/male/bookings`
- **Access:** Seeker
- **Layout:** seeker tab layout
- **Type:** list
- **Content:** Upcoming / Pending / Completed / All tabs, booking row cards
- **UI Elements:** `Card`, `Badge`, `Button`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /bookings?filter=upcoming&page=1`
- **Dependencies:** screen-booking-detail, screen-reviews-write, screen-date-completion
- **Acceptance Criteria:**
  - [ ] Filters persist in URL
  - [ ] Completed bookings show "Write review" CTA if unreviewed
  - [ ] Pull-to-refresh

### screen-seeker-favorites
- **Status:** TODO
- **Route:** `/(tabs)/male/favorites`
- **Access:** Seeker (verified)
- **Layout:** seeker tab layout
- **Type:** list
- **Content:** Favorite companion cards
- **UI Elements:** `Card`, `UserImage`, `Button`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /favorites`, `DELETE /favorites/:companionId`
- **Dependencies:** screen-companion-profile
- **Acceptance Criteria:**
  - [ ] Empty state with CTA to browse
  - [ ] Remove-from-favorites instant UI update

### screen-seeker-messages
- **Status:** TODO
- **Route:** `/(tabs)/male/messages`
- **Access:** Seeker (verified for send, unverified can read)
- **Layout:** seeker tab layout
- **Type:** list
- **Content:** Conversation list, unread badges, pre-booking label
- **UI Elements:** `Card`, `Avatar`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /messages/conversations`
- **Dependencies:** screen-chat-conversation
- **Acceptance Criteria:**
  - [ ] Sort by most recent message
  - [ ] Pre-booking threads show 5-msg cap
  - [ ] Real-time updates via Socket.IO

### screen-chat-conversation
- **Status:** TODO
- **Route:** `/chat/[id]`
- **Access:** Seeker (verified), Companion (existing thread or booking)
- **Layout:** detail
- **Type:** chat
- **Content:** Message list, composer, header with avatar
- **UI Elements:** `Avatar`, `Input`, `Button`, message bubbles
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /messages/:userId`, `POST /messages/:userId { content }`, Socket.IO events
- **Dependencies:** screen-companion-profile, screen-booking-detail
- **Acceptance Criteria:**
  - [ ] Pre-booking 5-msg limit enforced
  - [ ] Message >=1 and <=2000 chars
  - [ ] Socket.IO delivers without refresh
  - [ ] Optimistic send with retry

### screen-seeker-profile
- **Status:** TODO
- **Route:** `/(tabs)/male/profile`
- **Access:** Seeker
- **Layout:** seeker tab layout
- **Type:** navigation hub
- **Content:** Profile card, quick links, Log out, Delete account
- **UI Elements:** `Card`, `Avatar`, `Badge`, `Button`
- **States:** `loaded`
- **Data:** `GET /users/me`
- **Dependencies:** screen-settings
- **Acceptance Criteria:**
  - [ ] Verified badge if `isVerified=true`
  - [ ] All sub-links route correctly
  - [ ] Log out clears tokens

### screen-date-completion
- **Status:** TODO
- **Route:** `/booking/[id]/complete`
- **Access:** Seeker (confirm), Companion (input), Admin (dispute review)
- **Layout:** detail
- **Type:** form
- **Content:** Companion enters actual duration; seeker confirms or disputes
- **UI Elements:** `Input`, `Button`, `Card`
- **States:** `companion-input`, `seeker-confirm`, `disputed`, `completed`, `error`
- **Data:** `PUT /bookings/:id/complete { actualDuration }`, `POST /bookings/:id/confirm-duration`, `PUT /bookings/:id/dispute`
- **Dependencies:** screen-reviews-write, screen-admin-disputes
- **Acceptance Criteria:**
  - [ ] Duration >= 0.5h
  - [ ] Seeker 48h timer to confirm or auto-confirms
  - [ ] Dispute path routes to admin

### screen-reviews-write
- **Status:** TODO
- **Route:** `/reviews/new?bookingId=X`
- **Access:** Seeker (after completed booking)
- **Layout:** detail
- **Type:** form
- **Content:** 5-star rating, comment (<=1000), Submit
- **UI Elements:** `Button`, `Input` (multiline), star picker
- **States:** `idle`, `submitting`, `error`
- **Data:** `POST /reviews/bookings/:bookingId { rating, comment }`
- **Dependencies:** screen-seeker-bookings
- **Acceptance Criteria:**
  - [ ] One review per booking enforced
  - [ ] Rating 1-5 required
  - [ ] Replace to booking detail on success

### screen-comp-home
- **Status:** TODO
- **Route:** `/(tabs)/female/index`
- **Access:** Companion (verified, approved)
- **Layout:** companion tab layout
- **Type:** dashboard
- **Content:** Stats summary, upcoming bookings, pending requests CTA, online toggle
- **UI Elements:** `Card`, `Badge`, `Button`
- **States:** `loading`, `populated`, `error`
- **Data:** `GET /companion/dashboard`
- **Dependencies:** screen-comp-requests, screen-comp-earnings, screen-comp-calendar
- **Acceptance Criteria:**
  - [ ] Unapproved companions cannot access
  - [ ] Online toggle flips `lastSeen`
  - [ ] Pending count badge matches tab

### screen-comp-requests
- **Status:** TODO
- **Route:** `/(tabs)/female/requests`
- **Access:** Companion
- **Layout:** companion tab layout
- **Type:** list
- **Content:** Pending booking requests with Accept/Decline, 24h expiry timers
- **UI Elements:** `Card`, `Button`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /bookings/requests?status=pending`, `PUT /bookings/:id/accept`, `PUT /bookings/:id/decline`
- **Dependencies:** screen-booking-detail, screen-chat-conversation
- **Acceptance Criteria:**
  - [ ] 24h expiry countdown
  - [ ] Accept reserves companion calendar
  - [ ] Decline releases payment hold

### screen-comp-calendar
- **Status:** TODO
- **Route:** `/(tabs)/female/calendar`
- **Access:** Companion
- **Layout:** companion tab layout
- **Type:** calendar editor
- **Content:** Month grid, blocked dates highlighted, tap to toggle, reason input
- **UI Elements:** `Card`, `Button`, calendar grid
- **States:** `loading`, `loaded`, `saving`, `error`
- **Data:** `GET /calendar/blocked`, `POST /calendar/block`, `DELETE /calendar/block`
- **Dependencies:** screen-comp-requests
- **Acceptance Criteria:**
  - [ ] Cannot block past dates
  - [ ] Cannot block dates with confirmed bookings
  - [ ] Optimistic UI on toggle

### screen-comp-earnings
- **Status:** TODO
- **Route:** `/(tabs)/female/earnings`
- **Access:** Companion
- **Layout:** companion tab layout
- **Type:** finance dashboard
- **Content:** Available balance, pending, history, Payout button, Stripe Connect status
- **UI Elements:** `Card`, `Button`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /payments/earnings`, `GET /payments/earnings/history`, `GET /payments/payouts/balance`, `POST /payments/payouts`
- **Dependencies:** screen-comp-stripe-connect
- **Acceptance Criteria:**
  - [ ] Payout disabled until Stripe Connect enabled
  - [ ] Min payout $50 enforced
  - [ ] History paginated

### screen-comp-stripe-connect
- **Status:** TODO
- **Route:** `/stripe/connect`
- **Access:** Companion
- **Layout:** detail
- **Type:** external redirect
- **Content:** Onboarding CTA, pending requirements list
- **UI Elements:** `Button`, `Card`
- **States:** `idle`, `processing`, `error`
- **Data:** `POST /stripe/connect/onboarding -> { onboardingUrl }`, `GET /stripe/connect/status`
- **Dependencies:** screen-comp-earnings
- **Acceptance Criteria:**
  - [ ] Redirect to Stripe hosted onboarding
  - [ ] Return callback refreshes status
  - [ ] Payout eligibility reflected

### screen-comp-messages
- **Status:** TODO
- **Route:** `/(tabs)/female/messages`
- **Access:** Companion
- **Layout:** companion tab layout
- **Type:** list
- **Content:** Conversation list, unread badges, pre-booking label, close-thread swipe
- **UI Elements:** `Card`, `Avatar`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /messages/conversations`, `POST /messages/:userId/close`
- **Dependencies:** screen-chat-conversation
- **Acceptance Criteria:**
  - [ ] Can close pre-booking thread
  - [ ] Closed threads removed from list
  - [ ] Real-time updates

### screen-settings
- **Status:** TODO
- **Route:** `/settings`
- **Access:** Any authenticated user
- **Layout:** detail / navigation hub
- **Type:** navigation hub
- **Content:** Edit profile, notifications, blocked users, bank (companion), delete account, log out
- **UI Elements:** `Card`, `Button`
- **States:** `loaded`
- **Data:** `GET /users/me`
- **Dependencies:** screen-seeker-profile, screen-comp-stripe-connect
- **Acceptance Criteria:**
  - [ ] Role-specific links (bank only for companion)
  - [ ] Delete account requires confirmation
  - [ ] Log out clears all tokens

### screen-admin-dashboard
- **Status:** TODO
- **Route:** `/admin`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** dashboard
- **Content:** Key stats cards, quick links to verifications, disputes, bookings
- **UI Elements:** `Card`, `Badge`, `Button`
- **States:** `loading`, `populated`, `error`
- **Data:** `GET /auth/me`, `GET /admin/stats`
- **Dependencies:** screen-admin-users, screen-admin-verifications, screen-admin-bookings
- **Acceptance Criteria:**
  - [ ] Non-admin redirected
  - [ ] Stats match DB counts
  - [ ] Pending badges match tab counts

### screen-admin-users
- **Status:** TODO
- **Route:** `/admin/users`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** CRUD list
- **Content:** Search, filter by role, pagination, ban/unban actions
- **UI Elements:** `Input`, `Card`, `Button`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /admin/users?search=&page=&limit=`, `GET /admin/users/:id`, `POST /admin/users/:id/ban`, `POST /admin/users/:id/unban`
- **Dependencies:** screen-admin-verifications, screen-admin-bookings
- **Acceptance Criteria:**
  - [ ] Search hits email/name
  - [ ] Ban blocks login
  - [ ] Audit log entry per action

### screen-admin-verifications
- **Status:** TODO
- **Route:** `/admin/verifications`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** review queue
- **Content:** Pending verifications, Approve / Reject (with reason)
- **UI Elements:** `Card`, `Button`, `Input`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /admin/verifications`, `PUT /admin/verifications/:id/approve`, `PUT /admin/verifications/:id/reject { reason }`
- **Dependencies:** screen-admin-users
- **Acceptance Criteria:**
  - [ ] Approve flips `users.isVerified=true`
  - [ ] Reject stores `rejectionReason`
  - [ ] User notified (email)

### screen-admin-bookings
- **Status:** TODO
- **Route:** `/admin/bookings`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** CRUD list
- **Content:** Filters (status, date, dispute), details, cancel
- **UI Elements:** `Card`, `Button`, `Badge`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /admin/bookings`, `POST /admin/bookings/:id/cancel`
- **Dependencies:** screen-admin-disputes
- **Acceptance Criteria:**
  - [ ] Admin cancel triggers refund per policy
  - [ ] Filters persist in URL

### screen-admin-disputes
- **Status:** TODO
- **Route:** `/admin/disputes`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** review queue
- **Content:** Open disputes, resolution actions (refund / partial / warn / ban)
- **UI Elements:** `Card`, `Button`, `Input`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /admin/disputes`, `PUT /admin/disputes/:id/resolve`, `PUT /admin/disputes/:id/refund`
- **Dependencies:** screen-admin-bookings
- **Acceptance Criteria:**
  - [ ] Resolution stored with admin_id
  - [ ] Stripe refund triggered correctly
  - [ ] Notifications sent

### screen-admin-cities
- **Status:** TODO
- **Route:** `/admin/cities`
- **Access:** Admin
- **Layout:** admin layout
- **Type:** CRUD list
- **Content:** City list, add form (name/state/slug), toggle active
- **UI Elements:** `Card`, `Input`, `Button`
- **States:** `loading`, `populated`, `empty`, `error`
- **Data:** `GET /admin/cities`, `POST /admin/cities`, `PATCH /admin/cities/:id { isActive }`
- **Dependencies:** screen-seeker-home
- **Acceptance Criteria:**
  - [ ] Unique slug enforced
  - [ ] Deactivate hides from browse filter

---

## Section 3 — Navigation Map

### 3.1 Seeker Tab Bar (5)
1. Browse — magnifying-glass — screen-seeker-home
2. Bookings — calendar — screen-seeker-bookings
3. Favorites — heart — screen-seeker-favorites
4. Messages — chat-bubble — screen-seeker-messages (unread badge)
5. Profile — person-circle — screen-seeker-profile

### 3.2 Companion Tab Bar (5)
1. Home — chart-bar — screen-comp-home
2. Requests — inbox-tray — screen-comp-requests (pending badge)
3. Calendar — calendar — screen-comp-calendar
4. Earnings — dollar-circle — screen-comp-earnings
5. Messages — chat-bubble — screen-comp-messages (unread badge)

### 3.3 Admin Sidebar (6)
1. Dashboard — screen-admin-dashboard
2. Users — screen-admin-users
3. Verifications — screen-admin-verifications
4. Bookings — screen-admin-bookings
5. Disputes — screen-admin-disputes
6. Cities — screen-admin-cities

### 3.4 Auth Flow
```
Landing -> Welcome -> Login -> OTP
  -> [new user] Role Select -> Profile Setup -> Verification/Onboarding -> Home
  -> [existing] Home (replace)
Landing -> Onboarding Slides (roleHint) -> Login -> OTP -> Profile Setup -> ...
```

### 3.5 Seeker Verification Flow
```
Profile Setup -> Verify Intro -> Photo ID -> Selfie -> Stripe Identity -> Consent -> Pending -> [admin approves] -> Browse
```

### 3.6 Companion Onboarding Flow
```
Profile Setup -> Comp Step2 (photos/videos >=4) -> Comp Verify -> Stripe Identity -> Comp Pending -> [admin approves] -> Comp Home
```

### 3.7 Booking Flow
```
Browse -> Companion Profile -> Booking Detail -> Payment -> Request Sent
  -> [companion accepts] Confirmed -> Date -> Date Completion -> Review
```

### 3.8 Messaging Flow
```
Companion Profile -> Chat (pre-booking, 5 msg/side) -> [after booking] Unlimited Chat
Messages Tab -> Conversation List -> Chat Conversation
```

### 3.9 Deep Links (Push Notifications)
| Push | Screen |
|---|---|
| "New Date Request" | screen-comp-requests |
| "Date Confirmed" | screen-booking-detail |
| "Confirm Duration" | screen-date-completion |
| "[Name] is online" | screen-companion-profile |
| "New message" | screen-chat-conversation |
| "Payout sent" | screen-comp-earnings |
| "You're Verified" | screen-seeker-home / screen-comp-home |

### 3.10 Transition Map (key edges)
| From | To | Transition |
|---|---|---|
| OTP | Home (existing) | replace |
| Payment | Request Sent | replace |
| Consent | Pending | replace |
| Date Completion | Review | replace |
| Any tab switch | Any tab | tab (instant) |
| Browse | Companion Profile | push |
| Settings | Sub-setting | push |

---

## Section 4 — Access Matrix

Legend: `-` = no access, `R` = read, `W` = read + write, `A` = admin/special.

| Screen | Guest | Seeker (unverified) | Seeker (verified) | Companion (pending) | Companion (active) | Admin |
|---|---|---|---|---|---|---|
| screen-landing | R | R | R | R | R | R |
| screen-onboarding-slides | R | - | - | - | - | - |
| screen-auth-welcome | R | - | - | - | - | - |
| screen-auth-login | W | - | - | - | - | - |
| screen-auth-otp | W | - | - | - | - | - |
| screen-auth-role-select | - | W | - | W | - | - |
| screen-auth-profile-setup | - | W | - | W | - | - |
| screen-verify-intro | - | R | - | - | - | - |
| screen-verify-photo-id | - | W | - | - | - | - |
| screen-verify-selfie | - | W | - | - | - | - |
| screen-stripe-identity-seeker | - | W | - | - | - | - |
| screen-verify-consent | - | W | - | - | - | - |
| screen-verify-pending | - | R | - | - | - | - |
| screen-comp-onboard-step2 | - | - | - | W | - | - |
| screen-comp-onboard-verify | - | - | - | W | - | - |
| screen-stripe-identity-companion | - | - | - | W | - | - |
| screen-comp-onboard-pending | - | - | - | R | - | - |
| screen-seeker-home | R (public) | R (public) | R (all) | - | - | - |
| screen-companion-profile | R (public) | R (public) | R (all) | - | - | R |
| screen-booking-detail | - | R (CTA verify) | W | - | R (own) | R |
| screen-booking-payment | - | - | W | - | - | - |
| screen-booking-request-sent | - | - | R | - | - | - |
| screen-seeker-bookings | - | R | W | - | - | - |
| screen-seeker-favorites | - | - | W | - | - | - |
| screen-seeker-messages | - | R | W | - | - | - |
| screen-chat-conversation | - | R | W | - | W | R |
| screen-seeker-profile | - | R | W | - | - | - |
| screen-date-completion | - | - | W | - | W | A |
| screen-reviews-write | - | - | W | - | - | - |
| screen-comp-home | - | - | - | - | R | - |
| screen-comp-requests | - | - | - | - | W | - |
| screen-comp-calendar | - | - | - | - | W | - |
| screen-comp-earnings | - | - | - | - | R | - |
| screen-comp-stripe-connect | - | - | - | - | W | - |
| screen-comp-messages | - | - | - | - | W | - |
| screen-settings | - | W | W | W | W | W |
| screen-admin-dashboard | - | - | - | - | - | A |
| screen-admin-users | - | - | - | - | - | A |
| screen-admin-verifications | - | - | - | - | - | A |
| screen-admin-bookings | - | - | - | - | - | A |
| screen-admin-disputes | - | - | - | - | - | A |
| screen-admin-cities | - | - | - | - | - | A |

---

## Section 5 — DB Schema (PostgreSQL)

### 5.1 Tables (20)

#### users
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | varchar(254) UNIQUE | lowercase |
| role | enum | seeker\|companion\|admin |
| name | varchar | required |
| age | int | CHECK >= 21 |
| bio | text | companion: min 20 chars |
| city_id | UUID FK cities | |
| hourlyRate | decimal | companion only, CHECK 10..10000 |
| avatar_url | varchar | nullable |
| isVerified | bool | default false |
| isPublicProfile | bool | default false |
| isActive | bool | default true |
| lastSeen | timestamp | |
| payoutEnabled | bool | default false |
| createdAt, updatedAt | timestamp | |
| Indexes: UNIQUE(email), INDEX(city_id), INDEX(role), INDEX(isActive, isPublicProfile), INDEX(lastSeen DESC) |

#### verifications
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK users | UNIQUE |
| status | enum | not_started\|in_progress\|pending_review\|approved\|rejected |
| idPhotoUrl | varchar | |
| selfieUrl | varchar | |
| consentGiven | bool | |
| consentDate | timestamp | |
| stripeIdentitySessionId | varchar | nullable |
| fingerprintStatus | enum | POST-MVP |
| rejectionReason | text | nullable |
| createdAt, updatedAt | timestamp | |
| Indexes: UNIQUE(user_id), INDEX(status) |

#### bookings
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| seeker_id | UUID FK users | |
| companion_id | UUID FK users | |
| activity | enum | dinner\|drinks\|coffee\|walk\|movie\|museum\|concert\|other |
| dateTime | timestamp | must be future |
| duration | decimal | hours, CHECK >= 0.5 |
| location | varchar | |
| notes | text | max 2000 |
| status | enum | pending\|confirmed\|cancelled\|completed\|disputed\|auto_expired |
| totalPrice | decimal | locked at create |
| serviceFee | decimal | locked at create |
| actualDuration | decimal | nullable |
| cancelledBy | enum | seeker\|companion\|system, nullable |
| cancelReason | text | nullable |
| createdAt, updatedAt | timestamp | |
| Indexes: INDEX(seeker_id), INDEX(companion_id), INDEX(status), INDEX(dateTime), INDEX(companion_id, dateTime), INDEX(status, dateTime) |
| Constraints: no overlapping bookings for same companion+time |

#### payments
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| booking_id | UUID FK bookings | |
| stripePaymentIntentId | varchar | UNIQUE |
| amount | decimal | |
| status | enum | pending\|authorized\|captured\|refunded\|partial_refund\|failed\|cancelled\|disputed |
| captureMethod | enum | manual (default)\|automatic |
| createdAt, updatedAt | timestamp | |
| Indexes: INDEX(booking_id), UNIQUE(stripePaymentIntentId), INDEX(status) |

#### reviews
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| booking_id | UUID FK bookings | |
| reviewer_id | UUID FK users | |
| target_id | UUID FK users | |
| rating | int | CHECK 1..5 |
| comment | text | max 1000 |
| createdAt | timestamp | |
| Indexes: INDEX(booking_id), INDEX(target_id), UNIQUE(reviewer_id, booking_id) |

#### messages
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| sender_id | UUID FK users | |
| receiver_id | UUID FK users | |
| thread_id | varchar | |
| content | text | max 2000 |
| isRead | bool | default false |
| createdAt | timestamp | |
| Indexes: INDEX(thread_id, createdAt), INDEX(sender_id), INDEX(receiver_id), INDEX(receiver_id, isRead) |
| Constraint: pre-booking threads max 5 messages per side |

#### favorites
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| seeker_id | UUID FK users | |
| companion_id | UUID FK users | |
| createdAt | timestamp | |
| Indexes: UNIQUE(seeker_id, companion_id), INDEX(seeker_id) |

#### cities
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | varchar | |
| state | varchar | |
| slug | varchar | UNIQUE |
| isActive | bool | default true |
| createdAt | timestamp | |
| Indexes: UNIQUE(slug), INDEX(isActive) |
| Seed: ~100 US cities |

#### calendar_blocks
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| companion_id | UUID FK users | |
| date | date | |
| reason | text | nullable |
| createdAt | timestamp | |
| Indexes: UNIQUE(companion_id, date) |

#### platform_settings
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | singleton |
| commissionRate | decimal | default 0.20 |
| minPayoutAmount | decimal | default 50.00 |
| updatedAt | timestamp | |

#### online_watchers
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| seeker_id | UUID FK users | |
| companion_id | UUID FK users | |
| createdAt | timestamp | |
| Indexes: UNIQUE(seeker_id, companion_id), INDEX(companion_id) |
| One-shot: deleted after notification sent |

#### refresh_tokens
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK users | |
| token | varchar | UNIQUE |
| expiresAt | timestamp | |
| createdAt | timestamp | |
| Indexes: INDEX(user_id), UNIQUE(token), INDEX(expiresAt) |
| TTL: 30 days sliding |

#### disputes
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| booking_id | UUID FK bookings | |
| opened_by | UUID FK users | |
| type | enum | no_show\|duration\|safety\|other\|mutual_no_show |
| reason | text | max 2000 |
| status | enum | open\|resolved\|dismissed |
| resolution | enum | full_refund\|partial_refund\|no_refund\|warning\|ban, nullable |
| refundAmount | decimal | nullable |
| resolved_by | UUID FK users | admin, nullable |
| createdAt, updatedAt, resolvedAt | timestamp | |
| Indexes: INDEX(booking_id), INDEX(status), INDEX(resolved_by) |

#### reports
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| reporter_id | UUID FK users | |
| target_id | UUID FK users | |
| reason | enum | inappropriate\|safety\|fake\|other |
| details | text | max 2000 |
| status | enum | open\|reviewed\|actioned |
| createdAt | timestamp | |
| Indexes: INDEX(target_id), INDEX(status) |

#### notifications
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK users | |
| type | varchar | event name (e.g. booking.confirmed) |
| payload | jsonb | |
| isRead | bool | default false |
| sentEmail | bool | default false |
| sentPush | bool | default false (POST-MVP) |
| createdAt | timestamp | |
| Indexes: INDEX(user_id, createdAt DESC), INDEX(user_id, isRead) |

#### photos
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK users | |
| url | varchar | MinIO key |
| isMain | bool | default false |
| sortOrder | int | default 0 |
| createdAt | timestamp | |
| Indexes: INDEX(user_id, sortOrder) |
| Constraint: companion must have >=4 photos to activate |

#### videos
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK users | |
| url | varchar | MinIO key |
| thumbnailUrl | varchar | |
| sortOrder | int | default 0 |
| createdAt | timestamp | |
| Indexes: INDEX(user_id) |
| Constraint: max 3 videos per companion |

#### blocks
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| blocker_id | UUID FK users | |
| blocked_id | UUID FK users | |
| createdAt | timestamp | |
| Indexes: UNIQUE(blocker_id, blocked_id), INDEX(blocked_id) |

#### payouts
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| companion_id | UUID FK users | |
| stripeTransferId | varchar | UNIQUE |
| amount | decimal | CHECK >= 50 |
| status | enum | pending\|paid\|failed |
| createdAt, updatedAt | timestamp | |
| Indexes: INDEX(companion_id), UNIQUE(stripeTransferId), INDEX(status) |

#### audit_log
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| actor_id | UUID FK users | admin |
| action | varchar | e.g. user.ban, verification.approve |
| target_type | varchar | |
| target_id | UUID | |
| meta | jsonb | |
| createdAt | timestamp | |
| Indexes: INDEX(actor_id, createdAt DESC), INDEX(action), INDEX(target_id) |

### 5.2 Cross-cutting Constraints
- `UNIQUE(users.email)`
- `CHECK(users.age >= 21)`
- `CHECK(users.hourlyRate >= 10 AND <= 10000)` (companion)
- `CHECK(bookings.duration >= 0.5)`
- `CHECK(bookings.actualDuration >= 0.5 OR IS NULL)`
- `CHECK(reviews.rating BETWEEN 1 AND 5)`
- `FK(bookings.seeker_id) ON DELETE RESTRICT`
- `FK(bookings.companion_id) ON DELETE RESTRICT`
- `platform_settings` singleton enforced application-level

### 5.3 Enums (exact values)
- `user.role`: `seeker | companion | admin`
- `verification.status`: `not_started | in_progress | pending_review | approved | rejected`
- `booking.status`: `pending | confirmed | cancelled | completed | disputed | auto_expired`
- `booking.cancelledBy`: `seeker | companion | system`
- `booking.activity`: `dinner | drinks | coffee | walk | movie | museum | concert | other`
- `payment.status`: `pending | authorized | captured | refunded | partial_refund | failed | cancelled`
- `payment.captureMethod`: `manual | automatic`
- `dispute.type`: `no_show | duration | safety | other | mutual_no_show`
- `dispute.resolution`: `full_refund | partial_refund | no_refund | warning | ban`

---

## Section 6 — API Spec

Base URL: `https://daterabbit-api.smartlaunchhub.com/api` (local: `http://localhost:3004/api`). All auth endpoints except `/auth/*` require `Authorization: Bearer <accessToken>`.

| # | Method | Path | Purpose | Screen |
|---|---|---|---|---|
| 1 | POST | `/auth/start` | Send OTP to email | screen-auth-login |
| 2 | POST | `/auth/verify` | Verify OTP, issue JWT | screen-auth-otp |
| 3 | POST | `/auth/register` | Create profile (name, role, age, bio, ...) | screen-auth-profile-setup |
| 4 | POST | `/auth/refresh` | Rotate refresh token | global |
| 5 | POST | `/auth/logout` | Revoke refresh token | screen-settings |
| 6 | GET | `/auth/me` | Current session user | screen-admin-dashboard |
| 7 | GET | `/users/me` | Current user profile | screen-seeker-profile, screen-settings |
| 8 | PATCH | `/users/me` | Update profile | screen-settings |
| 9 | GET | `/users/me/stats` | Stats (bookings, reviews) | screen-seeker-profile |
| 10 | PATCH | `/users/me/media` | Update photo/video selection | screen-comp-onboard-step2 |
| 11 | GET | `/verification/status` | Verification progress | screen-verify-intro, screen-verify-pending |
| 12 | POST | `/api/verification/photo-id` | Upload ID photo | screen-verify-photo-id |
| 13 | POST | `/api/verification/selfie` | Upload selfie | screen-verify-selfie |
| 14 | POST | `/verification/stripe-identity/start` | Start Stripe Identity | screen-stripe-identity-seeker, screen-stripe-identity-companion |
| 15 | POST | `/api/verification/consent` | Submit consent | screen-verify-consent |
| 16 | GET | `/companion/status` | Companion approval status | screen-comp-onboard-pending |
| 17 | GET | `/companion/dashboard` | Companion dashboard stats | screen-comp-home |
| 18 | GET | `/companions` | Browse companions (filters, pagination) | screen-seeker-home, screen-landing |
| 19 | GET | `/companions/:id` | Companion profile + availability | screen-companion-profile, screen-booking-detail |
| 20 | POST | `/bookings` | Create booking | screen-booking-detail |
| 21 | GET | `/bookings` | List user's bookings (filter) | screen-seeker-bookings |
| 22 | GET | `/bookings/requests` | Pending requests (companion) | screen-comp-requests |
| 23 | GET | `/bookings/:id` | Booking detail | screen-booking-detail |
| 24 | PUT | `/bookings/:id/accept` | Companion accepts | screen-comp-requests |
| 25 | PUT | `/bookings/:id/decline` | Companion declines | screen-comp-requests |
| 26 | PUT | `/bookings/:id/cancel` | Cancel (seeker/companion) | screen-seeker-bookings |
| 27 | PUT | `/bookings/:id/complete` | Companion enters duration | screen-date-completion |
| 28 | POST | `/bookings/:id/confirm-duration` | Seeker confirms | screen-date-completion |
| 29 | PUT | `/bookings/:id/dispute` | Open dispute | screen-date-completion |
| 30 | POST | `/payments/bookings/:bookingId/pay` | Stripe Payment Intent | screen-booking-payment |
| 31 | GET | `/payments/earnings` | Companion earnings summary | screen-comp-earnings |
| 32 | GET | `/payments/earnings/history` | Earnings history | screen-comp-earnings |
| 33 | GET | `/payments/payouts/balance` | Available balance | screen-comp-earnings |
| 34 | POST | `/payments/payouts` | Request payout | screen-comp-earnings |
| 35 | POST | `/stripe/connect/onboarding` | Start Stripe Connect | screen-comp-stripe-connect |
| 36 | GET | `/stripe/connect/status` | Connect status | screen-comp-stripe-connect |
| 37 | POST | `/stripe/webhooks` | Stripe webhook receiver | global |
| 38 | GET | `/messages/conversations` | Conversation list | screen-seeker-messages, screen-comp-messages |
| 39 | GET | `/messages/:userId` | Thread history | screen-chat-conversation |
| 40 | POST | `/messages/:userId` | Send message | screen-chat-conversation |
| 41 | POST | `/messages/:userId/close` | Close pre-booking thread | screen-comp-messages |
| 42 | GET | `/favorites` | Seeker favorites | screen-seeker-favorites |
| 43 | POST | `/favorites/:companionId` | Add favorite | screen-companion-profile |
| 44 | DELETE | `/favorites/:companionId` | Remove favorite | screen-seeker-favorites |
| 45 | POST | `/reviews/bookings/:bookingId` | Write review | screen-reviews-write |
| 46 | GET | `/reviews/user/:id` | Reviews for user | screen-companion-profile |
| 47 | GET | `/calendar/blocked` | Companion blocked dates | screen-comp-calendar |
| 48 | POST | `/calendar/block` | Block dates | screen-comp-calendar |
| 49 | DELETE | `/calendar/block` | Unblock dates | screen-comp-calendar |
| 50 | GET | `/cities` | Active cities (public) | screen-auth-profile-setup, screen-seeker-home |
| 51 | POST | `/uploads/photo` | Upload photo -> MinIO | screen-comp-onboard-step2 |
| 52 | POST | `/uploads/video` | Upload video -> MinIO | screen-comp-onboard-step2 |
| 53 | POST | `/reports` | Report user | screen-companion-profile, screen-chat-conversation |
| 54 | POST | `/blocks/:userId` | Block user | screen-settings |
| 55 | DELETE | `/blocks/:userId` | Unblock user | screen-settings |
| 56 | POST | `/online/watch/:companionId` | Watch-online for companion | screen-companion-profile |
| 57 | GET | `/notifications` | User notifications | screen-settings |
| 58 | PATCH | `/notifications/:id/read` | Mark read | global |
| 59 | GET | `/admin/stats` | Admin dashboard stats | screen-admin-dashboard |
| 60 | GET | `/admin/users` | Admin user list | screen-admin-users |
| 61 | GET | `/admin/users/:id` | Admin user detail | screen-admin-users |
| 62 | POST | `/admin/users/:id/ban` | Ban user | screen-admin-users |
| 63 | POST | `/admin/users/:id/unban` | Unban user | screen-admin-users |
| 64 | GET | `/admin/verifications` | Verification queue | screen-admin-verifications |
| 65 | PUT | `/admin/verifications/:id/approve` | Approve verification | screen-admin-verifications |
| 66 | PUT | `/admin/verifications/:id/reject` | Reject verification | screen-admin-verifications |
| 67 | GET | `/admin/bookings` | Admin booking list | screen-admin-bookings |
| 68 | POST | `/admin/bookings/:id/cancel` | Admin cancel booking | screen-admin-bookings |
| 69 | GET | `/admin/disputes` | Disputes queue | screen-admin-disputes |
| 70 | PUT | `/admin/disputes/:id/resolve` | Resolve dispute | screen-admin-disputes |
| 71 | PUT | `/admin/disputes/:id/refund` | Issue refund | screen-admin-disputes |
| 72 | GET | `/admin/cities` | Admin cities list | screen-admin-cities |
| 73 | POST | `/admin/cities` | Add city | screen-admin-cities |
| 74 | PATCH | `/admin/cities/:id` | Update city (active) | screen-admin-cities |

---

## Section 7 — Seed Data

### 7.1 Dev Test Account (always seeded first)
```json
{
  "email": "serter2069@gmail.com",
  "phone": "+17024826083",
  "role": "admin",
  "name": "Sergei Dev",
  "age": 35,
  "city_id": "<first NYC city>",
  "isVerified": true,
  "isActive": true
}
```
This account is admin but also has a seeker profile: it can browse companions, create bookings with seeded companions, write reviews, and access `/admin`. All seeded notifications/messages/bookings include this account so developer sees all data types.

### 7.2 Seed Strategy
- Script: `scripts/seed.ts` (run via `npm run seed` or `seed.yml` GitHub workflow)
- RNG: `faker` with fixed seed `42` (deterministic across runs)
- Images: `picsum.photos/seed/<id>/800/1200` (fake photos) + `picsum.photos/seed/<id>/400/400` (thumbnails)
- Reset: `scripts/seed.ts --truncate` wipes tables in FK-safe order before insert

### 7.3 Volumes
| Table | Count |
|---|---|
| cities | ~100 (top US cities from static list) |
| users (seekers) | 40 (half verified, half unverified) |
| users (companions) | 60 (48 approved active, 8 pending, 4 rejected) |
| users (admins) | 2 (incl. dev account) |
| verifications | 102 (1 per non-admin user) |
| photos | 240+ (4 per companion, 2 per seeker) |
| videos | 60 (1 per active companion) |
| favorites | 150 (random pairs) |
| bookings | 200 (40 pending, 60 confirmed future, 80 completed past, 20 cancelled/disputed) |
| payments | 200 (matching bookings) |
| reviews | 80 (1 per completed booking) |
| messages | 500 (across 50 threads, mix pre-booking + active) |
| calendar_blocks | 120 (2 per active companion random dates) |
| platform_settings | 1 (singleton, commissionRate=0.20, minPayoutAmount=50) |
| online_watchers | 30 |
| refresh_tokens | 0 (created at runtime) |
| disputes | 10 (5 open, 5 resolved) |
| reports | 8 |
| notifications | ~300 (event-mix across users) |
| blocks | 12 |
| payouts | 40 (mix of pending, paid, failed) |
| audit_log | ~60 (admin actions on seeded disputes/bans/verifications) |

### 7.4 Invariants Seed Must Enforce
- Dev account is row 1 in `users`
- No `booking.dateTime` in past unless `status in (completed, cancelled, disputed)`
- No overlapping bookings for same companion+time
- Every completed booking has a matching payment (status=captured)
- Every review belongs to a completed booking by the reviewer
- Companion with `isActive=true` has >=4 photos
- `platform_settings` has exactly 1 row
- All emails lowercase and unique

### 7.5 Local Dev Workflow
```bash
doppler run -- npm run seed          # apply seed
doppler run -- npm run seed -- --truncate   # wipe + re-seed
```

---

## Section 8 — Test Cycles Log

| Cycle | Date | Screens touched | Result | Notes |
|---|---|---|---|---|
| (empty — first run pending) | | | | |
