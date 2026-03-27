# PRODUCT: DateRabbit

## Vision

Two-sided companion dating marketplace where men find verified companions for events and dates, and women earn money providing professional companionship -- with safety, transparency, and fair payments at the core.

## Roles

### Role: Seeker
- **Who:** Man looking for a companion for a dinner, event, travel, or casual date
- **Goal:** Find a verified, attractive companion for a specific occasion quickly and without awkwardness
- **Tech level:** medium
- **Frustration triggers:**
  - Companion doesn't match photos or description (catfishing)
  - Payment charged but date cancelled last minute with no refund
  - Long wait for companion to accept/decline booking request

### Role: Companion
- **Who:** Woman who earns money by accompanying seekers to events and dates
- **Goal:** Get a steady flow of well-paying, safe bookings with respectful clients on her own schedule
- **Tech level:** low-medium
- **Frustration triggers:**
  - Unsafe or disrespectful seeker with no consequences
  - Unfair public reviews that damage her profile (low ratings visible to everyone)
  - Earnings delayed, unclear fees, or surprise deductions

### Role: Admin
- **Who:** Platform operator responsible for moderation, verification, disputes, and safety
- **Goal:** Keep the marketplace safe, fair, and growing by resolving disputes, verifying users, and removing bad actors
- **Tech level:** high
- **Frustration triggers:**
  - Flood of unverified users slipping through
  - No tooling to handle disputes or review reports efficiently
  - Inability to see platform-wide health metrics at a glance

### Role: System
- **Who:** Automated background processes (cron jobs, webhooks, scheduled tasks)
- **Goal:** Execute time-sensitive operations reliably: payment captures, hold expirations, reminders, notifications, rating prompts
- **Tech level:** n/a
- **Frustration triggers:**
  - Stripe webhook missed or processed out of order
  - Hold expires without capture/cancel decision
  - Push notification not delivered (token stale, user unregistered)

---

## Functions

### Seeker

| ID | Function | Priority | Success Criteria | Anti-Criteria |
|----|----------|----------|-----------------|---------------|
| F-001 | Create account and verify identity | critical | Account created in under 2 min via OTP; ID verification submitted in under 5 min (photo-id + selfie + SSN) | No dead-end screens; no OTP that never arrives within 60s |
| F-002 | Browse and filter companions | critical | Can filter by location, date, price range, rating; results load in under 2s; at least 3 profile cards visible without scrolling | No empty state without explanation; no stale profiles (inactive >30 days shown) |
| F-003 | View companion profile | critical | See photos, bio, rating (4-5 star average), hourly rate, availability calendar, and public reviews in one scroll | No private feedback or moderation data leaked to seeker |
| F-004 | Book a date | critical | Select date/time/duration/occasion, see total price with platform fee breakdown, submit request in under 4 taps from profile | No booking submitted without payment method on file; no double-booking same companion same slot |
| F-005 | Pay via Stripe (hold + capture) | critical | Card charged as hold on booking request; hold captured only after date confirmed complete; full refund if companion declines | No capture before date completion; no hold exceeding 7-day Stripe limit without re-auth |
| F-006 | Chat with companion | important | Real-time messaging available after booking confirmed; message delivery under 3s; unread badge on tab | No chat before booking exists; no messages after booking cancelled/completed (read-only archive) |
| F-007 | Rate and review companion | important | Prompt appears within 1h after date ends; 1-5 star rating + optional text; submitted in under 30s | No review possible if date was cancelled; no editing review after 24h |
| F-008 | Manage bookings | important | See upcoming, past, and cancelled bookings; cancel with clear refund policy shown before confirming | No silent cancellation without refund terms displayed |
| F-009 | Save favorite companions | nice-to-have | One-tap heart icon; favorites list accessible from profile tab; persists across sessions | No favoriting blocked/banned profiles |
| F-010 | Receive push notifications | important | Notified when companion accepts/declines, date reminder 1h before, chat message received | No notification after user disabled them in settings; no spam (max 5/day) |

### Companion

| ID | Function | Priority | Success Criteria | Anti-Criteria |
|----|----------|----------|-----------------|---------------|
| F-011 | Create account and complete onboarding | critical | Role selected, profile built (photos, bio, rate, languages), video intro uploaded, references optional; entire flow under 10 min | No onboarding step that blocks without clear instruction; no mandatory field without explanation why |
| F-012 | Submit verification (photo + video) | critical | Upload photo-id and selfie for identity match; record short video intro; status shown as pending/approved/rejected | No verification stuck in "pending" longer than 48h without admin action |
| F-013 | Set availability calendar | critical | Block/unblock dates; set default weekly schedule; changes reflected immediately in seeker search | No bookings accepted on blocked dates; no calendar that resets on app restart |
| F-014 | Manage booking requests | critical | See incoming requests with seeker profile, date/time, duration, payout amount; accept or decline within the app | No auto-decline without companion seeing the request; no accept without payout amount visible |
| F-015 | Receive earnings and withdraw | critical | See total earnings, pending holds, completed payouts; withdraw to bank via Stripe Connect; 15% platform fee clearly shown | No payout before date confirmed complete; no hidden fees beyond the stated 15% |
| F-016 | Configure privacy settings | important | Control who can message (verified only, booked only, anyone); toggle profile visibility; hide from specific users | No privacy setting that silently resets; no messages from blocked seekers |
| F-017 | View private feedback | important | See constructive feedback from low-rating dates (private, not public); tips for improvement shown alongside | No raw 1-star text displayed; no feedback attributed to specific seeker by name |
| F-018 | Chat with seeker | important | Same as F-006 from companion side; can initiate only after booking confirmed | No unsolicited messages from seekers without booking |
| F-019 | View own public profile and ratings | important | See exactly what seekers see: public reviews (4-5 stars only), average rating, photo gallery | No low-rating reviews (1-3 stars) appearing on public profile |
| F-020 | Receive push notifications | important | Notified on new booking request, payment received, review posted, date reminder | No notification for private feedback (shown only in-app) |

### Admin

| ID | Function | Priority | Success Criteria | Anti-Criteria |
|----|----------|----------|-----------------|---------------|
| F-021 | Dashboard with platform metrics | critical | See total users, active bookings, revenue, pending verifications, open reports on one screen | No stale data (refresh under 30s); no metrics that require manual SQL |
| F-022 | Review and approve user verifications | critical | Queue of pending verifications with photo-id, selfie, video side-by-side; approve/reject with one click + reason | No verification older than 48h without admin attention flagged |
| F-023 | Moderate reviews and reports | critical | See reported users/reviews with context (booking history, both sides); take action: warn, suspend, ban | No ban without documented reason; no report dismissed without response to reporter |
| F-024 | Manage users | important | Search by name/email/id; view profile, booking history, earnings, verification status; edit or suspend | No user data deletion without audit trail |
| F-025 | View and manage bookings | important | See all bookings with status, payment state, both parties; intervene on disputes (refund, cancel) | No refund issued without both parties notified |
| F-026 | Manage payments and disputes | important | See Stripe payment status per booking; issue partial/full refunds; view platform fee revenue | No refund exceeding original charge amount |
| F-027 | Configure platform settings | nice-to-have | Set platform fee percentage, hold duration limits, minimum payout threshold | No setting change that affects in-flight bookings retroactively |

### System

| ID | Function | Priority | Success Criteria | Anti-Criteria |
|----|----------|----------|-----------------|---------------|
| F-028 | Process Stripe webhooks | critical | Handle payment_intent.succeeded, payment_intent.canceled, charge.dispute.created; update booking status within 5s of webhook | No duplicate processing of same event; no missed webhook without retry |
| F-029 | Expire uncaptured holds | critical | Cron checks holds approaching 7-day Stripe limit; auto-cancel booking and release hold if no completion confirmation | No hold expiring silently without notifying both parties |
| F-030 | Send scheduled notifications | important | Date reminders 1h before; review prompt 1h after date ends; earnings summary weekly | No notification sent for cancelled dates; no duplicate reminders |
| F-031 | Auto-suspend flagged accounts | important | User with 3+ reports in 30 days auto-suspended pending admin review; both parties notified | No auto-ban (only suspension); no suspension without admin review queue entry |
| F-032 | Clean up stale data | nice-to-have | Archive bookings older than 1 year; remove unverified accounts inactive >90 days; purge expired OTP codes | No deletion of data involved in open disputes |
