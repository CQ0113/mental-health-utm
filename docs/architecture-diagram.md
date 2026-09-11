# PsyCare 2.0 Architecture Diagram Information

This document lists the information needed to create a logical architecture diagram for PsyCare 2.0. It is based on the current UI routes/pages, `docs/use-cases.md`, `docs/use-case-descriptions.md`, and `docs/postgresql-database-schema.md`.

## Architecture Summary

PsyCare 2.0 uses a Laravel MVC backend with Inertia React as the frontend view layer and Supabase PostgreSQL as the database backend.

Recommended architecture label:

```text
Laravel MVC + Inertia React + Supabase PostgreSQL
```

The architecture diagram should show:

- Users access the system through role-based portals.
- React/Inertia pages act as the View layer.
- Laravel routes and controllers handle requests.
- Laravel models represent domain data and connect to Supabase PostgreSQL.
- External services support AI/NLP screening, online meetings, email notifications, QR attendance, and file/resource access.

## Main Actors

| Actor | Purpose |
| --- | --- |
| Client | Accepts system terms, books appointments, submits client information declarations, joins sessions, records emotion, chats with AI counselor, takes psychometric tests, accesses resources, and uses peer support forum. |
| Admin | Manages counselors, clients, appointments, testing materials, learning resources, forum moderation, and slot schedules. |
| Counselor | Reviews appointments, manages slots, reviews caseload/risk flags, handles tasks, reviews psychometric triage, and manages attendance. |
| System | Performs automated actions such as AI/NLP screening, risk flag creation, email notification, QR/online attendance logging, and meeting link generation. |

## UI / View Layer

The frontend uses React pages rendered through Inertia routes in `routes/web.php`.

### Client Portal

Route prefix: `/psycare`

| UI Page | Route | Main Purpose |
| --- | --- | --- |
| Dashboard | `/psycare/dashboard` | Client landing dashboard. |
| Smart Appointment Form | `/psycare/permohonan` | New and follow-up appointment booking. |
| Appointment Records | `/psycare/rekod-temujanji` | View appointment records and follow-up actions. |
| Psychometric Test | `/psycare/ujian-psikometrik` | Take self-assessment and view result history. |
| Resource Library | `/psycare/resource-library` | Search and open mental health resources. |
| Services | `/psycare/perkhidmatan` | View available counselling services. |
| Smart Journal | `/psycare/jurnal-pintar` | Emotion logging, AI counselor chatbot, and tracking. |
| Peer Support Forum | `/psycare/forum-sokongan` | Submit and view peer support posts. |

### Admin Portal

Route prefix: `/admin`

| UI Page | Route | Main Purpose |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Admin overview. |
| Service | `/admin/service` | Counselling service management. |
| Counsellor (PPsi) | `/admin/counsellor-ppsi` | Counselor onboarding and profile management. |
| Counsellor Timetable | `/admin/counsellor-timetable` | Counselor timetable overview. |
| Client Information | `/admin/client-information` | Client profile and case information. |
| Appointment Queue | `/admin/appointments` | Appointment review, creation, attendance, and approval flow. |
| Testing Materials | `/admin/materials` | Upload/generate psychometric tests. |
| Learning Materials | `/admin/learning-materials` | Manage resource library items. |
| Forum Moderation | `/admin/forum` | Review AI safety scores and moderate forum posts. |

### Counselor Portal

Route prefix: `/counsellor`

| UI Page | Route | Main Purpose |
| --- | --- | --- |
| Dashboard | `/counsellor/dashboard` | Counselor overview. |
| Appointments | `/counsellor/appointments` | Review assigned appointment requests and session status. |
| Slot Manager | `/counsellor/slots` | Manage appointment slots. |
| Caseload | `/counsellor/caseload` | Investigate flagged clients and risk cases. |
| Tasks | `/counsellor/tasks` | Manage counselor follow-up tasks. |
| Psychometric Results | `/counsellor/assessments` | Review psychometric triage results. |

## Backend / Controller Layer

The current app uses Laravel routes and Inertia pages. The logical architecture diagram should show backend controllers grouped by domain, even if some are still represented by mock UI logic during the prototype phase.

| Controller / Backend Component | Related Modules |
| --- | --- |
| AuthController / UserController | User management, role access, profile management. |
| CounselorController | Counselor onboarding, counselor records, counselor availability. |
| ClientProfileController | Client information, profile tabs, locked profile sections. |
| AppointmentController | Appointment booking, new/follow-up booking, admin/counselor review, appointment status. |
| SlotController | Manual slot setup, bulk generation, CSV import. |
| TermsAcceptanceController | System Terms and Conditions pop-up acceptance. |
| DeclarationController | Client information declaration submission and verification. |
| AttendanceController | Manual attendance, QR scan attendance, online auto attendance. |
| ChatbotController | AI counselor chat, chat messages, risk screening. |
| EmotionLogController | Daily emotion logging and emotion history. |
| RiskFlagController | Risk flag creation, counselor investigation, follow-up tasks. |
| PsychometricController | Test management, test taking, scoring, triage results. |
| ResourceLibraryController | Learning material upload, publishing, client access. |
| ForumController | Forum post submission and client forum interaction. |
| ForumModerationController | Admin moderation and AI safety scoring. This controller exists in the current codebase. |
| NotificationController / NotificationService | Email notification records and delivery status. |

## Model / Domain Layer

Models should be shown between controllers and Supabase PostgreSQL. Models are the only logical components that directly access the database.

| Domain Area | Main Models / Tables |
| --- | --- |
| User and Role Management | `users`, `clients`, `counsellors`, `counselling_locations`, `counselling_services` |
| Appointment and Scheduling | `appointments`, `appointment_participants`, `appointment_attachments`, `appointment_slots`, `appointment_slot_session_types`, `slot_generation_batches` |
| Terms Acceptance | `terms_acceptances` |
| Declaration | `declarations`, `declaration_verification_events` |
| Attendance | `attendance_sessions`, `attendance_participants`, `attendance_events` |
| Chatbot and Tracking | `emotion_logs`, `chat_sessions`, `chat_messages`, `risk_flags`, `counsellor_tasks` |
| Resource Library | `resource_library_items`, `resource_access_logs` |
| Peer Support Forum | `forum_categories`, `forum_posts`, `forum_supports`, `forum_moderation_events` |
| Psychometric Self-Assessment | `psychometric_tests`, `psychometric_questions`, `psychometric_options`, `psychometric_submissions`, `psychometric_answers` |
| Notifications | `email_notifications` |

## Database Layer

Database component label for the architecture diagram:

```text
Supabase PostgreSQL Database
```

The database stores:

- User accounts and role-specific profiles.
- Counseling services, locations, and counselors.
- Appointment requests, appointment participants, and slot schedules.
- System Terms and Conditions acceptance records.
- Client information declaration and verification records.
- Attendance sessions, participants, and events.
- Emotion logs, chat sessions, chat messages, counselor tasks, and risk flags.
- Psychometric tests, questions, options, submissions, and answers.
- Resource library items and access logs.
- Peer support forum posts, support actions, and moderation events.
- Email notification records.

## External / Supporting Services

Include these only if the architecture diagram needs integration components.

| External Component | Purpose | Connected To |
| --- | --- | --- |
| AI Counselor / NLP Screening Service | Generates chatbot responses and screens chat/emotion/forum content for risk keywords or distress signals. | ChatbotController, EmotionLogController, ForumController, RiskFlagController |
| Psychometric Scoring / AI Recommendation Service | Calculates score summaries, risk level, AI summary, and recommendations for psychometric tests. | PsychometricController |
| Online Meeting Platform | Opens online counselling sessions using generated meeting links. | AppointmentController, Telemedicine/Attendance flow |
| QR Code Service | Generates and validates QR tokens for physical attendance. | AttendanceController |
| Email Service | Sends appointment, declaration, and notification emails. | NotificationService |
| File / Resource Storage | Stores uploaded attachments, learning materials, and psychometric PDFs. Can be Supabase Storage or another file store. | AppointmentController, ResourceLibraryController, PsychometricController |

## Core System Modules

The architecture diagram should group the system around these modules.

| Module | Main Users | Main UI Areas | Main Backend Components | Main Data |
| --- | --- | --- | --- | --- |
| User Management | Admin, Counselor, Client | Admin counselor/client pages, profile tabs | AuthController, UserController, CounselorController, ClientProfileController | `users`, `clients`, `counsellors` |
| Appointment and Scheduling | Client, Admin, Counselor | Smart Appointment Form, Appointment Queue, Counselor Appointments, Slot Manager | AppointmentController, SlotController | `appointments`, `appointment_slots`, `appointment_participants` |
| Terms Acceptance | Client | First-use Terms and Conditions pop-up | TermsAcceptanceController | `terms_acceptances` |
| Declaration | Client, Admin, Counselor | Confirmation/Pengesahan section | DeclarationController | `declarations`, `declaration_verification_events` |
| Telemedicine and Attendance | Client, Admin, Counselor | Appointment records, Join Online Session, Attendance panel, QR display | AttendanceController, MeetingLinkService, QRCodeService | `attendance_sessions`, `attendance_participants`, `attendance_events` |
| Chatbot and Tracking | Client, Counselor | Smart Journal, AI Chatbot, Caseload | ChatbotController, EmotionLogController, RiskFlagController | `emotion_logs`, `chat_sessions`, `chat_messages`, `risk_flags`, `counsellor_tasks` |
| Psychometric Self-Assessment | Client, Admin, Counselor | Ujian Psikometrik, Testing Materials, Psychometric Results | PsychometricController | `psychometric_tests`, `psychometric_submissions`, `psychometric_answers`, `risk_flags` |
| Resource Library | Client, Admin | Resource Library, Learning Materials | ResourceLibraryController | `resource_library_items`, `resource_access_logs` |
| Peer Support Forum | Client, Admin | Forum Sokongan, Forum Moderation | ForumController, ForumModerationController | `forum_posts`, `forum_moderation_events`, `risk_flags` |
| Notifications | Client, Admin, Counselor | Email inbox outside app, optional notification status views | NotificationService | `email_notifications` |

## Important Data Flows For Diagram

### Appointment Booking Flow

```text
Client -> Smart Appointment Form -> AppointmentController -> Appointment/Slot/ClientInformationDeclaration Models -> Supabase PostgreSQL
```

If session type is online:

```text
AppointmentController -> MeetingLinkService -> Appointment Model -> Supabase PostgreSQL
```

Result:

- Appointment request is saved.
- Client information declaration/confirmation is saved.
- Online meeting link is saved when applicable.
- Request becomes available for Admin or Counselor review.

### Slot Management Flow

```text
Admin/Counselor -> Slot Manager -> SlotController -> AppointmentSlot Model -> Supabase PostgreSQL
```

Supported slot methods:

- Manual slot add.
- Bulk generation.
- CSV import.
- Save/publish slot changes.

### Attendance Flow

```text
Admin/Counselor/Client -> Attendance UI or QR/Online Session -> AttendanceController -> Attendance Models -> Supabase PostgreSQL
```

Attendance can be recorded by:

- Manual update.
- Physical QR scan.
- Online auto-log after joining meeting link.

### Chatbot and Risk Flow

```text
Client -> AI Chatbot View -> ChatbotController -> AI/NLP Service
ChatbotController -> ChatSession/ChatMessage/RiskFlag Models -> Supabase PostgreSQL
Counselor -> Caseload -> RiskFlagController -> RiskFlag/CounsellorTask Models -> Supabase PostgreSQL
```

Result:

- Chat messages are saved.
- AI responses are displayed.
- Risk flags are created when risk is detected.
- Flagged cases become available for counselor investigation.

### Psychometric Flow

```text
Client -> Ujian Psikometrik Page -> PsychometricController -> Psychometric Models -> Supabase PostgreSQL
```

If high risk:

```text
PsychometricController -> RiskFlag Model -> Supabase PostgreSQL
```

Result:

- Submission and answers are saved.
- Score/risk level/result summary is generated.
- High-risk result becomes available for counselor triage.

### Forum Moderation Flow

```text
Client -> Forum Sokongan -> ForumController -> AI/NLP Safety Screening -> ForumPost Model -> Supabase PostgreSQL
Admin -> Forum Moderation -> ForumModerationController -> ForumModerationEvent Model -> Supabase PostgreSQL
```

Result:

- Safe posts are published.
- Unsafe posts are queued/hidden for moderation.
- Moderation actions are logged.

### Resource Library Flow

```text
Admin -> Learning Materials -> ResourceLibraryController -> ResourceLibraryItem Model -> Supabase PostgreSQL
Client -> Resource Library -> ResourceLibraryController -> ResourceAccessLog Model -> Supabase PostgreSQL
```

Result:

- Admin-published resources become available to clients.
- Client access can be logged.

## Recommended Architecture Diagram Layout

Use a layered layout from top to bottom:

```text
Actors
  |
Role-Based Portals / React Inertia Views
  |
Laravel Routes and Controllers
  |
Domain Models / Services
  |
Supabase PostgreSQL Database
  |
External Services / Storage
```

Alternative left-to-right layout:

```text
Actors -> React/Inertia UI -> Laravel MVC Backend -> Supabase PostgreSQL -> External Services
```

Recommended visual grouping:

- Put Client, Admin, and Counselor on the left/top as actors.
- Put three portal boxes under the View layer: Client Portal, Admin Portal, Counselor Portal.
- Put Laravel backend in the center with grouped controllers.
- Put domain models below controllers.
- Put Supabase PostgreSQL below models.
- Put external services on the right side.

## Architecture Diagram Components To Include

Minimum professional diagram:

```text
Client, Admin, Counselor
React/Inertia View Layer
Laravel Routes
Laravel Controllers
Laravel Models
Supabase PostgreSQL Database
AI/NLP Service
Online Meeting Platform
Email Service
QR Code Service
File/Resource Storage
```

Detailed diagram:

```text
Client Portal
Admin Portal
Counselor Portal
Appointment and Scheduling Module
Terms Acceptance Module
Declaration Module
Attendance and Telemedicine Module
Chatbot and Risk Tracking Module
Psychometric Module
Resource Library Module
Peer Support Forum Module
Notification Module
Supabase PostgreSQL Database
External AI/NLP, Meeting, Email, QR, Storage services
```

## Relationship Rules For The Diagram

Follow these rules to keep the architecture logical:

1. Actors interact with UI portals, not directly with controllers or database.
2. React/Inertia pages communicate with Laravel routes/controllers.
3. Controllers coordinate application logic and call models/services.
4. Models access Supabase PostgreSQL.
5. Views do not access Supabase PostgreSQL directly in the architecture diagram.
6. Controllers should not be drawn as directly writing database records; show the model layer in between.
7. External services connect to controllers/services, not directly to UI unless the service opens outside the app, such as an online meeting link.
8. Risk-producing modules connect to `risk_flags`.
9. Notification events connect to `email_notifications` and Email Service.
10. File upload features connect to File/Resource Storage.

## Notes And Assumptions

- Current frontend pages contain mock/local data behavior in several areas. The architecture diagram should represent the intended logical architecture described by the use cases and Supabase PostgreSQL schema.
- `ForumModerationController` currently exists in the Laravel codebase. Other controllers listed here are logical backend components that match the documented modules and should be implemented as the prototype moves from mock data to full backend persistence.
- Supabase is the hosted PostgreSQL database backend. For diagram labels, use `Supabase PostgreSQL Database`.
- Use `Counselor` for system roles when matching code enums, and `Counsellor` where UI text or Malaysian/British spelling is used. Keep one spelling consistently inside a single diagram.
