# TDD (Test-Driven Development) Workflow

Run tests and implement TDD workflow for DateRabbit app.

## Test Infrastructure

- **Test Framework:** Jest with jest-expo preset
- **UI Testing:** @testing-library/react-native
- **Location:** `__tests__/` directory

## Available Test Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
npm run test:ci       # CI mode (no watch, with coverage)
```

## Test Structure

```
__tests__/
├── store/           # Zustand store tests
│   └── authStore.test.ts
├── components/      # UI component tests
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   └── Avatar.test.tsx
├── utils/           # Test utilities
│   ├── testAuth.ts  # Auth bypass functions
│   └── render.tsx   # Custom render with providers
└── fixtures/        # Mock data
    ├── users.ts     # Mock user objects
    └── dateRequests.ts # Mock date requests
```

## Auth Bypass for Testing

Use these functions to skip auth flow in tests:

```typescript
import {
  bypassLoginAsCompanion,  // Login as female user
  bypassLoginAsSeeker,     // Login as male user
  bypassLoginAs,           // Login with custom user
  bypassLogout,            // Logout
  resetAuthStore,          // Reset to initial state
} from '../utils/testAuth';
```

## Task: Run TDD Workflow

1. Run existing tests: `npm test`
2. Check test coverage: `npm run test:coverage`
3. If writing new feature, write test first (RED)
4. Implement minimal code to pass (GREEN)
5. Refactor if needed (REFACTOR)

## Current Test Status

Run `npm test` to see current test results.
