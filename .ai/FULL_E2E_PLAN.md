# ПОЛНЫЙ E2E ТЕСТОВЫЙ ПЛАН

## Флоу: Seeker находит Companion → Встреча → Отзыв → Оплата

### Шаг 1: Девочка (Companion) регистрируется
- [ ] Регистрация через welcome → role=companion
- [ ] Заполняет профиль: имя, возраст, локация, ставка
- [ ] Загружает фото (опционально)
- [ ] Устанавливает доступные даты в календаре
- [ ] **Результат:** Profile visible in browse

### Шаг 2: Мальчик (Seeker) ищет
- [ ] Регистрация через welcome → role=seeker
- [ ] Browse → видит компаньонку
- [ ] Открывает профиль → видит фото, bio, ставку, отзывы
- [ ] **Результат:** Can see companion details

### Шаг 3: Seeker создает бронирование
- [ ] Выбирает Activity (Dinner/Coffee/Drinks)
- [ ] Выбирает Date + Time
- [ ] Выбирает Duration (1-5 hours)
- [ ] Указывает Location
- [ ] Видит Price Summary: $100 × 2h + 15% fee = $230
- [ ] Отправляет запрос → Status: PENDING
- [ ] **API:** POST /bookings

### Шаг 4: Companion видит запрос
- [ ] Dashboard показывает "1 Pending Request"
- [ ] Открывает Requests → видит детали
- [ ] Видит: Seeker name, Activity, Date, Time, Location, Price
- [ ] **API:** GET /bookings/requests

### Шаг 5: Companion принимает
- [ ] Нажимает "Accept"
- [ ] Status: PENDING → CONFIRMED
- [ ] Seeker получает уведомление
- [ ] **API:** PUT /bookings/:id/confirm

### Шаг 6: Seeker оплачивает
- [ ] Открывает Confirmed booking
- [ ] Нажимает "Pay Now"
- [ ] Вводит карту (Stripe test: 4242 4242 4242 4242)
- [ ] Payment Status: SUCCESS
- [ ] Booking полностью подтверждён
- [ ] **API:** POST /payments/create-payment-intent

### Шаг 7: Встреча происходит
- [ ] System mark booking as COMPLETED
- [ ] Или manual completion после даты
- [ ] **API:** PUT /bookings/:id/complete

### Шаг 8: Seeker оставляет отзыв
- [ ] Видит "Leave Review" на completed booking
- [ ] Ставит рейтинг (1-5 stars)
- [ ] Пишет комментарий
- [ ] Companion получает отзыв
- [ ] Rating обновляется (среднее)
- [ ] **API:** POST /bookings/:id/review

### Шаг 9: Companion получает деньги
- [ ] Earnings page показывает: +$200 (minus 15% fee = $170)
- [ ] Balance: $170 available
- [ ] Может вывести на карту (Stripe Connect)
- [ ] **API:** GET /payments/earnings, POST /payments/payouts/create

---

## Текущий статус реализации

| Шаг | API | Frontend | Status |
|-----|-----|----------|--------|
| 1. Companion регистрация | ✅ | ✅ | Готов |
| 2. Seeker browse | ✅ | ✅ | Готов |
| 3. Create booking | ✅ | ⚠️ | UI есть, API не подключен |
| 4. Companion requests | ✅ | ⚠️ | UI mock, API не подключен |
| 5. Accept booking | ✅ | ❌ | UI нет кнопки Accept |
| 6. Payment (Stripe) | ❌ | ❌ | Не реализовано |
| 7. Complete booking | ✅ | ❌ | UI нет |
| 8. Leave review | ❌ | ⚠️ | UI есть, API нет |
| 9. Earnings/Payouts | ❌ | ⚠️ | UI mock, API нет |

---

## Что нужно доделать

### HIGH PRIORITY
1. Подключить фронтенд к API bookings
2. Добавить кнопку Accept на /female/requests
3. Реализовать reviews API
4. Реализовать payments API (Stripe)

### MEDIUM PRIORITY  
5. Notifications при смене статуса
6. Complete booking автоматический
7. Stripe Connect для payouts

---

## Тестовые данные для полного цикла

### Users
- **Seeker:** e2e@test.com (через temp email)
- **Companion:** sarah@daterabbit.test (в БД)

### Booking Test
```
Seeker: e2e@test.com
Companion: sarah@daterabbit.test
Activity: dinner
DateTime: Tomorrow 7PM
Duration: 2 hours
Location: Nobu, Manhattan
Total: $230
```

### Stripe Test Card
```
4242 4242 4242 4242
Exp: 12/30
CVC: 123
```
