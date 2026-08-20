# PsyCare 2.0 Implementation Plan — Making The Prototype Real

This plan turns the current PsyCare 2.0 codebase from a **UI-only prototype with mock data** into the **fully working, persisted, role-secured system** described by the SRS documents in this `docs/` directory.

It is based on a full read of:

- `docs/use-cases.md` and `docs/use-case-descriptions.md` (30 use cases, 8 modules)
- `docs/entity-data-dictionary.md` and `docs/entity-relationship-diagram.md` (32 domain models)
- `docs/postgresql-database-schema.md` (physical Supabase schema, already provisioned)
- `docs/page-navigation-design.md` (routes / IA)
- `docs/architecture-diagram.md` and `docs/SRS package diagram plantuml.md` (layered architecture, service boundaries)
- `docs/class-diagram-functions.md` and the SRS class diagrams (View/Controller/Model method contracts)
- `docs/ui-feature-capture-checklist.md` and `docs/real-ui-captures/` (already-built UI states, 31 screens captured)
- The project's actual PSM1 thesis (Chu Cheng Qing, *"PsyCare 2.0: Enhancing UTM Mental Health Services Through AI-Assisted Triage, Moderated Peer Support, and Data-Driven Monitoring"*) — the authoritative source for §5's technology choices (n8n, Google Gemini, Daily.co, `stichoza/google-translate-php`), which override any generic placeholder this plan guessed before it was read
- A direct audit of `app/`, `routes/web.php`, and `resources/js/` in this repo, plus direct `information_schema` queries against the live Supabase database (not just the schema docs) to confirm §5.1–5.3's claims

## 1. Where The Project Actually Stands Today

**Status as of 2026-08-20 — Foundations, Phase 1, and Phase 2 are done and verified; Phase 3 onward has not started.** Full day-by-day record: `LOG/`.

| Area | Spec says | Codebase actually has now |
| --- | --- | --- |
| Eloquent models | 32 domain models (`docs/entity-data-dictionary.md`) | **34** (all 32 + `CounsellingService` + `TermsAcceptance`) — `HasUuids`, enum casts, relationships. Done. |
| PHP enums | 20 Postgres enum types | **20**, under `app/Enums`, mirroring the live schema's enum values exactly (including the `appointment_status` quirk of having both `complete` and `completed`). Done. |
| Controllers | ~15 controllers across 8 modules | **8 real ones**: `Auth\AuthController`, `Admin\CounsellorController`, `Admin\ClientInformationController`, `MyAccountController`, `Admin\SlotController`, `AppointmentController`, `Admin\AppointmentController`, `Counsellor\AppointmentController`. Plus the original `ForumModerationController` (still keyword-based — Phase 8 replaces its internals with the n8n workflow, §5.1). The other ~7 don't exist yet. |
| Laravel migrations | Should reproduce `docs/postgresql-database-schema.md` | **Done** — 9 new migrations + a rewritten stock `users` migration reproduce all 38 tables. Validated clean against scratch SQLite, marked as already-applied on live Supabase (no data touched). |
| Routes | Role-secured, data-backed | **Auth + Identity + Appointment/Scheduling routes are real** (`/login`, `/logout`, `/admin/counsellor-ppsi`, `/admin/client-information`, `/psycare/perkhidmatan`, `/admin/slots`, `/counsellor/slots`, `/admin/appointments`, `/counsellor/appointments`, `/psycare/permohonan`, `/psycare/rekod-temujanji`). The remaining routes are still `Route::inertia(...)` with zero props, behind role middleware but serving mock data. |
| Authentication | Client/Admin/Counsellor roles, permission checks everywhere | **Done** — hand-built session auth (`password_hash`-based), `role:admin\|client\|counselor` middleware guarding all three portals, plus a dev-only one-click quick-login panel on `/login` (local/testing env only) for fast manual QA. 10 Pest tests covering login/quick-login/role-blocking/logout, all passing. |
| Identity module (UM01–UM03) | Counsellor onboarding, client profile management | **Done** — see Phase 1 below. Two real schema/UX gaps found and resolved with the user during the build (Client+Appointment combined creation; decorative fields left unbacked by schema) — see the Phase 1 entry for what actually shipped. |
| Terms Acceptance | Blocking first-use pop-up (`docs/architecture-diagram.md`) | **Not built**, despite being called out as foundational in §3.4 below. Only the `TermsAcceptance` Eloquent model exists (created in the Phase 0 model batch) — no controller, no route, no blocking-modal wiring on the client side. Real gap, flagged here rather than left implied-done. |
| Frontend data | Should come from Inertia props / form submissions | Identity pages (Phase 1) and Appointment/Scheduling pages (Phase 2 — `admin/slots.tsx`, `psycare/permohonan.tsx`, `psycare/rekod-temujanji.tsx`, the queue+review parts of `admin/appointments.tsx` and `counsellor/appointments.tsx`) are wired to real data. Everything else (Phases 3–10, plus the attendance/report/walk-in-create modals inside the appointment pages) is still `useState` mock arrays. |

This confirms exactly what `docs/architecture-diagram.md` itself says in its Notes section: *"Current frontend pages contain mock/local data behavior in several areas... should be implemented as the prototype moves from mock data to full backend persistence."* That sentence is still the whole scope of what's left (Phases 3–10).

## 2. Guiding Principles

1. **Don't throw away the frontend.** The React components already encode the correct UI states (validation errors, confirmation dialogs, empty states, success toasts) per `docs/ui-feature-capture-checklist.md`. The work is to replace their internal `useState` mock arrays with Inertia props and `router.post/put/delete` calls — not to redesign the screens.
2. **Auth and RBAC come first.** Every single use case precondition starts with "User is authenticated" and "User has permission to...". Nothing else can be honestly implemented until login + role middleware exist.
3. **Migrations before models.** Write real Laravel migrations that reproduce `docs/postgresql-database-schema.md` exactly (table names, enum types, FKs already match — this is transcription, not design work), then point them at the same Supabase database that already has the data structure. This makes the schema reproducible (`php artisan migrate:fresh`) instead of depending on a one-off PHP script.
4. **One module at a time, in dependency order.** Appointment scheduling depends on Identity; Attendance depends on Appointment; Chatbot risk flags feed Counsellor Caseload; Psychometric triage feeds the same Caseload. Build in the order in §4 so each phase only needs things already built.
5. **Match the use-case error states, not just the happy path.** Each UC has explicit Exception Flows (EF) with specific messages — `docs/use-case-descriptions.md` is effectively the acceptance-test spec for validation logic.
6. **Keep Supabase as the single source of truth.** `.env` already points at it (Session Pooler), and `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` already run through it — no separate local dev database.

## 3. Foundational Work — ✅ Done (2026-08-16), except §3.4

### 3.1 Laravel migrations for the full schema — ✅ Done

9 new grouped migrations + a rewritten stock `users` migration reproduce all 38 tables from `docs/postgresql-database-schema.md`, `uuid` PKs via the `HasUuids` trait (not DB-level `gen_random_uuid()` defaults, for portability to SQLite in tests), enum values matching the live schema exactly. Validated clean against a scratch SQLite DB, then marked as already-applied on live Supabase (bookkeeping only — the tables already existed there from the earlier raw-SQL provisioning; no data was touched or recreated).

### 3.2 Eloquent models — ✅ Done, 34 classes

All 32 entities from `docs/entity-data-dictionary.md`, plus `CounsellingService` and `TermsAcceptance` (both have real tables but aren't in that 32-entity list). Each has `HasUuids`, enum casts, and relationships matching the ERD's multiplicity table. **Not done**: the specific SRS query-method names from `docs/class-diagram-functions.md` (`findByCriteria`, `checkDuplicateIdentifiers`, `getClientSummaries`, etc.) weren't implemented as named scopes — Phase 1's controllers used plain Eloquent queries instead. Revisit only if a future phase's controller genuinely needs that exact method shape; don't retrofit it speculatively.

### 3.3 Authentication & role-based access control — ✅ Done, hand-built

- `Auth\AuthController` — login against `users.password_hash` (via `User::getAuthPassword()` override), logout, **plus a dev-only quick-login panel** (one click into a seeded demo account per role, gated to `local`/`testing` env) that wasn't in the original plan but was added at the user's request for fast manual QA.
- `resources/js/pages/auth/login.tsx`.
- `role:admin|client|counselor` middleware guarding the `admin/*`, `psycare/*`, `counsellor/*` route groups.
- `HandleInertiaRequests` shares `auth.user` (already scaffolded before this session; just needed real data flowing into it) and `flash.success`/`flash.error` for controller-driven toasts.
- Hand-built, not Fortify — confirmed the right call in practice, no auth package was needed.

One real bug found and fixed during this build, worth remembering for any future form using `useForm().setData()` immediately followed by `.post()`: React batches the state update, so the `post()` fires with the *previous* render's data, not the just-set value. The quick-login buttons hit exactly this (clicking "Admin" logged in as whatever the *previous* click had queued). Fix: pass the value directly into `router.post(url, { field: value })` instead of going through `setData` + a separate `post()` call.

### 3.4 Terms Acceptance (blocking pop-up) — ❌ Not done

Called out as foundational here, but never actually built. Only the `TermsAcceptance` Eloquent model exists (from the §3.2 batch) — no `TermsAcceptanceController`, no route, no blocking-modal logic gating first client login. This is a real gap between what this plan said was necessary and what shipped. Since every client-side page currently renders without any consent check, this should be picked up early in Phase 3 (Declaration) rather than left for Phase 10 — it's a similar shape of work (a status check + blocking UI) and the two are easy to build together.

### 3.5 Seeders — ✅ Done, smaller than planned

`DatabaseSeeder` creates: 2 `counselling_locations` (JB/KL, matching the existing mock UI's location names), 1 admin, 2 counsellors, 3 clients (not the originally-planned 5-10 — kept small since Phase 1 only needed enough to prove the UI works, not realistic volume), 4 forum categories. **Not seeded yet**: any psychometric test (deferred along with the rest of Phase 6 — see §5's PDF→test generation decision).

## 4. Module Build Order

Each phase lists: the use cases it satisfies, the backend pieces to add, the frontend rewiring needed, and how to verify it against the existing screenshots/checklist.

### Phase 1 — Identity & User Management (UM01–UM03) — ✅ Done (2026-08-16)

- **Backend:** built as `Admin\CounsellorController` + `Admin\ClientInformationController` + `MyAccountController` (not the `ClientProfileController`/`UserProfileController` names originally planned — the actual split follows the admin-page structure rather than the SRS class-diagram names 1:1). Duplicate-identifier checks (worker no/PPsi no/email for counsellors; matric no/worker no for clients) implemented as `Rule::unique` in `StoreCounsellorRequest`/`Store`+`UpdateClientRequest`, matching EF2 of UM01/UM03.
- **Two real schema/UX gaps found and resolved with the user during the build** (not knowable from the docs alone, worth remembering for later phases that touch the same pages):
  1. Admin's "Client Information" form actually collects `Appointment` fields (reference no, counsellor, appointment need), not just `Client` fields — matches UM03's use case text verbatim, not a UI bug. Resolved: `ClientInformationController@store` creates a `Client` row **and** a paired `Appointment` row (status always `pending`, `appointment_type: new`) in one transaction.
  2. Several profile-tab fields (guardian info, CPA, health Q&A, marriage rows) have zero columns anywhere in the schema. Resolved: only fields that exist on `clients` were wired to real data (full name, national ID, client type, email, phone, address, faculty, program, matric/student/worker no, marital status); the rest stay static/decorative — no schema was invented to back them.
  3. `applicationType` (walk-in/appointment/referral) and the admin's active/inactive "status" selector remain in the UI but **aren't persisted** — no matching schema slot. New appointments always start `pending`, which is correct (Phase 2 owns real status transitions from there).
- **Frontend:** `admin/counsellor-ppsi.tsx`, `admin/client-information.tsx`'s list/form/"maklumat-peribadi" detail tab (the other tabs — session/screening/attachment/confirmation — deliberately left on mock content, they belong to Phases 2/3/6), `ClientProfileForm.tsx`'s personal/study tabs.
- **Verified:** 21 Pest tests (create/update/delete/validation/duplicate-rejection/role-blocking, asserting real DB state) — all passing. Then driven live through an actual browser against Supabase (not just the test DB), confirmed via direct SQL query that a real counsellor+login and a real client+appointment were created correctly; test data cleaned up afterward. Matches `docs/real-ui-captures/14-admin-counsellor-ppsi.png`, `16-admin-client-information.png`.

### Phase 2 — Appointment & Scheduling (AS01–AS07) — ✅ Done (2026-08-20)

- **Backend (shipped):** AS04/AS05/AS06 slot management is **two separate controllers sharing one service**, not one controller branching on role — `Admin\SlotController` (manages every counsellor's slots) and `Counsellor\SlotController` (manages only the logged-in counsellor's own; new slots force-assigned to them, deleting anyone else's slot rejected server-side, no linked `Counsellor` record → 403), both delegating persistence/overlap-checking to `App\Services\SlotScheduleService` so the AS04 AF5 `Save Slot Changes` behaviour and the EF2 overlap rule can't drift between the two roles. `AppointmentController` for `AS01`/`AS02`/`AS03` client booking (capacity check, session-type-vs-slot check, follow-up eligibility check per AS02 EF2, reference number auto-generated via `App\Support\AppointmentReferenceNumber` — `{LOC}/{YEAR}/{seq}` per AS03 1.2); `Admin\AppointmentController` + `Counsellor\AppointmentController` for the two-stage `AS07` verify flow (`pending → needs_review/counsellor_reviewing → approved`, EF3 "Admin must act before Counsellor can" enforced server-side).
- **Cross-cutting service:** `App\Services\MeetingLinkService` — created, but **stubbed**: no Daily.co API key is provisioned yet (§5.2), so online bookings get a deterministic placeholder URL on `appointments.meeting_link`. The real Daily.co room-creation call is a TODO inside this one class (same return contract), to be wired when the key exists — required before Phase 4's `TA04` webhook auto-attendance. `config/services.php` now has the `daily_co.api_key` slot reading `DAILY_CO_API_KEY`.
- **Frontend (rewired to real data):** `admin/slots.tsx` and `counsellor/slots.tsx` — two genuinely separate pages (user decision, 2026-08-20: "Dont wire them into same page"), not one shared component branching on role. Admin's page has a counsellor picker on every action plus a "view calendar for" filter across all counsellors; the counsellor's page has no counsellor picker anywhere since there's nothing to pick — both render the same calendar-first layout independently. `psycare/permohonan.tsx` (fully rewritten — real slots/calendar, real client info header, real submit; the old localStorage slot-sync and mock seeds are gone), `psycare/rekod-temujanji.tsx` (real records + follow-up entry point by appointment id), `admin/appointments.tsx` and `counsellor/appointments.tsx` (queue list + AS07 review actions wired to the backend; **deliberately still mock**: the attendance modals (Phase 4), the walk-in/group "Create Appointment" modal (not in any AS use case), counsellor Open/Complete/Follow-up/Close status transitions (post-approval lifecycle, Phase 4's scope), and the Report modal).
- **Not persisted (schema has no slot for them, consistent with Phase 1's decision):** the booking form's attachment *file* upload (only `attachment_description` saves — `appointment_attachments` wiring belongs with Supabase Storage setup), `session_mode` group bookings.
- **Redesigned since first shipping (2026-08-20, user feedback: "overwhelming"):** both slot pages rebuilt around a month calendar (day cells badge their slot count, saved vs. unsaved color-coded) with a tabbed tool panel (Add/Bulk/CSV) instead of three stacked forms — same backend contract, purely a layout change. Also removed the legacy **Counsellor Timetable** page (`admin/counsellor-timetable.tsx`) — a pre-Phase-2 mock duplicate of Slot Manager (its own counsellor picker, saved to `localStorage`, never wired to the database). `/admin/counsellor-timetable` now redirects to `/admin/slots`; the admin sidebar's "Counsellor Timetable" link was replaced with "Slot Manager" (the admin nav had never actually linked to the real page — an oversight from the first Phase 2 pass).
- **Templates:** `template/` at the repo root holds the AS06 CSV import files — `slot-import-template.csv` (blank), `slot-import-example.csv` (filled with the seeded demo counsellors), and a README documenting the column rules and draft-vs-saved behaviour.
- **Fixed since first shipping (2026-08-20, user report: saving many slots hit PHP's "Maximum execution time of 30 seconds exceeded"):** `SlotScheduleService` batches everything into a handful of queries instead of one-row-at-a-time — bulk `insert()` for slots and their session-type rows instead of an `Eloquent::create()` loop, `withCount('appointments')` instead of a per-slot booked-count query, and one `whereBetween`-style overlap-check query instead of one per counsellor/date pair. The bigger fix was in validation, not persistence: Laravel's `exists:table,column` rule on a `field.*.x` wildcard runs **one query per array item**, not batched — 360 slots meant 720 silent existence-check queries before a single row was even saved, which is what was actually timing out. Replaced with format-only `uuid` validation plus two bulk `whereIn` existence checks inside the service. A Pest test asserts a 360-slot save stays under 20 total queries (was 720+) and completes in a fraction of a second.
- **Verified:** 27 Pest tests (slot save/overlap-rejection/delete/nonexistent-reference-rejection, counsellor-vs-admin slot scoping across both real pages, large-batch query-count regression, booking happy-path + EF2 capacity + AS02 follow-up eligibility both ways, AS07 both stages + EF3 rejection, role blocking, page-render prop-shape smoke tests) — all passing, full suite 48/48. Then the whole lifecycle driven live in a real browser against Supabase: admin published a slot → client booked it (`PUS/2026/00001`, real counsellor name shown) → admin moved it to counsellor review → counsellor approved → client's records page showed `Approved`. Test data cleaned out of Supabase afterward.
- **Lesson (dev-only):** `php artisan serve`'s multi-worker mode raced Playwright's XHR login redirects intermittently — `PHP_CLI_SERVER_WORKERS=1` plus logging in via direct POST (not the quick-login button) made browser tests deterministic. Also: `/login/quick` is guest-middleware-gated, so switching roles in a test requires an explicit logout first.

### Phase 3 — Declaration (DC01–DC03) — 🔜 Next, not started

- **Backend:** `DeclarationController`; ties into both the client profile Confirmation/Pengesahan tab and the appointment submission flow (a declaration can be linked to an appointment or standalone per the ERD).
- **Also pick up here: Terms Acceptance (§3.4's gap).** Same shape of work (a status check gating access + a blocking modal until the client acts), and it was supposed to ship with Foundations but didn't. Build `TermsAcceptanceController` + the client-side blocking pop-up alongside Declaration rather than deferring it again to Phase 10.
- **Frontend:** Confirmation tab inside `ClientProfileForm.tsx`, plus admin/counsellor verification UI inside `admin/client-information.tsx`.
- **Verify against:** `docs/real-ui-captures/01-client-terms-acceptance.png` (Terms Acceptance), `04-client-services-declaration.png` (Declaration).

### Phase 4 — Telemedicine & Attendance (TA01–TA04) — ⏳ Not started

- **Backend:** `TelemedicineController` (join validation), `AttendanceController` (manual + physical QR), `OnlineAttendanceController` (auto-log on join).
- **Service:** `QRCodeService` — generate a signed/expiring token (e.g. `encrypt()` a payload of `{attendance_session_id, expires_at}`), render it as an image (a small composer package such as `simplesoftwareio/simple-qrcode` or `bacon/bacon-qr-code`), and validate it on scan against `attendance_sessions.qr_token_hash`/`qr_expires_at`.
- **Frontend:** Attendance modals already exist inside `admin/appointments.tsx` and `counsellor/appointments.tsx`; add a standalone QR-scan confirmation page (`/psycare/attendance/{token}` — not yet in `routes/web.php`).
- **Verify against:** `docs/real-ui-captures/19,28*.png`.

### Phase 5 — Chatbot & Tracking (CT01–CT04) — ⏳ Not started

- **Backend:** `EmotionLogController` (score 0-10, one-per-date upsert, future-date rejection per EF2), `ChatbotController`, `RiskFlagController`.
- **Service — AI Counsellor Chatbot (n8n workflow 1 of 4):** per the thesis (§1.5.2, §2.4.7, §2.6.3), Laravel sends the client's message + recent emotion logs to an **n8n webhook**; n8n calls the **Google Gemini API**, which returns structured JSON (`risk_level`, `reason`, a generated reply); Laravel parses that back and updates `risk_flags`/`chat_messages`.
- **Service — Daily Emotion Tracker AI response (n8n workflow 2 of 4):** per the thesis (§2.4.8, §2.6.3), after `EmotionLogController` saves the day's score, Laravel passes it to the same n8n instance, which calls Gemini for "a brief encouraging message" shown back to the client — a separate, smaller n8n workflow from the chatbot one (different prompt, no risk-flag output), not a reuse of the chatbot flow.
- **Infrastructure this introduces:** n8n is a required deployment dependency, not optional — it sits between Laravel and Gemini for all four confirmed AI workflows (chatbot, emotion tracker here; forum moderation in Phase 8; psychometric summary in Phase 6). It needs to run somewhere reachable by Laravel's webhook calls, which affects Phase 0-era environment planning more than just this phase — provision it before Phase 5 starts, not during.
- **Frontend:** `FloatingChatbot.tsx` (475 lines), `SmartJournal.tsx`, `Dashboard.tsx` emotion tracker widget, `counsellor/caseload.tsx` (338 lines) + `counsellor/tasks.tsx` (290 lines) for CT04.
- **Verify against:** `docs/real-ui-captures/02,03,29,30*.png`.

### Phase 6 — Psychometric Self-Assessment (SA01–SA03) — ⏳ Not started, partially blocked

- **Backend:** `PsychometricController` — test taking/scoring (`total_score`, `score_percent`). Per the thesis (§2.4.2, §2.6.6), **`risk_level` is rule-based, not AI** — "the Laravel system compares the score to the hard-coded rules" and categorizes low/moderate/high off fixed thresholds. Don't spend an LLM call on this part; it's deterministic, matching the two named instruments (DASS-21, IPS) which already have standard cutoff scores.
- **Service — AI Result Summary/Recommendation (n8n workflow 3 of 4):** `psychometric_submissions.ai_summary_ms/en` and `ai_recommendation_ms/en` are a *separate* step from the rule-based `risk_level` above. Not explicitly detailed in the thesis narrative (§2.4.2/§2.6.6 only describe the rule-based part) — **confirmed by the user as an intentional 4th n8n workflow**, added on top of what the thesis wrote: after scoring, Laravel sends `total_score`/`score_percent`/`risk_level` to n8n, which calls Gemini for bilingual explanatory summary + recommendation text, keyed off the already-decided risk level (Gemini explains the result, it doesn't decide the risk level).
- **PDF Test Generation — deferred, out of scope for now (user decision, 2026-08-16):** SA03's "admin uploads a PDF, system auto-generates a new test" flow will **not** be built in this phase. DASS-21 and IPS are the only two instruments the thesis's actual scope needs (§1.5.3, §2.3.3, §2.4.2), both already exist in the current legacy PsyCare system with official/standard scoring rules, and AI-parsing clinical instrument content carries real risk (a mis-parsed item or option silently corrupts a risk classification) for no benefit here — seed them directly instead. **Open question still blocking Phase 6 start:** does the user have the real DASS-21/IPS question and scoring content to hand (from the current system or the official instruments), or should this plan source the standard published DASS-21 items itself? If SA03's PDF-upload capability is ever wanted later, it should be an assist-then-review flow (Gemini drafts into a `draft`-visibility test, admin must review and explicitly publish — never auto-publish AI-extracted clinical content), not a same-request auto-generate-and-publish.
- **Frontend:** `psycare/ujian-psikometrik.tsx` (480 lines), `admin/materials.tsx`, `counsellor/assessments.tsx` (221 lines).
- **Verify against:** `docs/real-ui-captures/09,22,31*.png`.

### Phase 7 — Educational Resource Library (ER01–ER02) — ⏳ Not started

- **Backend:** `ResourceLibraryController`, URL validation (EF2), access-log write on open.
- **Service — Bilingual Auto-Translation:** per the thesis (§2.6.7), admin enters a resource title/description in one language and the system auto-fills the other via **`stichoza/google-translate-php`** (a Composer package wrapping Google Translate's public endpoint — no API key needed, but it is an external network dependency this plan had missed entirely). Also drives the resource-recommendation logic keyed off recent emotion logs (§2.4.5).
- **Frontend:** `admin/learning-materials.tsx`, `psycare/resource-library.tsx`.
- **Verify against:** `docs/real-ui-captures/10,23*.png`.

### Phase 8 — Peer Support Forum (PS01–PS02) — ⏳ Not started

- **Backend:** `ForumController` (create post, publish/queue based on the safety score below) and `ForumModerationEvent` audit logging for approve/hide/restore/delete actions.
- **Service — AI Safety Scoring (n8n workflow 4 of 4):** per the thesis (§2.4.6, §2.6.3), post content is routed through the same n8n instance as the other three workflows to a Gemini-backed moderation node, which returns a numeric safety score. This **replaces** `ForumModerationController`'s current keyword-matching body (bilingual MS/EN keyword list, penalty scoring) — that logic was a working placeholder built before this n8n decision was confirmed, not the final design. Keep its request/response JSON shape (`safe`, `safetyScore`, `message`, `reason`, `matchedKeywords`) so the frontend doesn't need to change, just swap what populates it. `ForumModerationEvent` still needs to persist the outcome, which the current controller doesn't do at all.
- **Frontend:** `PeerSupportForum.tsx` (already calls the real endpoint — extend it to also submit the post itself, not just get a score), `admin/forum.tsx` (513 lines).
- **Verify against:** `docs/real-ui-captures/11,24*.png`.

### Phase 9 — Notifications — ⏳ Not started

- **Backend:** `NotificationService` + Laravel `Mailable`s wired into the appointment/declaration status-change points identified in AS07 and DC03. `MAIL_MAILER=log` in `.env` is fine for dev — emails land in the log instead of actually sending.
- **External dependency for publishing:** dev-only `log` mail never actually reaches anyone. Once this app is published, it needs a real transactional email provider — its own account and API key/SMTP credentials (e.g. AWS SES, Mailgun, Postmark, Resend) — configured in production `.env`. Not needed to build Phase 9 itself, but flagging now since it's an external dependency this plan hadn't named anywhere else.

### Phase 10 — Hardening — ⏳ Not started

- Form Request validation classes matching every EF in the use cases (this repo has zero `app/Http/Requests` currently).
- Policies (`ClientPolicy`, `AppointmentPolicy`, etc.) for the "unauthorized access" exception flows (EF3-style "access denied" states already exist as UI, need real enforcement).
- Pest feature tests per module (`pestphp/pest` and `pestphp/pest-plugin-laravel` are already in `composer.json` dev deps, unused so far — `tests/` should be checked for existing coverage).
- Re-run the UI capture script (`docs/qa/` shows this already exists) after each phase to confirm the real, data-backed screens still match the captured mock states.

## 5. Cross-Cutting Decisions Needed Before Building

Confirmed against `Thesis.pdf` (Chu Cheng Qing, PSM1 report — this project's actual thesis, §2.6, §3.5, Table 2.5). The thesis names real, specific technology choices for nearly everything below; this table now reflects those, not placeholder guesses.

| Decision | Thesis's Choice | Notes |
| --- | --- | --- |
| Auth scaffolding | Laravel Sanctum/Passport (thesis §2.6.8) or plain session auth | What's already built (hand-rolled session auth) is functionally equivalent for an Inertia monolith — Sanctum's *stateful* SPA mode is the same session-cookie mechanism, just packaged. No change needed unless a separate token-based API surface is added later. |
| AI orchestration | **n8n**, confirmed for all 4 AI workflows below (user decision, 2026-08-16 — not just the 1 the thesis narrative details end-to-end) | Not a per-feature decision anymore — n8n is standing infrastructure, provision it once, reuse it for all four. |
| PDF→test generation | **Deferred, not building it** (user decision, 2026-08-16) | DASS-21 + IPS are the only instruments actually needed and both already exist in the legacy system — seed them directly instead of AI-parsing a PDF. SA03's upload flow stays unbuilt unless requested later, and would be assist-then-review (never auto-publish) if it is. |
| Psychometric risk classification | **Rule-based, hard-coded thresholds** — not AI (thesis §2.4.2, §2.6.6) | The `risk_level` decision itself is deterministic; only the explanatory `ai_summary`/`ai_recommendation` text (workflow 3 below) is Gemini-generated. |
| Online meeting links | **Daily.co WebRTC API** (thesis §2.6.4) | Not Jitsi — Daily.co's webhook system is what makes `TA04` auto-attendance possible; a plain Jitsi link has no equivalent hook. |
| Bilingual translation | **`stichoza/google-translate-php`** (thesis §2.6.7) | Missed entirely in the first pass of this plan. Wraps Google Translate's public endpoint — no API key, but a real external network dependency. |
| File storage | Supabase Storage (bucket `psycare` already named in `.env`) | Consistent with the thesis's Supabase-centric architecture. |
| Production email | Real transactional provider (SES/Mailgun/Postmark/Resend/SMTP) | Not named in the thesis at all — still genuinely open, and still not needed until actually publishing. |

## 5.1 The 4 Confirmed n8n → Gemini Workflows

Every AI-assisted feature in this app goes through the same shape: **Laravel → n8n webhook → Gemini API → structured JSON back → Laravel persists it.** One n8n instance, four separate workflows (four separate webhook endpoints/node graphs) inside it — not four different pieces of infrastructure.

| # | Workflow | Phase | Trigger | Sent to Gemini | Gemini returns | Laravel writes to |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | AI Counsellor Chatbot | Phase 5 (CT02) | Client sends a chat message | Message text + recent `emotion_logs` | `risk_level`, `reason`, generated reply | `chat_messages`, `risk_flags` (if flagged) |
| 2 | Daily Emotion Tracker response | Phase 5 (CT01) | Client saves today's emotion score | The score (+ optional note) | A short empathetic/encouraging message | Shown to client; not persisted as its own record (per thesis §2.4.8) |
| 3 | Psychometric AI Summary/Recommendation | Phase 6 (SA01) | Client submits a completed test | `total_score`, `score_percent`, the already-computed `risk_level` (rule-based, not sent *to* decide — sent *for* explaining) | Bilingual summary + recommendation text | `psychometric_submissions.ai_summary_ms/en`, `ai_recommendation_ms/en` |
| 4 | Forum Post Safety Scoring | Phase 8 (PS01/PS02) | Client submits a forum post | Post title + content | Numeric safety score (+ reason) | `forum_posts.safety_score`/`status`, replaces `ForumModerationController`'s current keyword logic |

Workflow 4 is the only one with a working (if provisional) implementation today — `ForumModerationController`'s keyword-matching stands in for it until it's rebuilt on n8n in Phase 8. The other three don't exist yet in any form.

## 5.2 External Services & API Keys — Consolidated

| Service | Needed for | Account/API key required? | Status |
| --- | --- | --- | --- |
| **n8n** (self-hosted or cloud) | Hosts all 4 workflows above | No API key itself, but needs an instance deployed and reachable from Laravel's webhook calls | **Required infrastructure — provision before Phase 5**, not during it |
| **Google Gemini API** | What every n8n workflow above calls | Yes — Google AI Studio/Cloud API key | Resolved choice |
| **Daily.co WebRTC** | Online session meeting rooms (Phase 2) + webhook-driven auto-attendance (Phase 4, `TA04`) | Yes — Daily.co account + API key | **Stubbed** — `MeetingLinkService` ships placeholder links until `DAILY_CO_API_KEY` is set (`config/services.php` slot ready). Provision before Phase 4. |
| QR code generation | Physical attendance (Phase 4) | No — `react-qr-code` (frontend) + a signed/encrypted token from Laravel generate it locally | Resolved, self-hosted |
| `stichoza/google-translate-php` | Bilingual MS/EN auto-translation for the resource library (Phase 7) | No API key, but calls Google Translate's public endpoint over the network | Resolved |
| Supabase Storage | Appointment attachments, resource library, psychometric PDFs (Phases 2, 6, 7) | Already have one — bucket `psycare` named in `.env`, filesystem disk wiring not yet built | Decision made, wiring pending |
| Transactional email provider | Real email delivery (Phase 9, only for publishing) | Yes, once published — SES/Mailgun/Postmark/Resend/SMTP | Not needed for dev; needed before go-live |

**PDF→psychometric-test generation (SA03) is deferred, not building it now** — see Phase 6 above. Sourcing the real DASS-21/IPS content to seed is **on hold, not urgent** (user decision, 2026-08-16) — revisit when Phase 6 actually starts, not before.

### 5.3 DB Tally Check (2026-08-16)

Verified §5.1's four workflows and the rest of this section's claims directly against live Supabase — `information_schema.columns` queried for every table this plan references for AI/external-service wiring, not just cross-checked against the docs. Everything tallies, no DB changes needed:

- `psychometric_submissions.ai_summary_ms/en`, `ai_recommendation_ms/en` — exist, confirmed as workflow 3's write target.
- `psychometric_tests.source_pdf_file_name` — exists, confirmed unused for now (deferred feature above); left as-is since it's a harmless nullable column, not worth a migration to remove.
- `emotion_logs` — confirmed **no column** holds workflow 2's AI-generated encouraging message; this matches the plan's "shown to client, not persisted" claim rather than contradicting it. `mood_label` exists but is unassigned a purpose anywhere in this plan yet — if a short AI-derived tag (not the full message) is ever wanted, that's the column for it.
- `chat_messages.sender_role` — supports `'bot'` per the schema's CHECK constraint, confirming workflow 1's replies persist as normal rows, not a separate table.
- `appointments.meeting_link`, `attendance_sessions.qr_token_hash`/`qr_generated_*`/`qr_expires_at` — exist, match Phase 2/4's Daily.co and QR plans.
- `forum_posts.safety_score`, `moderation_reason` — exist, match workflow 4's write target.
- `resource_library_items.title_ms/en`, `description_ms/en` — exist, match Phase 7's translation plan.

No table needs a migration change for anything decided in this session.

## 6. Suggested Sequencing Summary

```text
[DONE] Foundations (migrations, models, auth/RBAC, seeders)          — except Terms Acceptance, moved to Phase 3
[DONE] Phase 1  Identity & User Management
[DONE] Phase 2  Appointment & Scheduling    (Daily.co still stubbed — provision key before Phase 4)
  -> Phase 3  Declaration + Terms Acceptance (needs Identity + Appointment)  [NEXT]
  -> Phase 4  Telemedicine & Attendance      (needs Appointment)      — needs n8n/Gemini + Daily.co provisioned
  -> Phase 5  Chatbot & Tracking             (needs Identity; feeds Caseload) — needs n8n/Gemini provisioned
  -> Phase 6  Psychometric Self-Assessment   (needs Identity; feeds Caseload/Triage) — needs n8n/Gemini; PDF-upload sub-flow deferred
  -> Phase 7  Resource Library               (independent, can run in parallel with 4-6) — needs Google Translate reachability
  -> Phase 8  Peer Support Forum             (rebuilds the existing moderation endpoint on n8n/Gemini)
  -> Phase 9  Notifications                  (cross-cuts 2 and 3)
  -> Phase 10 Hardening (validation, policies, tests, QA re-capture)
```

Phases 4, 6, and 7 have no dependency on each other and can be built in parallel if more than one person/session is working on this. Phases 1 and 2 are done — Phase 3 (Declaration + Terms Acceptance) is the next unblocked phase. Before Phase 4 or 5 start (whichever comes first): provision n8n + a Google Gemini API key (both need it) **and** a Daily.co API key (Phase 2's `MeetingLinkService` is stubbed until then, and Phase 4's `TA04` auto-attendance depends on Daily.co webhooks); Phase 3 needs none of these.

## 7. What "Done" Looks Like Per Phase

A phase is complete when:
1. Its Eloquent models + migrations exist and match `docs/postgresql-database-schema.md`.
2. Its controller(s) implement every Normal/Alternative/Exception flow listed for its use cases in `docs/use-case-descriptions.md` — not just the happy path.
3. Its frontend page(s) receive real Inertia props and submit real `router.post/put/delete` calls — no `useState` mock arrays left for that module's data.
4. Role/permission checks match the "Access denied" states already designed in the UI.
5. The resulting screen, re-screenshotted, matches the intent of the corresponding file in `docs/real-ui-captures/` (same states, now backed by real data instead of hard-coded arrays).
