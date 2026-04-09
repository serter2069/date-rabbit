## STATUS: QA
## BUILD_PHASE: C
## BUILD_CYCLES: 5
## UC_PROGRESS: 61/64

## DEPENDENCIES
- [x] Stripe Connect — Express, Platform: DateRabbit, webhook configured, STRIPE_WEBHOOK_SECRET in Doppler
- [x] Stripe Identity — enabled and confirmed
- [blocked] Checkr API — v2, background checks deferred. В v1 seekers верифицируются только через Stripe Identity
- [blocked] Twilio — убран, используем email OTP (не SMS)
- [blocked] Video verification — deferred до v2
- [blocked] Apple Dev Account — для нативной публикации (не блокирует staging QA)
- [blocked] Google Play Account — для нативной публикации (не блокирует staging QA)

<!-- SCENARIOS_META
schema_hash: dr-prototype-v2
generated_at: 2026-03-17T02:42:00.000Z
updated_at: 2026-04-08T00:00:00.000Z
schema_id: cmm17yy690007ll2xy8ezeliv
scenarios_count: 87
mvp_scope: 61
post_mvp_scope: 26
mvp_implemented: 56
mvp_coverage: 87.5%
ui_flow: 10
cross_portal: 8
security: 20
multi_role: 5
not_implemented_count: 23
partial_scenarios: 4
admin_gaps: 7
-->

# DateRabbit — User Stories & Test Scenarios

**Staging:** https://daterabbit.smartlaunchhub.com
**API:** https://daterabbit-api.smartlaunchhub.com/api
**Admin:** https://daterabbit-admin.smartlaunchhub.com (or /admin)
**Tech:** React Native + Expo + NestJS + PostgreSQL + Stripe Connect + Socket.IO
**Schema:** https://diagrams.love/canvas?schema=cmm17yy690007ll2xy8ezeliv

---

## Product Vision & Roles

**What:** Paid dating platform. Real offline dates, not virtual. Companions set their price, Seekers book and pay.

**Value proposition:**
- Seekers: guaranteed date, no ghosting, transparent pricing, verified companions, full refund if she doesn't show up
- Companions: earn on your terms, control schedule, same-day Stripe payouts, safety (seekers are fingerprint-checked)

**Market:** USA, 21+ only (age-verified via Stripe Identity)

### Seeker — man looking for a date
- **Goal:** find an attractive companion, book a real date, show up and have a good time
- **Pain:** dating apps = ghosting, fake profiles, unclear expectations. Here — pay and show up
- **Tech level:** medium
- **Frustrations:** long verification, unclear pricing, cancellations

### Companion — woman offering paid dates
- **Goal:** earn on her own terms, full control (price, schedule, who to accept)
- **Pain:** unsafe freelance dating, payment delays, pushy clients
- **Tech level:** medium
- **Frustrations:** payout delays, fake seekers, complex verification

### Guest — unauthenticated visitor (web)
- **Goal:** understand what this service is, browse companions, decide whether to sign up
- **Pain:** unclear what the service is, no trust
- **Frustrations:** can't see anything without registration

### Admin — platform moderator
- **Goal:** safety, user verification, dispute resolution, payment oversight
- **Tech level:** high
- **Frustrations:** no bulk actions, incomplete user context, slow search

---

## MVP Scope

MVP: 69 UC | Post-MVP: 26 UC | Total: 95 UC
Updated: 2026-04-04 — добавлены UC-L01..L04 (Landing), UC-006..007 (roleHint onboarding), UC-019..020 (Seeker Stripe Identity + Fingerprint), обновлён UC-023 (Companion Stripe Identity)

### Post-MVP (descoped from v1.0):
- ~~UC-037: Pre-chat messaging~~ — перенесён в MVP (см. ниже)
- UC-061..075: Active Date real-time flow (15 UC) — backend ready, frontend post-MVP
- UC-086: Companion date packages
- UC-092: Companion reviews seeker
- UC-094: Admin review moderation
- UC-096..098: Referral program (3 UC)
- UC-116: Wallet/payment methods management
- UC-ADMIN-007: Revenue analytics
- UC-ADMIN-008: Review moderation admin
- UC-ADMIN-009: Platform settings admin

---

## LANDING (UC-L01 — UC-L04)

[x] UC-L01: Гендерный сплэш при первом визите
  Actor: ГОСТЬ (первый визит, web-only)
  Страница: /landing
  Гость видит: полноэкранный оверлей с выбором Female / Male
  Основной поток:
    1. Пользователь открывает /landing
    2. localStorage dr_gender отсутствует → сплэш-оверлей появляется
    3. Пользователь выбирает Female или Male
    4. dr_gender = 'female' | 'male' сохраняется в localStorage
    5. Сплэш скрывается, показывается контент под выбранную роль
  Альтернативный поток: dr_gender уже в localStorage → сплэш не показывается
  AC-01: Сплэш показывается только если dr_gender не в localStorage
  AC-02: Выбор сохраняется между сессиями (localStorage persistent)
  AC-03: На мобильном (Platform.OS !== 'web') лендинг не показывается

[x] UC-L02: Гендерный переключатель в navbar
  Actor: ГОСТЬ / USER (web-only)
  Страница: /landing
  Гость видит: pill-переключатель Female | Male в шапке navbar, всегда виден
  Основной поток:
    1. Пользователь кликает на другую сторону переключателя
    2. dr_gender обновляется в localStorage
    3. Контент лендинга обновляется мгновенно без перезагрузки
  AC-01: Переключение без перезагрузки страницы
  AC-02: Активная сторона визуально выделена

[x] UC-L03: Лендинг Female (Companion)
  Actor: ГОСТЬ — женщина
  Страница: /landing (dr_gender='female')
  Гость видит:
    - Headline: "Go on a date. Get paid."
    - Описание: заработок на датах, контроль расписания, Stripe выплаты
    - CTA primary: "Start Earning" → /onboarding?roleHint=companion
    - CTA secondary: "Find a Companion" → /onboarding?roleHint=seeker
    - Блок шагов: как это работает для companion
    - Trust badges: верификация, безопасность, выплаты
  AC-01: CTA "Start Earning" передаёт roleHint=companion

[x] UC-L04: Лендинг Male (Seeker)
  Actor: ГОСТЬ — мужчина
  Страница: /landing (dr_gender='male')
  Гость видит:
    - Headline: "Pick a woman. Book a date. Show up."
    - Профили companions (горизонтальный скролл, 10+ карточек с фото)
    - Trust badges: "ID-verified", "Real offline dates. Not virtual.", "Full refund if she doesn't show up"
    - Feature rows: No swiping/ghosting, Book in minutes, Transparent pricing, Full refund guarantee
    - CTA primary: "Find a Companion" → /onboarding?roleHint=seeker
    - "View all / 200+ women" карточка в конце скролла
  AC-01: CTA "Find a Companion" передаёт roleHint=seeker
  AC-02: Горизонтальный скролл профилей работает на web и mobile
  AC-03: В скролле показываются только companion с isPublicProfile=true
  API: GET /companions?isPublic=true&limit=10 — для лендинга

---

## AUTH (UC-001 — UC-007)

[v] UC-001: Запрос OTP по email
  Actor: USER (Seeker/Companion)
  Flow: welcome -> login (email input) -> POST /auth/start
  Expected: OTP отправлен на email (Brevo), isNewUser flag возвращен
  API: POST /auth/start { email }
  Throttle: 20 emails/hour per IP
  Validation: email required, max 254 chars, regex format check, lowercase+trim

[v] UC-002: Верификация OTP кода
  Actor: USER
  Flow: otp screen -> ввод кода -> POST /auth/verify
  Expected: JWT token возвращен, user object, redirect на role select (если новый) или dashboard
  API: POST /auth/verify { email, code }
  Throttle: 10 attempts per 10 min
  Edge: неверный код -> 401 + OTP инвалидируется (защита от brute-force), expired код -> 401

[v] UC-003: Регистрация с выбором роли (Seeker)
  Actor: NEW USER
  Flow: role select -> "I am a Seeker" -> profile-setup -> POST /auth/register
  Expected: user создан с role=seeker, новый JWT, redirect на seeker verification flow
  API: POST /auth/register { name, role: "seeker", age, bio, location }
  Note: email берется из JWT токена (требует Authorization header)

[v] UC-004: Регистрация с выбором роли (Companion)
  Actor: NEW USER
  Flow: role select -> "I am a Companion" -> profile-setup -> POST /auth/register
  Expected: user создан с role=companion, hourlyRate сохранен, redirect на companion onboarding
  API: POST /auth/register { name, role: "companion", age, bio, location, hourlyRate }
  Note: email берется из JWT токена (требует Authorization header)

[v] UC-005: Повторный вход (existing user)
  Actor: EXISTING USER
  Flow: login -> otp -> verify -> dashboard (skip onboarding)
  Expected: если user.age заполнен -> сразу authenticated, без onboarding
  Logic: authStore.verifyCode checks !apiUser.age для определения needsOnboarding

[x] UC-006: Role-specific онбординг — Companion slides
  Actor: ГОСТЬ → пришёл с лендинга с roleHint=companion
  Страница: /onboarding?roleHint=companion
  Поток:
    1. Онбординг читает roleHint=companion из URL params
    2. Показывает 4 слайда про заработок:
       - "Set your hourly rate. You're in control."
       - "Get paid via Stripe. Same day payouts."
       - "Choose your schedule. Decline anytime."
       - "Verified & safe. All seekers are background-checked."
    3. "Get Started" → /(auth)/login?role=companion (role-select пропускается)
  AC-01: role-select экран НЕ показывается если roleHint передан
  AC-02: При переходе на login роль companion сохраняется
> Note (UX Advocate, /dous 2026-04-04): [x] не реализован — CTA с лендинга ведут в onboarding без roleHint. Без этого смысл кнопок 'Start Earning' и 'Find a Companion' теряется — пользователь выбирает роль заново

[x] UC-007: Role-specific онбординг — Seeker slides
  Actor: ГОСТЬ → пришёл с лендинга с roleHint=seeker
  Страница: /onboarding?roleHint=seeker
  Поток:
    1. Онбординг читает roleHint=seeker из URL params
    2. Показывает 4 слайда про поиск:
       - "Browse verified companions near you."
       - "Book a date in minutes. Real offline meetings."
       - "Transparent pricing. No surprises."
       - "Safe & trusted. FBI fingerprint-verified companions."
    3. "Get Started" → /(auth)/login?role=seeker (role-select пропускается)
  AC-01: role-select экран НЕ показывается если roleHint передан
  AC-02: Если roleHint отсутствует — показывается generic онбординг + role-select как раньше
> Note (UX Advocate, /dous 2026-04-04): Pre-fill роли по roleHint не реализован. Связан с UC-006 — оба нужны для корректной работы лендинга

---

## SEEKER_VERIFY (UC-011 — UC-020)

[v] UC-011: Начало верификации Seeker
  Actor: SEEKER
  Flow: verify_intro -> POST /verification/start
  Expected: verification record создан со status=in_progress
  API: POST /verification/start

[deferred] UC-012: Ввод SSN (последние 4 цифры)
  > Status: REMOVED — избыточно, личность верифицируется через Stripe Identity (UC-019).
  Screen: app/(seeker-verify)/ssn.tsx — удалить

[v] UC-013: Загрузка фото документа (ID)
  Actor: SEEKER
  Flow: verify_id -> выбор/съемка фото -> POST /verification/upload-id
  Expected: файл загружен, idPhotoUrl сохранен
  API: POST /verification/upload-id (multipart/form-data, field: file)
  Fix: BUG-680 исправлен — frontend теперь использует field "file" (было "photo")

[v] UC-014: Загрузка селфи
  Actor: SEEKER
  Flow: verify_selfie -> съемка селфи -> POST /verification/selfie
  Expected: selfieUrl сохранен
  API: POST /verification/selfie (multipart/form-data, field: file)
  Fix: BUG-680 исправлен — frontend теперь использует field "file" (было "photo")

[v] UC-015: Согласие на проверку (consent)
  Actor: SEEKER
  Flow: verify_consent -> чекбокс -> POST /verification/consent
  Expected: consentGiven=true, consentDate записан
  API: POST /verification/consent { consentGiven: true }

[v] UC-016: Отправка на проверку (submit)
  Actor: SEEKER
  Flow: verify_consent -> POST /verification/submit
  Expected: status переходит в pending_review
  API: POST /verification/submit

[v] UC-017: Ожидание одобрения
  Actor: SEEKER
  Flow: verify_pending -> экран ожидания
  Expected: polling GET /verification/status, показ статуса
  API: GET /verification/status
  > Note: pending экран показывает примерный срок ("Usually 1-2 business days") + email пользователя на который придёт уведомление
  > Note: при открытии приложения пока статус pending — показывать тот же экран (не пускать в browse)

[v] UC-018: Одобрение верификации
  Actor: SYSTEM/ADMIN
  Flow: verify_approved -> redirect на browse
  Expected: user.isVerified=true, доступ к browse/booking
  > Note: при смене статуса на approved — отправить email "You're verified! Start browsing companions."
  > Note: при смене статуса на rejected — отправить email с причиной отказа и инструкцией что делать

[x] UC-019: Stripe Identity верификация (Seeker) — возраст 21+
  Actor: SEEKER (после selfie, до fingerprint)
  Страница: /(seeker-verify)/stripe-identity
  Поток:
    1. Backend создаёт Stripe Identity VerificationSession → возвращает clientSecret
    2. Frontend открывает Stripe Identity SDK (ID scan + selfie liveness check)
    3. Stripe автоматически извлекает возраст из документа
    4. Webhook stripe identity.verification_session.verified → backend обновляет статус
    5. Если возраст < 21 → верификация автоматически отклоняется
    6. Если возраст >= 21 → переход на UC-020 (Fingerprint)
  API: POST /verification/stripe-identity/start → { clientSecret }
  Webhook: stripe identity.verification_session.verified | requires_input
  AC-01: Если возраст < 21 → показывается экран отказа с объяснением
  AC-02: Stripe хранит копию документа (мы не храним сырые данные)
  AC-03: stripeIdentitySessionId сохраняется в verification record

[POST-MVP] UC-020: Fingerprint enrollment (IdentoGo/UPS) — decision: post-MVP (user decision 2026-04-04)
  Actor: SEEKER (после Stripe Identity)
  Страница: /(seeker-verify)/fingerprint
  Поток:
    1. Экран объясняет процесс: "Go to a UPS Store or IdentoGo location"
    2. Показывает предзаполненные данные пользователя (имя, DOB)
    3. Показывает карту ближайших точек (Mapbox)
    4. Показывает appointment code (генерируется backend)
    5. Пользователь нажимает "I've scheduled my appointment" → pending
    6. Admin в панели вручную ставит fingerprintStatus: approved | rejected
    7. Approved → доступ к browse
  API: POST /verification/fingerprint/schedule → { appointmentCode, instructions }
  Admin: PATCH /admin/verification/:id/fingerprint { status: approved | rejected }
  AC-01: Без fingerprintStatus=approved → browse недоступен
  AC-02: При rejected → пользователь видит причину и может обратиться в поддержку
  AC-03: Post-MVP: автоматическая интеграция с IdentoGo/Checkr API (сейчас всё вручную)
  Note: fingerprintStatus поле добавляется в Verification model: not_started | scheduled | approved | rejected

Обновлённый флоу Seeker:
  intro → ssn → photo-id → selfie → [UC-019 Stripe Identity] → [UC-020 Fingerprint] → consent → pending → approved

---

## COMPANION_ONBOARD (UC-021 — UC-028)

[~] UC-021: Шаг 1 — базовый профиль companion
  > Status: REMOVED — дублирует register экран. Данные (имя, возраст, локация, hourlyRate) собираются в /(auth)/register.
  > Companion flow после регистрации начинается с UC-022 (фото).
  Screen: app/(comp-onboard)/step1.tsx — удалить

[x] UC-022: Медиа профиля companion — фото + видео
  Actor: COMPANION
  Страница: /(comp-onboard)/step2 + /settings/edit-profile (одинаковый компонент)
  Поток:
    1. Загрузка фото — минимум 4 обязательных для активации профиля
    2. Одно фото назначается главным (cover) — отображается в каталоге
    3. Можно загрузить видео (до 3 штук, до 60 сек каждое)
    4. Медиа отображаются в профиле: сначала главное фото, затем остальные фото и видео
  API:
    POST /uploads/photo → { url, id }
    POST /uploads/video → { url, id, thumbnailUrl }
    PATCH /users/me/media { photos: [{id, isMain}], videos: [{id}] }
  AC-01: Минимум 4 фото — без этого профиль не активируется после верификации
  AC-02: Только одно фото может быть isMain=true
  AC-03: Видео опциональны — 0..3 штуки
  AC-04: В каталоге отображается только главное фото
  AC-05: На странице профиля — галерея (фото + видео вперемешку, видео с иконкой play)
  Screen: app/(comp-onboard)/step2.tsx

[x] UC-023: Stripe Identity верификация companion — возраст 21+
  Actor: COMPANION
  Страница: /(comp-onboard)/verify
  Поток:
    1. Backend создаёт Stripe Identity VerificationSession → возвращает clientSecret
    2. Frontend открывает Stripe Identity SDK (ID scan + selfie liveness check)
    3. Stripe автоматически извлекает возраст из документа
    4. Webhook stripe identity.verification_session.verified → backend обновляет статус
    5. Если возраст < 21 → верификация автоматически отклоняется с объяснением
    6. Если возраст >= 21 → верификация пройдена, переход к pending approval
  API: POST /verification/stripe-identity/start → { clientSecret }
  Webhook: stripe identity.verification_session.verified | requires_input
  AC-01: Возраст 21+ обязателен — при отказе показывается экран с объяснением
  AC-02: Stripe хранит документ, мы получаем только статус + подтверждённый возраст
  AC-03: Заменяет ручную загрузку фото документа (старый UC-023)
  Note: stripeIdentitySessionId сохраняется в verification record

[deferred] UC-024: Видео-верификация
  > Status: REMOVED — избыточный шаг, верификация личности закрывается Stripe Identity (UC-023).
  Screen: app/(comp-onboard)/video.tsx — удалить

[deferred] UC-025: Рекомендации (references)
  > Status: REMOVED — избыточный шаг, никем не проверяется. Верификация личности обеспечивается Stripe Identity + видео.
  Screen: app/(comp-onboard)/refs.tsx — удалить

[v] UC-026: Ожидание одобрения companion
  Actor: COMPANION
  Flow: comp_pending -> экран ожидания
  Expected: polling статуса, redirect на comp_dash после approval
  Screen: app/(comp-onboard)/pending.tsx
  > Note: pending экран показывает примерный срок ("Usually 1-2 business days") + email пользователя
  > Note: при approved — email "Welcome to DateRabbit! Your profile is live."
  > Note: при rejected — email с причиной + что исправить

[x] UC-027: Уведомление companion об одобрении
> Note (UX Advocate, /dous 2026-04-04): [x] Companion не получает уведомление об одобрении — должна сама проверять статус. UX тупик

---

## BROWSE & SEARCH (UC-031 — UC-038)

[v] UC-031: Просмотр каталога companions
  Actor: ГОСТЬ / SEEKER (любой)
  Flow: browse -> GET /companions с пагинацией
  Expected: список CompanionListItem (name, age, hourlyRate, rating, photo, distance)
  API: GET /companions?page=1&limit=20
  Screen: app/(tabs)/male/browse.tsx
  Видимость профилей:
    - ГОСТЬ / неверифицированный → только companion с isPublicProfile=true
    - Верифицированный SEEKER → все companion
  AC-01: Фильтр и каталог доступны без авторизации
  AC-02: При попытке забронировать без полной верификации → редирект на верификацию
  GLOBAL RULE — Seeker access gates:
    - Гость / не авторизован → только публичные профили (isPublicProfile=true), без действий
    - Авторизован, verification pending/incomplete → только просмотр публичных профилей, NO message, NO book
    - fingerprintStatus=approved → полный доступ (message, book, browse all)

[x] UC-032: Фильтрация каталога — универсальный компонент
  Actor: ГОСТЬ / SEEKER (любой)
  Flow: browse -> фильтр-панель -> apply -> обновлённый список
  Фильтры:
    - Город — выбор из закрытого списка активных городов (не свободный ввод)
    - Цена: мин/макс (ползунок)
    - Доступность: конкретная дата ИЛИ период (date picker)
    - Рейтинг минимальный
  Expected: GET /companions?city=X&priceMin=Y&priceMax=Z&date=YYYY-MM-DD&...
  AC-01: Один компонент FilterPanel — используется везде (browse, лендинг, поиск)
  AC-02: Фильтр по дате показывает только companion у которых нет booking на эту дату
  AC-03: Фильтр работает для гостей (видят только публичные профили с учётом фильтра)
  AC-04: URL обновляется при применении фильтров (sharable ссылка)
  AC-05: Список городов загружается через GET /cities?active=true
> Note (BizComplete, /dous 2026-04-04): FilterModal [~] без price range filter бесполезен при 50+ companions. Минимум price range + age filters нужны для MVP конверсии

[x] UC-CITY-01: Управление городами (Admin)
  Actor: ADMIN
  Страница: /admin/cities
  Поток:
    1. Admin видит список городов (название, штат, активен/неактивен, кол-во companions)
    2. Может добавить новый город, деактивировать/активировать существующий
    3. Изначально загружены ~100 крупных городов США (seed data)
  API:
    GET  /admin/cities — список всех городов
    POST /admin/cities { name, state, slug } — добавить город
    PATCH /admin/cities/:id { isActive: boolean } — вкл/выкл
  AC-01: Деактивированный город не появляется в фильтре и при регистрации
  AC-02: Companion в деактивированном городе не удаляется — просто не отображается в поиске

[x] UC-CITY-02: Выбор города при регистрации/профиле
  Actor: COMPANION / SEEKER
  Поток: поле "City" → searchable dropdown → выбор из активных городов
  API: GET /cities?active=true → список для dropdown
  AC-01: Свободный ввод города запрещён — только из списка
  AC-02: Companion без города в списке может написать в поддержку ("My city isn't listed")

[v] UC-033b: Настройка публичного профиля (Companion)
  Actor: COMPANION
  Страница: /settings или /settings/profile-visibility
  Поток:
    1. Companion включает/выключает "Show my profile to unverified users"
    2. isPublicProfile сохраняется в профиле
    3. При isPublicProfile=true → профиль виден гостям и неверифицированным seekers
    4. При isPublicProfile=false → профиль виден только верифицированным seekers
  API: PATCH /users/me { isPublicProfile: boolean }
  AC-01: По умолчанию isPublicProfile=false (companion должна явно включить)
> Status: deferred to backlog (decision 2026-04-04) — profile visibility через admin isActive достаточно для MVP

[x] UC-033: Просмотр профиля companion
  Actor: ГОСТЬ / SEEKER
  Страница: /profile/[id]
  Гость видит:
    - Если companion.isPublicProfile=true → полный профиль (фото, имя, возраст, bio, рейтинг, цена)
    - Если companion.isPublicProfile=false → 404 или редирект на /landing
    - Кнопка "Book a Date" → редирект на регистрацию с объяснением ("Sign up to book a date")
    - Хотелось бы зарегистрироваться? Да — профиль привлекательный, CTA есть
  Верифицированный SEEKER видит: полный профиль + кнопка "Book a Date" → booking flow
  API: GET /companions/:id
    - Если гость + isPublicProfile=false → 403
    - Если гость + isPublicProfile=true → возвращает публичные поля (без контактов)
  Screen: app/profile/[id].tsx
  AC-01: Публичный профиль открывается без авторизации если isPublicProfile=true
  AC-02: "Book" без верификации → не 403, а редирект на регистрацию с сообщением

[x] UC-034: Добавление/удаление из избранного
  Actor: SEEKER (верифицированный)
  Flow: profile/[id] -> heart icon toggle -> POST/DELETE /favorites/:companionId
  Expected: избранное синхронизируется с backend, доступно на всех устройствах
  API:
    POST   /favorites/:companionId — добавить
    DELETE /favorites/:companionId — удалить
    GET    /favorites — список избранных companion
  AC-01: Heart icon отображает актуальный статус с backend
  AC-02: Optimistic update — иконка меняется мгновенно, rollback при ошибке
  Note: BUG-686 — текущая реализация локальная (AsyncStorage), требует миграции на API
> Note (Architect, /dous 2026-04-04): BUG-686 OPEN — Favorites client-side only. При смене устройства все избранные теряются. Backend sync отсутствует

[x] UC-035: Список избранных
  Actor: SEEKER
  Flow: favorites tab -> GET /favorites -> список companions
  Expected: список избранных с фото, именем, ценой, рейтингом, кнопкой "Book"
  AC-01: Пустой список → empty state "No favorites yet. Browse companions to add some."
  Screen: app/favorites/index.tsx

[v] UC-036: Просмотр отзывов companion
  Actor: SEEKER
  Flow: comp_profile -> reviews section -> reviews/[id]
  Expected: пагинированный список отзывов
  API: GET /reviews/users/:userId?page=1&limit=20
  Screen: app/reviews/[id].tsx

[x] UC-037: Pre-chat — переписка до бронирования
  Actor: SEEKER (верифицированный)
  Страница: /profile/[id] → кнопка "Message"
  Поток:
    1. Seeker открывает профиль companion → кнопка "Message before booking"
    2. Открывается чат-тред (тот же /chat/[id] компонент)
    3. До бронирования доступно до 5 сообщений с каждой стороны
    4. После создания booking — лимит снимается, обычный чат
    5. Companion может отклонить переписку (close thread)
  API: POST /messages/pre-booking { companionId } → создаёт pre-booking thread
  AC-01: Лимит 5 сообщений до бронирования (защита от спама)
  AC-02: Только полностью верифицированный seeker (fingerprintStatus=approved) может начать pre-chat
  AC-02b: Авторизован но fingerprint не approved → кнопка "Message" скрыта, вместо неё: "Complete verification to message"
  AC-03: Companion получает push-уведомление о новом сообщении (UC-123)
  AC-04: В чате видна плашка "Book a date" — CTA для перехода к бронированию

[v] UC-038: Report user
  Actor: SEEKER/COMPANION
  Flow: comp_profile или my_profile -> report
  Expected: жалоба отправлена
  API: POST /users/:userId/report { reason, description }

---

## BOOKING (UC-041 — UC-055)

[v] UC-041: Создание booking request
  Actor: SEEKER
  Flow: comp_profile -> book -> booking/[id] -> заполнение формы
  Expected: booking создан со status=pending
  API: POST /bookings { companionId, activity, dateTime, duration, location, notes }
  Validation: companionId required, cannot book yourself, valid dateTime (future), duration > 0, valid activity type, notes max 2000
  Price:
    companionEarnings = hourlyRate × duration
    serviceFee = companionEarnings × 0.20 (настраивается в admin)
    totalPrice = companionEarnings + serviceFee
    Пример: $80/hr × 2h = $160 + $32 = $192 с seeker, companion получает $160
  Checkout показывает: "$160 + $32 service fee = $192 total"
  Fix: BUG-683 исправлен — overlap check предотвращает двойное бронирование (same companion, time overlap -> 409)

[v] UC-042: Оплата booking (Stripe Payment Intent)
  Actor: SEEKER
  Flow: booking confirmed -> payment/[bookingId] -> Stripe form
  Expected: payment intent создан с capture_method=manual (hold only, no charge)
  API: POST /payments/bookings/:bookingId/pay
  Screen: app/payment/[bookingId].tsx
  Fix: BUG-681 исправлен — capture_method: 'manual' добавлен, деньги НЕ списываются сразу

[v] UC-043: Companion просматривает входящие requests
  Actor: COMPANION
  Flow: comp_dash -> requests tab
  Expected: список pending bookings
  API: GET /bookings/requests?status=pending
  Screen: app/(tabs)/female/requests.tsx

[v] UC-044: Companion принимает request
  Actor: COMPANION
  Flow: comp_request -> accept button -> PUT /bookings/:id/confirm
  Expected: status -> confirmed, email уведомления обоим
  API: PUT /bookings/:id/confirm
  Guard: только companion может confirm, только pending booking

[v] UC-045: Companion отклоняет request
  Actor: COMPANION
  Flow: comp_request -> decline button
  Expected: status -> cancelled с reason, Stripe hold отменен
  API: PUT /bookings/:id/cancel { reason }
  Fix: BUG-682 исправлен — cancelPaymentHold вызывается при отмене

[x] UC-046: Отмена booking — refund policy (companion-first)
  Actor: SEEKER / COMPANION
  REFUND RULES:
    Seeker отменяет 48+ часов до даты  → seeker: 90% refund | companion: 10% компенсация
    Seeker отменяет 24–48 часов        → seeker: 50% refund | companion: 50%
    Seeker отменяет < 24 часов         → seeker: 0%         | companion: 100%
    Seeker no-show (не пришёл)         → seeker: 0%         | companion: 100%
    Companion отменяет (любое время)   → seeker: 100% refund | companion: 0% + предупреждение
    Companion no-show (не пришла)      → seeker: 100% refund | companion: 0% + account review
  API: PUT /bookings/:id/cancel { reason, cancelledBy: 'seeker'|'companion' }
  Backend: автоматически рассчитывает refund % по времени до даты и cancelledBy
  AC-01: Stripe partial refund выполняется автоматически при отмене
  AC-02: Companion no-show → автоматически открывается admin review задача
  AC-03: 3 отмены companion за 30 дней → автоматическое предупреждение + admin уведомление

[v] UC-047: Просмотр моих bookings (seeker)
  Actor: SEEKER
  Flow: bookings tab -> фильтр (all/pending/upcoming/past)
  Expected: список с пагинацией, normalized fields
  API: GET /bookings?filter=upcoming&page=1
  Screen: app/(tabs)/male/bookings.tsx

[x] UC-047b: История дат (seeker)
  Actor: SEEKER
  Страница: /bookings?tab=history (или отдельный таб "History")
  Поток: список завершённых дат → тап → детали
  Карточка показывает: фото companion, имя, дата, локация, сумма оплаты
  Действия на карточке:
    - "Leave a review" — если отзыв ещё не написан (ведёт на UC-091)
    - "Book again" — открывает профиль companion с pre-filled датой
  API: GET /bookings?filter=completed&page=1
  AC-01: Пустой список → "No dates yet. Browse companions to book your first date."
  AC-02: "Book again" недоступна если companion деактивирована или удалила аккаунт

[x] UC-048: Завершение даты — подтверждение фактического времени
  Actor: COMPANION (инициирует) + SEEKER (подтверждает)
  Поток:
    1. Companion нажимает "Date completed" → вводит фактическую длительность (напр. 2.5h)
    2. Seeker получает push/email: "Confirm: your date lasted 2.5 hours?"
    3. Seeker подтверждает → payment captured (2.5h × rate + service fee)
    4. Seeker не отвечает 24h → автоматически засчитывается время companion → payment captured
    5. Seeker оспаривает → статус dispute → admin разбирает → выносит решение
  API:
    PUT /bookings/:id/complete { actualDuration: 2.5 } — companion завершает
    POST /bookings/:id/confirm-duration — seeker подтверждает
    PUT /bookings/:id/dispute { reason } — seeker оспаривает
  Admin: GET /admin/bookings?status=dispute — очередь споров
  AC-01: Stripe capture на сумму actualDuration × rate + service fee
  AC-02: Если actualDuration > booked duration → доп. hold был предварительно создан или seeker доплачивает
  AC-03: Companion не нажала "complete" в течение 24h после окончания → автоматически complete по booked time
  AC-04: При dispute — деньги заморожены до решения admin
  Fix: BUG-680 исправлен — PUT вместо POST; BUG-681 — capturePayment вызывается в controller

[v] UC-049: Оставить отзыв после booking
  Actor: SEEKER
  Flow: booking completed -> review form
  Expected: review создан с rating + comment
  API: POST /reviews/bookings/:bookingId { rating, comment }

[v] UC-050: Экран request_sent (ожидание ответа)
  Actor: SEEKER
  Flow: после создания booking -> holding screen
  Expected: экран с таймером ожидания ответа companion
  Note: Backend added in PR #90
  Status: РЕАЛИЗОВАНО (backend), frontend in progress

[v] UC-051: Экран seeker_declined (уведомление об отказе)
  Actor: SEEKER
  Flow: companion declined -> push notification -> decline screen
  Expected: уведомление seeker, предложение искать другого companion
  Note: Backend added in PR #90
  Status: РЕАЛИЗОВАНО (backend), frontend in progress

---

## ACTIVE_DATE (UC-061 — UC-075) [POST-MVP]

[POST-MVP] UC-061: Selfie verification перед датой
  Status: НЕ РЕАЛИЗОВАНО — сравнение селфи с верификационным фото (post-MVP)

[POST-MVP] UC-062: Check-in (геолокация)
  Status: НЕ РЕАЛИЗОВАНО — оба участника в радиусе 100м от location (post-MVP)

[POST-MVP] UC-063: Companion check-in
  Status: НЕ РЕАЛИЗОВАНО — companion подтверждает прибытие (post-MVP)

[POST-MVP] UC-064: Active date (таймер + контролы)
  Status: НЕ РЕАЛИЗОВАНО — таймер duration часов, контролы extend/end/sos (post-MVP)

[POST-MVP] UC-065: Запрос продления времени
  Status: НЕ РЕАЛИЗОВАНО — запрос + дополнительный payment hold (post-MVP)

[POST-MVP] UC-066: Companion принимает/отклоняет продление
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-067: Досрочное завершение
  Status: НЕ РЕАЛИЗОВАНО — partial refund (post-MVP)

[POST-MVP] UC-068: SOS (экстренная помощь)
  Status: НЕ РЕАЛИЗОВАНО — emergency contacts + admin alert + payment freeze (post-MVP)

[POST-MVP] UC-069: Safety check-in (30 мин таймер)
  Status: НЕ РЕАЛИЗОВАНО — companion подтверждает каждые 30 мин (post-MVP)

[POST-MVP] UC-070: Фото с даты (shared)
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-071: План/маршрут даты
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-072: Report issue during date
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-073: Companion завершает дату
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-074: Post-date summary
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-075: No-show (15 мин без check-in)
  Status: НЕ РЕАЛИЗОВАНО — booking отменен, refund seeker, штраф companion (post-MVP)

---

## REVIEWS (UC-091 — UC-094)

[v] UC-091: Seeker оставляет отзыв companion
  Actor: SEEKER
  Flow: booking completed -> review form -> rating + comment
  Expected: review создан, companion.rating обновлен
  API: POST /reviews/bookings/:bookingId { rating, comment }

[POST-MVP] UC-092: Companion оставляет отзыв seeker
  Actor: COMPANION
  Flow: booking completed -> review_comp -> rating + comment
  Expected: review создан для seeker
  Status: НЕ РЕАЛИЗОВАНО (UI отсутствует, но API поддерживает) (post-MVP)

[v] UC-093: Просмотр отзывов пользователя
  Actor: ANY
  Flow: profile -> reviews section
  Expected: пагинированный список отзывов
  API: GET /reviews/users/:userId

[POST-MVP] UC-094: Модерация отзывов (Admin)
  Actor: ADMIN
  Flow: admin panel -> review moderation
  Expected: удаление/скрытие недопустимых отзывов
  Status: НЕ РЕАЛИЗОВАНО — backend endpoints отсутствуют (BUG-701) (post-MVP)

---

## COMPANION_MGMT (UC-081 — UC-088)

[v] UC-081: Companion dashboard
  Actor: COMPANION
  Flow: comp_dash -> overview (upcoming bookings, earnings, requests)
  Screen: app/(tabs)/female/index.tsx

[v] UC-082: Управление профилем companion
  Actor: COMPANION
  Flow: comp_dash -> comp_edit -> edit profile
  API: PUT /users/me
  Screen: app/(tabs)/female/profile.tsx

[v] UC-083: Управление доступностью (calendar)
  Actor: COMPANION
  Flow: comp_dash -> comp_calendar -> block/unblock dates
  API: POST /calendar/block { dates, reason }, DELETE /calendar/block { dates }, GET /calendar/blocked
  Screen: app/(tabs)/female/calendar.tsx

[v] UC-084: Просмотр earnings
  Actor: COMPANION
  Flow: comp_dash -> comp_earnings -> summary + history
  API: GET /payments/earnings, GET /payments/earnings/history
  Screen: app/(tabs)/female/earnings.tsx

[x] UC-084b: История дат (companion)
  Actor: COMPANION
  Страница: /bookings/history или таб в earnings/calendar
  Поток: список завершённых дат → тап → детали
  Карточка показывает: фото seeker (если есть), имя, дата, локация, сумма заработка
  Действия на карточке:
    - "Leave a review" — если отзыв ещё не написан
  API: GET /bookings?filter=completed&role=companion&page=1
  AC-01: Пустой список → "No completed dates yet."
  AC-02: Отображается заработок по каждой дате (после вычета комиссии платформы)
> Note (AdminMirror, /dous 2026-04-04): Помечен [v] но экрана нет в коде. Companion не может видеть историю дат — ломает earning tracking и dispute resolution

[x] UC-084c: Подключение банковского счёта — Stripe Connect
  Actor: COMPANION
  Страница: /settings/payout или баннер в earnings если не подключено
  Поток:
    1. После апрува верификации — companion видит баннер "Connect your bank to receive payouts"
    2. Нажимает "Connect Bank" → открывается Stripe Connect Express onboarding (WebView или браузер)
    3. Вводит данные банка в интерфейсе Stripe (мы не видим реквизиты)
    4. Stripe возвращает connected account → статус payoutEnabled=true
    5. Теперь доступны автоматические выплаты
  API:
    POST /stripe/connect/onboarding → { onboardingUrl } — создаёт Stripe Connect Express account
    GET  /stripe/connect/status → { payoutEnabled, pendingRequirements }
  Webhook: account.updated → обновляет payoutEnabled статус
  AC-01: Без payoutEnabled=true — earnings отображаются, но вывод недоступен
  AC-02: Баннер "Connect your bank" показывается на earnings экране пока не подключено
  AC-03: Companion может обновить банк через Stripe Connect dashboard (ссылка в настройках)
  AC-04: Минимальная сумма для вывода: $50 (настраивается в admin)

MONETIZATION MODEL:
  Seeker платит: hourlyRate × hours + platform fee + Stripe processing fee
  Companion получает: hourlyRate × hours (100%, без вычетов)
  Платформа зарабатывает: platform fee % от (hourlyRate × hours) — настраивается в admin
  Stripe processing fee: 2.9% + $0.30 от (date cost + platform fee) — добавляется сверху
  Пример: $80/hr × 2h = $160 + $32 platform fee (20%) + $5.59 Stripe = $197.59 total. Companion получает $160.
  Service fee % настраивается в admin через PlatformSettings.commissionRate (по умолчанию 20%)
  На checkout ОБЯЗАТЕЛЬНО показывается breakdown: date cost + platform fee + Stripe fee + total charged
  See: GitHub #351

[v] UC-085: Вывод средств (withdraw)
  Actor: COMPANION
  Flow: comp_earnings -> withdraw -> payout
  API: GET /payments/payouts/balance, POST /payments/payouts/create { amount }
  Note: BUG-684 открыт — нет валидации amount > 0

[POST-MVP] UC-086: Пакеты (date packages)
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[v] UC-087: Stripe Connect onboarding
  API: POST /payments/connect/onboard -> URL для Stripe
  Status: РЕАЛИЗОВАНО — PR #362: банер в earnings.tsx, кнопка в settings/index.tsx, /stripe/connect.tsx экран
> Note: BUG-686 fix + PR #362 — companion видит баннер "Connect your bank" и может подключить банк

[v] UC-088: Stripe Connect status check
  API: GET /payments/connect/status

---

## MESSAGING (UC-101 — UC-105)

[v] UC-101: Список чатов
  API: GET /messages/conversations
  Screen: app/(tabs)/male/messages.tsx

[v] UC-102: Чат (переписка)
  API: GET /messages/:userId, POST /messages/:userId { content }
  Screen: app/chat/[id].tsx

[v] UC-103: Отправка сообщения
  API: POST /messages/:userId { content }

[v] UC-104: Счетчик непрочитанных
  API: GET /messages/unread-count

---

## NOTIFICATIONS (UC-120 — UC-125)

[x] UC-120: Уведомления — верификация
  Actor: SEEKER / COMPANION
  Триггеры:
    - verification.approved → email + push: "You're verified! Start browsing."
    - verification.rejected → email + push: причина + что делать дальше
    - fingerprint.approved → email + push: "Fingerprint check passed. You're all set."
    - fingerprint.rejected → email + push: причина + контакт поддержки

[x] UC-121: Уведомления — booking (Companion)
  Actor: COMPANION
  Триггеры:
    - booking.requested → push + email: "New date request from [Name] — [date, location]"
    - booking.cancelled_by_seeker → push + email: "Date cancelled by seeker. [refund info]"
    - date.reminder_24h → push: "Your date tomorrow at [time] with [Name]"
    - date.reminder_1h → push: "Your date in 1 hour with [Name] at [location]"
  AC-01: Request уведомление содержит кнопки Accept / Decline прямо в push (iOS/Android)

[x] UC-122: Уведомления — booking (Seeker)
  Actor: SEEKER
  Триггеры:
    - booking.accepted → push + email: "Date confirmed! [companion name], [date, location]"
    - booking.declined → push + email: "Request declined. Browse other companions."
    - booking.cancelled_by_companion → push + email: "Date cancelled. Full refund issued."
    - payment.confirmed → email: чек с деталями бронирования
    - date.reminder_24h → push: "Your date tomorrow at [time] with [Name]"
    - date.reminder_1h → push: "Your date in 1 hour with [Name] at [location]"

[x] UC-123: Уведомления — сообщения
  Actor: SEEKER / COMPANION
  Триггеры:
    - message.received (когда приложение в фоне) → push: "[Name]: [preview текста]"
  AC-01: Если чат открыт — push не отправляется

[x] UC-124: Уведомления — выплаты (Companion)
  Actor: COMPANION
  Триггеры:
    - payout.initiated → email + push: "Payout of $X sent to your bank account"
    - payout.failed → email + push: причина + как исправить

[v] UC-125: Настройки уведомлений
  Actor: SEEKER / COMPANION
  Страница: /settings/notifications
  Поток: управление какие push/email включены/выключены
  AC-01: Email уведомления о верификации и выплатах нельзя отключить (критичные)
  AC-02: Push уведомления для reminders можно отключить отдельно
> Status: deferred to backlog (decision 2026-04-04) — все уведомления ON по умолчанию, granular control post-MVP

---

## SETTINGS (UC-111 — UC-116)

[v] UC-111: Настройки профиля
  Screen: app/settings/edit-profile.tsx

[v] UC-112: Настройки уведомлений
  Screen: app/settings/notifications.tsx

[v] UC-113: Удаление аккаунта
  API: DELETE /users/me
  Screen: app/settings/delete-account.tsx

[v] UC-114: Статус верификации
  API: GET /users/verification/status
  Screen: app/settings/verification.tsx

[v] UC-115: Block/unblock пользователя
  API: POST /users/:userId/block, DELETE /users/:userId/block, GET /users/blocked

[POST-MVP] UC-116: Способы оплаты (wallet)
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

---

## ADMIN PANEL (UC-ADMIN-001 — UC-ADMIN-009)

[~] UC-ADMIN-001: Admin авторизация / текущий пользователь
  Actor: ADMIN
  Flow: admin login -> GET /auth/me
  Expected: admin user object возвращен, admin session active
  API: GET /auth/me
  Status: ЧАСТИЧНО — login endpoint есть, GET /auth/me отсутствует (BUG-696)
  Admin UI: admin/src/app/(auth)/login/page.tsx
> Note (SecOfficer, /dous 2026-04-04): BUG-696 OPEN — GET /auth/me отсутствует. Admin panel не проверяет текущую сессию — риск работы с expired token

[~] UC-ADMIN-002: Просмотр и поиск пользователей
  Actor: ADMIN
  Flow: admin panel -> Users -> search/filter
  Expected: список users с пагинацией
  API: GET /admin/users?search=&page=&limit= (СУЩЕСТВУЕТ)
  Status: РЕАЛИЗОВАНО в backend

[~] UC-ADMIN-003: Просмотр деталей пользователя
  Actor: ADMIN
  Flow: admin -> Users -> user detail page -> bookings history
  Expected: полные данные user + история bookings
  API: GET /admin/users/:id (СУЩЕСТВУЕТ), GET /admin/users/:userId/bookings (ОТСУТСТВУЕТ)
  Status: ЧАСТИЧНО — user detail есть, bookings history -> 404 (BUG-698)

[~] UC-ADMIN-004: Бан/разбан пользователя
  Actor: ADMIN
  Flow: admin -> user detail -> Ban/Unban button
  Expected: user.isActive изменен
  API: POST /admin/users/:id/ban, POST /admin/users/:id/unban (ОТСУТСТВУЮТ)
  Status: НЕ РЕАЛИЗОВАНО — кнопки вызывают 404 (BUG-697)

[~] UC-ADMIN-005: Верификация пользователей
  Actor: ADMIN
  Flow: admin -> Verifications -> список pending -> approve/reject
  Expected: verification.status обновлен
  API: GET /admin/verifications (СУЩЕСТВУЕТ), PUT /admin/verifications/:id/approve (СУЩЕСТВУЕТ)
  Status: РЕАЛИЗОВАНО в backend — это рабочий раздел

[~] UC-ADMIN-006: Просмотр и управление bookings
  Actor: ADMIN
  Flow: admin -> Bookings -> список + cancel action
  Expected: все bookings, возможность отмены
  API: GET /admin/bookings (СУЩЕСТВУЕТ), POST /admin/bookings/:id/cancel (ОТСУТСТВУЕТ)
  Status: ЧАСТИЧНО — read работает, cancel -> 404 (BUG-699)

[POST-MVP] UC-ADMIN-007: Финансовая аналитика
  Actor: ADMIN
  Flow: admin -> Finances -> transactions + revenue charts
  Expected: история транзакций, revenue breakdown по периодам
  API: GET /admin/transactions (ОТСУТСТВУЕТ), GET /admin/revenue (ОТСУТСТВУЕТ)
  Status: НЕ РЕАЛИЗОВАНО (BUG-700) (post-MVP)

[POST-MVP] UC-ADMIN-008: Модерация отзывов
  Actor: ADMIN
  Flow: admin -> Reviews -> список + delete action
  Expected: просмотр и удаление отзывов
  API: GET /admin/reviews (ОТСУТСТВУЕТ), DELETE /admin/reviews/:id (ОТСУТСТВУЕТ)
  Status: НЕ РЕАЛИЗОВАНО (BUG-701) (post-MVP)

[POST-MVP] UC-ADMIN-009: Настройки платформы
  Actor: ADMIN
  Flow: admin -> Settings -> commission rate, verification settings
  Expected: изменение платформенных настроек
  API: GET/PATCH /admin/settings (ОТСУТСТВУЮТ)
  Status: НЕ РЕАЛИЗОВАНО (BUG-702) (post-MVP)

---

## REFERRAL (UC-096 — UC-098) [POST-MVP]

[POST-MVP] UC-096: Реферальная программа
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-097: Применение реферального кода
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

[POST-MVP] UC-098: Статистика рефералов
  Status: НЕ РЕАЛИЗОВАНО (post-MVP)

---
---

## ONLINE_WATCHER (UC-W01) [добавлено /dous 2026-04-08]

[v] UC-W01: Seeker подписывается на online статус companion
  Actor: SEEKER (верифицированный)
  Страница: /profile/[id]
  Поток:
    1. На профиле companion: online indicator (зелёная точка если lastSeen < 5 мин назад)
    2. Если companion offline — кнопка "Notify when online"
    3. Seeker нажимает → POST /users/:id/watch-online → добавлен в watch list
    4. Когда companion делает heartbeat (PATCH /users/heartbeat) → проверить OnlineWatcher → push уведомление всем watchers: "[Name] is online now"
    5. Seeker может отменить подписку → DELETE /users/:id/watch-online
  API:
    GET    /users/watch-online — список watched companions
    POST   /users/:id/watch-online — подписаться
    DELETE /users/:id/watch-online — отписаться
  AC-01: Push уведомление отправляется в течение 30 сек после heartbeat companion
  AC-02: Нельзя подписаться дважды на одного companion
  AC-03: Подписка удаляется автоматически после отправки уведомления (one-shot)
  GitHub: #359

---

## MISSING UC (добавлено /dous 2026-04-04)

[x] UC-MISSING-001: No-show refund flow
  Actor: SEEKER / ADMIN
  Priority: p1 | Trinity: #2070
  Страница: /booking/[id] → no-show report
  **Гость видит:** N/A (auth required)
  Основной поток:
    1. Seeker на confirmed booking > 15 мин после начала — кнопка "She didn't show up"
    2. Seeker подтверждает claim
    3. Admin видит no-show claim в /admin/disputes
    4. Admin проверяет + инициирует Stripe full refund
    5. Seeker получает email: "Refund initiated for $X"
    6. Companion получает предупреждение
  Acceptance criteria:
    - AC-01: Кнопка доступна только через 15 мин после scheduled time
    - AC-02: Только один no-show claim на booking
    - AC-03: Full refund инициируется через Stripe API
    - AC-04: Payout companion заморожен пока claim открыт

[x] UC-MISSING-002: Dispute resolution flow
  Actor: SEEKER / COMPANION / ADMIN
  Priority: p1 | Trinity: #2071
  Страница: /booking/[id] → report issue
  Основной поток:
    1. Кнопка "Report an issue" в completed/active booking
    2. Форма: тип проблемы, описание, опциональное фото
    3. Admin panel: очередь disputes, детали, решение
    4. Возможные решения: refund / partial refund / ban / warning
    5. Заморозка companion payout пока dispute открыт
    6. Уведомления обеим сторонам о результате
  Acceptance criteria:
    - AC-01: Dispute создаётся в течение 24h после окончания date
    - AC-02: Payout companion автоматически заморожен на время dispute
    - AC-03: Admin может принять решение и инициировать refund

[x] UC-MISSING-004: Booking expiration / auto-decline
  Actor: SYSTEM (cron)
  Priority: p1 | Trinity: #2072
  Триггер: booking.status=pending > 24h без ответа Companion
  Основной поток:
    1. Cron проверяет pending bookings каждый час
    2. pending > 24h → booking.status = auto_expired
    3. Seeker: push + email "Request expired — companion did not respond. Browse others."
    4. Companion: push "Missed request from [Name]"
  Acceptance criteria:
    - AC-01: Cron запускается каждый час
    - AC-02: Точно 24h окно (configurable через env)
    - AC-03: Уведомления отправляются обеим сторонам

[x] UC-MISSING-005: Companion safety button (в-датовый SOS)
  Actor: COMPANION
  Priority: p2 | Trinity: #2073
  Страница: в-датовый экран / чат
  Основной поток:
    1. Companion нажимает "I feel unsafe"
    2. Подтверждение (2 тапа для защиты от случайного)
    3. SMS + push с GPS координатами → admin
    4. Опциональный emergency contact из настроек
    5. Booking автоматически отменяется
    6. Seeker получает уведомление "Companion activated safety alert"
  Acceptance criteria:
    - AC-01: 2-tap confirmation (защита от случайного нажатия)
    - AC-02: GPS координаты отправляются admin в течение 30 сек
    - AC-03: Booking немедленно отменяется без charge

[x] UC-MISSING-007: Age verification gate (21+)
  Actor: SYSTEM
  Priority: p1 | Trinity: #2038 (verified — re-check implementation)
  NOTE: UC-2038 помечен verified — проверить что DOB из Stripe Identity реально проверяется против 21+
  Acceptance criteria:
    - AC-01: При DOB < 21 лет — регистрация блокируется с сообщением
    - AC-02: Проверка происходит после Stripe Identity verification
    - AC-03: Данные DOB не хранятся на наших серверах (только флаг isAgeVerified)

[x] UC-MISSING-008: Platform fee / commission model
  Actor: SYSTEM / SEEKER / COMPANION
  Priority: p1 | Trinity: #2055 (verified — platform 15% in code)
  NOTE: 85/15 split реализован в коде (#2055 verified). UC добавлен для документирования.
  Описание:
    - Seeker платит totalPrice = hourlyRate × duration
    - Platform удерживает 15% = application_fee_amount в Stripe Connect
    - Companion получает 85%
    - Breakdown показывается в: payment confirmation, companion earnings
  Acceptance criteria:
    - AC-01: application_fee_amount = 15% от totalPrice
    - AC-02: Companion earnings отображают breakdown (gross / platform fee / net)

[x] UC-MISSING-009: Companion onboarding completion gate
  Actor: SYSTEM
  Priority: p2 | Trinity: #2074
  Описание: профиль companion публикуется ТОЛЬКО при:
    - Минимум 1 фото загружено
    - Stripe Identity пройдена (isVerified=true)
    - hourlyRate > 0
    - Bio заполнено (≥ 20 символов)
  Acceptance criteria:
    - AC-01: isPublicProfile автоматически = false пока gate не пройден
    - AC-02: Companion видит checklist прогресса на dashboard
    - AC-03: При попытке publish без выполнения gate — показать что именно не заполнено

[v] UC-MISSING-010: Refresh Token Implementation (auth persistence)
  Actor: SYSTEM
  Priority: p1 | Category: auto (Collegium 2026-04-05)
  Описание: Текущий auth выдаёт один JWT без refresh. Пользователи вылетают при истечении токена.
  Требования:
    - Backend: POST /auth/refresh → новая пара access+refresh (token rotation)
    - Backend: таблица refresh_tokens в PostgreSQL (НЕ in-memory, НЕ Redis без persistence)
    - Access token TTL: 15 минут
    - Refresh token TTL: 30 дней sliding window (обновляется при каждом refresh)
    - Client: 3-уровневый refresh: reactive (401 interceptor) + proactive (каждые 20 мин) + on app start
    - Server restart НЕ должен разлогинивать пользователей (JWT stateless + refresh в БД)
  Acceptance criteria:
    - AC-01: Перезапуск API → пользователь остался залогинен
    - AC-02: Access token истёк → автоматический refresh без экрана входа
    - AC-03: Refresh token в PostgreSQL таблице refresh_tokens с expiresAt
  Note: эталонная реализация: ~/.claude/guides/auth.md — секция 10

[v] UC-MISSING-011: Stripe charge.dispute.created webhook handler
  Actor: SYSTEM (Stripe webhook)
  Priority: p1 | Category: auto (Collegium 2026-04-05)
  Описание: Текущий webhook обрабатывает только payment_intent.succeeded и account.updated.
  charge.dispute.created не обрабатывается — booking остаётся в неверном статусе при споре.
  Требования:
    - Backend: обработать charge.dispute.created → booking status = "disputed"
    - Admin: уведомление о споре (in-app + email)
    - Payment intent заморожен до разрешения спора
  Acceptance criteria:
    - AC-01: dispute.created → booking.status = "disputed" в БД
    - AC-02: Admin видит спор в admin panel

[v] UC-MISSING-012: Commission rate из PlatformSettings (не хардкод)
  Actor: SYSTEM
  Priority: p2 | Category: auto (Collegium 2026-04-05)
  Описание: payments.service.ts хардкодит 20% (const platformFee = amount * 0.20).
  PRODUCT.md говорит 15%. Admin PlatformSettings.commissionRate существует но игнорируется.
  Требования:
    - payments.service.ts читает commissionRate из PlatformSettings (через admin settings)
    - Default: 20% если настройка не задана
    - Маркетинговые материалы приведены в соответствие с фактическим %
  Acceptance criteria:
    - AC-01: commissionRate = 15 в PlatformSettings → Seeker платит 15% fee
    - AC-02: Earnings breakdown показывает актуальный % companion

[x] UC-MISSING-013: Admin disputes page (frontend)
  Actor: ADMIN
  Priority: p1 | Category: needs_approval → approved (user 2026-04-05)
  Описание: Backend admin.service.ts имеет полный CRUD для disputes. Frontend /admin/src/app/(dashboard)/ не имеет страницы disputes.
  Требования:
    - Next.js страница /admin/disputes с таблицей disputes
    - Фильтрация по статусу (open/resolved/refunded)
    - Детальная страница /admin/disputes/:id с историей и кнопками Resolve / Refund
  Acceptance criteria:
    - AC-01: Admin видит список всех disputes
    - AC-02: Admin может изменить статус dispute
    - AC-03: Dispute изменение логируется в audit_log

[v] UC-MISSING-014: Date history screen (Seeker + Companion)
  Actor: SEEKER / COMPANION
  Priority: p1 | Category: needs_approval → approved (user 2026-04-05)
  Описание: Нет экрана истории прошлых дат. UC-084b помечен [x] но экрана не существует. UC-047b аналогично для seeker.
  Страницы:
    - Seeker: /(tabs)/bookings/history → список завершённых bookings
    - Companion: /(tabs)/female/earnings/history → список завершённых дат с earnings
  Требования:
    - Список дат отсортирован по дате (новые сверху)
    - Каждая карточка: дата, партнёр, сумма (earned/paid), статус
    - Тап → детальная страница booking
  Acceptance criteria:
    - AC-01: Seeker видит историю прошлых дат
    - AC-02: Companion видит историю + earnings per date
    - AC-03: Пустое состояние если нет завершённых дат

[x] UC-MISSING-015: FilterModal age minimum 21 (legal compliance)
  Actor: SYSTEM / SEEKER
  Priority: p2 | Category: auto (Collegium 2026-04-05)
  Описание: FilterModal устанавливает ageRange minimum = 18, но платформа 21+ для США.
  Требования:
    - components/FilterModal.tsx: ageRange min = 21 (не 18)
    - Backend /companions endpoint: ageMin validation — отклонять < 21
  Acceptance criteria:
    - AC-01: FilterModal не позволяет установить age filter < 21
    - AC-02: Backend отклоняет запрос с ageMin < 21

[x] UC-LEGAL-001: Legal pages content
  Actor: GUEST / USER
  Priority: p2 | Trinity: #2075
  Страницы: /terms, /privacy, /safety
  Описание:
    - Terms of Service (USA paid dating platform, 21+, CCPA)
    - Privacy Policy (data collection, storage, sharing)
    - Safety Guidelines (tips для safe dating)
  **Гость видит:** полный контент без auth
  Acceptance criteria:
    - AC-01: Все три страницы доступны без авторизации
    - AC-02: Ссылки в footer лендинга и в registration flow
    - AC-03: Terms требуют acceptance при регистрации (checkbox)

# DFS TEST SCENARIOS

---

## path-001: Seeker Happy Path — Регистрация -> Верификация -> Browse -> Book -> Pay -> Complete -> Review
Source: DFS | Actor: SEEKER | Severity: critical

  1. NAVIGATE Welcome screen (welcome) -> кнопка "Get Started" видна
  2. NAVIGATE /login -> email input, "Send Code"
  3. ACTION POST /auth/start { email } -> OTP отправлен
  4. NAVIGATE /otp -> 6 полей кода
  5. ACTION POST /auth/verify { email, code } -> JWT получен
  6. NAVIGATE /role-select -> выбрать "I am a Seeker"
  7. ACTION POST /auth/register { name, role: "seeker" } -> email из JWT
  8. ACTION Пройти verification flow (upload-id, selfie, consent, submit)
     API: POST /verification/start, /verification/ssn, /verification/upload-id (field: file), /verification/selfie (field: file), /verification/consent, /verification/submit
  9. WAIT Admin approves -> user.isVerified=true
  10. NAVIGATE /browse -> GET /companions?page=1
  11. ACTION Tap companion -> GET /companions/:id
  12. ACTION POST /bookings { companionId, activity, dateTime, duration } -> booking.status=pending
  13. WAIT Companion confirms -> PUT /bookings/:id/confirm -> status=confirmed
  14. ACTION POST /payments/bookings/:bookingId/pay -> Stripe hold (capture_method=manual)
  15. ACTION PUT /bookings/:id/complete -> status=completed, Stripe capture triggered
  16. ACTION POST /reviews/bookings/:bookingId { rating: 5, comment: "Great!" }

---

## path-002: Companion Happy Path — Онбординг -> Dashboard -> Accept Request -> Complete -> Earnings
Source: DFS | Actor: COMPANION | Severity: critical

  1. Auth flow -> role select -> "I am a Companion"
  2. Onboarding: step1 (name/age/bio/hourlyRate) -> step2 (photos) -> verify (id+selfie, field: file) -> video (field: file) -> refs
  3. WAIT Admin approves
  4. NAVIGATE comp_dash -> requests tab
  5. ACTION PUT /bookings/:id/confirm -> emails отправлены обоим
  6. WAIT Date -> PUT /bookings/:id/complete -> capturePayment triggered (85/15 split)
  7. NAVIGATE comp_earnings -> GET /payments/earnings -> balance обновлен
  8. ACTION POST /payments/payouts/create { amount: X } -> payout через Stripe Connect

---

## path-003: Decline Flow — Companion отклонила запрос
Source: DFS | Actor: COMPANION | Severity: high

  1. PRE: Seeker создал booking (status=pending), оплата не была проведена
  2. Companion: PUT /bookings/:id/cancel { reason: "Schedule conflict" } -> status=cancelled
  3. VERIFY: GET /bookings?filter=all -> booking.status=cancelled
  4. If payment hold existed: cancelPaymentHold() triggered automatically
  5. [NOT_IMPLEMENTED] Seeker получает push notification -> seeker_declined screen

---

## path-004: Cancel Flow — Seeker отменяет подтвержденный booking
Source: DFS | Actor: SEEKER | Severity: high

  1. PRE: Booking confirmed + paid
  2. PUT /bookings/:id/cancel { reason: "Plans changed" } -> status=cancelled
  3. VERIFY: cancelPaymentHold triggered (BUG-682 fix) -> Stripe refund/cancel
  4. Companion: GET /bookings?filter=all -> booking.status=cancelled

---

## path-005: Active Date Flow [POST-MVP]
Source: DFS | Actor: SEEKER + COMPANION | Severity: critical

  UC-061..075 — весь active date flow не реализован (post-MVP).
  1. [POST-MVP] selfie_verify -> pre-date face match
  2. [POST-MVP] checkin -> geolocation verification
  3. [POST-MVP] active_date -> timer, extend/end/sos controls
  4. [POST-MVP] no_show -> 15 min timeout handler
  5. [POST-MVP] date_summary -> post-date review flow

---

## path-006..010 (messaging, settings, profile mgmt)
  Смотри предыдущую версию документа — не изменились.

---
---

# CROSS-PORTAL SCENARIOS (UPDATED)

---

## cross-001: Booking lifecycle (SEEKER <-> COMPANION)
Source: Cross-portal | Actors: SEEKER, COMPANION | Severity: critical

  Step 1 [SEEKER]:   POST /bookings -> booking.status=pending
  Step 2 [COMPANION]: GET /bookings/requests -> видит новый запрос
  Step 3 [COMPANION]: PUT /bookings/:id/confirm -> status=confirmed, emails отправлены
  Step 4 [SEEKER]:   GET /bookings?filter=upcoming -> booking.status=confirmed
  Step 5 [SEEKER]:   POST /payments/bookings/:bookingId/pay -> Stripe hold
  Step 6 [COMPANION]: PUT /bookings/:id/complete -> capturePayment (85/15)
  Step 7 [SEEKER]:   GET /bookings?filter=past -> booking.status=completed
  Step 8 [COMPANION]: GET /payments/earnings -> баланс обновлен

---

## cross-002: Cancel with refund (SEEKER <-> COMPANION)
Source: Cross-portal | Actors: SEEKER, COMPANION | Severity: high

  Step 1 [SEEKER]:  PUT /bookings/:id/cancel -> cancelPaymentHold triggered
  Step 2 [SYSTEM]:  Stripe: cancel intent (if not captured) OR refund (if captured)
  Step 3 [COMPANION]: GET /bookings?filter=all -> booking.status=cancelled
  Verify: Stripe dashboard — payment intent cancelled, no charge

---

## cross-003: Admin approves verification -> User gains access
Source: Cross-portal | Actors: SEEKER, ADMIN | Severity: critical

  Step 1 [SEEKER]:  Проходит verification flow, статус -> pending_review
  Step 2 [ADMIN]:   GET /admin/verifications?status=pending -> видит новую заявку
  Step 3 [ADMIN]:   PUT /admin/verifications/:id/approve -> user.isVerified=true
  Step 4 [SEEKER]:  GET /verification/status -> status=approved
  Step 5 [SEEKER]:  Redirect на browse -> может просматривать companions
  Step 6 [SEEKER]:  Может создавать bookings (guard проверяет isVerified)

---
---

# MULTI-ROLE SCENARIOS (NEW)

Эти сценарии тестируют полную цепочку событий, видимых через все три портала:
USER APP (Seeker/Companion) <-> ADMIN PANEL

---

## MRUL-001: Companion регистрируется -> Admin видит -> Admin апрувит -> Companion работает

Source: Multi-role | Actors: COMPANION, ADMIN | Severity: critical
Prerequisites: Admin аккаунт активен (isAdmin=true)

  Step 1 [COMPANION — App]:
    Регистрация через OTP
    POST /auth/start { email: "companion@test.com" }
    POST /auth/verify { email, code: "000000" } -> JWT
    POST /auth/register { name: "Anna", role: "companion", age: 25, hourlyRate: 50 }
    Expected: user создан с role=companion, isVerified=false, isActive=true

  Step 2 [ADMIN — Panel]:
    GET /admin/users?search=companion@test.com
    Expected: новый user виден в списке
    Verify: role=companion, isVerified=false, createdAt в последние 5 минут

  Step 3 [COMPANION — App]:
    Пройти onboarding: step1 -> step2 -> verify (upload-id, selfie) -> video -> refs -> pending
    POST /verification/start, /ssn, /upload-id, /selfie, /video, /references, /submit
    Expected: verification.status=pending_review

  Step 4 [ADMIN — Panel]:
    GET /admin/verifications?status=pending
    Expected: verification companion Anna видна в очереди
    Verify: idPhotoUrl, selfieUrl, videoUrl загружены корректно

  Step 5 [ADMIN — Panel]:
    PUT /admin/verifications/:id/approve
    Expected: verification.status=approved, user.isVerified=true

  Step 6 [COMPANION — App]:
    GET /verification/status -> status=approved
    Expected: redirect на comp_dash
    GET /payments/connect/status -> можно настроить Stripe Connect
    POST /calendar/block { dates: ["2026-03-25", "2026-03-26"] } -> даты заблокированы

  Step 7 [ADMIN — Panel]:
    GET /admin/users/:id -> companion профиль
    Expected: isVerified=true, последняя активность обновлена
    NOTE: GET /admin/users/:userId/bookings -> 404 (BUG-698 не исправлен)

  Cross-check:
    - Companion видна в GET /companions после верификации
    - hourlyRate отображается корректно
    - Заблокированные даты companion недоступны для бронирования

---

## MRUL-002: Seeker регистрируется -> Находит Companion -> Бронирует -> Admin видит booking

Source: Multi-role | Actors: SEEKER, COMPANION, ADMIN | Severity: critical
Prerequisites: Companion Anna уже верифицирована (из MRUL-001)

  Step 1 [SEEKER — App]:
    Регистрация через OTP (ДРУГОЙ аккаунт)
    POST /auth/start { email: "seeker@test.com" }
    POST /auth/verify { email, code: "000000" } -> JWT
    POST /auth/register { name: "Mike", role: "seeker", age: 30 }
    Expected: user создан с role=seeker, isVerified=false

  Step 2 [SEEKER — App]:
    Верификация seeker identity
    POST /verification/start, /ssn { ssnLast4: "1234" }, /upload-id (field: file), /selfie (field: file), /consent, /submit
    Expected: verification.status=pending_review

  Step 3 [ADMIN — Panel]:
    GET /admin/users -> оба пользователя (Anna + Mike) видны
    GET /admin/verifications?status=pending -> заявка Mike в очереди
    PUT /admin/verifications/:id/approve -> Mike.isVerified=true

  Step 4 [SEEKER — App]:
    GET /verification/status -> approved -> redirect на browse
    GET /companions?page=1 -> companion Anna видна в списке
    GET /companions/:annaId -> профиль Anna (bio, hourlyRate=50, rating)

  Step 5 [SEEKER — App]:
    POST /bookings {
      companionId: annaId,
      activity: "coffee",
      dateTime: "2026-03-20T18:00:00Z",
      duration: 2,
      location: "Central Park Cafe"
    }
    Expected: booking создан, status=pending, totalPrice=100 (50*2)

  Step 6 [COMPANION — App]:
    GET /bookings/requests?status=pending -> запрос от Mike виден
    Verify: seeker.name="Mike", activity="coffee", totalPrice=100

  Step 7 [ADMIN — Panel]:
    GET /admin/bookings -> booking виден в списке
    GET /admin/bookings/:id -> полные детали booking
    Verify: seeker=Mike, companion=Anna, status=pending, totalPrice=100

  Step 8 [COMPANION — App]:
    PUT /bookings/:id/confirm -> status=confirmed
    Expected: emails отправлены Mike и Anna

  Step 9 [ADMIN — Panel]:
    GET /admin/bookings/:id -> booking.status=confirmed
    GET /admin/stats -> totalBookings обновлен

  Cross-check:
    - Booking виден с обеих сторон (seeker + companion)
    - Admin видит корректные данные в реальном времени
    - totalPrice рассчитан правильно

---

## MRUL-003: Полный платежный цикл (Seeker pay -> Companion earns -> Admin видит revenue)

Source: Multi-role | Actors: SEEKER, COMPANION, ADMIN | Severity: critical
Prerequisites: Booking confirmed из MRUL-002

  Step 1 [SEEKER — App]:
    POST /payments/bookings/:bookingId/pay -> Stripe PaymentIntent created
    Expected: clientSecret возвращен, capture_method=manual
    Stripe: payment hold $100, NOT charged yet

  Step 2 [ADMIN — Panel]:
    GET /admin/bookings/:id -> booking.status=confirmed (или paid после webhook)
    NOTE: GET /admin/transactions -> 404 (BUG-700 не исправлен)
    NOTE: Stripe dashboard показывает payment intent в "uncaptured" состоянии

  Step 3 [COMPANION — App] или [SEEKER — App]:
    PUT /bookings/:id/complete -> status=completed
    Expected: capturePayment() вызван -> Stripe capture $100
    Expected: companion получает 85% = $85, platform 15% = $15

  Step 4 [COMPANION — App]:
    GET /payments/earnings -> totalEarnings обновлен (+$85)
    GET /payments/earnings/history -> новая запись за этот booking

  Step 5 [ADMIN — Panel]:
    GET /admin/stats -> revenue обновлен (+$15 platform fee)
    NOTE: GET /admin/revenue?period=week -> 404 (BUG-700)

  Step 6 [SEEKER — App]:
    POST /reviews/bookings/:bookingId { rating: 5, comment: "Amazing experience" }
    Expected: review создан, companion.rating обновлен

  Step 7 [ADMIN — Panel]:
    GET /admin/users/:annaId -> companion Anna, rating обновлен
    NOTE: GET /admin/reviews -> 404 (BUG-701)

  Cross-check:
    - Stripe: payment intent = succeeded
    - Companion earnings: +$85
    - Platform revenue: +$15
    - Review: виден в профиле companion

---

## MRUL-004: Admin banит пользователя -> Сессия аннулирована

Source: Multi-role | Actors: SEEKER, ADMIN | Severity: high
Prerequisites: Seeker Mike активен и авторизован

  Step 1 [ADMIN — Panel]:
    Текущее состояние: Mike.isActive=true, Mike авторизован в приложении

  Step 2 [ADMIN — Panel]:
    POST /admin/users/:mikeId/ban { reason: "Terms violation" }
    Expected: Mike.isActive=false
    NOTE: Endpoint отсутствует -> 404 (BUG-697 не исправлен)

  Step 3 [SEEKER — App] (после фикса BUG-697):
    Следующий API запрос -> должен вернуть 403 "Account suspended"
    Expected: автоматический logout + показ сообщения о бане
    NOTE: Текущая авторизация не проверяет isActive при каждом запросе (нужен guard)

  Step 4 [ADMIN — Panel]:
    GET /admin/users/:mikeId -> isActive=false
    POST /admin/users/:mikeId/unban -> isActive=true (если решили разбанить)

  Missing implementation:
    - Backend: POST /admin/users/:id/ban endpoint (BUG-697)
    - Backend: JwtAuthGuard должен проверять user.isActive при каждом запросе
    - Frontend app: обработка 403 "Account suspended" ответа

---

## MRUL-005: Companion устанавливает доступность -> Seeker видит через booking

Source: Multi-role | Actors: COMPANION, SEEKER | Severity: high
Prerequisites: Оба пользователя верифицированы

  Step 1 [COMPANION — App]:
    POST /calendar/block { dates: ["2026-03-22", "2026-03-23"], reason: "Personal" }
    Expected: даты заблокированы
    GET /calendar/blocked -> ["2026-03-22", "2026-03-23"] в списке

  Step 2 [SEEKER — App]:
    GET /companions/:annaId -> профиль companion
    При попытке забронировать 2026-03-22:
    POST /bookings { companionId: annaId, dateTime: "2026-03-22T18:00:00Z", ... }
    Expected: 409 Conflict "Companion is not available on these dates"
    NOTE: Проверяется ли blocked calendar при создании booking? Нужно верифицировать.

  Step 3 [SEEKER — App]:
    Выбирает незаблокированную дату: 2026-03-25
    POST /bookings { companionId: annaId, dateTime: "2026-03-25T18:00:00Z", duration: 2 }
    Expected: booking создан успешно

  Step 4 [COMPANION — App]:
    Попытка заблокировать 2026-03-25 (дата с активным booking):
    POST /calendar/block { dates: ["2026-03-25"] }
    Expected: 409 или блокировка отклонена — нельзя заблокировать дату с booking
    NOTE: Нужно проверить есть ли такая защита в CalendarController

  Cross-check:
    - Blocked dates отображаются серым в UI seeker
    - Conflict check работает на уровне backend (не только UI)
    - Admin видит availability companion в user detail (после исправления BUG-698)

---
---

# SECURITY SCENARIOS

---

## OTP Security
bf-001: Brute force -> 10 attempts/10min throttle (РЕАЛИЗОВАНО)
bf-002: OTP expiry -> 10 min TTL, после expired -> 401
bf-003: OTP reuse -> invalidated после успешной верификации + после failed attempt
bf-004: Send rate limit -> 20 emails/hour (РЕАЛИЗОВАНО)

## Auth Security
ab-001: Access booking без JWT -> 401 (РЕАЛИЗОВАНО — JwtAuthGuard)
ab-002: Access чужого booking -> 403 (РЕАЛИЗОВАНО — seekerId/companionId check)
ab-003: Companion confirm чужого booking -> 403 "Only companion can confirm" (РЕАЛИЗОВАНО)
ab-004: POST /auth/register без JWT -> 401 (ИСПРАВЛЕНО в BUG-685 — @UseGuards(JwtAuthGuard) добавлен)
ab-005: JWT manipulation -> 401 (РЕАЛИЗОВАНО — jwtService.verify)
ab-006: isActive=false user -> 403 (ИСПРАВЛЕНО — jwt.strategy.ts:24 проверяет isActive)

## Race Conditions
rc-001: Двойное создание booking -> overlap check -> 409 (ИСПРАВЛЕНО в BUG-683)
rc-002: Двойной confirm -> второй -> 400 "Cannot confirm a confirmed booking" (РЕАЛИЗОВАНО)
rc-003: Двойной payment -> нужно проверить PaymentsService идемпотентность

## Input Validation
iv-001: Negative duration -> 400 (РЕАЛИЗОВАНО)
iv-002: SQL injection в email -> regex + TypeORM parameterized (РЕАЛИЗОВАНО)
iv-003: XSS в notes/bio -> React auto-escapes при рендеринге
iv-004: Booking в прошлом -> 400 (РЕАЛИЗОВАНО)
iv-005: Self-booking -> 400 (РЕАЛИЗОВАНО)

## Payment Security
pay-001: Double capture -> второй complete -> 400 guard (РЕАЛИЗОВАНО)
pay-002: Negative payout amount -> нет валидации (BUG-684 открыт)
pay-003: Payment для чужого booking -> нужна проверка в PaymentsService

---
---

# UC vs CODE ANALYSIS SUMMARY

## MVP Scope Summary
- **Total UC:** 87
- **MVP scope:** 61 UC
- **Post-MVP descoped:** 26 UC
- **MVP implemented:** 45 [v] + 8 [~] = 53
- **MVP coverage:** 86.9% (53/61)
- **MVP remaining:** 8 UC to full MVP coverage

## Реализовано [v]: 45 UC
AUTH (5), SEEKER_VERIFY (8), COMPANION_ONBOARD (6), BROWSE (6), BOOKING (9 — includes UC-050, UC-051 with backend from PR #90),
COMPANION_MGMT (6), MESSAGING (4), SETTINGS (5), REVIEWS (2)

## Частично [~]: 2 UC + 6 Admin UC (MVP)
UC-032: FilterModal без advanced filters
UC-087: Stripe Connect API есть, экран отсутствует
ADMIN MVP: UC-ADMIN-001..006 с разной степенью реализации

## Post-MVP [POST-MVP]: 26 UC
ACTIVE_DATE: UC-061..075 (15)
UC-037, UC-086, UC-092, UC-094, UC-096..098, UC-116
UC-ADMIN-007, UC-ADMIN-008, UC-ADMIN-009

## Admin backend gaps (MVP — все созданы как bugs):
BUG-696: GET /auth/me
BUG-697: POST /admin/users/:id/ban, /unban
BUG-698: GET /admin/users/:userId/bookings
BUG-699: POST /admin/bookings/:id/cancel

## Admin backend gaps (Post-MVP):
BUG-700: GET /admin/transactions, /admin/revenue
BUG-701: GET/DELETE /admin/reviews
BUG-702: GET/PATCH /admin/settings

## Исправленные баги (PRs #78, #79, #80):
BUG-680: File upload field name mismatch (photo -> file) — FIXED
BUG-681: No capture_method: 'manual' на PaymentIntent — FIXED
BUG-682: No Stripe refund/cancel on booking cancellation — FIXED
BUG-683: Race condition — duplicate bookings same companion/time — FIXED
BUG-685: Account takeover via /auth/register without JWT — FIXED

## Открытые баги:
BUG-684: No payout amount validation (negative amounts) — OPEN
BUG-686: Favorites client-side only, no backend sync — OPEN

---

## SCREEN INVENTORY
*Создано автоматически /audit — DateRabbit*

| # | Route | File | UC Ref | Guest | Status |
|---|-------|------|--------|-------|--------|
| 1 | / | index.tsx | NONE | public | OK — splash redirect via NavigationGuard |
| 2 | /landing | landing/index.tsx | UC-L01, UC-L02, UC-L03, UC-L04 | public | OK |
| 3 | /onboarding | onboarding.tsx | UC-006, UC-007 | public | OK |
| 4 | /(auth)/welcome | (auth)/welcome.tsx | UC-001 | public | OK |
| 5 | /(auth)/login | (auth)/login.tsx | UC-001 | public | OK |
| 6 | /(auth)/otp | (auth)/otp.tsx | UC-002 | public | OK |
| 7 | /(auth)/register | (auth)/register.tsx | UC-003, UC-004 | public | OK |
| 8 | /(auth)/profile-setup | (auth)/profile-setup.tsx | UC-003, UC-004 | public | OK |
| 9 | /(auth)/role-select | (auth)/role-select.tsx | UC-003, UC-004 | public | OK |
| 10 | /(auth)/forgot-password | (auth)/forgot-password.tsx | NONE | public | ORPHAN — нет UC (OTP-модель не предполагает forgot-password) |
| 11 | /(seeker-verify)/intro | (seeker-verify)/intro.tsx | UC-011 | auth_required | OK |
| 12 | /(seeker-verify)/ssn | (seeker-verify)/ssn.tsx | UC-012 | auth_required | DEAD — UC-012 REMOVED |
| 13 | /(seeker-verify)/photo-id | (seeker-verify)/photo-id.tsx | UC-013 | auth_required | OK |
| 14 | /(seeker-verify)/selfie | (seeker-verify)/selfie.tsx | UC-014 | auth_required | OK |
| 15 | /(seeker-verify)/consent | (seeker-verify)/consent.tsx | UC-015, UC-016 | auth_required | OK |
| 16 | /(seeker-verify)/pending | (seeker-verify)/pending.tsx | UC-017 | auth_required | OK |
| 17 | /(seeker-verify)/approved | (seeker-verify)/approved.tsx | UC-018 | auth_required | OK |
| 18 | /(comp-onboard)/step1 | (comp-onboard)/step1.tsx | UC-021 | auth_required | DEAD — UC-021 REMOVED |
| 19 | /(comp-onboard)/step2 | (comp-onboard)/step2.tsx | UC-022 | auth_required | OK |
| 20 | /(comp-onboard)/verify | (comp-onboard)/verify.tsx | UC-023 | auth_required | OK |
| 21 | /(comp-onboard)/video | (comp-onboard)/video.tsx | UC-024 | auth_required | DEAD — UC-024 REMOVED |
| 22 | /(comp-onboard)/refs | (comp-onboard)/refs.tsx | UC-025 | auth_required | DEAD — UC-025 REMOVED |
| 23 | /(comp-onboard)/pending | (comp-onboard)/pending.tsx | UC-026 | auth_required | OK |
| 24 | /(tabs)/male/index | (tabs)/male/index.tsx | UC-047 | auth_required | OK |
| 25 | /(tabs)/male/browse | (tabs)/male/browse.tsx | UC-031 | auth_required | OK |
| 26 | /(tabs)/male/bookings | (tabs)/male/bookings.tsx | UC-047 | auth_required | OK |
| 27 | /(tabs)/male/messages | (tabs)/male/messages.tsx | UC-101 | auth_required | OK |
| 28 | /(tabs)/male/profile | (tabs)/male/profile.tsx | UC-111 | auth_required | OK |
| 29 | /(tabs)/female/index | (tabs)/female/index.tsx | UC-081 | auth_required | OK |
| 30 | /(tabs)/female/requests | (tabs)/female/requests.tsx | UC-043 | auth_required | OK |
| 31 | /(tabs)/female/calendar | (tabs)/female/calendar.tsx | UC-083 | auth_required | OK |
| 32 | /(tabs)/female/earnings | (tabs)/female/earnings.tsx | UC-084 | auth_required | OK |
| 33 | /(tabs)/female/earnings/history | (tabs)/female/earnings/history.tsx | UC-084b | auth_required | OK |
| 34 | /(tabs)/female/earnings/withdraw | (tabs)/female/earnings/withdraw.tsx | UC-085 | auth_required | OK |
| 35 | /(tabs)/female/profile | (tabs)/female/profile.tsx | UC-082 | auth_required | OK |
| 36 | /profile/[id] | profile/[id].tsx | UC-033 | public | OK |
| 37 | /booking/[id] | booking/[id].tsx | UC-041 | auth_required | OK |
| 38 | /booking/request-sent/[bookingId] | booking/request-sent/[bookingId].tsx | UC-050 | auth_required | OK |
| 39 | /booking/declined/[bookingId] | booking/declined/[bookingId].tsx | UC-051 | auth_required | OK |
| 40 | /payment/[bookingId] | payment/[bookingId].tsx | UC-042 | auth_required (verified) | OK |
| 41 | /chat/[id] | chat/[id].tsx | UC-102 | auth_required | OK |
| 42 | /reviews/[id] | reviews/[id].tsx | UC-036, UC-093 | auth_required | OK |
| 43 | /reviews/write/[bookingId] | reviews/write/[bookingId].tsx | UC-049, UC-091 | auth_required | OK |
| 44 | /favorites | favorites/index.tsx | UC-035 | auth_required | OK |
| 45 | /settings | settings/index.tsx | UC-111 | auth_required | OK |
| 46 | /settings/edit-profile | settings/edit-profile.tsx | UC-111 | auth_required | OK |
| 47 | /settings/notifications | settings/notifications.tsx | UC-112, UC-125 | auth_required | OK |
| 48 | /settings/delete-account | settings/delete-account.tsx | UC-113 | auth_required | OK |
| 49 | /settings/verification | settings/verification.tsx | UC-114 | auth_required | OK |
| 50 | /settings/payment-methods | settings/payment-methods.tsx | UC-116 | auth_required | POST-MVP |
| 51 | /settings/referral | settings/referral.tsx | UC-096..098 | auth_required | POST-MVP |
| 52 | /settings/my-packages | settings/my-packages.tsx | UC-086 | auth_required | POST-MVP |
| 53 | /stripe/connect | stripe/connect.tsx | UC-084c, UC-087 | auth_required (verified) | OK |
| 54 | /stripe/return | stripe/return.tsx | UC-084c | auth_required (verified) | OK |
| 55 | /stripe/refresh | stripe/refresh.tsx | UC-084c | auth_required (verified) | OK |
| 56 | /date/checkin/[bookingId] | date/checkin/[bookingId].tsx | UC-062 | auth_required | POST-MVP |
| 57 | /date/companion-checkin/[bookingId] | date/companion-checkin/[bookingId].tsx | UC-063 | auth_required | POST-MVP |
| 58 | /date/active/[bookingId] | date/active/[bookingId].tsx | UC-064 | auth_required | POST-MVP |
| 59 | /date/plan/[bookingId] | date/plan/[bookingId].tsx | UC-071 | auth_required | POST-MVP |
| 60 | /date/photos/[bookingId] | date/photos/[bookingId].tsx | UC-070 | auth_required | POST-MVP |
| 61 | /date/extend/[bookingId] | date/extend/[bookingId].tsx | UC-065 | auth_required | POST-MVP |
| 62 | /date/extend-response/[bookingId] | date/extend-response/[bookingId].tsx | UC-066 | auth_required | POST-MVP |
| 63 | /date/safety-checkin/[bookingId] | date/safety-checkin/[bookingId].tsx | UC-069 | auth_required | POST-MVP |
| 64 | /date/report/[bookingId] | date/report/[bookingId].tsx | UC-072 | auth_required | POST-MVP |
| 65 | /date/sos/[bookingId] | date/sos/[bookingId].tsx | UC-068 | auth_required | POST-MVP |
| 66 | /date/summary/[bookingId] | date/summary/[bookingId].tsx | UC-074 | auth_required | POST-MVP |
| 67 | /terms | terms.tsx | NONE | public | ORPHAN — нет UC |
| 68 | /privacy | privacy.tsx | NONE | public | ORPHAN — нет UC |
| 69 | /safety | safety.tsx | NONE | public | ORPHAN — нет UC |
| 70 | /(dev)/brand | (dev)/brand.tsx | NONE | public | ORPHAN — dev-only |

### Orphan screens (есть в коде, нет в UC или UC REMOVED)

**Файлы REMOVED UC (нужно удалить):**
- `(seeker-verify)/ssn.tsx` — UC-012 REMOVED
- `(comp-onboard)/step1.tsx` — UC-021 REMOVED
- `(comp-onboard)/video.tsx` — UC-024 REMOVED
- `(comp-onboard)/refs.tsx` — UC-025 REMOVED

**POST-MVP реализованы досрочно (оставить, но не навигировать):**
- `date/` group (UC-062..074): checkin, companion-checkin, active, plan, photos, extend, extend-response, safety-checkin, report, sos, summary
- `settings/payment-methods`, `settings/referral`, `settings/my-packages`

**Нет UC:**
- `(auth)/forgot-password` — концептуально не нужен при OTP-модели
- `/terms`, `/privacy`, `/safety` — юридические страницы, нужен UC
- `(dev)/brand` — dev-only, не нужен в продакшене

### Missing screens (UC есть, файла нет)

- **UC-019** `/(seeker-verify)/stripe-identity` — Stripe Identity для Seeker
- **UC-020** `/(seeker-verify)/fingerprint` — Fingerprint enrollment (IdentoGo/UPS)
- **UC-033b** `/settings/profile-visibility` — toggle видимости профиля companion
- **UC-047b** `/(tabs)/male/history` — история дат seeker
- **UC-084b** `/(tabs)/female/dates-history` — история дат companion
- **UC-084c** баннер Stripe Connect в earnings — stripe/connect есть, но нет триггера из earnings

### Статистика
- Всего экранов: 70
- Покрыто UC (MVP): 37 (53%)
- Покрыто UC (включая POST-MVP): 52 (74%)
- Dead/REMOVED: 4
- POST-MVP (реализованы досрочно): 14
- Orphan без UC: 5
- Missing (UC есть, экрана нет): 6

<!-- COLLEGIUM_DECISIONS
{
  "UC-020": { "decision": "post-MVP", "reason": "Fingerprint (IdentoGo) сложная интеграция — Stripe Identity достаточно для v1. Убрать из маркетинга на v1", "date": "2026-04-04", "by": "user" },
  "UC-033b": { "decision": "backlog", "reason": "Profile visibility через admin isActive достаточно для MVP", "date": "2026-04-04", "by": "user" },
  "UC-125": { "decision": "backlog", "reason": "Granular notification control post-MVP; все ON по умолчанию", "date": "2026-04-04", "by": "user" },
  "Q-companion-calendar-public-view": { "decision": "backlog", "reason": "Backlog MVP2. UC-083 calendar management уже есть", "date": "2026-04-04", "by": "user" },
  "UC-MISSING-001": { "decision": "approved", "reason": "Value prop promise — must implement", "date": "2026-04-04", "by": "user" },
  "UC-MISSING-002": { "decision": "approved", "reason": "Offline platform needs dispute resolution", "date": "2026-04-04", "by": "user" },
  "UC-MISSING-005": { "decision": "approved", "reason": "Safety/legal requirement for offline dates", "date": "2026-04-04", "by": "user" },
  "UC-MISSING-007": { "decision": "approved", "reason": "21+ is own TOS — must enforce", "date": "2026-04-04", "by": "user" },
  "UC-MISSING-008": { "decision": "approved", "reason": "Commission already in code, UC needed for documentation", "date": "2026-04-04", "by": "user" },
  "Q-smart-matching": { "decision": "post-MVP", "reason": "Guardian CUT: ML infrastructure not needed for MVP", "date": "2026-04-04", "by": "collegium" },
  "Q-video-verification": { "decision": "post-MVP", "reason": "Guardian CUT: Stripe Identity already has liveness detection", "date": "2026-04-04", "by": "collegium" },
  "Q-seeker-deposit": { "decision": "post-MVP", "reason": "Guardian CUT: friction kills early conversion", "date": "2026-04-04", "by": "collegium" },
  "Q-date-location-safety-zones": { "decision": "post-MVP", "reason": "Guardian CUT: requires geolocation partnerships", "date": "2026-04-04", "by": "collegium" },
  "UC-MISSING-010": { "decision": "approved", "reason": "Critical auth requirement — server restart must not log out users", "date": "2026-04-05", "by": "collegium" },
  "UC-MISSING-011": { "decision": "approved", "reason": "Compliance requirement for paid platform", "date": "2026-04-05", "by": "collegium" },
  "UC-MISSING-012": { "decision": "approved", "reason": "Commission rate inconsistency must be resolved before QA", "date": "2026-04-05", "by": "collegium" },
  "UC-MISSING-013": { "decision": "approved", "reason": "User confirmed: build admin disputes page before QA", "date": "2026-04-05", "by": "user" },
  "UC-MISSING-014": { "decision": "approved", "reason": "User confirmed: build date history screen before QA", "date": "2026-04-05", "by": "user" },
  "UC-MISSING-015": { "decision": "approved", "reason": "Legal compliance — 21+ platform cannot show age filter from 18", "date": "2026-04-05", "by": "collegium" },
  "Q-commission-canonical": { "decision": "configurable", "reason": "Commission % настраивается в admin (PlatformSettings). UC-041 и PRODUCT.md используют 20% как пример, не фикс. Stripe processing fee (2.9%+$0.30) показывается отдельной строкой в checkout.", "date": "2026-04-08", "by": "user" },
  "UC-W01": { "decision": "approved", "reason": "Feature exists in code (OnlineWatcher entity + endpoints), document and implement", "date": "2026-04-08", "by": "user" },
  "UC-019": { "decision": "qa-skip", "reason": "Stripe Identity blocked on prod Stripe account (#350). Skip for QA cycle, implement separately after #350 resolved.", "date": "2026-04-08", "by": "user" },
  "UC-023": { "decision": "qa-skip", "reason": "Stripe Identity blocked on prod Stripe account (#350). Skip for QA cycle, implement separately after #350 resolved.", "date": "2026-04-08", "by": "user" },
  "Q-selfie-verification-booking": { "decision": "post-MVP", "reason": "SelfieVerification during booking = part of UC-061 (pre-date selfie check), post-MVP active date flow. Leave code, mark as post-MVP orphan.", "date": "2026-04-08", "by": "user" },
  "Q-onlinewatcher-orphan": { "decision": "document", "reason": "OnlineWatcher code exists without UC. Document as UC-W01 and implement.", "date": "2026-04-08", "by": "user" },
  "UC-MISSING-016": { "decision": "approved", "reason": "Pending bookings hanging forever without expiration is UX/product bug. Implement cron. GitHub #353.", "date": "2026-04-08", "by": "collegium" }
}
-->
