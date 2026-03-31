# DateRabbit App -- UX + Code Audit Report

**Date:** 2026-03-26
**Scope:** All screen files in `/Users/sergei/Desktop/date-rabbit/app`
**Criteria:** Loading states, error states, empty states, navigation, form validation, UX issues, code bugs, test data readiness

---

## CRITICAL (Blocks core user flows, data loss, or broken production experience)

### C1. Seeker Verification Polling Disabled in Production
**File:** `app/(seeker-verify)/pending.tsx`, line 49
**Issue:** `if (!IS_DEV) return;` -- the polling interval that checks verification status only runs in DEV mode. In production, seekers who complete verification will be stuck on the pending screen forever. The "Continue to App" button is disabled until `isApproved` becomes true, which never happens because the poll never fires.
**Impact:** 100% of production seeker users cannot complete verification flow.

### C2. Female Dashboard Uses Entirely Hardcoded Data
**File:** `app/(tabs)/female/index.tsx`
**Issue:** All dashboard stats are hardcoded constants: `pendingRequests: 3`, `upcomingDates: 2`, `totalEarnings: 2450`, `rating: 4.8`. Request items displayed are also hardcoded objects, not fetched from API. The "View All" button has no `onPress` handler.
**Impact:** Companions see fake data that never reflects reality. Core dashboard is non-functional.

### C3. Register Screen Creates Fake Demo User on API Failure
**File:** `app/(auth)/register.tsx`, lines 163-181
**Issue:** When `authApi.register()` fails, the catch block creates a fake user object with `id: 'demo-user-1'`, sets it in the auth store, and navigates the user into the app as if registration succeeded. This means any API error silently creates an unauthenticated ghost session.
**Impact:** Users may operate in the app without a real account, leading to data loss and confusing failures downstream.

### C4. Profile Setup Bypasses Verification Flow
**File:** `app/(auth)/profile-setup.tsx`
**Issue:** After completing profile setup, the screen navigates directly to `/(tabs)/female` or `/(tabs)/male` tabs, completely skipping the verification flow (companion onboarding or seeker verification). Users enter the app unverified.
**Impact:** Users bypass mandatory identity verification, breaking the trust/safety model.

### C5. Seeker Verification Steps Have No Error Handling
**Files:** `app/(seeker-verify)/photo-id.tsx`, `app/(seeker-verify)/selfie.tsx`, `app/(seeker-verify)/consent.tsx`
**Issue:** The `uploadId`, `uploadSelfie`, `submitConsent`, and `submitForReview` API calls have no try/catch or error handling. If any call fails, the user is navigated forward anyway, resulting in incomplete verification data on the server.
**Impact:** Verification submissions may be silently incomplete; users think they submitted but backend has missing data.

### C6. Companion Onboarding Photos Never Uploaded to Server
**File:** `app/(comp-onboard)/step2.tsx`
**Issue:** Photos selected by companions are stored as local device URIs only. There is no upload call to persist them to the server. When the user proceeds, the photos exist only on the device and are lost.
**Impact:** Companion profiles will have no photos on the server, breaking the browse/discovery experience for seekers.

---

## HIGH (Significant UX degradation or logic errors)

### H1. Google Login Button is Non-Functional
**File:** `app/(auth)/login.tsx`
**Issue:** The Google sign-in button has `onPress={() => {}}` -- an empty handler. No visual indication that it's not implemented.
**Impact:** Users who tap Google login get no response, creating confusion. Should either be implemented or hidden.

### H2. OTP Screen Comment Mismatch (8-digit vs 6-digit)
**File:** `app/(auth)/otp.tsx`
**Issue:** Code comment says "8-digit code" but `CODE_LENGTH = 6`. Minor code quality issue, but if the backend changes to 8-digit, the comment would mislead developers.
**Impact:** Low direct user impact, but a maintenance risk.

### H3. Seeker SSN Screen Navigates Forward on API Failure
**File:** `app/(seeker-verify)/ssn.tsx`
**Issue:** The SSN submission navigates to the next step regardless of whether the API call succeeded or failed. Error is shown via toast but user proceeds with potentially unsubmitted SSN data.
**Impact:** Verification data may be incomplete on server while user believes they submitted successfully.

### H4. Companion Pending Screen Navigates to `/(tabs)` Instead of Role-Specific Tab
**File:** `app/(comp-onboard)/pending.tsx`
**Issue:** On approval, navigates to `/(tabs)` which may not resolve to the correct companion tab layout. Should navigate to `/(tabs)/female` explicitly.
**Impact:** Approved companions may land on wrong tab or get a routing error.

### H5. Multiple Profile Menu Items Have No onPress Handlers
**Files:** `app/(tabs)/female/profile.tsx`, `app/(tabs)/male/profile.tsx`
**Issue:** Several menu items (Settings, Help & Support, etc.) render as tappable elements but have no `onPress` handler or navigate to placeholder screens.
**Impact:** Users tap menu items and nothing happens, creating a broken feel.

### H6. Safety Link on Welcome Screen is Placeholder
**File:** `app/(auth)/welcome.tsx`
**Issue:** The "Safety" link shows a "coming soon" alert instead of actual safety information. For a dating app, safety information is essential.
**Impact:** Users have no access to safety guidelines, which is a trust and liability concern.

### H7. Withdraw Screen Has Variable Shadowing
**File:** `app/(tabs)/female/earnings/withdraw.tsx`
**Issue:** The file imports `colors` from the theme module and then destructures `{ colors }` from `useTheme()`, shadowing the import. This could lead to subtle bugs if the wrong `colors` reference is used.
**Impact:** Potential styling bugs if the shadowed variable behavior changes.

### H8. Chat "Book" Button Has No Verification Gate
**File:** `app/chat/[id].tsx`, line 162
**Issue:** The "Book" button in the chat header navigates directly to `/booking/${id}` without calling `useVerificationGate()`. The standalone booking screen does use the gate, but users could still reach it from chat without proper checks if the booking screen gate were removed.
**Impact:** Currently mitigated by the booking screen's own gate check, but defense-in-depth is missing.

### H9. Role Select May Be Redundant with Profile Setup
**Files:** `app/(auth)/role-select.tsx`, `app/(auth)/profile-setup.tsx`
**Issue:** Both screens include role selection UI. If a user goes through role-select and then profile-setup, they pick their role twice. Navigation flow may skip one, but the duplication creates maintenance burden.
**Impact:** Confusing UX if both are shown; wasted code if one is always skipped.

### H10. Terms/Privacy Links May Route to Nonexistent Pages
**File:** `app/(auth)/welcome.tsx`
**Issue:** Terms of Service and Privacy Policy links may navigate to pages that don't exist in the app router, potentially causing crashes or blank screens.
**Impact:** Users cannot review legal documents; potential app store rejection.

---

## MEDIUM (UX polish issues, missing edge cases)

### M1. No Pull-to-Refresh on Female Dashboard
**File:** `app/(tabs)/female/index.tsx`
**Issue:** The dashboard (even if data were real) has no pull-to-refresh mechanism. Users cannot manually refresh stats.
**Impact:** Stale data display, poor perceived responsiveness.

### M2. Calendar Error States Silently Logged
**File:** `app/(tabs)/female/calendar.tsx`
**Issue:** API errors when loading/saving availability are caught and logged to console but not shown to the user. The user gets no feedback when save fails.
**Impact:** Users think they saved availability but it may not have persisted.

### M3. Male Home.tsx is Unnecessary Redirect
**File:** `app/(tabs)/male/home.tsx`
**Issue:** The entire file is just `<Redirect href="/(tabs)/male" />`. This creates an unnecessary routing hop.
**Impact:** Slight performance overhead and code clutter.

### M4. Chat Polling Could Be More Efficient
**File:** `app/chat/[id].tsx`
**Issue:** Messages poll every 5 seconds regardless of activity. No WebSocket or push notification integration for real-time messaging. Also polls full message list rather than just new messages since last fetch.
**Impact:** Battery drain on mobile, unnecessary network requests, messages appear with up to 5-second delay.

### M5. Booking Flow Has No Back Confirmation
**File:** `app/booking/[id].tsx`
**Issue:** Users can navigate back mid-booking without any "discard changes?" confirmation, losing all entered booking details.
**Impact:** Accidental back navigation loses form data; user must restart.

### M6. Message Send Failure UX Could Be Better
**File:** `app/chat/[id].tsx`, lines 69-75
**Issue:** On send failure, the message text is restored to the input and an alert is shown. However, the user has no visual indication of which message failed or retry button -- they must manually re-send.
**Impact:** Acceptable but not great UX for a chat experience.

### M7. Seeker Intro Screen Has Duplicate Style Property
**File:** `app/(seeker-verify)/intro.tsx`, line 127-128
**Issue:** `flexGrow: 1` appears twice in the same style object. Not a runtime error but indicates copy-paste issue.
**Impact:** No functional impact, code quality issue.

### M8. Female Profile Shows Hardcoded Photo Placeholders
**File:** `app/(tabs)/female/profile.tsx`
**Issue:** Profile photos displayed are placeholder/hardcoded rather than the user's actual uploaded photos.
**Impact:** Companions see fake photos on their own profile, not their real ones.

### M9. Booking Declined Screen Has Minimal Context
**File:** `app/booking/declined/[bookingId].tsx`
**Issue:** Shows that a booking was declined but provides no reason or context from the companion. No suggested next action beyond "OK".
**Impact:** Poor UX -- user doesn't know why they were declined or what to do next.

### M10. Not-Found Screen Auth Detection Delay
**File:** `app/+not-found.tsx`
**Issue:** Shows loading spinner while checking auth hydration state. If hydration is slow, user sees spinner on 404 page, which is confusing.
**Impact:** Minor UX confusion during the brief hydration period.

### M11. No Offline/Network Error Handling Anywhere
**Files:** All screens
**Issue:** No screen checks for network connectivity before making API calls. No offline banner or retry mechanism. Users on poor connections get generic error messages.
**Impact:** Poor experience on flaky networks common on mobile.

### M12. Chat List Polling at 10s, Chat Messages at 5s -- No Coordination
**Files:** `app/(tabs)/male/messages.tsx`, `app/chat/[id].tsx`
**Issue:** Chat list and chat messages poll independently at different intervals. No event-based coordination. When a new message arrives, the chat list badge may not update for up to 10 seconds.
**Impact:** Inconsistent unread indicators across screens.

---

## LOW (Minor polish, code quality, nice-to-haves)

### L1. Companion Onboarding Step2 Bio Validation is Client-Only
**File:** `app/(comp-onboard)/step2.tsx`
**Issue:** Bio length and content validation exists only on the client. No server-side validation mentioned.
**Impact:** Bypass possible via API calls directly.

### L2. No Haptic Feedback on Key Actions
**Files:** All interactive screens
**Issue:** No haptic feedback (`expo-haptics`) on send message, submit booking, accept/decline request, or other key taps.
**Impact:** App feels less native/premium compared to competitors.

### L3. Booking Request Sent Polling Could Auto-Navigate Faster
**File:** `app/booking/request-sent/[bookingId].tsx`
**Issue:** Polls every 10 seconds for booking status. If companion responds quickly, user waits up to 10 seconds to see the update.
**Impact:** Minor delay in responsiveness.

### L4. No Keyboard Dismiss on Scroll in Chat
**File:** `app/chat/[id].tsx`
**Issue:** ScrollView does not have `keyboardDismissMode="interactive"` or similar. Users must tap outside the input to dismiss keyboard.
**Impact:** Minor usability friction.

### L5. Date Formatting Not Localized
**Files:** `app/chat/[id].tsx`, `app/booking/[id].tsx`
**Issue:** Date/time formatting uses `toLocaleTimeString` and `toLocaleDateString` with minimal options. No explicit locale handling for international users.
**Impact:** Date display may vary unexpectedly across devices/regions.

### L6. Accessibility Labels Missing on Many Interactive Elements
**Files:** Most screens
**Issue:** While some elements have `testID`, very few have `accessibilityLabel` or `accessibilityRole`. Screen readers will struggle with the app.
**Impact:** App is not accessible to users with visual impairments. Potential app store compliance issue.

### L7. No Animation on Screen Transitions
**Files:** All navigation transitions
**Issue:** Screen transitions use default Expo Router behavior. No custom enter/exit animations for flows like onboarding, verification, or booking.
**Impact:** App feels less polished.

### L8. Seed Data Uses Unsplash URLs Directly
**File:** `backend/daterabbit-api/src/seed/seed.ts`
**Issue:** Profile photos reference Unsplash URLs directly. These could change, break, or be rate-limited. No local fallback.
**Impact:** Dev/staging environments may show broken images if Unsplash changes URLs.

### L9. Auth Store Persists User Object to AsyncStorage
**File:** `app/src/store/authStore.ts`, lines 331-337
**Issue:** The full user object (including email, location, etc.) is persisted to AsyncStorage unencrypted. While `expo-secure-store` is used for the JWT token (via `setToken`), the user profile data in AsyncStorage could be extracted on a rooted device.
**Impact:** Minor privacy concern, though sensitive data (SSN) is not stored.

### L10. Multiple `any` Type Casts in Auth Store
**File:** `app/src/store/authStore.ts`, line 83
**Issue:** `(apiUser as any).notificationsEnabled` -- casting to `any` to access a property not in the type definition. Indicates type definitions are out of sync with the actual API response.
**Impact:** Type safety is compromised; bugs from wrong property names won't be caught at compile time.

---

## Summary by Severity

| Severity | Count | Key Theme |
|----------|-------|-----------|
| CRITICAL | 6 | Broken verification flow, fake data, ghost sessions |
| HIGH | 10 | Non-functional features, missing error handling, navigation issues |
| MEDIUM | 12 | Missing UX patterns, polling inefficiency, no offline support |
| LOW | 10 | Accessibility, animations, code quality, type safety |
| **TOTAL** | **38** | |

## Recommended Priority Order

1. **C1** -- Fix seeker verification polling (1-line fix, unblocks all seeker users)
2. **C5** -- Add error handling to seeker verification steps
3. **C2** -- Replace hardcoded female dashboard with real API data
4. **C3** -- Remove fake demo user creation on register failure
5. **C4** -- Route profile-setup completion through verification flow
6. **C6** -- Implement photo upload in companion onboarding
7. **H1** -- Either implement Google login or hide the button
8. **H5** -- Implement or remove non-functional menu items
9. **H6** -- Create actual safety information page
10. **M11** -- Add network connectivity detection and offline handling
