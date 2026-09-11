# PsyCare 2.0 UI / Feature Capture Checklist

This checklist lists the core UI screens, panels, dialogs, and states that should be captured for User Interface Design.

It is aligned with:

- `docs/use-case-descriptions.md`
- `docs/SRS class diagram plantuml.md`
- `docs/class-diagram-functions.md`

The goal is to cover as much of the sequence-diagram flow as possible, including normal flows, alternative flows, exception states, confirmation dialogs, and success/error feedback.

## Global UI States To Capture

For every major page, capture these common UI states where relevant:

| UI State | What To Show |
| --- | --- |
| Default / loaded state | Main page content after data loads successfully. |
| Search / filter state | Search fields, filter chips/dropdowns, selected criteria, and result list. |
| Empty result state | Clear message when no records match. |
| Validation error state | Missing required fields, invalid format, invalid selection, or incomplete information. |
| Confirmation dialog | Save, submit, approve, verify, upload, or moderation confirmation. |
| Success state | Success alert/toast/message after save, submit, upload, approval, or update. |
| Unavailable state | Slot unavailable, declaration unavailable, resource unavailable, session unavailable. |
| Access denied state | User does not have permission to view or perform the action. |
| Cancel / back state | Return to previous page, dashboard, appointment list, or remain on current section. |

## 1. User Management Module

Covered use cases: `UM01 Onboard Counselor`, `UM02 Find Client Profile`, `UM03 Manage User Profile`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Counsellor PPsi management page | Admin | Open counsellor page, load counsellor list, search/filter counsellor records | Counsellor table, filters, search field, status labels, empty result message. |
| Add counsellor form | Admin | Add counsellor, enter counsellor details, save counsellor | PPsi number, worker number, name, email, phone, type, organization, location, status, start/end dates. |
| Counsellor save confirmation dialog | Admin | Request save confirmation, confirm save | Confirmation modal with entered counsellor summary and Save/Cancel buttons. |
| Counsellor validation and duplicate states | Admin | Missing/invalid counsellor details, duplicate PPsi/worker/email | Required field errors, duplicate record error, no duplicate success path. |
| Client profile search page | Admin / Counsellor | Open client profile page, search/filter client profiles | Search by name, matrix/staff number, email, phone; result list; invalid search error. |
| Client profile detail page / tabs | Admin / Counsellor | View client profile, check permission, load profile details | Personal info, appointment history, declaration history, read-only detail sections. |
| Access denied client profile state | Admin / Counsellor | User not authorized to view profile | Access denied message and redirect/back action. |
| My Account locked profile view | Client | Client opens My Account and views locked profile | Read-only fields, locked profile notice, return/back button. |
| Admin client information management page | Admin | Load client information list, create/update client profile | Client table, editable client form, profile tabs, save button. |
| Client profile save/update states | Admin | Validate profile, check conflict, save profile, update tabs | Confirmation dialog, profile validation error, duplicate profile error, save success, tab update success. |

## 2. Appointment Scheduling Module

Covered use cases: `AS01 Book Appointment`, `AS02 Request Follow-Up`, `AS03 Book New Appointment`, `AS04 Manage Slots`, `AS05 Bulk Generate Slots`, `AS06 Import CSV Timetable`, `AS07 Verify Appointment`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Smart appointment form landing state | Client | Open booking form, load client profile, load available slots | Applicant information, reference number, booking type selector, available slot summary. |
| New appointment booking form | Client | Create new booking, select date/slot/session type, enter appointment details | Calendar, slot list, session type selector, issue summary, applicant note, attachment upload, confirmation fields. |
| Appointment availability states | Client | Validate selected slot, check slot availability | Available slots, no available slot error, slot unavailable message, incomplete appointment information error. |
| Booking summary / confirmation screen | Client | Submit appointment request, create appointment, create declaration, optional meeting link | Booking reference, selected counsellor/location/date/session, pending status, online meeting link if applicable. |
| Draft appointment save state | Client | Save draft appointment and optional attachment | Save draft button, draft saved message, attachment preview. |
| Follow-up appointment records page | Client | Load appointment records and eligible follow-up records | Appointment history list, follow-up eligibility status, select previous appointment. |
| Follow-up booking form | Client | Open follow-up mode, lock previous appointment reference, select new date/slot/session | Previous appointment reference, locked field, follow-up slot selector, summary. |
| Follow-up error states | Client | Appointment not eligible, no follow-up slot available | Not eligible message, unavailable follow-up slot error. |
| Slot manager overview page | Admin / Counsellor | Load configured slots and active counsellors | Slot calendar/table, filters, existing slots, active counsellor list, manual/bulk/CSV sections. |
| Manual slot draft UI | Admin / Counsellor | Add manual slot, validate session type, validate time, check overlap | Date, start/end time, counsellor, location, session type, draft slot list, invalid/overlap errors. |
| Bulk slot generation UI | Admin / Counsellor | Enter criteria, generate bulk slots, replace existing dates | Weekday selector, date range, session type, counsellor, replace existing toggle, generation summary. |
| CSV import UI | Admin / Counsellor | Upload CSV, parse rows, validate template, import slots | File upload, CSV template hint, replace existing toggle, valid/skipped row summary, empty/invalid CSV error. |
| Save slot changes confirmation | Admin / Counsellor | Save draft changes, delete marked saved slots, create slots and session types | Draft slot list, marked-for-removal list, confirmation dialog, save success message. |
| Appointment queue page | Admin / Counsellor | Load pending appointment queue, open appointment details | Pending queue table, filter controls, appointment detail panel, client/slot/counsellor details. |
| Admin appointment review UI | Admin | Approve appointment for counsellor review | Admin review notes/status, confirmation dialog, missing review information error, success message. |
| Counsellor appointment review UI | Counsellor | Open counsellor review appointment, approve appointment | Counsellor review notes/status, approval confirmation, unavailable/not ready state, success message. |
| Appointment notification status | Admin / Counsellor | Queue appointment status notification | Notification queued/sent status feedback where relevant. |

## 3. Telemedicine And Attendance Module

Covered use cases: `TA01 Join Online Session`, `TA02 Record Attendance`, `TA03 Scan Physical QR Code`, `TA04 Auto-Log Attendance (Online)`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Appointment record detail page | Client / Counsellor | Open appointment record, get appointment details | Reference number, session type, appointment date/time, counsellor, location/link, attendance status. |
| Join online session action | Client / Counsellor | Validate access, validate meeting link, open meeting link | Join button, online session availability, meeting link state, auto-log attendance message. |
| Online session error states | Client / Counsellor | Session not available, invalid meeting link, access denied | Session not available message, invalid/expired link error, access denied message. |
| Attendance record panel | Admin / Counsellor | Load attendance record and appointment participants | Appointment reference input, participant list, attendance status controls. |
| Manual attendance save UI | Admin / Counsellor | Select status and save attendance | Present/absent/excused controls, save button, missing status error, save success. |
| QR attendance confirmation page | Client | Scan physical QR code, confirm identity, mark attendance | Appointment/session details, identity confirmation, confirm attendance button. |
| QR attendance error states | Client | Invalid/expired QR, already checked in, unauthorized, non-physical session | Error banners/messages for each exception. |
| Online auto-log attendance status | Client | Detect online join event, auto-log attendance | Auto-log success message, unverified join error, invalid online context error. |

## 4. Declaration Module

Covered use cases: `DC01 View Declaration Form`, `DC02 Submit Declaration`, `DC03 Verify Declaration`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Declaration form / confirmation tab | Client | Load declaration form and current declaration | Declaration statement, client identity, appointment context, current status, submitted date. |
| Declaration checkbox and submit state | Client | Select checkbox, submit declaration | Confirmation checkbox, submit button, submitted status message. |
| Declaration unavailable and checkbox error states | Client | Required declaration info unavailable, checkbox not selected | Checkbox required error, declaration unavailable message. |
| Declaration review page | Admin / Counsellor | Load submitted declaration, verify permission, display details | Declaration details, client profile summary, status blocks, verifier information. |
| Verify declaration action | Admin / Counsellor | Validate completeness, check already verified, mark verified | Verify/approve button, verification success message. |
| Correction required action | Admin / Counsellor | Enter correction note, request correction, record event | Correction note field, reject/correction button, correction required success. |
| Declaration verification error states | Admin / Counsellor | Incomplete declaration, already verified | Incomplete declaration error, already verified message. |

## 5. Chatbot And Tracking Module

Covered use cases: `CT01 Log Daily Emotion`, `CT02 Chat With AI Counselor`, `CT03 View Emotion History`, `CT04 Investigate Flagged Client`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Dashboard emotion tracker | Client | Open dashboard, load emotion tracker, save emotion score | Date selector, emotion score input, save control, meaningful words/success message. |
| Emotion validation states | Client | Invalid score, future date | Invalid emotion score error, future date error. |
| Emotion history graph | Client / Counsellor | Load/filter emotion history | Line/bar graph, date range filter, filtered records, no history message. |
| AI counsellor chatbot window | Client | Open chatbot, send message, quick reply, receive AI response | Greeting, quick replies, message input, send button, user/AI message bubbles. |
| Chatbot risk detected state | Client | AI screens risk and creates risk flag | High-stress detected message, guidance text, mark conversation for review. |
| Save chat state | Client | Save chat session for counsellor review | Save chat button, saved confirmation message. |
| Caseload flagged client list | Counsellor | Load flagged client list, view flagged client | Flagged client list, risk indicators, severity/status labels. |
| Flagged client detail panel | Counsellor | Load client details, appointment history, emotion history | Client profile summary, risk flag details, appointment history, emotion graph. |
| Risk review decision UI | Counsellor | Enter review note, save review decision | Review note/status controls, save button, review saved success. |
| Task creation panel | Counsellor | Create intervention task from risk flag | Task title, priority, due date, notes, create button, incomplete task error, task created success. |

## 6. Educational Resource Library Module

Covered use cases: `ER01 Manage Resource Library`, `ER02 Access Learning Materials`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Learning materials management page | Admin | Load learning materials page and resource status | Upload form, current resource count, resource metadata summary. |
| Upload learning material form | Admin | Enter resource details, validate, create resource | Title, description, category, type, duration label, URL/file, visibility, upload button. |
| Resource upload states | Admin | Missing title/URL, invalid URL, upload success | Missing title or URL error, invalid URL error, upload success message. |
| Client resource library page | Client | Load published resources | Resource cards/list, category filter, search keyword, resource type/duration labels. |
| Resource search/filter result state | Client | Search/filter materials | Filtered resource list, no matching resource message. |
| Open selected resource state | Client | Open learning material and record access log | Open resource action, selected material URL, resource unavailable error. |

## 7. Peer Support Forum Module

Covered use cases: `PS01 Submit Forum Post`, `PS02 Moderate Forum`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Peer support forum create post form | Client | Open create post form, load active categories | Title, category dropdown, content field, submit button. |
| Forum post validation state | Client | Missing title/content | Missing post details error. |
| Forum post safety result states | Client | Safe content is published, unsafe content queued for review | Published confirmation, queued-for-review message. |
| Forum moderation dashboard | Admin | Open moderation page, load dashboard posts and events | Management filters, unsafe post queue, all forum posts, moderation event log. |
| Forum moderation filtering state | Admin | Filter forum posts by criteria | Matching forum post list, no posts found message. |
| Moderate selected post dialog | Admin | Select moderation action, confirm moderation | Action selector, reason field, confirmation dialog. |
| Moderation result states | Admin | Update post status, create moderation event | Moderation success message, moderation action failed error. |

## 8. Psychometric Self-Assessment Module

Covered use cases: `SA01 Take Psychometric Test`, `SA02 View Triage Dashboard`, `SA03 Manage Test`.

| UI / Feature To Capture | Main Actor | Sequence Flow Coverage | Important UI Components / States |
| --- | --- | --- | --- |
| Psychometric test selection page | Client | Load available published tests | Available test list/cards, test title/category/estimated duration. |
| Test question and answer UI | Client | Load questions/options, select answers | Question list, radio/option controls, progress indicator. |
| Submit psychometric test confirmation | Client | Submit/review answers, confirm submission | Confirmation dialog, submit button. |
| Psychometric result summary | Client | Calculate score, risk level, interpretation, recommendation | Total score, score percent, risk level, AI summary, support recommendation. |
| Incomplete answers state | Client | Required questions not answered | Incomplete answers message. |
| Psychometric triage dashboard | Counsellor | Load latest submissions and client profiles | Latest submission list, filters, risk level labels, client summary. |
| Triage search/filter state | Counsellor | Search/filter submissions | Filtered results, no triage results found message. |
| Submission detail page/panel | Counsellor | Open submission details, load answers/test/client/risk flags | Submission details, answer records, client profile, open psychometric risk flags. |
| Submission cannot load state | Counsellor | Submission missing or inaccessible | Submission cannot be loaded error. |
| Testing materials management page | Admin | Load testing materials page and current test summary | Upload PDF form, current test count, available testing materials. |
| Generate test from PDF UI | Admin | Upload PDF, validate file, generate questions/options | Test title, PDF upload, generate button, generated test success message with test code and question count. |
| Test generation error states | Admin | Missing title/PDF, unsupported file type | Missing title or PDF error, unsupported file type error. |

## Minimum Screens To Draw If Time Is Limited

If you cannot design every state, prioritize these core screens because they cover the most sequence-diagram flow:

| Priority | Screen / Feature | Why It Is Important |
| --- | --- | --- |
| 1 | Smart Appointment Form | Covers booking, slot selection, declaration creation, online link, errors, and booking summary. |
| 2 | Slot Manager | Covers manual slots, bulk generation, CSV import, draft changes, save confirmation, and slot errors. |
| 3 | Appointment Queue / Verification | Covers admin/counsellor review, appointment status transitions, and notification flow. |
| 4 | Dashboard Emotion Tracker + Emotion History Graph | Covers CT01 and CT03 core client tracking feature. |
| 5 | AI Counsellor Chatbot | Covers AI response, chat save, risk detection, and counsellor review trigger. |
| 6 | Caseload / Flagged Client Details | Covers counsellor investigation, risk review, emotion history, and intervention task creation. |
| 7 | Declaration Form + Declaration Review | Covers DC01, DC02, and DC03 end-to-end. |
| 8 | Attendance Record + QR/Online Attendance States | Covers manual, physical QR, and online auto-log attendance. |
| 9 | Psychometric Test + Result Summary | Covers test-taking, scoring, risk flag creation, and recommendation. |
| 10 | Psychometric Triage Dashboard | Covers counsellor review of psychometric submissions. |
| 11 | Forum Post + Forum Moderation | Covers client post submission and admin moderation. |
| 12 | Resource Library Access + Admin Upload | Covers educational resource management and client access logging. |
| 13 | User/Profile Management Screens | Covers onboarding counsellor, finding client profile, and managing locked/admin profile information. |

## Suggested UI Design Deliverables

For the SRS/UI design section, create:

| Deliverable | Suggested Coverage |
| --- | --- |
| Sitemap / navigation flow | Show role-based navigation for Client, Admin, and Counsellor. |
| Wireframes | One wireframe per core screen listed above. |
| Main user flows | Appointment booking, attendance, declaration, chatbot/risk, psychometric test, forum, and resource access. |
| UI state samples | At least one success, one validation error, one empty state, one confirmation modal, and one access/unavailable state. |
| Role-based access notes | Which screens are Client-only, Admin-only, Counsellor-only, or shared. |

