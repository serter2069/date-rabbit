# TDD Fix Report — DateRabbit

**URL:** https://daterabbit.smartlaunchhub.com
**Дата:** 2026-02-13
**Режим:** FIX

---

## Summary

| Сценариев | Кол-во |
|-----------|--------|
| Всего проверено | 20 |
| ✅ Прошли | 6 |
| ⏸️ Заблокированы бэкендом | 14 |
| 🔧 Починено (код) | 0 |
| 📝 Обновлено (тест устарел) | 0 |

---

## ✅ Прошедшие сценарии

### AUTH-01: Welcome Page Load
- **Результат:** DateRabbit, Create Account, Login — все видны
- **Скриншот:** 01-welcome-page.jpg

### AUTH-02: Navigate to Login
- **Результат:** URL = /login, email input виден
- **Скриншот:** 02-login-page.jpg

### AUTH-03: Navigate to Role Select
- **Результат:** URL = /role-select, обе карточки видны
- **Скриншот:** 03-role-select.jpg

### AUTH-04: Role Select - Seeker
- **Результат:** URL = /register?role=male
- **Скриншот:** 04-register-seeker.jpg

### AUTH-05: Role Select - Companion
- **Результат:** URL = /register?role=female, Hourly Rate input виден
- **Скриншот:** 05-register-companion.jpg

### EDGE-01: Access Protected Page Without Auth
- **Результат:** /browse → /welcome, /profile → /welcome (корректный редирект)
- **Скриншоты:** 06-07

---

## ❌ Блокированные сценарии

### AUTH-06: Login with Temp Email
- **Проблема:** API `POST /api/auth/otp/request` возвращает 500 Internal Server Error
- **Причина:** Backend email service не работает
- **Влияние:** Блокирует все сценарии с авторизацией (14 сценариев)

```
curl -X POST https://daterabbit-api.smartlaunchhub.com/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

Response: {"statusCode":500,"message":"Internal server error"}
```

---

## ⏸️ Заблокированные сценарии (14)

Все требуют авторизации, которая не работает из-за AUTH-06:

| ID | Название |
|----|----------|
| AUTH-07 | Profile Setup - Seeker |
| AUTH-08 | Profile Setup - Companion |
| BROWSE-01 | View Companions List |
| BROWSE-02 | Search Companions |
| BROWSE-03 | Open Filters |
| BROWSE-04 | View Companion Profile |
| BOOK-01 | Create Booking Request |
| BOOK-02 | View My Bookings |
| REQ-01 | View Incoming Requests |
| REQ-02 | Accept Request |
| REQ-03 | Decline Request |
| CHAT-01 | View Chats List |
| CHAT-02 | Send Message |
| PROF-01..03 | Profile operations |

---

## Рекомендации

1. **Починить backend email service** — Brevo/Brevo API ключи или SMTP конфигурация
2. **Добавить health check endpoint** — `/api/health` для мониторинга
3. **Добавить логирование** — для отладки 500 ошибок
4. **Перезапустить TDD FIX** после починки бэкенда

---

## Инфраструктура создана

```
app/
├── tests/
│   ├── scenarios.ts        ← Single Source of Truth (TypeScript)
│   ├── scenarios.md        ← Человекочитаемый формат
│   ├── logic/
│   │   └── helpers.ts      ← Logic Testing helpers
│   └── generated/
│       └── e2e.spec.ts     ← Playwright тесты
├── scripts/
│   └── generate-tests.ts   ← Генератор из scenarios.ts
└── playwright.config.ts    → https://daterabbit.smartlaunchhub.com
```

### NPM scripts

```bash
npm run generate:tests    # Генерация тестов
npm run test:web          # Playwright (9 тестов, все проходят)
npm run test:web:logic    # Logic Testing с скриншотами
```

---

## Скриншоты

Все в `/tmp/tdd-screenshots/`:
- 01-welcome-page.jpg
- 02-login-page.jpg
- 03-role-select.jpg
- 04-register-seeker.jpg
- 05-register-companion.jpg
- 06-protected-browse.jpg
- 07-protected-profile.jpg
- 08-10 auth flow (не завершился)
