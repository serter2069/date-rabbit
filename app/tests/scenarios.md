# Test Scenarios — DateRabbit

**URL:** https://daterabbit.smartlaunchhub.com
**Последнее обновление:** 2026-02-13

---

## Auth

### AUTH-01: Welcome Page Load ✅
- **Шаги:**
  1. Открыть /
  2. Дождаться загрузки
- **Ожидание:** Страница с DateRabbit логотипом, кнопки "Create Account" и "I already have an account"
- **Результат:** Все элементы видны, скриншот 01-welcome-page.jpg
- **Статус:** ✅ Работает

### AUTH-02: Navigate to Login ✅
- **Шаги:**
  1. Открыть /
  2. Нажать "I already have an account"
- **Ожидание:** Страница /login с полем email и кнопкой Continue
- **Результат:** URL = /login, email input виден, скриншот 02-login-page.jpg
- **Статус:** ✅ Работает

### AUTH-03: Navigate to Role Select ✅
- **Шаги:**
  1. Открыть /
  2. Нажать "Create Account"
- **Ожидание:** Страница /role-select с карточками "Date Companion" и "Date Seeker"
- **Результат:** URL = /role-select, обе карточки видны, скриншот 03-role-select.jpg
- **Статус:** ✅ Работает

### AUTH-04: Role Select - Seeker ✅
- **Шаги:**
  1. Открыть /role-select
  2. Нажать "Date Seeker"
- **Ожидание:** Редирект на /register?role=male
- **Результат:** URL = /register?role=male, скриншот 04-register-seeker.jpg
- **Статус:** ✅ Работает

### AUTH-05: Role Select - Companion ✅
- **Шаги:**
  1. Открыть /role-select
  2. Нажать "Date Companion"
- **Ожидание:** Редирект на /register?role=female (с полем Hourly Rate)
- **Результат:** URL = /register?role=female, Hourly Rate input виден, скриншот 05-register-companion.jpg
- **Статус:** ✅ Работает

### AUTH-06: Login with Temp Email
- **Шаги:**
  1. Создать temp email через MCP
  2. Открыть /login
  3. Ввести temp email
  4. Нажать Continue
  5. Получить OTP из email
  6. Ввести OTP
- **Ожидание:** Редирект на /profile-setup (новый пользователь)
- **API:** ✅ Работает (`POST /api/auth/send-otp`)
- **Фронтенд:** ❌ Сломан (Expo 54 + Zustand `import.meta` incompatibility)
- **Статус:** ⏸️ Блокировано Expo 54

### AUTH-07: Profile Setup - Seeker
- **Шаги:**
  1. После OTP (новый пользователь)
  2. Ввести Name, Age, Location
  3. Нажать Continue
  4. Ввести Bio
  5. Нажать Complete
- **Ожидание:** Редирект на dashboard (male tabs)
- **Статус:** ⏸️ Заблокировано AUTH-06

### AUTH-08: Profile Setup - Companion
- **Шаги:**
  1. После OTP (новый пользователь)
  2. Ввести Name, Age, Location
  3. Нажать Continue
  4. Ввести Bio, Hourly Rate
  5. Нажать Complete
- **Ожидание:** Редирект на dashboard (female tabs)
- **Статус:** ⏸️ Заблокировано AUTH-06

---

## Browse & Search (Seeker)

### BROWSE-01: View Companions List
- **Шаги:**
  1. Залогиниться как seeker
  2. Открыть Browse tab
- **Ожидание:** Список companions с фото, именем, рейтингом
- **Статус:** ⏸️ Заблокировано AUTH-06

### BROWSE-02: Search Companions
- **Шаги:**
  1. На странице Browse
  2. Ввести текст в поиск
- **Ожидание:** Фильтрация списка
- **Статус:** ⏸️ Заблокировано AUTH-06

### BROWSE-03: Open Filters
- **Шаги:**
  1. На странице Browse
  2. Нажать кнопку фильтров
- **Ожидание:** Модальное окно с фильтрами
- **Статус:** ⏸️ Заблокировано AUTH-06

### BROWSE-04: View Companion Profile
- **Шаги:**
  1. На странице Browse
  2. Нажать на карточку companion
- **Ожидание:** Страница профиля с фото, bio, рейтингом, кнопками Book/Message
- **Статус:** ⏸️ Заблокировано AUTH-06

---

## Booking (Seeker)

### BOOK-01: Create Booking Request
- **Шаги:**
  1. Открыть профиль companion
  2. Нажать "Book a Date"
  3. Выбрать активность, дату, время
  4. Ввести location, message
  5. Нажать "Request Booking"
- **Ожидание:** Booking создан со статусом pending
- **Статус:** ⏸️ Заблокировано AUTH-06

### BOOK-02: View My Bookings
- **Шаги:**
  1. Залогиниться как seeker
  2. Открыть Bookings tab
- **Ожидание:** Список bookings с фильтрами (upcoming/past)
- **Статус:** ⏸️ Заблокировано AUTH-06

---

## Requests (Companion)

### REQ-01: View Incoming Requests
- **Шаги:**
  1. Залогиниться как companion
  2. Открыть Requests tab
- **Ожидание:** Список входящих booking requests
- **Статус:** ⏸️ Заблокировано AUTH-06

### REQ-02: Accept Request
- **Шаги:**
  1. На странице Requests
  2. Нажать Accept на request
- **Ожидание:** Статус changed to accepted
- **Статус:** ⏸️ Заблокировано AUTH-06

### REQ-03: Decline Request
- **Шаги:**
  1. На странице Requests
  2. Нажать Decline на request
  3. Ввести причину (опционально)
- **Ожидание:** Статус changed to declined
- **Статус:** ⏸️ Заблокировано AUTH-06

---

## Chat

### CHAT-01: View Chats List
- **Шаги:**
  1. Залогиниться
  2. Открыть Messages tab
- **Ожидание:** Список чатов
- **Статус:** ⏸️ Заблокировано AUTH-06

### CHAT-02: Send Message
- **Шаги:**
  1. Открыть чат
  2. Ввести сообщение
  3. Нажать Send
- **Ожидание:** Сообщение отправлено, отображается в чате
- **Статус:** ⏸️ Заблокировано AUTH-06

---

## Profile

### PROF-01: View Own Profile
- **Шаги:**
  1. Залогиниться
  2. Открыть Profile tab
- **Ожидание:** Профиль с фото, именем, bio, кнопка Edit
- **Статус:** ⏸️ Заблокировано AUTH-06

### PROF-02: Edit Profile
- **Шаги:**
  1. На странице Profile
  2. Нажать Edit Profile
  3. Изменить данные
  4. Сохранить
- **Ожидание:** Профиль обновлён
- **Статус:** ⏸️ Заблокировано AUTH-06

### PROF-03: Sign Out
- **Шаги:**
  1. На странице Profile
  2. Нажать Sign Out
- **Ожидание:** Редирект на Welcome page
- **Статус:** ⏸️ Заблокировано AUTH-06

### AUTH-08: Profile Setup - Companion
- **Шаги:**
  1. После OTP (новый пользователь)
  2. Ввести Name, Age, Location
  3. Нажать Continue
  4. Ввести Bio, Hourly Rate
  5. Нажать Complete
- **Ожидание:** Редирект на dashboard (female tabs)
- **Статус:** ❓ Не проверено

---

## Browse & Search (Seeker)

### BROWSE-01: View Companions List
- **Шаги:**
  1. Залогиниться как seeker
  2. Открыть Browse tab
- **Ожидание:** Список companions с фото, именем, рейтингом
- **Статус:** ❓ Не проверено

### BROWSE-02: Search Companions
- **Шаги:**
  1. На странице Browse
  2. Ввести текст в поиск
- **Ожидание:** Фильтрация списка
- **Статус:** ❓ Не проверено

### BROWSE-03: Open Filters
- **Шаги:**
  1. На странице Browse
  2. Нажа��ь кнопку фильтров
- **Ожидание:** Модальное окно с фильтрами
- **Статус:** ❓ Не проверено

### BROWSE-04: View Companion Profile
- **Шаги:**
  1. На странице Browse
  2. Нажать на карточку companion
- **Ожидание:** Страница профиля с фото, bio, рейтингом, кнопками Book/Message
- **Статус:** ❓ Не проверено

---

## Booking (Seeker)

### BOOK-01: Create Booking Request
- **Шаги:**
  1. Открыть профиль companion
  2. Нажать "Book a Date"
  3. Выбрать активность, дату, время
  4. Ввести location, message
  5. Нажать "Request Booking"
- **Ожидание:** Booking создан со статусом pending
- **Статус:** ❓ Не проверено

### BOOK-02: View My Bookings
- **Шаги:**
  1. Залогиниться как seeker
  2. Открыть Bookings tab
- **Ожидание:** Список bookings с фильтрами (upcoming/past)
- **Статус:** ❓ Не проверено

---

## Requests (Companion)

### REQ-01: View Incoming Requests
- **Шаги:**
  1. Залогиниться как companion
  2. Открыть Requests tab
- **Ожидание:** Список входящих booking requests
- **Статус:** ❓ Не проверено

### REQ-02: Accept Request
- **Шаги:**
  1. На странице Requests
  2. Нажать Accept на request
- **Ожидание:** Статус changed to accepted
- **Статус:** ❓ Не проверено

### REQ-03: Decline Request
- **Шаги:**
  1. На странице Requests
  2. Нажать Decline на request
  3. Ввести причину (опционально)
- **Ожидание:** Статус changed to declined
- **Статус:** ❓ Не проверено

---

## Chat

### CHAT-01: View Chats List
- **Шаги:**
  1. Залогиниться
  2. Открыть Messages tab
- **Ожидание:** Список чатов
- **Статус:** ❓ Не проверено

### CHAT-02: Send Message
- **Шаги:**
  1. Открыть чат
  2. Ввести сообщение
  3. Нажать Send
- **Ожидание:** Сообщение отправлено, отображается в чате
- **Статус:** ❓ Не проверено

---

## Profile

### PROF-01: View Own Profile
- **Шаги:**
  1. Залогиниться
  2. Открыть Profile tab
- **Ожидание:** Профиль с фото, именем, bio, кнопка Edit
- **Статус:** ❓ Не проверено

### PROF-02: Edit Profile
- **Шаги:**
  1. На странице Profile
  2. Нажать Edit Profile
  3. Изменить данные
  4. Сохранить
- **Ожидание:** Профиль обновлён
- **Статус:** ❓ Не проверено

### PROF-03: Sign Out
- **Шаги:**
  1. На странице Profile
  2. Нажать Sign Out
- **Ожидание:** Редирект на Welcome page
- **Статус:** ❓ Не проверено

---

## Chaos Tests

*(Пока пусто — заполняется после режима CHAOS)*

---

## Edge Cases

### EDGE-01: Access Protected Page Without Auth ✅
- **Условие:** Не залогинен
- **URL:** /profile, /browse, /bookings
- **Ожидание:** Редирект на /login или /welcome
- **Результат:** /browse → /welcome, /profile → /welcome, скриншоты 06-07
- **Статус:** ✅ Работает

### EDGE-02: Empty Bookings List
- **Условие:** У пользователя нет bookings
- **Ожидание:** Placeholder "No bookings yet"
- **Статус:** ❓ Не проверено

### EDGE-03: Empty Messages List
- **Условие:** У пользователя нет чатов
- **Ожидание:** Placeholder "No messages yet"
- **Статус:** ❓ Не проверено

---

## История изменений

| Дата | Что изменилось |
|------|----------------|
| 2026-02-13 | Создан файл сценариев |
| 2026-02-13 | TDD FIX: AUTH-01..05 ✅, EDGE-01 ✅, AUTH-06 ❌ (backend 500) |
