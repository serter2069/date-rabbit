# Технический анализ DateRabbit

## 1. Анализ выбранного стека

### Текущий стек: React Native + Expo + NestJS + PostgreSQL

| Компонент | Оценка | Обоснование |
|-----------|--------|-------------|
| **React Native + Expo** | ✅ Отличный выбор | - Быстрая разработка под iOS/Android<br>- Огромная экосистема<br>- OTA updates через Expo<br>- Хороший UX близкий к нативному |
| **NestJS** | ✅ Очень хорошо | - Structured, масштабируемый<br>- TypeScript из коробки<br>- Отличная документация<br>- Готовые модули для всего |
| **PostgreSQL** | ✅ Идеально | - Надёжность, ACID<br>- JSON поддержка<br>- Geolocation (PostGIS)<br>- Full-text search |
| **Stripe Connect** | ✅ Правильно | - Marketplace payments из коробки<br>- Автоматическое распределение комиссий<br>- Compliance handled |

### Pros выбранного стека:

- **Скорость разработки**: MVP за 2-3 месяца реально
- **Один язык**: TypeScript везде — проще нанимать, меньше context switching
- **Проверенная комбинация**: тысячи production apps на этом стеке
- **Community support**: быстрые ответы на любые вопросы

### Cons:

- **React Native performance**: сложные анимации могут лагать
- **OTA limitations**: native модули требуют store updates
- **Bundle size**: может быть больше чем у нативных приложений

### Альтернативные стеки:

| Альтернатива | Когда имеет смысл |
|--------------|-------------------|
| **Flutter + Dart** | - Нужны сложные анимации<br>- Приоритет — нативный performance<br>- Команда знает Dart |
| **Native (Swift/Kotlin)** | - Unlimited budget<br>- Максимальный UX критичен<br>- Долгосрочный продукт (5+ лет) |
| **Supabase вместо NestJS** | - Solo developer<br>- Нужно быстрее, проще<br>- Не критична кастомная логика |

**Рекомендация:** 🟢 Оставить текущий стек. Он оптимален для MVP и первых 10-50K пользователей.

---

## 2. Технологии конкурентов и индустрии

### Что используют топ dating apps:

| App | Frontend | Backend | Database |
|-----|----------|---------|----------|
| **Tinder** | Native (Swift/Kotlin) | Scala, Node.js | MongoDB, Cassandra |
| **Bumble** | Native | Go, Python | PostgreSQL |
| **Hinge** | Native | Ruby on Rails | PostgreSQL |
| **OkCupid** | Native | Python, Java | MySQL |

### Ключевые паттерны:

1. **Real-time messaging**: WebSockets, Firebase Realtime DB
2. **Image optimization**: Cloudinary, imgix
3. **Video profiles**: TikTok-style short videos набирают популярность
4. **AI/ML**:
   - Matching algorithms (collaborative filtering)
   - Photo verification (face recognition)
   - Safety (content moderation, scam detection)

### Emerging technologies для dating:

| Технология | Применение | Приоритет |
|------------|------------|-----------|
| **AI Avatar Generation** | Создание profile photos | 🟡 Medium |
| **Voice Notes** | Async audio сообщения (BeReal style) | 🟢 High |
| **AR Filters** | Profile enhancement | 🔴 Low |
| **Blockchain Verification** | Identity proof | 🔴 Low |
| **Video Speed Dating** | Live video sessions | 🟢 High |

---

## 3. AI/ML возможности для DateRabbit

### Приоритетные AI фичи:

#### Phase 1 (MVP — критично):
1. **Fraud Detection** 🔴 Критично
   - ML model для определения фейковых профилей
   - Stripe Radar для payment fraud
   - Photo verification через face recognition

2. **Content Moderation** 🔴 Критично
   - Auto-moderate messages (hate speech, harassment)
   - NSFW image detection
   - AWS Rekognition или Google Vision API

#### Phase 2 (рост):
3. **Smart Matching** 🟡 Важно
   - Collaborative filtering для рекомендаций
   - Учитывать: past bookings, reviews, preferences
   - Boosting совместимости пар

4. **Dynamic Pricing** 🟡 Важно
   - ML для оптимизации цен листингов
   - Surge pricing в peak times
   - Personalized pricing based on demand

#### Phase 3 (retention):
5. **Conversational AI** 🟢 Nice-to-have
   - Icebreaker suggestions
   - Message tone analysis (помощь в общении)
   - Date activity recommendations

### Готовые решения:

| Задача | Решение | Стоимость |
|--------|---------|-----------|
| **Fraud Detection** | Stripe Radar | Included в Stripe |
| **Image Moderation** | AWS Rekognition | $1 за 1000 фото |
| **Chat Moderation** | Perspective API (Google) | Free до 1M запросов |
| **Face Verification** | Onfido, Veriff | ~$1-3 за проверку |

---

## 4. Платформенные тренды

### Mobile vs Web vs Desktop:

| Метрика | Mobile | Web | Desktop |
|---------|--------|-----|---------|
| **Dating app usage** | 85% | 12% | 3% |
| **Payment conversion** | Lower | Higher | Highest |
| **User engagement** | Highest | Medium | Low |

**Вывод:** 🟢 Мобайл — приоритет #1. Web — для landing page и admin panel.

### Стратегия платформ:

```
Phase 1: iOS + Android apps (React Native)
Phase 2: Responsive web для bookings/payments (Next.js)
Phase 3: Admin dashboard (React/Next.js)
```

### PWA vs Native vs Hybrid:

| Фактор | PWA | Hybrid (RN) | Native |
|--------|-----|-------------|--------|
| **Push notifications** | Limited | ✅ Full | ✅ Full |
| **Camera/Gallery** | Limited | ✅ Full | ✅ Full |
| **Performance** | Good | Very Good | Perfect |
| **Development cost** | Low | Medium | High |
| **App Store presence** | ❌ No | ✅ Yes | ✅ Yes |

**Рекомендация:** 🟢 Hybrid (React Native) — оптимальный баланс cost/performance/features.

---

## 5. Инфраструктура и хостинг

### Рекомендации по хостингу:

| Сервис | Что хостить | Стоимость (ранние стадии) |
|--------|-------------|---------------------------|
| **Railway** | NestJS backend + PostgreSQL | $20-50/мес |
| **Vercel** | Landing page (Next.js) | Free tier |
| **Expo EAS** | Mobile app hosting/updates | $29/мес (1 seat) |
| **AWS S3 + CloudFront** | User photos/videos | ~$10-30/мес |
| **Stripe** | Payment processing | 2.9% + 30¢ |

### Масштабирование (прогнозы):

| Users | Backend | Database | Storage | CDN | Total |
|-------|---------|----------|---------|-----|-------|
| **100** | $20 | Included | $5 | $5 | ~$30/мес |
| **1K** | $50 | Included | $20 | $10 | ~$80/мес |
| **10K** | $200 | $50 | $100 | $50 | ~$400/мес |
| **100K** | $800 | $200 | $500 | $200 | ~$1,700/мес |

**Расчёты для 100K users:**
- 100K * 10 фото = 1M фото @ 500KB = 500GB storage
- ~50K активных в месяц → 10K транзакций → 200K API calls/day
- Bandwidth: ~2TB/мес

### Альтернативные варианты хостинга:

**Бюджетный вариант (MVP):**
- Backend: Render.com ($7/мес)
- DB: Supabase Free tier → $25/мес на 10K users
- Files: Supabase Storage (2GB free)
- **Total: $7-30/мес**

**Enterprise вариант (50K+ users):**
- Backend: AWS ECS/Fargate
- DB: AWS RDS PostgreSQL (Multi-AZ)
- Files: S3 + CloudFront
- **Total: $1,500-3,000/мес**

### Database выбор (обоснование PostgreSQL):

| Требование | PostgreSQL | MongoDB | MySQL |
|------------|-----------|---------|-------|
| **ACID transactions** | ✅ | ⚠️ Limited | ✅ |
| **Relations (users↔bookings)** | ✅ Perfect | ❌ Manual | ✅ Good |
| **JSON fields (profiles)** | ✅ JSONB | ✅ Native | ⚠️ Basic |
| **Geolocation (PostGIS)** | ✅ Best | ✅ Good | ⚠️ Limited |
| **Full-text search** | ✅ Good | ✅ Good | ⚠️ Basic |
| **Community/tooling** | ✅ Huge | ✅ Large | ✅ Huge |

**Вывод:** 🟢 PostgreSQL — лучший выбор для marketplace с транзакциями.

### CDN, кэширование, real-time:

| Компонент | Решение | Зачем |
|-----------|---------|-------|
| **CDN** | CloudFront или Cloudflare | Быстрая загрузка фото/видео |
| **Cache** | Redis (Upstash) | Session, rate limiting, hot data |
| **Real-time chat** | Socket.io или Supabase Realtime | Instant messaging |
| **Push notifications** | Expo Push или Firebase | Booking alerts, matches |

---

## 6. Build vs Buy

### Что КУПИТЬ (готовые решения):

| Функция | Решение | Стоимость | Обоснование |
|---------|---------|-----------|-------------|
| **Authentication** | Supabase Auth / Clerk | Free-$25/мес | Не изобретать велосипед |
| **Payments** | Stripe Connect | 2.9% + 30¢ | Marketplace payments из коробки |
| **SMS/OTP** | Twilio | $0.0075/SMS | Verification |
| **Email** | Resend / SendGrid | Free-$20/мес | Transactional emails |
| **Analytics** | Mixpanel / Amplitude | Free tier → $200/мес | User behaviour tracking |
| **Error tracking** | Sentry | Free tier | Production debugging |
| **Image CDN** | Cloudinary | Free-$89/мес | Optimization, transforms |
| **Video storage** | Mux / Cloudflare Stream | $0.05/min | Profile videos |
| **Push notifications** | Expo Push / OneSignal | Free | Engagement |
| **Identity verification** | Veriff / Onfido | $1-3/check | Trust & Safety |
| **Background checks** | Checkr | $25-50/check | Optional premium feature |

**Total build vs buy cost (MVP):**
- **Buy (recommended)**: ~$150-300/мес для 1K users
- **Build all custom**: 6-12 месяцев дополнительной разработки

### Что СТРОИТЬ самим:

| Компонент | Почему custom |
|-----------|---------------|
| **Matching algorithm** | Core IP, уникальная логика |
| **Booking system** | Специфичная для marketplace логика |
| **Review/Rating system** | Custom правила, moderation |
| **Profile management** | Уникальные поля (pricing, availability) |
| **Admin dashboard** | Специфичные метрики, управление |
| **Commission logic** | Core business rules |

---

## 7. Технические риски

### Scalability bottlenecks:

| Риск | Impact | Mitigation |
|------|--------|------------|
| **Database queries на profiles** | 🔴 High | - Indexing (location, price, ratings)<br>- Redis cache для hot profiles<br>- Pagination |
| **Image uploads** | 🟡 Medium | - Direct S3 uploads (presigned URLs)<br>- Image compression на клиенте<br>- Cloudinary auto-optimization |
| **Real-time chat** | 🟡 Medium | - Socket.io clustering<br>- Redis adapter для horizontal scaling |
| **Stripe webhook processing** | 🟢 Low | - Job queue (Bull/BullMQ)<br>- Idempotency keys |

### Security considerations:

| Угроза | Меры защиты |
|--------|-------------|
| **Payment fraud** | - Stripe Radar<br>- 3D Secure<br>- Manual review для больших сумм |
| **Fake profiles** | - Phone verification (Twilio)<br>- Photo verification (face match)<br>- Social media linking |
| **Harassment** | - Block/report функции<br>- AI content moderation<br>- Human moderation team |
| **Data breach** | - Encryption at rest (PostgreSQL)<br>- Encryption in transit (HTTPS)<br>- Regular security audits |
| **PII exposure** | - Anonymization<br>- Selective data sharing<br>- GDPR compliance |

### Compliance requirements:

| Регион | Требования | Действия |
|--------|------------|----------|
| **EU (GDPR)** | Data protection, right to deletion | - Cookie consent<br>- Data export API<br>- Retention policies |
| **California (CCPA)** | Similar to GDPR | - Privacy policy<br>- Do not sell data option |
| **Global** | Age verification (18+) | - Age gate при регистрации<br>- ID verification optional |
| **Payment compliance** | PCI DSS | - Stripe handles это<br>- Не хранить card data |

### Technical debt risks:

| Риск | Вероятность | Профилактика |
|------|-------------|--------------|
| **Монолитная архитектура** | 🟡 Medium | - Modular NestJS структура<br>- Event-driven approach<br>- Готовность к микросервисам |
| **Vendor lock-in (Expo)** | 🟢 Low | - Expo можно eject<br>- Минимум Expo-specific кода |
| **Database schema changes** | 🟡 Medium | - Migrations (TypeORM/Prisma)<br>- Backward compatibility<br>- Staging environment |
| **API versioning** | 🟢 Low | - REST API versioning (/v1/)<br>- Graceful deprecation |

---

## 8. Итоговые рекомендации

### Подтверждённые решения (не менять):

✅ **React Native + Expo** — оптимально для MVP  
✅ **NestJS + PostgreSQL** — надёжный, масштабируемый backend  
✅ **Stripe Connect** — идеально для marketplace payments  

### Критичные дополнения:

🔴 **Обязательно добавить:**
1. **Redis** (Upstash) — кэширование, sessions, rate limiting
2. **Cloudinary** — image optimization и CDN
3. **Sentry** — error tracking с первого дня
4. **Mixpanel/Amplitude** — analytics для product decisions

🟡 **Желательно (Phase 2):**
1. **AI Fraud Detection** — защита от скамеров
2. **Video profiles** — повышение engagement
3. **Real-time notifications** — Socket.io или Supabase Realtime

### Budget breakdown (первый год):

| Категория | Стоимость |
|-----------|-----------|
| **Development** | $30K-50K (outsource) или 4-6 мес solo |
| **Infrastructure (год)** | $500-2,000 (рост до 10K users) |
| **Third-party services** | $2,000-5,000/год |
| **Compliance/Legal** | $5,000-10,000 |
| **Marketing/UA** | $20K-50K (критично для traction) |
| **Total Year 1** | **$57K-117K** |

### Next steps:

1. **Сейчас (Week 1-2):** Setup инфраструктуры
   - Railway + PostgreSQL
   - Stripe Connect тестовый аккаунт
   - Expo project init
   
2. **MVP (Month 1-3):** Core features
   - Auth + Profiles
   - Booking flow
   - Payments
   - Basic chat

3. **Beta (Month 4-6):** Trust & Safety
   - Reviews/Ratings
   - Verification
   - AI moderation

4. **Launch (Month 7-12):** Growth features
   - Advanced matching
   - Subscriptions
   - Referral program

---

**Вывод:** Выбранный стек — 9/10. Минимальные изменения, максимум focus на продукт и пользователей. Infrastructure будет масштабироваться естественно по мере роста.
