# PsyCare 2.0 Entity Catalogue And Data Dictionary

This document lists the domain entities used in the latest SRS class diagrams and defines the data dictionary for each entity.

It is aligned with:

- `docs/SRS class diagram.md`
- `docs/SRS class diagram plantuml.md`
- `docs/postgresql-database-schema.md`

## Scope Alignment

Only classes marked as `<<Model>>` in the latest class diagrams are treated as entities in this dictionary.

The following class diagram elements are not included as entities:

- `<<View>>` classes, because they represent UI pages.
- `<<Controller>>` classes, because they coordinate workflows.
- `<<Service>>` classes, because they represent application or external service behavior.
- Abstract layer classes such as `View`, `Controller`, `Model`, and `Service`.

Some database fields may reference schema-level tables that are not shown as standalone model classes in the latest class diagrams. Those fields are retained where they belong to a current model entity.

## Entity Catalogue

| Entity / Model Class | Database Table | Main Module(s) | Description |
| --- | --- | --- | --- |
| UserAccount | `users` | User Management, Attendance, Declaration, Resource Library, Forum, Psychometric | Portal account used for authentication and role-based access by admins, clients, and counsellors. |
| ClientProfile | `clients` | User Management, Appointment Scheduling, Declaration, Chatbot And Tracking, Resource Library, Forum, Psychometric | Client profile containing student, staff, or alumni details used across the system. |
| Counsellor | `counsellors` | User Management, Appointment Scheduling, Chatbot And Tracking | Counsellor profile used for appointment assignment, slot ownership, triage review, and intervention work. |
| CounsellingLocation | `counselling_locations` | User Management, Appointment Scheduling | Counselling location or campus where counsellors and appointment slots can be assigned. |
| Appointment | `appointments` | User Management, Appointment Scheduling, Telemedicine And Attendance, Declaration, Chatbot And Tracking | Main appointment booking record covering new appointments, follow-ups, review, approval, attendance, and meeting links. |
| AppointmentSlot | `appointment_slots` | Appointment Scheduling | Available counselling time slot selected during appointment booking. |
| AppointmentSlotSessionType | `appointment_slot_session_types` | Appointment Scheduling | Supported session type for an appointment slot, such as physical or online. |
| AppointmentAttachment | `appointment_attachments` | Appointment Scheduling | Uploaded appointment-related file and its metadata. |
| AppointmentParticipant | `appointment_participants` | Telemedicine And Attendance | Join entity that records which clients participate in an individual or group appointment. |
| SlotGenerationBatch | `slot_generation_batches` | Appointment Scheduling | Batch metadata for slot creation through manual entry, bulk generation, or CSV import. |
| EmailNotification | `email_notifications` | Appointment Scheduling | Email queue and delivery record for appointment or declaration workflow notifications. |
| Declaration | `declarations` | Declaration, Appointment Scheduling, User Management | Client declaration confirming that profile or appointment information is true and ready for review. |
| DeclarationVerificationEvent | `declaration_verification_events` | Declaration | Audit trail of declaration verification, correction, rejection, or approval actions. |
| AttendanceSession | `attendance_sessions` | Telemedicine And Attendance | Attendance container linked to an appointment, including QR token information when needed. |
| AttendanceParticipant | `attendance_participants` | Telemedicine And Attendance | Attendance status for each client participant in an attendance session. |
| AttendanceEvent | `attendance_events` | Telemedicine And Attendance | Log entry for attendance-related events such as manual update, QR scan, or online join. |
| EmotionLog | `emotion_logs` | Chatbot And Tracking | Daily client emotion score record used for dashboard emotion history and risk monitoring. |
| ChatSession | `chat_sessions` | Chatbot And Tracking | AI counselling chat session started by a client. |
| ChatMessage | `chat_messages` | Chatbot And Tracking | Individual message exchanged within a chat session. |
| RiskFlag | `risk_flags` | Chatbot And Tracking, Psychometric | Risk signal raised from emotion tracking, chatbot, psychometric assessment, or forum activity. |
| CounsellorTask | `counsellor_tasks` | Chatbot And Tracking | Counsellor intervention task linked to a client and optionally to a risk flag. |
| ResourceLibraryItem | `resource_library_items` | Educational Resource Library | Mental-health resource uploaded for clients, such as articles, videos, or toolkits. |
| ResourceAccessLog | `resource_access_logs` | Educational Resource Library | Record that a client opened or accessed a resource library item. |
| ForumCategory | `forum_categories` | Peer Support Forum | Category used to organize peer support forum posts. |
| ForumPost | `forum_posts` | Peer Support Forum | Peer support forum post authored by a client and moderated by admins. |
| ForumSupport | `forum_supports` | Peer Support Forum | Join entity showing that a client supported a forum post. |
| ForumModerationEvent | `forum_moderation_events` | Peer Support Forum | Audit record of admin moderation actions on forum posts. |
| PsychometricTest | `psychometric_tests` | Psychometric Self-Assessment | Psychometric self-assessment test created or generated by an admin. |
| PsychometricQuestion | `psychometric_questions` | Psychometric Self-Assessment | Question belonging to a psychometric test. |
| PsychometricOption | `psychometric_options` | Psychometric Self-Assessment | Scored answer option available for a psychometric test. |
| PsychometricSubmission | `psychometric_submissions` | Psychometric Self-Assessment | Completed client psychometric test result with calculated score and recommendation details. |
| PsychometricAnswer | `psychometric_answers` | Psychometric Self-Assessment | Selected answer for one question within a psychometric submission. |

## Data Dictionary

### UserAccount

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the user account. |
| name | text | Display name of the account holder. |
| email | text | Unique login email address. |
| password_hash | text | Hashed password used for authentication. |
| role | user_role enum | Account role: admin, client, or counselor. |
| status | account_status enum | Account status: active, inactive, or suspended. |
| email_verified_at | timestamptz | Date and time when the email was verified. |
| remember_token | text | Token used for persistent login sessions. |
| created_at | timestamptz | Date and time when the account was created. |
| updated_at | timestamptz | Date and time when the account was last updated. |

### ClientProfile

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the client profile. |
| user_id | uuid FK | Linked user account for this client profile. |
| full_name | text | Client's official full name. |
| preferred_name | text | Name the client prefers to be called. |
| client_type | client_type enum | Client category: student, staff, or alumni. |
| national_id | text | National identification number. |
| email | text | Client contact email. |
| phone | text | Client contact phone number. |
| current_address | text | Client's current residential address. |
| faculty | text | Faculty or department related to the client. |
| program | text | Academic program, if applicable. |
| matrix_no | text | Student matric number. |
| student_no | text | Student number used by the institution. |
| worker_no | text | Staff worker number. |
| marital_status | text | Client marital status. |
| dependent_count | integer | Number of dependents declared by the client. |
| treatment_history | text | Previous counselling or treatment information. |
| current_medications | text | Current medication information. |
| profile_locked | boolean | Indicates whether the client profile is locked from client-side editing. |
| created_at | timestamptz | Date and time when the profile was created. |
| updated_at | timestamptz | Date and time when the profile was last updated. |

### Counsellor

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the counsellor profile. |
| user_id | uuid FK | Linked user account for this counsellor profile. |
| ppsi_no | text | Counsellor professional registration or PPsi number. |
| worker_no | text | Staff worker number. |
| name | text | Counsellor's full name. |
| counsellor_type | counsellor_type enum | Counsellor category: staff or trainee. |
| organization | text | Counsellor's organization or unit. |
| location_id | uuid FK | Assigned counselling location. |
| status | account_status enum | Counsellor profile status. |
| start_date | date | Date the counsellor starts service. |
| end_date | date | Date the counsellor ends service, if applicable. |
| email | text | Counsellor contact email. |
| phone | text | Counsellor contact phone number. |
| specialization | text | Counsellor area of specialization. |
| created_at | timestamptz | Date and time when the profile was created. |
| updated_at | timestamptz | Date and time when the profile was last updated. |

### CounsellingLocation

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the counselling location. |
| code | text | Unique short code for the location. |
| name | text | Location name. |
| campus | text | Campus where the location belongs. |
| address | text | Physical address of the location. |
| is_active | boolean | Indicates whether the location can currently be used. |
| created_at | timestamptz | Date and time when the location was created. |
| updated_at | timestamptz | Date and time when the location was last updated. |

### Appointment

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the appointment. |
| reference_no | text | Unique reference number shown to users. |
| client_id | uuid FK | Client who booked or owns the appointment. |
| requested_by_user_id | uuid FK | User account that submitted the appointment request. |
| previous_appointment_id | uuid FK | Previous appointment linked to a follow-up request. |
| appointment_type | appointment_type enum | Appointment type: new or follow_up. |
| session_type | session_type enum | Delivery type: physical or online. |
| session_mode | session_mode enum | Session mode: individual or group. |
| service_id | uuid FK | Optional counselling service requested by the appointment. |
| location_id | uuid FK | Appointment location. |
| slot_id | uuid FK | Selected appointment slot. |
| counsellor_id | uuid FK | Assigned counsellor. |
| preferred_date | date | Client's preferred appointment date. |
| appointment_need | text | Reason or need for the appointment. |
| issue_summary | text | Summary of the issue provided by the client. |
| attachment_description | text | Description of attached supporting files. |
| applicant_note | text | Additional note from the applicant. |
| attended_before | boolean | Indicates whether the client attended counselling before. |
| status | appointment_status enum | Current appointment lifecycle status. |
| admin_review_by_user_id | uuid FK | Admin user who reviewed the appointment. |
| admin_review_note | text | Admin review note. |
| admin_reviewed_at | timestamptz | Date and time of admin review. |
| counsellor_review_by_user_id | uuid FK | Counsellor user who reviewed the appointment. |
| counsellor_review_note | text | Counsellor review note. |
| counsellor_reviewed_at | timestamptz | Date and time of counsellor review. |
| meeting_link | text | Online meeting link for online sessions. |
| submitted_at | timestamptz | Date and time when the appointment request was submitted. |
| created_at | timestamptz | Date and time when the appointment was created. |
| updated_at | timestamptz | Date and time when the appointment was last updated. |

### AppointmentSlot

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the appointment slot. |
| slot_date | date | Calendar date of the slot. |
| start_time | time | Slot start time. |
| end_time | time | Slot end time. |
| label | text | Display label for the slot. |
| counsellor_id | uuid FK | Counsellor assigned to the slot. |
| location_id | uuid FK | Location assigned to the slot. |
| batch_id | uuid FK | Slot generation batch that created the slot. |
| capacity | integer | Number of appointments or participants the slot can support. |
| is_active | boolean | Indicates whether the slot can be selected. |
| created_by_user_id | uuid FK | User who created the slot. |
| created_at | timestamptz | Date and time when the slot was created. |
| updated_at | timestamptz | Date and time when the slot was last updated. |

### AppointmentSlotSessionType

| Attribute Name | Type | Description |
| --- | --- | --- |
| slot_id | uuid FK | Appointment slot that supports the session type. |
| session_type | session_type enum | Supported appointment delivery type: physical or online. |

### AppointmentAttachment

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the appointment attachment. |
| appointment_id | uuid FK | Appointment linked to the attachment. |
| uploaded_by_user_id | uuid FK | User who uploaded the attachment. |
| file_name | text | Original or stored file name. |
| file_path | text | Storage path of the uploaded file. |
| description | text | Optional attachment description. |
| uploaded_at | timestamptz | Date and time when the file was uploaded. |

### AppointmentParticipant

| Attribute Name | Type | Description |
| --- | --- | --- |
| appointment_id | uuid FK | Appointment that the client participates in. |
| client_id | uuid FK | Client participating in the appointment. |
| participant_role | text | Participant role: primary or group_member. |
| created_at | timestamptz | Date and time when the participant record was created. |

### SlotGenerationBatch

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the slot generation batch. |
| created_by_user_id | uuid FK | User who created the batch. |
| generation_method | text | Slot generation method: manual, bulk, or csv. |
| start_date | date | First date covered by the batch. |
| end_date | date | Last date covered by the batch. |
| slot_template | text | Template or pattern used to generate slots. |
| replace_existing | boolean | Indicates whether existing slots should be replaced. |
| total_rows | integer | Total number of rows processed. |
| valid_rows | integer | Number of valid rows processed successfully. |
| skipped_rows | integer | Number of rows skipped due to validation or replacement rules. |
| summary | text | Human-readable batch summary. |
| created_at | timestamptz | Date and time when the batch was created. |

### EmailNotification

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the email notification. |
| recipient_user_id | uuid FK | User who should receive the email. |
| appointment_id | uuid FK | Appointment related to the notification, if applicable. |
| declaration_id | uuid FK | Declaration related to the notification, if applicable. |
| event_type | text | Workflow event that caused the notification. |
| subject | text | Email subject line. |
| body | text | Email body content. |
| status | notification_status enum | Delivery status: queued, sent, or failed. |
| error_message | text | Error message if delivery failed. |
| sent_at | timestamptz | Date and time when the email was sent. |
| created_at | timestamptz | Date and time when the notification was created. |

### Declaration

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the declaration. |
| client_id | uuid FK | Client who submitted the declaration. |
| appointment_id | uuid FK | Appointment attached to the declaration, if applicable. |
| declaration_text | text | Text of the declaration statement. |
| is_checked | boolean | Indicates whether the client checked the confirmation box. |
| status | declaration_status enum | Current declaration status. |
| submitted_at | timestamptz | Date and time when the declaration was submitted. |
| verified_by_user_id | uuid FK | User who verified the declaration. |
| verified_at | timestamptz | Date and time when the declaration was verified. |
| correction_note | text | Note explaining required correction. |
| created_at | timestamptz | Date and time when the declaration was created. |
| updated_at | timestamptz | Date and time when the declaration was last updated. |

### DeclarationVerificationEvent

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the verification event. |
| declaration_id | uuid FK | Declaration being verified or reviewed. |
| verifier_user_id | uuid FK | User who performed the verification action. |
| action | declaration_status enum | Verification action or resulting declaration status. |
| note | text | Optional note for the verification event. |
| created_at | timestamptz | Date and time when the event was recorded. |

### AttendanceSession

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the attendance session. |
| appointment_id | uuid FK | Appointment linked to this attendance session. |
| session_mode | session_mode enum | Session mode: individual or group. |
| qr_token_hash | text | Hashed QR token used for physical attendance. |
| qr_generated_by_user_id | uuid FK | User who generated the QR token. |
| qr_generated_at | timestamptz | Date and time when the QR token was generated. |
| qr_expires_at | timestamptz | Date and time when the QR token expires. |
| created_at | timestamptz | Date and time when the attendance session was created. |
| updated_at | timestamptz | Date and time when the attendance session was last updated. |

### AttendanceParticipant

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the attendance participant record. |
| attendance_session_id | uuid FK | Attendance session that includes the client. |
| client_id | uuid FK | Client whose attendance is being tracked. |
| status | attendance_status enum | Attendance status: pending, present, absent, or excused. |
| method | attendance_method enum | Attendance capture method: manual, physical_qr, or online_auto. |
| checked_in_at | timestamptz | Date and time when the client checked in. |
| recorded_by_user_id | uuid FK | User who recorded or updated attendance. |
| updated_at | timestamptz | Date and time when the attendance record was last updated. |

### AttendanceEvent

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the attendance event. |
| attendance_session_id | uuid FK | Attendance session linked to the event. |
| client_id | uuid FK | Client involved in the event. |
| user_id | uuid FK | User account involved in the event. |
| event_type | text | Attendance event type such as manual_update, qr_scan, online_join, or online_leave. |
| method | attendance_method enum | Method used to record the event. |
| metadata | jsonb | Additional structured event details. |
| created_at | timestamptz | Date and time when the event was recorded. |

### EmotionLog

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the emotion log. |
| client_id | uuid FK | Client who recorded the emotion score. |
| score | integer | Emotion score selected by the client, from 0 to 10. |
| mood_label | text | Optional display label derived from or attached to the score; this is not a separate emotion level. |
| note | text | Optional note written by the client. |
| logged_at | timestamptz | Date and time for the emotion score entry. |
| created_at | timestamptz | Date and time when the log was created. |

### ChatSession

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the chat session. |
| client_id | uuid FK | Client who started the chat session. |
| status | text | Chat session status: open, saved, or closed. |
| started_at | timestamptz | Date and time when the chat session started. |
| saved_at | timestamptz | Date and time when the session was saved. |
| closed_at | timestamptz | Date and time when the session was closed. |

### ChatMessage

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the chat message. |
| chat_session_id | uuid FK | Chat session containing the message. |
| sender_role | text | Message sender role: user, bot, or system. |
| message | text | Message content. |
| created_at | timestamptz | Date and time when the message was created. |

### RiskFlag

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the risk flag. |
| client_id | uuid FK | Client associated with the risk flag. |
| assigned_counsellor_id | uuid FK | Counsellor assigned to review or handle the risk flag. |
| source | text | Origin of the flag: emotion_log, ai_chatbot, psychometric, or forum. |
| source_ref_id | uuid | Identifier of the source record that created the flag. |
| severity | risk_level enum | Risk severity: low, moderate, or high. |
| message | text | Risk message or summary. |
| status | risk_flag_status enum | Review status: open, in_review, resolved, or dismissed. |
| flagged_at | timestamptz | Date and time when the flag was created. |
| reviewed_by_user_id | uuid FK | User who reviewed the risk flag. |
| review_note | text | Review note entered by the reviewer. |
| reviewed_at | timestamptz | Date and time when the flag was reviewed. |
| resolved_at | timestamptz | Date and time when the flag was resolved. |

### CounsellorTask

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the counsellor task. |
| counsellor_id | uuid FK | Counsellor assigned to the task. |
| client_id | uuid FK | Client who is the subject of the task. |
| risk_flag_id | uuid FK | Risk flag that created or relates to the task. |
| title | text | Task title. |
| priority | task_priority enum | Task priority: low, medium, or high. |
| due_at | timestamptz | Due date and time for the task. |
| status | task_status enum | Task status: open, in_progress, completed, or cancelled. |
| notes | text | Additional notes for the task. |
| created_at | timestamptz | Date and time when the task was created. |
| updated_at | timestamptz | Date and time when the task was last updated. |

### ResourceLibraryItem

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the resource item. |
| title_ms | text | Resource title in Malay. |
| title_en | text | Resource title in English. |
| description_ms | text | Resource description in Malay. |
| description_en | text | Resource description in English. |
| category | resource_category enum | Resource category: stress, anxiety, sleep, or support. |
| resource_type | resource_type enum | Resource type: article, video, or toolkit. |
| duration_label | text | Display label for reading or viewing duration. |
| url | text | Resource URL or storage link. |
| visibility | content_visibility enum | Visibility state: draft, published, hidden, or deleted. |
| uploaded_by_user_id | uuid FK | User who uploaded the resource. |
| created_at | timestamptz | Date and time when the resource was created. |
| updated_at | timestamptz | Date and time when the resource was last updated. |

### ResourceAccessLog

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the resource access log. |
| resource_id | uuid FK | Resource item that was accessed. |
| client_id | uuid FK | Client who accessed the resource. |
| accessed_at | timestamptz | Date and time when the resource was accessed. |

### ForumCategory

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the forum category. |
| name | text | Unique category name. |
| is_active | boolean | Indicates whether the category can be used for posts. |

### ForumPost

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the forum post. |
| author_client_id | uuid FK | Client who authored the post. |
| category_id | uuid FK | Category assigned to the post. |
| title | text | Forum post title. |
| content | text | Forum post content. |
| safety_score | integer | Safety score calculated for the post, from 0 to 100. |
| moderation_reason | text | Reason for moderation decision or safety concern. |
| status | forum_post_status enum | Post status: pending_review, published, hidden, or deleted. |
| created_at | timestamptz | Date and time when the post was created. |
| updated_at | timestamptz | Date and time when the post was last updated. |

### ForumSupport

| Attribute Name | Type | Description |
| --- | --- | --- |
| post_id | uuid FK | Forum post being supported. |
| client_id | uuid FK | Client who supported the post. |
| created_at | timestamptz | Date and time when the support action was recorded. |

### ForumModerationEvent

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the moderation event. |
| post_id | uuid FK | Forum post that was moderated. |
| moderator_user_id | uuid FK | Admin user who performed the moderation action. |
| action | text | Moderation action: approve, hide, restore, or delete. |
| previous_status | forum_post_status enum | Forum post status before moderation. |
| next_status | forum_post_status enum | Forum post status after moderation. |
| reason | text | Reason for the moderation action. |
| created_at | timestamptz | Date and time when the moderation event was recorded. |

### PsychometricTest

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the psychometric test. |
| code | text | Unique test code. |
| title_ms | text | Test title in Malay. |
| title_en | text | Test title in English. |
| description_ms | text | Test description in Malay. |
| description_en | text | Test description in English. |
| category | text | Test category. |
| estimated_minutes | integer | Estimated time needed to complete the test. |
| source_pdf_file_name | text | Source PDF file name used to generate the test. |
| uploaded_by_user_id | uuid FK | User who uploaded or generated the test. |
| visibility | content_visibility enum | Visibility state: draft, published, hidden, or deleted. |
| created_at | timestamptz | Date and time when the test was created. |
| updated_at | timestamptz | Date and time when the test was last updated. |

### PsychometricQuestion

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the psychometric question. |
| test_id | uuid FK | Psychometric test that owns the question. |
| position | integer | Display order of the question within the test. |
| prompt_ms | text | Question prompt in Malay. |
| prompt_en | text | Question prompt in English. |

### PsychometricOption

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the psychometric option. |
| test_id | uuid FK | Psychometric test that owns the option. |
| value | integer | Numeric score value for the option, from 0 to 3. |
| label_ms | text | Option label in Malay. |
| label_en | text | Option label in English. |

### PsychometricSubmission

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the psychometric submission. |
| test_id | uuid FK | Psychometric test that was completed. |
| client_id | uuid FK | Client who submitted the test. |
| submitted_at | timestamptz | Date and time when the test was submitted. |
| total_score | integer | Total score calculated from selected answers. |
| max_score | integer | Maximum possible score for the test. |
| score_percent | integer | Score percentage from 0 to 100. |
| risk_level | risk_level enum | Risk level derived from the score: low, moderate, or high. |
| ai_summary_ms | text | AI-generated result summary in Malay. |
| ai_summary_en | text | AI-generated result summary in English. |
| ai_recommendation_ms | text | AI-generated recommendation in Malay. |
| ai_recommendation_en | text | AI-generated recommendation in English. |

### PsychometricAnswer

| Attribute Name | Type | Description |
| --- | --- | --- |
| id | uuid | Unique identifier of the psychometric answer. |
| submission_id | uuid FK | Psychometric submission that contains the answer. |
| question_id | uuid FK | Psychometric question answered. |
| option_value | integer | Selected option value, from 0 to 3. |

## Relationship Notes

- `UserAccount` may be associated with one `ClientProfile` or one `Counsellor`.
- `ClientProfile` owns appointment, declaration, emotion, chat, forum, resource access, and psychometric submission activity.
- `Appointment` is the central workflow entity for appointment scheduling, telemedicine attendance, declarations, notifications, and follow-up appointments.
- `AppointmentSlot` composes `AppointmentSlotSessionType` records because supported session types belong to a slot.
- `Appointment` composes `AppointmentAttachment` records because attachments are tied to the appointment lifecycle.
- `AttendanceSession` composes `AttendanceParticipant` and `AttendanceEvent` records.
- `ChatSession` composes `ChatMessage` records.
- `Declaration` composes `DeclarationVerificationEvent` records.
- `PsychometricTest` composes `PsychometricQuestion` and `PsychometricOption` records.
- `PsychometricSubmission` composes `PsychometricAnswer` records.
