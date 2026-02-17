# DateRabbit E2E Test Plan

## 📋 Тестовые аккаунты

### Seeker (Мужчина)
| Email | Password | Назначение |
|-------|----------|------------|
| seeker@test.com | (OTP) | Основной тестировщик |
| temp@*.dollicons.com | (OTP) | Временные через mail.tm |

### Companion (Женщина)
| Email | Name | Hourly Rate | Verified |
|-------|------|-------------|----------|
| sarah@test.com | Sarah | $100 | ✅ |
| emma@test.com | Emma | $85 | ✅ |
| olivia@test.com | Olivia | $120 | ✅ |
| mia@test.com | Mia | $75 | ❌ |

---

## 🔄 Полный флоу т��стирования

### Phase 1: Seeker Flow

```
1. Регистрация/Вход (temp email → mail.tm)
2. Dashboard → Browse компаньонок
3. Фильтры: цена, геолокация, рейтинг
4. Profile компаньонки → Фото, Bio, Отзывы
5. Add to Favorites
6. Book Date → Activity, Date, Time, Location
7. Chat с компаньонкой
8. Отмена бронирования (опционально)
9. После "встречи" → Leave Review
```

### Phase 2: Companion Flow

```
1. Вход как компаньонка
2. Dashboard → Statistics
3. Requests → Accept/Decline
4. Calendar → Block dates
5. Earnings → View balance
6. Profile → Edit, Upload photos
7. Verification request
```

---

## ✅ API Endpoints для проверки

### Auth
- [x] POST /api/auth/start - отправка OTP
- [x] POST /api/auth/verify - верификация OTP
- [x] POST /api/auth/register - регистрация

### Users
- [ ] GET /api/users/me - профиль
- [ ] PATCH /api/users/me - обновление
- [ ] POST /api/users/:id/block - блокировка
- [ ] POST /api/users/:id/report - жалоба

### Companions
- [ ] GET /api/companions/search - поиск с фильтрами
- [ ] GET /api/companions/:id - профиль компаньонки
- [ ] GET /api/companions/:id/reviews - отзывы

### Bookings
- [ ] POST /api/bookings - создать
- [ ] GET /api/bookings - список
- [ ] GET /api/bookings/:id - детали
- [ ] PATCH /api/bookings/:id/status - изменить статус
- [ ] POST /api/bookings/:id/cancel - отменить

### Messages
- [ ] GET /api/messages/chats - список чатов
- [ ] GET /api/messages/:bookingId - сообщения
- [ ] POST /api/messages/:bookingId - отправить

### Payments (⚠️ Нужен Stripe)
- [ ] POST /api/payments/create-payment-intent
- [ ] GET /api/payments/earnings
- [ ] POST /api/payments/payouts/create

---

## 🔧 Что нужно настроить

### 1. Тестовые данные (БД)
```sql
-- Компаньонки
INSERT INTO users (id, email, name, role, age, location, bio, "hourlyRate", rating, "reviewCount", "isVerified", "isActive")
VALUES 
  (gen_random_uuid(), 'sarah@daterabbit.test', 'Sarah', 'companion', 28, 'Manhattan, NY', 'Elite companion', 100, 4.9, 47, true, true),
  (gen_random_uuid(), 'emma@daterabbit.test', 'Emma', 'companion', 25, 'Brooklyn, NY', 'Art lover', 85, 4.8, 32, true, true);
```

### 2. Stripe Test Keys
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Тестовые карты Stripe
| Номер | Результат |
|-------|-----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 3220 | 3D Secure |

---

## 📊 Чеклист тестирования

### Web (Playwright)
- [ ] SC-AUTH-001: Регистрация happy path
- [ ] SC-AUTH-003: Вход по OTP
- [ ] SC-BROWSE-001: Загрузка компаньонок
- [ ] SC-PROFILE-001: Просмотр профиля
- [ ] SC-BOOKING-001: Создание бронирования
- [ ] SC-CHAT-001: Отправка сообщения
- [ ] SC-FAV-001: Добавление в избранное
- [ ] SC-REVIEW-001: Оставить отзыв
- [ ] SC-FEMALE-001: Просмотр запросов (companion)
- [ ] SC-EARNINGS-001: Просмотр заработка (companion)

### API (curl)
- [ ] Все endpoints возвращают корректные статусы
- [ ] Валидация входных данных
- [ ] Авторизация работает

---

## 🚀 Порядок выполнения

1. **Создать тестовых компаньонок в БД**
2. **Проверить все API endpoints**
3. **Запустить E2E тесты через Playwright**
4. **Настроить Stripe (если нужно тестировать оплату)**
5. **Задокументировать результаты**
