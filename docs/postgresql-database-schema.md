# PsyCare 2.0 Supabase PostgreSQL Database Schema Draft

This schema is based on the current frontend UI and the UCD document. It targets Supabase PostgreSQL and is documentation-first so it can later be converted into Laravel migrations.

## Design Notes

- Supabase is used as the hosted PostgreSQL database backend. Schema objects remain standard PostgreSQL tables, constraints, indexes, and enum types unless noted otherwise.
- `users` stores login accounts for Admin, Client, and Counselor.
- `clients` and `counsellors` store role-specific profile data shown in the UI.
- `appointments` is the central table for booking, follow-up, admin review, counsellor review, telemedicine, and attendance.
- `appointment_slots` is managed through the Slot Manager UI. Manual add, bulk generation, and CSV import all write into the same slot model.
- `declarations` supports the Confirmation/Pengesahan checkbox where the client declares that the profile or appointment information provided is true.
- `terms_acceptances` is separate from `declarations` and supports the pop-up Terms and Conditions acceptance before the client uses the portal.
- `attendance_sessions` supports manual attendance, physical QR scan, and online auto-log attendance.
- `risk_flags` connects chatbot, emotion, psychometric, and forum safety signals to counsellor investigation.

## Relationship Overview

| Module | Main Tables | Relationship Summary |
| --- | --- | --- |
| User Management | `users`, `clients`, `counsellors`, `counselling_locations` | A user may have one client profile or one counsellor profile. Admin manages counsellor records. |
| Declaration | `declarations`, `declaration_verification_events` | A client information declaration belongs to a client and may be attached to an appointment. Verification events track Admin/Counselor review. |
| Terms Acceptance | `terms_acceptances` | A client accepts the current PsyCare Terms and Conditions version through the blocking portal pop-up. This is not the same record as the Confirmation/Pengesahan declaration. |
| Appointment and Scheduling | `appointments`, `appointment_participants`, `appointment_slots`, `slot_generation_batches` | Appointments use configured slots. Follow-up appointments reference previous appointments. Group sessions use participants. |
| Telemedicine and Attendance | `attendance_sessions`, `attendance_participants`, `attendance_events` | Each appointment can have one attendance session. Attendance may be manual, physical QR, or online auto-log. |
| Chatbot and Tracking | `emotion_logs`, `chat_sessions`, `chat_messages`, `risk_flags`, `counsellor_tasks` | Client emotion/chat activity can create risk flags and counsellor tasks. |
| Educational Resource Library | `resource_library_items`, `resource_access_logs` | Admin uploads resources; clients access them. |
| Peer Support Forum | `forum_categories`, `forum_posts`, `forum_supports`, `forum_moderation_events` | Clients submit posts; Admin moderates posts using safety score and moderation events. |
| Psychometric Self-Assessment | `psychometric_tests`, `psychometric_questions`, `psychometric_options`, `psychometric_submissions`, `psychometric_answers` | Admin creates tests; clients submit answers; counsellors review triage results. |
| Notifications | `email_notifications` | Appointment and declaration workflow events can notify users by email. |

## PostgreSQL DDL

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'client', 'counselor');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE client_type AS ENUM ('student', 'staff', 'alumni');
CREATE TYPE counsellor_type AS ENUM ('staff', 'trainee');
CREATE TYPE service_session_mode AS ENUM ('physical', 'online', 'hybrid');
CREATE TYPE session_type AS ENUM ('physical', 'online');
CREATE TYPE session_mode AS ENUM ('individual', 'group');
CREATE TYPE appointment_type AS ENUM ('new', 'follow_up');
CREATE TYPE appointment_status AS ENUM (
    'draft',
    'pending',
    'needs_review',
    'counsellor_reviewing',
    'approved',
    'on_going',
    'complete',
    'completed',
    'follow_up',
    'closed'
);
CREATE TYPE attendance_status AS ENUM ('pending', 'present', 'absent', 'excused');
CREATE TYPE attendance_method AS ENUM ('manual', 'physical_qr', 'online_auto');
CREATE TYPE declaration_status AS ENUM (
    'draft',
    'submitted',
    'pending_verification',
    'verified',
    'correction_required',
    'rejected'
);
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE risk_flag_status AS ENUM ('open', 'in_review', 'resolved', 'dismissed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE resource_category AS ENUM ('stress', 'anxiety', 'sleep', 'support');
CREATE TYPE resource_type AS ENUM ('article', 'video', 'toolkit');
CREATE TYPE content_visibility AS ENUM ('draft', 'published', 'hidden', 'deleted');
CREATE TYPE forum_post_status AS ENUM ('pending_review', 'published', 'hidden', 'deleted');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text,
    role user_role NOT NULL,
    status account_status NOT NULL DEFAULT 'active',
    email_verified_at timestamptz,
    remember_token text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE counselling_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    campus text,
    address text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE counselling_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
    location_id uuid REFERENCES counselling_locations(id),
    session_mode service_session_mode NOT NULL DEFAULT 'physical',
    status account_status NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    preferred_name text,
    client_type client_type NOT NULL,
    national_id text UNIQUE,
    email text UNIQUE,
    phone text,
    current_address text,
    faculty text,
    program text,
    matrix_no text UNIQUE,
    student_no text UNIQUE,
    worker_no text UNIQUE,
    marital_status text,
    dependent_count integer NOT NULL DEFAULT 0 CHECK (dependent_count >= 0),
    treatment_history text,
    current_medications text,
    profile_locked boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE terms_acceptances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    terms_version text NOT NULL,
    accepted boolean NOT NULL DEFAULT false,
    accepted_at timestamptz,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (client_id, terms_version)
);

CREATE TABLE counsellors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    ppsi_no text UNIQUE,
    worker_no text UNIQUE,
    name text NOT NULL,
    counsellor_type counsellor_type NOT NULL DEFAULT 'staff',
    organization text,
    location_id uuid REFERENCES counselling_locations(id),
    status account_status NOT NULL DEFAULT 'active',
    start_date date,
    end_date date,
    email text UNIQUE,
    phone text,
    specialization text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE slot_generation_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_user_id uuid REFERENCES users(id),
    generation_method text NOT NULL CHECK (generation_method IN ('manual', 'bulk', 'csv')),
    start_date date,
    end_date date,
    slot_template text,
    replace_existing boolean NOT NULL DEFAULT false,
    total_rows integer NOT NULL DEFAULT 0,
    valid_rows integer NOT NULL DEFAULT 0,
    skipped_rows integer NOT NULL DEFAULT 0,
    summary text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appointment_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    label text NOT NULL,
    counsellor_id uuid REFERENCES counsellors(id) ON DELETE SET NULL,
    location_id uuid REFERENCES counselling_locations(id) ON DELETE SET NULL,
    batch_id uuid REFERENCES slot_generation_batches(id) ON DELETE SET NULL,
    capacity integer NOT NULL DEFAULT 1 CHECK (capacity > 0),
    is_active boolean NOT NULL DEFAULT true,
    created_by_user_id uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_time > start_time),
    UNIQUE (slot_date, start_time, end_time, counsellor_id)
);

CREATE TABLE appointment_slot_session_types (
    slot_id uuid NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
    session_type session_type NOT NULL,
    PRIMARY KEY (slot_id, session_type)
);

CREATE TABLE appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no text NOT NULL UNIQUE,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    requested_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    previous_appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    appointment_type appointment_type NOT NULL DEFAULT 'new',
    session_type session_type NOT NULL,
    session_mode session_mode NOT NULL DEFAULT 'individual',
    service_id uuid REFERENCES counselling_services(id) ON DELETE SET NULL,
    location_id uuid REFERENCES counselling_locations(id) ON DELETE SET NULL,
    slot_id uuid REFERENCES appointment_slots(id) ON DELETE SET NULL,
    counsellor_id uuid REFERENCES counsellors(id) ON DELETE SET NULL,
    preferred_date date,
    appointment_need text,
    issue_summary text,
    attachment_description text,
    applicant_note text,
    attended_before boolean NOT NULL DEFAULT false,
    status appointment_status NOT NULL DEFAULT 'pending',
    admin_review_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    admin_review_note text,
    admin_reviewed_at timestamptz,
    counsellor_review_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    counsellor_review_note text,
    counsellor_reviewed_at timestamptz,
    meeting_link text,
    submitted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appointment_participants (
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    participant_role text NOT NULL DEFAULT 'primary'
        CHECK (participant_role IN ('primary', 'group_member')),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (appointment_id, client_id)
);

CREATE TABLE appointment_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    uploaded_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    description text,
    uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE declarations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
    declaration_text text NOT NULL,
    is_checked boolean NOT NULL DEFAULT false,
    status declaration_status NOT NULL DEFAULT 'draft',
    submitted_at timestamptz,
    verified_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    verified_at timestamptz,
    correction_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE declaration_verification_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    declaration_id uuid NOT NULL REFERENCES declarations(id) ON DELETE CASCADE,
    verifier_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action declaration_status NOT NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    session_mode session_mode NOT NULL DEFAULT 'individual',
    qr_token_hash text,
    qr_generated_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    qr_generated_at timestamptz,
    qr_expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'pending',
    method attendance_method,
    checked_in_at timestamptz,
    recorded_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (attendance_session_id, client_id)
);

CREATE TABLE attendance_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_session_id uuid NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    event_type text NOT NULL CHECK (event_type IN ('manual_update', 'qr_scan', 'online_join', 'online_leave')),
    method attendance_method,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE emotion_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    score integer NOT NULL CHECK (score BETWEEN 0 AND 10),
    mood_label text,
    note text,
    logged_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'saved', 'closed')),
    started_at timestamptz NOT NULL DEFAULT now(),
    saved_at timestamptz,
    closed_at timestamptz
);

CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_role text NOT NULL CHECK (sender_role IN ('user', 'bot', 'system')),
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE risk_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    assigned_counsellor_id uuid REFERENCES counsellors(id) ON DELETE SET NULL,
    source text NOT NULL CHECK (source IN ('emotion_log', 'ai_chatbot', 'psychometric', 'forum')),
    source_ref_id uuid,
    severity risk_level NOT NULL,
    message text,
    status risk_flag_status NOT NULL DEFAULT 'open',
    flagged_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    review_note text,
    reviewed_at timestamptz,
    resolved_at timestamptz
);

CREATE TABLE counsellor_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    counsellor_id uuid NOT NULL REFERENCES counsellors(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    risk_flag_id uuid REFERENCES risk_flags(id) ON DELETE SET NULL,
    title text NOT NULL,
    priority task_priority NOT NULL DEFAULT 'medium',
    due_at timestamptz,
    status task_status NOT NULL DEFAULT 'open',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE resource_library_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ms text NOT NULL,
    title_en text NOT NULL,
    description_ms text,
    description_en text,
    category resource_category NOT NULL,
    resource_type resource_type NOT NULL,
    duration_label text,
    url text NOT NULL,
    visibility content_visibility NOT NULL DEFAULT 'published',
    uploaded_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE resource_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id uuid NOT NULL REFERENCES resource_library_items(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE forum_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE forum_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    category_id uuid REFERENCES forum_categories(id) ON DELETE SET NULL,
    title text NOT NULL,
    content text NOT NULL,
    safety_score integer NOT NULL DEFAULT 90 CHECK (safety_score BETWEEN 0 AND 100),
    moderation_reason text,
    status forum_post_status NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE forum_supports (
    post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, client_id)
);

CREATE TABLE forum_moderation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    moderator_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL CHECK (action IN ('approve', 'hide', 'restore', 'delete')),
    previous_status forum_post_status,
    next_status forum_post_status NOT NULL,
    reason text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE psychometric_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    title_ms text NOT NULL,
    title_en text NOT NULL,
    description_ms text,
    description_en text,
    category text,
    estimated_minutes integer CHECK (estimated_minutes > 0),
    source_pdf_file_name text,
    uploaded_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    visibility content_visibility NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE psychometric_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid NOT NULL REFERENCES psychometric_tests(id) ON DELETE CASCADE,
    position integer NOT NULL CHECK (position > 0),
    prompt_ms text NOT NULL,
    prompt_en text NOT NULL,
    UNIQUE (test_id, position)
);

CREATE TABLE psychometric_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid REFERENCES psychometric_tests(id) ON DELETE CASCADE,
    value integer NOT NULL CHECK (value BETWEEN 0 AND 3),
    label_ms text NOT NULL,
    label_en text NOT NULL,
    UNIQUE (test_id, value)
);

CREATE TABLE psychometric_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid NOT NULL REFERENCES psychometric_tests(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    total_score integer NOT NULL CHECK (total_score >= 0),
    max_score integer NOT NULL CHECK (max_score > 0),
    score_percent integer NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
    risk_level risk_level NOT NULL,
    ai_summary_ms text,
    ai_summary_en text,
    ai_recommendation_ms text,
    ai_recommendation_en text
);

CREATE TABLE psychometric_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES psychometric_submissions(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES psychometric_questions(id) ON DELETE CASCADE,
    option_value integer NOT NULL CHECK (option_value BETWEEN 0 AND 3),
    UNIQUE (submission_id, question_id)
);

CREATE TABLE email_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
    declaration_id uuid REFERENCES declarations(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    status notification_status NOT NULL DEFAULT 'queued',
    error_message text,
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

## Recommended Indexes

```sql
CREATE INDEX idx_clients_name ON clients USING gin (to_tsvector('simple', full_name));
CREATE INDEX idx_clients_matrix_no ON clients (matrix_no);
CREATE INDEX idx_clients_worker_no ON clients (worker_no);
CREATE INDEX idx_terms_acceptances_user ON terms_acceptances (user_id);
CREATE INDEX idx_counsellors_location ON counsellors (location_id);
CREATE INDEX idx_slots_date ON appointment_slots (slot_date);
CREATE INDEX idx_appointments_client ON appointments (client_id);
CREATE INDEX idx_appointments_counsellor ON appointments (counsellor_id);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_previous ON appointments (previous_appointment_id);
CREATE INDEX idx_attendance_session_appointment ON attendance_sessions (appointment_id);
CREATE INDEX idx_emotion_logs_client_time ON emotion_logs (client_id, logged_at DESC);
CREATE INDEX idx_risk_flags_client_status ON risk_flags (client_id, status);
CREATE INDEX idx_forum_posts_status_score ON forum_posts (status, safety_score);
CREATE INDEX idx_psychometric_submissions_client ON psychometric_submissions (client_id, submitted_at DESC);
CREATE INDEX idx_notifications_recipient_status ON email_notifications (recipient_user_id, status);
```

## UI Relationship Mapping

| UI / Use Case Behavior | Tables Involved |
| --- | --- |
| Admin onboards a counsellor in Counsellor (PPsi) | `users`, `counsellors`, `counselling_locations` |
| Client profile tabs and locked profile information | `clients` |
| First-use Terms and Conditions pop-up with Agree and Continue button | `terms_acceptances` |
| Confirmation/Pengesahan declaration checkbox and Hantar button | `declarations`, `declaration_verification_events` |
| Smart Appointment Form creates new or follow-up booking | `appointments`, `appointment_participants`, `appointment_slots`, `declarations` |
| Appointment Records Follow Up action routes to follow-up booking | `appointments.previous_appointment_id` |
| Slot Manager Add Slot | `appointment_slots`, `appointment_slot_session_types` |
| Bulk Setup / Generate Bulk Slots | `slot_generation_batches`, `appointment_slots`, `appointment_slot_session_types` |
| CSV Import | `slot_generation_batches`, `appointment_slots`, `appointment_slot_session_types` |
| Join Online Session and auto attendance | `appointments.meeting_link`, `attendance_sessions`, `attendance_participants`, `attendance_events` |
| Scan physical attendance QR | `attendance_sessions.qr_token_hash`, `attendance_events`, `attendance_participants` |
| Smart Journal emotion history | `emotion_logs` |
| AI Counselor Chatbot and risk flag | `chat_sessions`, `chat_messages`, `risk_flags` |
| Counsellor investigates flagged client and creates tasks | `risk_flags`, `counsellor_tasks`, `clients`, `counsellors` |
| Admin uploads learning resources | `resource_library_items` |
| Client opens resource material | `resource_access_logs` |
| Client submits peer forum post | `forum_posts`, `forum_categories`, `forum_supports` |
| Admin forum moderation | `forum_moderation_events`, `forum_posts` |
| Admin uploads psychometric PDF and generates test | `psychometric_tests`, `psychometric_questions`, `psychometric_options` |
| Client takes psychometric test | `psychometric_submissions`, `psychometric_answers` |
| Counsellor triage dashboard | `psychometric_submissions`, `clients`, `risk_flags` |
| Email notification after appointment or verification events | `email_notifications` |

## Notes For Laravel Migration Phase

- Use Laravel `uuid()` columns for all primary and foreign keys.
- Convert enum types either to PostgreSQL enums using raw SQL or to string columns with validation in Laravel.
- The existing Laravel `users` migration can be extended instead of recreated.
- `risk_flags.source_ref_id` is intentionally generic because flags can originate from different modules. Application logic should store the originating table name in `source` and the record ID in `source_ref_id`.
- `appointment_participants` allows one appointment to support both individual and group sessions without duplicating appointment records.
- `appointment_slot_session_types` allows a slot to support physical, online, or both, matching the Slot Manager UI.
