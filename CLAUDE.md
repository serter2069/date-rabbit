# DateRabbit

## 🔐 Тестовая авторизация

**DEV режим (DEV_AUTH=true в backend/.env):**

| Сценарий | Email | OTP код |
|----------|-------|---------|
| Существующий/Новый | `test@daterabbit.com` | `00000000` (8 цифр) |

При `DEV_AUTH=true` — OTP всегда `00000000`, email НЕ отправляется.

**URLs для тестирования (см. `.ai/context.json`):**
- Production: `https://daterabbit.smartlaunchhub.com`
- Local: `http://localhost:8081` (app), `http://localhost:3001/api` (API)

---

## Project Info

- **Type:** React Native / Expo
- **GitLab:** gitlab.com/serter2069/date-rabbit
