# DateRabbit

## 🔐 Тестовая авторизация

**DEV режим (DEV_AUTH=true в backend/.env):**

| Сценарий | Email | OTP код |
|----------|-------|---------|
| Существующий/Новый | `test@daterabbit.com` | `000000` (6 цифр) |

При `DEV_AUTH=true` — OTP всегда `000000`, email НЕ отправляется.

**URLs для тестирования (см. `.ai/context.json`):**
- Production: `https://daterabbit.smartlaunchhub.com`
- Local: `http://localhost:8081` (app), `http://localhost:3001/api` (API)

---

## Tasks & Bugs (diagrams.love)
**Schema:** https://diagrams.love/canvas?schema=cmm9ykbh20003ll81v26ea4zj

---

## Project Info

- **Type:** React Native / Expo
- **GitHub:** github.com/serter2069/date-rabbit
