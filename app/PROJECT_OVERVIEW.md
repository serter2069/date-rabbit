# DateRabbit — Project Overview

## Tagline
Real dates. Real connection.

## Description
Paid dating platform focused on real offline dates. Companions set their price and control their schedule, Seekers book and pay via Stripe. USA market, 21+ only.

## Roles
- **SEEKER** — Man looking for a companion date. Pays, books, verified via Stripe Identity + fingerprint.
- **COMPANION** — Woman offering paid dates. Sets price, controls schedule, receives same-day Stripe payouts.
- **GUEST** — Unauthenticated visitor. Can browse landing page only.
- **ADMIN** — Platform moderator. Manages users, cities, verifications, disputes.

## Scenarios
### S-001: Seeker Happy Path (SEEKER)
1. landing
2. auth-login
3. auth-otp
4. auth-role-select
5. auth-profile-setup
6. verify-intro
7. verify-photo-id
8. verify-selfie
9. verify-consent
10. verify-approved
11. seeker-home
12. booking-detail
13. booking-payment
14. booking-request-sent
15. seeker-bookings

### S-002: Companion Happy Path (COMPANION)
1. landing
2. auth-login
3. auth-otp
4. auth-role-select
5. comp-onboard-step2
6. comp-onboard-verify
7. comp-onboard-pending
8. comp-onboard-approved
9. comp-stripe-connect
10. comp-home
11. comp-requests
12. comp-calendar
13. comp-earnings
