# PROJECT_CONTEXT.md

> 🤖 Автоматически сгенерировано: 2026-02-16T19:09:47.388Z
> 📁 Проект: **date-rabbit**

---

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов | 268 |
| Директорий | 117 |
| Компонентов | 65 |
| API маршрутов | 12 |
| Экранов (Expo Router) | 77 |
| State Stores | 14 |
| DB моделей | 0 |

## 📁 Структура проекта

```
date-rabbit/
├── .ai/
├── app/
├── backend/
├── pitch/
├── ASCII_UI.md
├── BRAND_STYLE.md
├── DISCOVERY.md
├── IDEA.md
├── PROJECT_CONTEXT.md
├── RESEARCH.md
├── RESEARCH_REPORT.md
├── VIDEO_SCRIPT.md
```

## 📦 Пакеты

### app
- **Имя:** app
- **Версия:** 1.0.0
- **Ключевые:** @expo-google-fonts/inter, @expo/metro-runtime, @expo/vector-icons, @react-native-async-storage/async-storage, @react-native-community/slider, @react-navigation/bottom-tabs, @react-navigation/native, @react-navigation/native-stack, expo, expo-constants, expo-font, expo-haptics, expo-image, expo-image-picker, expo-linking, expo-location, expo-notifications, expo-router, expo-status-bar, expo-web-browser, jest-expo, lucide-react-native, react, react-dom, react-native, react-native-gesture-handler, react-native-reanimated, react-native-safe-area-context, react-native-screens, react-native-svg, react-native-web, zustand
- **Scripts:** start, android, ios, web, build, test, test:watch, test:coverage, test:ci, generate:tests, test:web, test:web:logic, test:web:ui, test:all

## 🗺️ Экраны (Expo Router)

| Маршрут | Файл |
|---------|------|
| `/App` | app/App.tsx |
| `/app/login` | app/app/(auth)/login.tsx |
| `/app/otp` | app/app/(auth)/otp.tsx |
| `/app/profile-setup` | app/app/(auth)/profile-setup.tsx |
| `/app/register` | app/app/(auth)/register.tsx |
| `/app/role-select` | app/app/(auth)/role-select.tsx |
| `/app/welcome` | app/app/(auth)/welcome.tsx |
| `/app/female/calendar` | app/app/(tabs)/female/calendar.tsx |
| `/app/female/earnings/history` | app/app/(tabs)/female/earnings/history.tsx |
| `/app/female/earnings/withdraw` | app/app/(tabs)/female/earnings/withdraw.tsx |
| `/app/female/earnings` | app/app/(tabs)/female/earnings.tsx |
| `/app/female` | app/app/(tabs)/female/index.tsx |
| `/app/female/profile` | app/app/(tabs)/female/profile.tsx |
| `/app/female/requests` | app/app/(tabs)/female/requests.tsx |
| `/app/male/bookings` | app/app/(tabs)/male/bookings.tsx |
| `/app/male/browse` | app/app/(tabs)/male/browse.tsx |
| `/app/male` | app/app/(tabs)/male/index.tsx |
| `/app/male/messages` | app/app/(tabs)/male/messages.tsx |
| `/app/male/profile` | app/app/(tabs)/male/profile.tsx |
| `/app/booking/:id` | app/app/booking/[id].tsx |
| `/app/chat/:id` | app/app/chat/[id].tsx |
| `/app/favorites` | app/app/favorites/index.tsx |
| `/app` | app/app/index.tsx |
| `/app/onboarding` | app/app/onboarding.tsx |
| `/app/profile/:id` | app/app/profile/[id].tsx |
| `/app/reviews/:id` | app/app/reviews/[id].tsx |
| `/app/settings/delete-account` | app/app/settings/delete-account.tsx |
| `/app/settings/edit-profile` | app/app/settings/edit-profile.tsx |
| `/app/settings/notifications` | app/app/settings/notifications.tsx |
| `/app/settings/verification` | app/app/settings/verification.tsx |
| `/coverage/lcov-report/block-navigation` | app/coverage/lcov-report/block-navigation.js |
| `/coverage/lcov-report/prettify` | app/coverage/lcov-report/prettify.js |
| `/coverage/lcov-report/sorter` | app/coverage/lcov-report/sorter.js |
| `/dist/_expo/static/js/web/entry-b8682a27b64d4537e66a2c40c2df600d` | app/dist/_expo/static/js/web/entry-b8682a27b64d4537e66a2c40c2df600d.js |
| `/e2e/auth-flow.spec` | app/e2e/auth-flow.spec.ts |
| `/jest.config` | app/jest.config.js |
| `/jest.setup` | app/jest.setup.js |
| `/metro.config` | app/metro.config.js |
| `/playwright.config` | app/playwright.config.ts |
| `/scripts/ai-test-runner` | app/scripts/ai-test-runner.js |
| `/scripts/crawler` | app/scripts/crawler.js |
| `/scripts/full-test-suite` | app/scripts/full-test-suite.js |
| `/scripts/generate-tests` | app/scripts/generate-tests.ts |
| `/scripts/scenario-runner` | app/scripts/scenario-runner.js |
| `/scripts/smart-test-runner` | app/scripts/smart-test-runner.js |
| `/scripts/test-ai-vision` | app/scripts/test-ai-vision.js |
| `/scripts/test-gpt-vision` | app/scripts/test-gpt-vision.js |
| `/scripts/test-magnitude` | app/scripts/test-magnitude.js |
| `/scripts/test-midscene` | app/scripts/test-midscene.js |
| `/scripts/test-registration` | app/scripts/test-registration.js |
| `/scripts/test-suite` | app/scripts/test-suite.js |
| `/src/__tests__/stores/authStore.test` | app/src/__tests__/stores/authStore.test.ts |
| `/src/__tests__/stores/bookingsStore.test` | app/src/__tests__/stores/bookingsStore.test.ts |
| `/src/__tests__/stores/messagesStore.test` | app/src/__tests__/stores/messagesStore.test.ts |
| `/src/components/Avatar` | app/src/components/Avatar.tsx |
| `/src/components/Button` | app/src/components/Button.tsx |
| `/src/components/Card` | app/src/components/Card.tsx |
| `/src/components/EmptyState` | app/src/components/EmptyState.tsx |
| `/src/components/FilterModal` | app/src/components/FilterModal.tsx |
| `/src/components/Icon` | app/src/components/Icon.tsx |
| `/src/components/PhotoUpload` | app/src/components/PhotoUpload.tsx |
| `/src/components/UserImage` | app/src/components/UserImage.tsx |
| `/src/constants/theme` | app/src/constants/theme.ts |
| `/src/hooks/useImagePicker` | app/src/hooks/useImagePicker.ts |
| `/src/services/api` | app/src/services/api.ts |
| `/src/store/authStore` | app/src/store/authStore.ts |
| `/src/store/bookingsStore` | app/src/store/bookingsStore.ts |
| `/src/store/companionsStore` | app/src/store/companionsStore.ts |
| `/src/store/earningsStore` | app/src/store/earningsStore.ts |
| `/src/store/favoritesStore` | app/src/store/favoritesStore.ts |
| `/src/store/messagesStore` | app/src/store/messagesStore.ts |
| `/src/store/profileStore` | app/src/store/profileStore.ts |
| `/src/types` | app/src/types/index.ts |
| `/tests/generated/e2e.spec` | app/tests/generated/e2e.spec.ts |
| `/tests/logic/helpers` | app/tests/logic/helpers.ts |
| `/tests/logic-explore` | app/tests/logic-explore.js |
| `/tests/scenarios` | app/tests/scenarios.ts |

## 🔌 API Endpoints

| Endpoint | Файл |
|----------|------|
| `start` | backend/daterabbit-api/src/auth/auth.controller.ts |
| `verify` | backend/daterabbit-api/src/auth/auth.controller.ts |
| `register` | backend/daterabbit-api/src/auth/auth.controller.ts |
| `upcoming` | backend/daterabbit-api/src/bookings/bookings.controller.ts |
| `requests` | backend/daterabbit-api/src/bookings/bookings.controller.ts |
| `:id` | backend/daterabbit-api/src/users/users.controller.ts |
| `:id/confirm` | backend/daterabbit-api/src/bookings/bookings.controller.ts |
| `:id/cancel` | backend/daterabbit-api/src/bookings/bookings.controller.ts |
| `conversations` | backend/daterabbit-api/src/messages/messages.controller.ts |
| `unread-count` | backend/daterabbit-api/src/messages/messages.controller.ts |
| `:userId` | backend/daterabbit-api/src/messages/messages.controller.ts |
| `me` | backend/daterabbit-api/src/users/users.controller.ts |

## 🧩 Компоненты

**app:** App

**app/app/(auth):** AuthLayout, LoginScreen, OTPScreen, ProfileSetupScreen, RegisterScreen, RoleSelectScreen, WelcomeScreen

**app/app/(tabs):** TabsLayout

**app/app/(tabs)/female:** CalendarScreen, EarningsScreen, FemaleDashboard, FemaleProfileScreen, RequestsScreen

**app/app/(tabs)/female/earnings:** EarningsHistoryScreen, WithdrawScreen

**app/app/(tabs)/male:** BookingsScreen, BrowseScreen, MaleDashboard, MessagesScreen, MaleProfileScreen

**app/app:** RootLayout, Index, OnboardingScreen

**app/app/booking:** BookingScreen

**app/app/chat:** ChatScreen

**app/app/favorites:** FavoritesScreen

**app/app/profile:** ProfileViewScreen

**app/app/reviews:** ReviewsScreen

**app/app/settings:** DeleteAccountScreen, EditProfileScreen, NotificationsSettingsScreen, VerificationScreen

**app/src/components:** Avatar, Button, Card, EmptyState, FilterModal, Icon, PhotoUpload, UserImage

**app/src/services:** ApiError

**backend/daterabbit-api/src:** AppController, AppModule, AppService

**backend/daterabbit-api/src/auth:** AuthController, AuthModule, AuthService

**backend/daterabbit-api/src/auth/guards:** JwtAuthGuard

**backend/daterabbit-api/src/auth/strategies:** JwtStrategy

**backend/daterabbit-api/src/bookings:** BookingsController, BookingsModule, BookingsService

**backend/daterabbit-api/src/bookings/entities:** Booking

**backend/daterabbit-api/src/companions:** CompanionsController, CompanionsModule

**backend/daterabbit-api/src/messages/entities:** Message, Conversation

**backend/daterabbit-api/src/messages:** MessagesController, MessagesModule, MessagesService

**backend/daterabbit-api/src/users/entities:** User

**backend/daterabbit-api/src/users:** UsersController, UsersModule, UsersService

## 🗄️ State Stores

| Store | Файл |
|-------|------|
| AuthState | app/src/store/authStore.ts |
| AuthStore | app/src/store/authStore.ts |
| BookingsState | app/src/store/bookingsStore.ts |
| BookingsStore | app/src/store/bookingsStore.ts |
| CompanionsState | app/src/store/companionsStore.ts |
| CompanionsStore | app/src/store/companionsStore.ts |
| EarningsState | app/src/store/earningsStore.ts |
| EarningsStore | app/src/store/earningsStore.ts |
| FavoritesState | app/src/store/favoritesStore.ts |
| FavoritesStore | app/src/store/favoritesStore.ts |
| MessagesState | app/src/store/messagesStore.ts |
| MessagesStore | app/src/store/messagesStore.ts |
| ProfileState | app/src/store/profileStore.ts |
| ProfileStore | app/src/store/profileStore.ts |

## 📄 Важные файлы

### app/tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}

```

### app/app.json

```json
{
  "expo": {
    "name": "DateRabbit",
    "slug": "daterabbit",
    "scheme": "daterabbit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}

```

