# PsyCare 2.0 Sequence Class / Function Inventory

This document records the classes, lifelines, and functions identified from sequence diagram guidance. It is intended to help construct or update the domain class diagram later.

The inventories are grouped by use case and module:

- View
- Controller
- Model
- Database
- External Service, when required

## UM01: Onboard Counselor

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `users`, `counsellors`, `counselling_locations`
- Key relationships:
  - `counsellors.user_id -> users.id`
  - `counsellors.location_id -> counselling_locations.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `counsellorPPsiPage : <<View>>` | `openCounsellorPPsiPage()`, `displayRecordsAndFilters()`, `displayAddCounsellorForm()`, `enterCounsellorDetails()`, `clickSave()`, `showRequiredFieldsError()`, `showConfirmSaveDialog()`, `confirmSave()`, `showDuplicateRecordError()`, `showSuccessMessage()`, `enterSearchOrFilter()`, `displayMatchingRecords()`, `displayNoMatchingResults()`, `cancelOperation()`, `hideFormOrReturnPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `counsellorController : <<Controller>>` | `loadCounsellorList()`, `returnCounsellorList()`, `saveCounsellor(formData)`, `validateCounsellorDetails()`, `returnValidationError()`, `requestSaveConfirmation()`, `confirmSaveCounsellor(formData)`, `returnDuplicateError()`, `returnSuccess()`, `searchCounsellors(criteria)`, `returnFilteredRecords(records)` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `counsellor : <<Model>>` | `getCounsellors()`, `checkDuplicate(ppsiNo, workerNo, email)`, `createCounsellorProfile(formData, userId)`, `findByCriteria(criteria)` |
| `user : <<Model>>` | `createOrLinkCounsellorUser(formData)` |
| `counsellingLocation : <<Model>>` | `findLocation(locationId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT counsellors`, `SELECT counsellors WHERE ppsi_no OR worker_no OR email`, `SELECT counselling_locations`, `INSERT users`, `INSERT counsellors`, `SELECT counsellors WHERE criteria` |

### External Service

Not required for UM01.

### Domain Class Diagram Notes

The main domain classes from UM01 are:

```text
Counsellor
User
CounsellingLocation
```

For the domain class diagram, associate `Counsellor` with `User` and `CounsellingLocation`:

```text
Counsellor --> User
Counsellor --> CounsellingLocation
```

## UM02: Find Client Profile

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `users`, `clients`, `appointments`, `declarations`
- Key relationships:
  - `clients.user_id -> users.id`
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `declarations.client_id -> clients.id`
  - `declarations.appointment_id -> appointments.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounselor : <<Actor>>` | `openClientInformationOrCaseloadPage()`, `enterSearchOrFilter()`, `selectClientRecord()`, `cancelOperation()` |
| `clientProfilePage : <<View>>` | `displayClientRecordsAndFilters()`, `displaySearchFields()`, `displayInvalidSearchError()`, `displayNoMatchingProfiles()`, `displayMatchingProfiles()`, `displayAccessDenied()`, `redirectToPreviousPage()`, `displayClientProfileSections()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfileController : <<Controller>>` | `loadClientRecords()`, `returnClientRecordList()`, `searchClientProfiles(criteria)`, `validateSearchCriteria(criteria)`, `returnInvalidSearchError()`, `returnNoMatchingProfiles()`, `returnMatchingProfiles(records)`, `viewClientProfile(clientId)`, `verifyProfilePermission(userId, clientId)`, `returnAccessDenied()`, `returnClientProfileDetails(profileDetails)` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Model>>` | `getClientSummaries()`, `findByCriteria(criteria)`, `findProfileById(clientId)` |
| `userAccount : <<Model>>` | `checkViewPermission(userId, clientId)` |
| `appointment : <<Model>>` | `getAppointmentsByClient(clientId)` |
| `declaration : <<Model>>` | `getDeclarationsByClient(clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients`, `SELECT clients WHERE criteria`, `SELECT users`, `SELECT appointments WHERE client_id`, `SELECT declarations WHERE client_id` |

### External Service

Not required for UM02.

### Domain Class Diagram Notes

The main domain classes from UM02 are:

```text
Client
User
Appointment
Declaration
```

For the domain class diagram, associate `Client` with `User`, `Appointment`, and `Declaration`:

```text
Client --> User
Client --> Appointment
Client --> Declaration
Appointment --> User
Declaration --> Appointment
```

## UM03: Manage User Profile

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `users`, `clients`, `appointments`, `declarations`
- Key relationships:
  - `clients.user_id -> users.id`
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `declarations.client_id -> clients.id`
  - `declarations.appointment_id -> appointments.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientUser : <<Actor>>` | `openMyAccount()`, `switchProfileTab()`, `goBack()` |
| `admin : <<Actor>>` | `openClientInformationPage()`, `clickAddOrEditClient()`, `enterClientProfileDetails()`, `clickRegisterOrUpdate()`, `confirmSave()`, `selectClientRecord()`, `updateProfileTabFields()`, `clickSaveTab()`, `cancelOrGoBack()` |
| `myAccountPage : <<View>>` | `displayLockedClientInformationForm()`, `displayProfileLockedNotice()`, `displayReadOnlyTabFields()`, `returnToPreviousPage()` |
| `clientInformationPage : <<View>>` | `displayClientInformationList()`, `displayEditableClientForm()`, `showProfileValidationError()`, `showDuplicateProfileError()`, `showSaveConfirmationDialog()`, `showProfileSaveSuccess()`, `displayClientDetailTabs()`, `showTabUpdateSuccess()`, `returnToListOrDetailView()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `userProfileController : <<Controller>>` | `loadMyAccount(userId)`, `returnLockedProfile(profileDetails)`, `loadClientInformationPage()`, `returnClientInformationList()`, `createOrEditClientProfile(formData)`, `validateProfileDetails(formData)`, `checkProfileConflict(formData)`, `requestSaveConfirmation()`, `saveClientProfile(formData)`, `returnProfileValidationError()`, `returnDuplicateProfileError()`, `returnProfileSaveSuccess()`, `loadClientProfileTabs(clientId)`, `updateClientProfileTabs(tabData)`, `returnTabUpdateSuccess()`, `returnWithoutSaving()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfile : <<Model>>` | `findByUserId(userId)`, `getClientProfiles()`, `findProfileById(clientId)`, `checkDuplicateIdentifiers(email, phone, matrixNo, workerNo)`, `createProfile(formData)`, `updateProfile(clientId, formData)`, `updateProfileTabs(clientId, tabData)` |
| `userAccount : <<Model>>` | `findAccount(userId)`, `checkAdminPermission(userId)` |
| `appointment : <<Model>>` | `createOrUpdateAppointmentInfo(formData, clientId)`, `getAppointmentsByClient(clientId)` |
| `declaration : <<Model>>` | `getDeclarationsByClient(clientId)`, `updateConfirmationInfo(clientId, confirmationData)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT users`, `SELECT clients WHERE user_id`, `SELECT clients`, `SELECT clients WHERE id`, `SELECT clients WHERE email OR phone OR matrix_no OR worker_no`, `INSERT clients`, `UPDATE clients`, `INSERT appointments`, `UPDATE appointments`, `SELECT appointments WHERE client_id`, `SELECT declarations WHERE client_id`, `UPDATE declarations` |

### External Service

Not required for UM03.

### Domain Class Diagram Notes

The main domain classes from UM03 are:

```text
Client
User
Appointment
Declaration
```

For the domain class diagram, associate `Client` with `User`, `Appointment`, and `Declaration`:

```text
Client --> User
Client --> Appointment
Client --> Declaration
Appointment --> User
Declaration --> Appointment
```

## TA02: Record Attendance

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `appointment_participants`, `attendance_sessions`, `attendance_participants`, `attendance_events`, `clients`, `users`
- Key relationships:
  - `appointment_participants.appointment_id -> appointments.id`
  - `appointment_participants.client_id -> clients.id`
  - `attendance_sessions.appointment_id -> appointments.id`
  - `attendance_participants.attendance_session_id -> attendance_sessions.id`
  - `attendance_participants.client_id -> clients.id`
  - `attendance_participants.recorded_by_user_id -> users.id`
  - `attendance_events.attendance_session_id -> attendance_sessions.id`
  - `attendance_events.client_id -> clients.id`
  - `attendance_events.user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounselor : <<Actor>>` | `openAppointmentRecord()`, `selectAttendanceRecord()`, `selectAttendanceStatus()`, `clickSaveAttendance()`, `changeSessionMode()`, `selectParticipants()`, `cancelOperation()` |
| `attendanceRecordPage : <<View>>` | `displayAttendanceRecordPanel()`, `displayAttendanceOptions()`, `showMissingStatusError()`, `showInvalidAppointmentReferenceError()`, `showInvalidGroupSelectionError()`, `showAttendanceSaveSuccess()`, `closeAttendancePanel()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `attendanceController : <<Controller>>` | `loadAttendanceRecord(appointmentRef)`, `validateAppointmentReference(appointmentRef)`, `returnAttendanceRecordPanel(attendanceDetails)`, `saveAttendanceStatus(attendanceData)`, `validateParticipantStatuses(attendanceData)`, `updateSessionModeAndParticipants(sessionData)`, `validateGroupParticipantSelection(participants)`, `recordManualAttendance(attendanceData)`, `returnMissingStatusError()`, `returnInvalidAppointmentReferenceError()`, `returnInvalidGroupSelectionError()`, `returnAttendanceSaveSuccess()`, `closeAttendanceRecordPanel()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointment : <<Model>>` | `findByReference(referenceNo)`, `getSessionDetails(appointmentId)`, `validateSessionType(appointmentId)` |
| `appointmentParticipant : <<Model>>` | `getParticipantsByAppointment(appointmentId)`, `updateParticipantList(appointmentId, participantIds)` |
| `attendanceSession : <<Model>>` | `findOrCreateByAppointment(appointmentId)`, `updateSessionMode(sessionId, sessionMode)` |
| `attendanceParticipant : <<Model>>` | `getAttendanceParticipants(sessionId)`, `updateParticipantStatus(sessionId, clientId, status, method)`, `syncParticipants(sessionId, participantIds)` |
| `attendanceEvent : <<Model>>` | `recordManualUpdateEvent(sessionId, clientId, userId, metadata)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT appointments WHERE reference_no`, `SELECT appointment_participants WHERE appointment_id`, `SELECT attendance_sessions WHERE appointment_id`, `INSERT attendance_sessions`, `SELECT attendance_participants WHERE attendance_session_id`, `INSERT attendance_participants`, `UPDATE attendance_participants`, `INSERT attendance_events`, `UPDATE appointment_participants` |

### External Service

Not required for TA02.

### Domain Class Diagram Notes

The main domain classes from TA02 are:

```text
Appointment
AppointmentParticipant
AttendanceSession
AttendanceParticipant
AttendanceEvent
Client
User
```

For the domain class diagram, associate `Appointment` with appointment and attendance participants:

```text
Appointment --> AppointmentParticipant
AppointmentParticipant --> Client
Appointment --> AttendanceSession
AttendanceSession --> AttendanceParticipant
AttendanceParticipant --> Client
AttendanceParticipant --> User
AttendanceEvent --> AttendanceSession
AttendanceEvent --> Client
AttendanceEvent --> User
```

## TA03: Scan Physical QR Code

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `attendance_sessions`, `attendance_participants`, `attendance_events`, `clients`, `users`
- Key relationships:
  - `attendance_sessions.appointment_id -> appointments.id`
  - `attendance_participants.attendance_session_id -> attendance_sessions.id`
  - `attendance_participants.client_id -> clients.id`
  - `attendance_events.attendance_session_id -> attendance_sessions.id`
  - `attendance_events.client_id -> clients.id`
  - `attendance_events.user_id -> users.id`
  - `appointments.client_id -> clients.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `scanPhysicalQrCode()`, `confirmAttendance()`, `cancelOperation()` |
| `physicalQrAttendancePage : <<View>>` | `openQrAttendancePage(qrPayload)`, `displayAttendanceConfirmationPage()`, `requestClientIdentityConfirmation()`, `showInvalidOrExpiredQrError()`, `showAlreadyCheckedInMessage()`, `showUnauthorizedScanError()`, `showNonPhysicalSessionError()`, `showAttendanceConfirmation()`, `redirectToDashboardOrPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `attendanceController : <<Controller>>` | `loadQrAttendancePage(qrPayload)`, `validateQrPayload(qrPayload)`, `validatePhysicalSession(appointmentId)`, `returnAttendanceConfirmationPage(sessionDetails)`, `confirmPhysicalAttendance(qrPayload, clientId)`, `identifyClient(qrPayload, clientId)`, `checkDuplicateCheckIn(sessionId, clientId)`, `checkClientAssignedToSession(sessionId, clientId)`, `markPhysicalAttendancePresent(sessionId, clientId)`, `returnInvalidOrExpiredQrError()`, `returnAlreadyCheckedInMessage()`, `returnUnauthorizedScanError()`, `returnNonPhysicalSessionError()`, `returnAttendanceConfirmation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointment : <<Model>>` | `findByReference(referenceNo)`, `validatePhysicalSession(appointmentId)` |
| `attendanceSession : <<Model>>` | `findActiveQrSession(qrTokenHash)`, `validateAttendanceWindow(sessionId)` |
| `attendanceParticipant : <<Model>>` | `findParticipant(sessionId, clientId)`, `checkAlreadyPresent(sessionId, clientId)`, `markPresentByQr(sessionId, clientId)` |
| `attendanceEvent : <<Model>>` | `recordQrScanEvent(sessionId, clientId, userId, metadata)` |
| `clientProfile : <<Model>>` | `identifyClient(clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT attendance_sessions WHERE qr_token_hash`, `SELECT appointments WHERE id`, `SELECT clients WHERE id`, `SELECT attendance_participants WHERE attendance_session_id AND client_id`, `UPDATE attendance_participants`, `INSERT attendance_events` |

### External Service

Not required for TA03.

### Domain Class Diagram Notes

The main domain classes from TA03 are:

```text
Appointment
AttendanceSession
AttendanceParticipant
AttendanceEvent
Client
User
```

For the domain class diagram, associate `AttendanceSession` with `Appointment`, `AttendanceParticipant`, and `AttendanceEvent`:

```text
AttendanceSession --> Appointment
AttendanceSession --> AttendanceParticipant
AttendanceParticipant --> Client
AttendanceEvent --> AttendanceSession
AttendanceEvent --> Client
AttendanceEvent --> User
Appointment --> Client
```

## TA04: Auto-log Attendance(Online)

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `attendance_sessions`, `attendance_participants`, `attendance_events`, `clients`, `users`
- Key relationships:
  - `attendance_sessions.appointment_id -> appointments.id`
  - `attendance_participants.attendance_session_id -> attendance_sessions.id`
  - `attendance_participants.client_id -> clients.id`
  - `attendance_events.attendance_session_id -> attendance_sessions.id`
  - `attendance_events.client_id -> clients.id`
  - `attendance_events.user_id -> users.id`
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientOrCounselor : <<Actor>>` | `joinOnlineSession()`, `leaveBeforeJoin()` |
| `onlineSessionPage : <<View>>` | `openMeetingLink(appointmentRef)`, `notifyAttendanceView()`, `showAutoLogError()`, `showInvalidOnlineContextError()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `onlineAttendanceController : <<Controller>>` | `detectOnlineJoinEvent(joinPayload)`, `retrieveAppointmentReference(joinPayload)`, `validateOnlineJoinEvent(joinPayload)`, `validateUserIdentity(userId)`, `validateOnlineSession(appointmentRef)`, `checkDuplicateOnlineAttendance(sessionId, clientId)`, `autoLogOnlineAttendance(sessionId, clientId, userId)`, `returnAutoLogSuccess()`, `returnUnverifiedJoinError()`, `returnInvalidOnlineContextError()`, `returnDuplicateOnlineAttendance()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointment : <<Model>>` | `findByReference(referenceNo)`, `validateOnlineSession(appointmentId)`, `validateMeetingLink(appointmentId, meetingLink)` |
| `userAccount : <<Model>>` | `findAccount(userId)`, `validateUserIdentity(userId)` |
| `attendanceSession : <<Model>>` | `findByAppointment(appointmentId)` |
| `attendanceParticipant : <<Model>>` | `findParticipant(sessionId, clientId)`, `checkAlreadyPresent(sessionId, clientId)`, `markPresentByOnlineAuto(sessionId, clientId, userId)` |
| `attendanceEvent : <<Model>>` | `recordOnlineJoinEvent(sessionId, clientId, userId, metadata)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT appointments WHERE reference_no`, `SELECT users WHERE id`, `SELECT attendance_sessions WHERE appointment_id`, `SELECT attendance_participants WHERE attendance_session_id AND client_id`, `UPDATE attendance_participants`, `INSERT attendance_events` |

### External Service

Not required for TA04.

### Domain Class Diagram Notes

The main domain classes from TA04 are:

```text
Appointment
User
AttendanceSession
AttendanceParticipant
AttendanceEvent
Client
```

For the domain class diagram, associate `AttendanceSession` with `Appointment`, `AttendanceParticipant`, and `AttendanceEvent`:

```text
AttendanceSession --> Appointment
AttendanceSession --> AttendanceParticipant
AttendanceParticipant --> Client
AttendanceParticipant --> User
AttendanceEvent --> AttendanceSession
AttendanceEvent --> Client
AttendanceEvent --> User
Appointment --> User
Appointment --> Client
```

## DC01: View Declaration Form

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `declarations`, `clients`, `appointments`, `users`
- Key relationships:
  - `declarations.client_id -> clients.id`
  - `declarations.appointment_id -> appointments.id`
  - `declarations.verified_by_user_id -> users.id`
  - `clients.user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openConfirmationTab()`, `reviewDeclarationDetails()` |
| `declarationFormPage : <<View>>` | `displayDeclarationStatement()`, `displayClientIdentity()`, `displayDeclarationStatus()`, `displaySubmittedDate()`, `showDeclarationUnavailableError()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `declarationController : <<Controller>>` | `loadDeclarationForm(clientId, appointmentId)`, `getClientIdentity(clientId)`, `getCurrentDeclaration(clientId, appointmentId)`, `returnDeclarationForm(declarationDetails)`, `returnDeclarationUnavailableError()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |
| `declaration : <<Model>>` | `findCurrentDeclaration(clientId, appointmentId)` |
| `appointment : <<Model>>` | `findAppointmentForDeclaration(appointmentId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT declarations WHERE client_id AND appointment_id`, `SELECT appointments WHERE id` |

### External Service

Not required for DC01.

### Domain Class Diagram Notes

The main domain classes from DC01 are:

```text
Declaration
Client
Appointment
User
```

For the domain class diagram, associate `Declaration` with `Client`, `Appointment`, and `User`:

```text
Declaration --> Client
Declaration --> Appointment
Declaration --> User
Client --> User
```

## DC02: Submit Declaration

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `declarations`, `clients`, `appointments`, `users`
- Key relationships:
  - `declarations.client_id -> clients.id`
  - `declarations.appointment_id -> appointments.id`
  - `clients.user_id -> users.id`
- Included use case:
  - `DC01 View Declaration Form`
- Follow-up workflow:
  - `DC03 Verify Declaration`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `selectDeclarationCheckbox()`, `clickSubmitDeclaration()`, `resetOrLeaveWithoutSubmitting()`, `cancelOrNavigateAway()` |
| `declarationFormPage : <<View>>` | `displayDeclarationStatement()`, `displayDeclarationCheckbox()`, `displayCurrentDeclarationStatus()`, `displaySubmittedDate()`, `showCheckboxRequiredError()`, `showDeclarationUnavailableError()`, `showSubmittedStatus()`, `redirectOrRemainOnDeclarationSection()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `declarationController : <<Controller>>` | `loadDeclarationForm(clientId, appointmentId)`, `submitDeclaration(declarationData)`, `validateDeclarationCheckbox(isChecked)`, `validateRequiredDeclarationInfo(clientId, appointmentId)`, `recordSubmittedDeclaration(declarationData)`, `exposeForDeclarationVerification(declarationId)`, `returnCheckboxRequiredError()`, `returnDeclarationUnavailableError()`, `returnSubmittedDeclarationStatus()`, `returnWithoutSubmitting()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `declaration : <<Model>>` | `findCurrentDeclaration(clientId, appointmentId)`, `validateRequiredInfo(clientId, appointmentId)`, `markSubmitted(declarationId)` |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |
| `appointment : <<Model>>` | `findAppointmentForDeclaration(appointmentId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT declarations WHERE client_id AND optional appointment_id`, `SELECT appointments WHERE id`, `UPDATE declarations` |

### External Service

Not required for DC02.

### Domain Class Diagram Notes

The main domain classes from DC02 are:

```text
Declaration
Client
Appointment
User
```

For the domain class diagram, associate `Declaration` with `Client`, `Appointment`, and `User`:

```text
Declaration --> Client
Declaration --> Appointment
Client --> User
```

## DC03: Verify Declaration

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `declarations`, `declaration_verification_events`, `clients`, `users`
- Key relationships:
  - `declarations.client_id -> clients.id`
  - `declarations.verified_by_user_id -> users.id`
  - `declaration_verification_events.declaration_id -> declarations.id`
  - `declaration_verification_events.verifier_user_id -> users.id`
  - `clients.user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounselor : <<Actor>>` | `openSubmittedDeclaration()`, `reviewSubmittedDeclaration()`, `selectVerifyOrApprove()`, `enterCorrectionNote()`, `requestCorrectionOrReject()`, `cancelOperation()` |
| `declarationReviewPage : <<View>>` | `displayDeclarationReviewDetails()`, `displayReviewStatusBlocks()`, `showIncompleteDeclarationError()`, `showAlreadyVerifiedMessage()`, `showVerificationSuccess()`, `showCorrectionRequiredSuccess()`, `redirectToPreviousReviewPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `declarationVerificationController : <<Controller>>` | `loadSubmittedDeclaration(declarationId)`, `validateVerifierPermission(userId)`, `returnDeclarationReviewDetails(reviewDetails)`, `verifyDeclaration(declarationId, verifierUserId)`, `requestDeclarationCorrection(declarationId, verifierUserId, correctionNote)`, `validateDeclarationCompleteness(declarationId)`, `checkAlreadyVerified(declarationId)`, `updateDeclarationStatus(declarationId, status)`, `recordVerificationEvent(declarationId, verifierUserId, action, note)`, `returnIncompleteDeclarationError()`, `returnAlreadyVerifiedMessage()`, `returnVerificationSuccess()`, `returnCorrectionRequiredSuccess()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `declaration : <<Model>>` | `findSubmittedDeclaration(declarationId)`, `validateCompleteness(declarationId)`, `checkAlreadyVerified(declarationId)`, `markVerified(declarationId, verifierUserId)`, `markCorrectionRequired(declarationId, correctionNote)` |
| `declarationVerificationEvent : <<Model>>` | `createVerificationEvent(declarationId, verifierUserId, action, note)` |
| `clientProfile : <<Model>>` | `findProfileById(clientId)`, `markDeclarationReviewRequired(clientId)` |
| `userAccount : <<Model>>` | `checkVerifierPermission(userId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT declarations WHERE id`, `SELECT clients WHERE id`, `SELECT users WHERE id`, `UPDATE declarations`, `INSERT declaration_verification_events` |

### External Service

Not required for DC03.

### Domain Class Diagram Notes

The main domain classes from DC03 are:

```text
Declaration
DeclarationVerificationEvent
Client
User
```

For the domain class diagram, associate `DeclarationVerificationEvent` with `Declaration` and `User`:

```text
Declaration --> Client
Declaration --> User
DeclarationVerificationEvent --> Declaration
DeclarationVerificationEvent --> User
Client --> User
```

## CT01: Log Daily Emotion

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `emotion_logs`, `clients`
- Key relationships:
  - `emotion_logs.client_id -> clients.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openDashboard()`, `selectEmotionDate()`, `enterEmotionScore()`, `clickSaveEmotion()`, `cancelOperation()` |
| `dashboardPage : <<View>>` | `displayDateSelector()`, `displayEmotionScoreInput()`, `displayEmotionTrend()`, `displaySaveControls()`, `showInvalidEmotionScoreError()`, `showFutureDateError()`, `showEmotionLogSuccess()`, `displayMeaningfulWords()`, `remainOnDashboard()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `emotionLogController : <<Controller>>` | `loadDashboardEmotionTracker(clientId)`, `saveEmotionScore(emotionData)`, `validateEmotionScore(score)`, `validateEmotionDate(date)`, `generateMeaningfulWords(score)`, `returnInvalidEmotionScoreError()`, `returnFutureDateError()`, `returnEmotionLogSuccess(meaningfulWords)` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `emotionLog : <<Model>>` | `findByClientAndDate(clientId, date)`, `createEmotionScore(clientId, date, score)`, `updateEmotionScore(clientId, date, score)` |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT emotion_logs WHERE client_id AND logged_at date`, `INSERT emotion_logs`, `UPDATE emotion_logs` |

### External Service

Not required for CT01.

### Domain Class Diagram Notes

The main domain classes from CT01 are:

```text
EmotionLog
Client
```

For the domain class diagram, associate `EmotionLog` with `Client`:

```text
EmotionLog --> Client
```

## CT03: View Emotion History

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `emotion_logs`, `clients`, `risk_flags`, `counsellors`, `users`
- Key relationships:
  - `emotion_logs.client_id -> clients.id`
  - `risk_flags.client_id -> clients.id`
  - `risk_flags.assigned_counsellor_id -> counsellors.id`
  - `clients.user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openDashboard()`, `selectDateRange()` |
| `counselor : <<Actor>>` | `selectFlaggedClient()`, `selectDateRange()` |
| `dashboardPage : <<View>>` | `displayEmotionScoresGraph()`, `displayDateRangeFilter()`, `showFilteredEmotionHistory()`, `showNoEmotionHistoryMessage()` |
| `caseloadPage : <<View>>` | `displayFlaggedClientList()`, `displayCaseloadDetailPanel()`, `showFilteredEmotionHistory()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `emotionHistoryController : <<Controller>>` | `loadEmotionHistory(userId, selectedClientId)`, `verifyEmotionHistoryPermission(userId, selectedClientId)`, `loadFlaggedClientEmotionHistory(counselorId, clientId)`, `filterEmotionHistory(clientId, dateRange)`, `returnEmotionHistory(records)`, `returnFilteredEmotionHistory(records)`, `returnNoEmotionHistoryMessage()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `emotionLog : <<Model>>` | `findByClient(clientId)`, `findByClientAndDateRange(clientId, startDate, endDate)` |
| `clientProfile : <<Model>>` | `findProfileByUserId(userId)`, `findProfileById(clientId)` |
| `riskFlag : <<Model>>` | `findActiveFlagForClient(clientId)`, `verifyCounselorAccess(counselorId, clientId)` |
| `userAccount : <<Model>>` | `checkEmotionHistoryPermission(userId, clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE user_id`, `SELECT clients WHERE id`, `SELECT risk_flags WHERE client_id`, `SELECT emotion_logs WHERE client_id`, `SELECT emotion_logs WHERE client_id AND logged_at BETWEEN date_range`, `SELECT users WHERE id` |

### External Service

Not required for CT03.

### Domain Class Diagram Notes

The main domain classes from CT03 are:

```text
EmotionLog
Client
RiskFlag
Counsellor
User
```

For the domain class diagram, associate `EmotionLog` and `RiskFlag` with `Client`:

```text
EmotionLog --> Client
RiskFlag --> Client
RiskFlag --> Counsellor
Client --> User
```

## CT04: Investigate Flagged Client

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `risk_flags`, `counsellor_tasks`, `clients`, `counsellors`, `appointments`, `users`
- Key relationships:
  - `risk_flags.client_id -> clients.id`
  - `risk_flags.assigned_counsellor_id -> counsellors.id`
  - `risk_flags.reviewed_by_user_id -> users.id`
  - `counsellor_tasks.counsellor_id -> counsellors.id`
  - `counsellor_tasks.client_id -> clients.id`
  - `counsellor_tasks.risk_flag_id -> risk_flags.id`
  - `appointments.client_id -> clients.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `counselor : <<Actor>>` | `openCaseloadOrTaskBoard()`, `selectFlaggedClient()`, `enterReviewNote()`, `saveReviewDecision()`, `openTaskCreationPanel()`, `enterTaskDetails()`, `createInterventionTask()`, `cancelOperation()` |
| `caseloadPage : <<View>>` | `displayFlaggedClientList()`, `displayRiskIndicators()`, `displayFlaggedClientDetails()`, `showFlaggedClientNotFoundError()`, `showReviewSavedSuccess()`, `showIncompleteTaskDetailsError()`, `showTaskCreatedSuccess()`, `redirectToPreviousCaseloadOrDashboard()` |
| `taskBoardPage : <<View>>` | `displayTaskCreationPanel()`, `showIncompleteTaskDetailsError()`, `showTaskCreatedSuccess()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `flaggedClientController : <<Controller>>` | `loadFlaggedClientList(counselorId)`, `viewFlaggedClient(riskFlagId)`, `saveReviewDecision(riskFlagId, reviewData)`, `validateTaskDetails(taskData)`, `createInterventionTask(taskData)`, `returnFlaggedClientDetails(details)`, `returnFlaggedClientNotFoundError()`, `returnReviewSavedSuccess()`, `returnIncompleteTaskDetailsError()`, `returnTaskCreatedSuccess()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `riskFlag : <<Model>>` | `findAssignedFlags(counselorId)`, `findById(riskFlagId)`, `updateReviewDecision(riskFlagId, reviewData)` |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |
| `appointment : <<Model>>` | `getAppointmentHistoryByClient(clientId)` |
| `counsellorTask : <<Model>>` | `createInterventionTask(counselorId, clientId, riskFlagId, taskData)` |
| `counsellor : <<Model>>` | `findByUserId(userId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT counsellors WHERE user_id`, `SELECT risk_flags WHERE assigned_counsellor_id`, `SELECT risk_flags WHERE id`, `SELECT clients WHERE id`, `SELECT appointments WHERE client_id`, `UPDATE risk_flags`, `INSERT counsellor_tasks` |

### External Service

Not required for CT04.

### Domain Class Diagram Notes

The main domain classes from CT04 are:

```text
RiskFlag
CounsellorTask
Client
Counsellor
Appointment
User
```

For the domain class diagram, associate `RiskFlag` with `Client`, `Counsellor`, and `User`; associate `CounsellorTask` with the selected flag and client:

```text
RiskFlag --> Client
RiskFlag --> Counsellor
RiskFlag --> User
CounsellorTask --> Counsellor
CounsellorTask --> Client
CounsellorTask --> RiskFlag
Appointment --> Client
Counsellor --> User
```

## AS01: Book Appointment

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Reference sequence diagram: `AS01 Sequence Diagram_ Book Appointment.jpg`
- Related tables: `appointments`, `appointment_slots`, `declarations`, `clients`, `users`
- Key relationships:
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `appointments.slot_id -> appointment_slots.id`
  - `declarations.client_id -> clients.id`
  - `declarations.appointment_id -> appointments.id`
- Referenced extension use cases:
  - `AS02 Request follow up`
  - `AS03 Book New Appointment`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openSmartAppointmentForm()`, `selectContinueFollowUp()`, `cancelBooking()`, `submitAppointmentRequest(formData)` |
| `smartAppointmentForm : <<View>>` | `loadBookingForm(clientId)`, `displayBookingForm()`, `redirectToPreviousPage()`, `displayBookingSummary()`, `displayValidationErrors()`, `displaySlotUnavailableMessage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentController : <<Controller>>` | `loadBookingForm(clientId)`, `getAvailableSlots()`, `submitAppointmentRequest(formData)`, `validateAppointmentRequest(formData)`, `checkSlotAvailability(slotId, sessionType)`, `generateReferenceNumber()`, `createAppointment(formData, status)`, `createDeclaration(appointmentId, confirmationDetails)`, `generateMeetingLink(referenceNo)`, `updateMeetingLink(appointmentId, meetingLink)`, `returnBookingSummary(summary)`, `returnValidationError()`, `returnSlotUnavailableError()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfile : <<Model>>` | `findClientProfileById(clientId)` |
| `appointmentSlot : <<Model>>` | `getAvailableSlots()`, `checkSlotAvailability(slotId, sessionType)` |
| `appointment : <<Model>>` | `generateReferenceNumber()`, `createAppointment(formData, status)`, `updateMeetingLink(appointmentId, meetingLink)` |
| `declaration : <<Model>>` | `createDeclaration(appointmentId, confirmationDetails)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT appointment_slots WHERE availability criteria`, `SELECT appointment_slots WHERE id`, `INSERT appointments`, `INSERT declarations`, `UPDATE appointments SET meeting_link` |

### External Service

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `meetingLinkService : <<Service>>` | `generateMeetingLink(referenceNo)` |

### Domain Class Diagram Notes

The main domain classes from AS01 are:

```text
Appointment
AppointmentSlot
Declaration
Client
User
MeetingLinkService
```

For the domain class diagram, associate `Appointment` with `Client`, `AppointmentSlot`, `Declaration`, and `User`:

```text
Appointment --> Client
Appointment --> User
Appointment --> AppointmentSlot
Declaration --> Appointment
Declaration --> Client
Appointment --> MeetingLinkService
```

## AS02: Request follow up

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `appointment_slots`, `clients`, `counsellors`, `counselling_locations`, `users`
- Key relationships:
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `appointments.previous_appointment_id -> appointments.id`
  - `appointments.slot_id -> appointment_slots.id`
  - `appointments.counsellor_id -> counsellors.id`
  - `appointments.location_id -> counselling_locations.id`
  - `appointment_slots.counsellor_id -> counsellors.id`
  - `appointment_slots.location_id -> counselling_locations.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openAppointmentRecords()`, `selectFollowUpAction()`, `selectAnotherAppointmentRecord()`, `selectNewDateSlotAndSessionType()`, `clickSubmitFollowUp()`, `cancelOperation()` |
| `appointmentRecordsPage : <<View>>` | `displayAppointmentRecords()`, `displaySelectedAppointmentSummary()`, `showFollowUpUnavailableMessage()`, `showAppointmentNotEligibleMessage()`, `redirectToAppointmentRecords()` |
| `smartAppointmentForm : <<View>>` | `openFollowUpMode()`, `lockPreviousAppointmentReference()`, `displayFollowUpForm()`, `showNoAvailableFollowUpSlotError()`, `showFollowUpBookingSummary()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `followUpAppointmentController : <<Controller>>` | `loadAppointmentRecords(clientId)`, `selectFollowUpAppointment(referenceNo)`, `validateFollowUpEligibility(appointmentId)`, `openFollowUpForm(previousAppointmentId)`, `validateFollowUpSlot(slotId, sessionType)`, `submitFollowUpRequest(followUpData)`, `returnFollowUpUnavailableMessage()`, `returnAppointmentNotEligibleMessage()`, `returnNoAvailableFollowUpSlotError()`, `returnFollowUpBookingSummary(summary)` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointment : <<Model>>` | `findEligibleFollowUpRecords(clientId)`, `findByReference(referenceNo)`, `checkFollowUpStatus(appointmentId)`, `createFollowUpRequest(followUpData)` |
| `appointmentSlot : <<Model>>` | `findAvailableSlot(slotId, sessionType)`, `reserveSlotForRequest(slotId)` |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |
| `counsellor : <<Model>>` | `findBySlot(slotId)` |
| `counsellingLocation : <<Model>>` | `findBySlot(slotId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT appointments WHERE client_id`, `SELECT appointments WHERE reference_no`, `SELECT appointment_slots WHERE id`, `SELECT clients WHERE id`, `SELECT counsellors WHERE id`, `SELECT counselling_locations WHERE id`, `INSERT appointments` |

### External Service

Not required for AS02.

### Domain Class Diagram Notes

The main domain classes from AS02 are:

```text
Appointment
AppointmentSlot
Client
Counsellor
CounsellingLocation
User
```

For the domain class diagram, associate the follow-up appointment with the previous appointment and selected slot:

```text
Appointment --> Appointment
Appointment --> AppointmentSlot
Appointment --> Client
Appointment --> User
Appointment --> Counsellor
Appointment --> CounsellingLocation
AppointmentSlot --> Counsellor
AppointmentSlot --> CounsellingLocation
```

## AS03: Book New Appointment

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `appointment_slots`, `appointment_slot_session_types`, `appointment_attachments`, `clients`, `counsellors`, `counselling_locations`, `users`
- Key relationships:
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `appointments.slot_id -> appointment_slots.id`
  - `appointments.counsellor_id -> counsellors.id`
  - `appointments.location_id -> counselling_locations.id`
  - `appointment_slots.counsellor_id -> counsellors.id`
  - `appointment_slots.location_id -> counselling_locations.id`
  - `appointment_slot_session_types.slot_id -> appointment_slots.id`
  - `appointment_attachments.appointment_id -> appointments.id`
  - `appointment_attachments.uploaded_by_user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `clickCreateNewBooking()`, `enterNewAppointmentDetails()`, `selectDateSlotAndSessionType()`, `clickSaveDraft()`, `cancelOperation()` |
| `smartAppointmentForm : <<View>>` | `generateNewReferenceDisplay()`, `displayApplicantInformation()`, `displayRequestInformationFields()`, `displayCalendarAndSlotSelection()`, `displayAttachmentFields()`, `displayConfirmationFields()`, `showNoAvailableSlotError()`, `showIncompleteAppointmentInfoError()`, `showDraftSavedMessage()`, `returnCompletedNewAppointmentDetails()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `newAppointmentController : <<Controller>>` | `startNewAppointment(clientId)`, `generateSessionReferenceNumber()`, `loadAvailableSlots(criteria)`, `validateNewAppointmentDetails(formData)`, `validateSelectedSlot(slotId, sessionType)`, `prepareNewAppointmentDetails(formData)`, `saveDraftAppointment(formData)`, `returnNoAvailableSlotError()`, `returnIncompleteAppointmentInfoError()`, `returnDraftSavedMessage()`, `returnCompletedNewAppointmentDetails(details)` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfile : <<Model>>` | `findProfileById(clientId)` |
| `appointmentSlot : <<Model>>` | `findAvailableSlots(criteria)`, `findSlotById(slotId)`, `checkSessionTypeAllowed(slotId, sessionType)` |
| `appointment : <<Model>>` | `createDraftAppointment(formData)`, `generateReferenceNumber()` |
| `appointmentAttachment : <<Model>>` | `saveDraftAttachment(appointmentId, attachmentData)` |
| `counsellor : <<Model>>` | `findBySlot(slotId)` |
| `counsellingLocation : <<Model>>` | `findBySlot(slotId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT appointment_slots WHERE criteria`, `SELECT appointment_slot_session_types WHERE slot_id`, `SELECT appointment_slots WHERE id`, `SELECT counsellors WHERE id`, `SELECT counselling_locations WHERE id`, `INSERT appointments`, `INSERT appointment_attachments` |

### External Service

Not required for AS03.

### Domain Class Diagram Notes

The main domain classes from AS03 are:

```text
Appointment
AppointmentSlot
AppointmentAttachment
Client
Counsellor
CounsellingLocation
User
```

For the domain class diagram, associate the prepared new appointment with the selected slot and optional attachment:

```text
Appointment --> AppointmentSlot
Appointment --> AppointmentAttachment
Appointment --> Client
Appointment --> User
Appointment --> Counsellor
Appointment --> CounsellingLocation
AppointmentSlot --> Counsellor
AppointmentSlot --> CounsellingLocation
```

## AS04: Manage Slots

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Extension use cases:
  - `AS05 Bulk Generate Slots`
  - `AS06 Import CSV Template`
- Related tables: `slot_generation_batches`, `appointment_slots`, `appointment_slot_session_types`, `counsellors`, `users`
- Key relationships:
  - `slot_generation_batches.created_by_user_id -> users.id`
  - `appointment_slots.batch_id -> slot_generation_batches.id`
  - `appointment_slots.counsellor_id -> counsellors.id`
  - `appointment_slots.created_by_user_id -> users.id`
  - `appointment_slot_session_types.slot_id -> appointment_slots.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounsellor : <<Actor>>` | `openSlotManagerPage()`, `enterManualSlotDetails()`, `clickAddSlot()`, `selectSlotForRemoval()`, `clickRemoveSlot()`, `clickGenerateBulkSlots()`, `uploadCsvFile()`, `clickSaveSlotChanges()`, `cancelSlotManagement()` |
| `slotManagerPage : <<View>>` | `displaySlotManagerPage()`, `displayConfiguredSlotOverview()`, `displayManualAddSlotControls()`, `displayBulkSetupSection()`, `displayCsvImportSection()`, `addManualSlotToDraft(slotDraft)`, `removeSlotFromDraft(slotId)`, `addGeneratedSlotsToDraft(generatedSlots)`, `addImportedSlotsToDraft(importedSlots)`, `markSavedSlotsForRemoval(existingSlots)`, `showDraftChangeMessage()`, `showConfirmSaveDialog()`, `showSaveSuccessMessage()`, `showNoSessionTypeSelectedError()`, `showInvalidSlotTimeError()`, `redirectToPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `slotManagementController : <<Controller>>` | `loadSlotManager(userId)`, `loadConfiguredSlots(filters)`, `addManualSlot(slotData)`, `validateSessionTypes(slotData)`, `validateSlotTime(slotData)`, `checkSlotOverlap(slotData)`, `removeDraftSlot(slotId)`, `markSavedSlotForRemoval(slotId)`, `receiveGeneratedSlotsFromAS05(generatedSlots, slotsMarkedForRemoval)`, `receiveImportedSlotsFromAS06(importedSlots, slotsMarkedForRemoval)`, `saveSlotChanges(draftChanges)`, `createSlotGenerationBatch(batchData)`, `deleteMarkedSavedSlots(slotIds)`, `saveDraftSlots(draftSlots, batchId)`, `saveSlotSessionTypes(slotId, sessionTypes)`, `returnSlotManagerData(slotData)`, `returnDraftChangeMessage()`, `returnSaveSuccessMessage()`, `returnNoSessionTypeSelectedError()`, `returnInvalidSlotTimeError()`, `cancelSlotManagement()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentSlot : <<Model>>` | `findConfiguredSlots(filters)`, `buildManualSlotDraft(slotData)`, `checkOverlap(slotData)`, `markSavedSlotForRemoval(slotId)`, `deleteSlots(slotIds)`, `createSlots(draftSlots, batchId)`, `removeDraftSlot(slotId)` |
| `appointmentSlotSessionType : <<Model>>` | `buildDraftSessionTypes(slotDraft, sessionTypes)`, `createSessionTypes(slotId, sessionTypes)`, `deleteBySlotIds(slotIds)` |
| `slotGenerationBatch : <<Model>>` | `createBatch(batchData)` |
| `counsellor : <<Model>>` | `findActiveCounsellors()`, `findById(counsellorId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT appointment_slots`, `SELECT appointment_slot_session_types WHERE slot_id`, `SELECT counsellors WHERE status`, `SELECT counsellors WHERE id`, `SELECT appointment_slots WHERE date/time/counsellor overlap`, `INSERT slot_generation_batches`, `DELETE appointment_slot_session_types WHERE slot_id IN slotIds`, `DELETE appointment_slots WHERE id IN slotIds`, `INSERT appointment_slots`, `INSERT appointment_slot_session_types` |

### External Service

Not required for AS04. AS05 and AS06 are referenced as extension sequence diagrams.

### Domain Class Diagram Notes

The main domain classes from AS04 are:

```text
SlotGenerationBatch
AppointmentSlot
AppointmentSlotSessionType
Counsellor
User
```

For the domain class diagram, associate configured slots with the creator, counsellor, batch, and supported session types:

```text
SlotGenerationBatch --> User
SlotGenerationBatch --> AppointmentSlot
AppointmentSlot --> User : createdBy
AppointmentSlot --> Counsellor
AppointmentSlot --> AppointmentSlotSessionType
```

## AS05: Bulk Generate Slots

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Parent use case: `AS04 Manage Slots`
- Related tables after AS04 save: `slot_generation_batches`, `appointment_slots`, `appointment_slot_session_types`, `counsellors`, `users`
- Key relationships:
  - `slot_generation_batches.created_by_user_id -> users.id`
  - `appointment_slots.batch_id -> slot_generation_batches.id`
  - `appointment_slots.counsellor_id -> counsellors.id`
  - `appointment_slot_session_types.slot_id -> appointment_slots.id`
- Note: AS05 prepares generated slot draft entries. Existing saved slots can be marked for removal when Replace existing slots is enabled, but the actual database insert/delete happens when AS04 Save Slot Changes publishes the draft schedule.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounsellor : <<Actor>>` | `openBulkSetupSection()`, `enterBulkGenerationCriteria()`, `enableReplaceExistingDates()`, `clickGenerateBulkSlots()`, `cancelBulkSetup()` |
| `slotManagerPage : <<View>>` | `displayBulkSetupSection()`, `submitBulkGenerationCriteria(criteria)`, `showBulkGenerationSummary(summary)`, `addGeneratedSlotsToDraft(generatedSlots)`, `removeDraftSlotsForMatchedDates(matchedDates)`, `markSavedSlotsForRemoval(existingSlots)`, `showNoWeekdaySelectedError()`, `showNoSessionTypeSelectedError()`, `showInvalidDateRangeError()`, `showNoMatchedDatesError()`, `returnToSlotManagerDraft()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `slotBulkGenerationController : <<Controller>>` | `openBulkSetupSection(userId)`, `generateBulkSlots(criteria)`, `validateWeekdaySelection(criteria)`, `validateSessionTypeSelection(criteria)`, `validateDateRange(criteria)`, `findMatchingDates(criteria)`, `generateSlotDrafts(criteria, matchedDates)`, `applyReplaceExistingDates(matchedDates)`, `markSavedSlotsForRemoval(existingSlots)`, `returnBulkGenerationSummary(summary, generatedSlots)`, `returnNoWeekdaySelectedError()`, `returnNoSessionTypeSelectedError()`, `returnInvalidDateRangeError()`, `returnNoMatchedDatesError()`, `cancelBulkSetup()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentSlot : <<Model>>` | `buildDraftSlotsFromBulkCriteria(criteria, matchedDates)`, `findDraftSlotsByDates(matchedDates)`, `removeDraftSlotsByDates(matchedDates)`, `findSavedSlotsByDates(matchedDates)`, `markSavedSlotsForRemoval(existingSlots)` |
| `appointmentSlotSessionType : <<Model>>` | `buildDraftSessionTypes(slotDraft, sessionTypes)` |
| `slotGenerationBatch : <<Model>>` | `prepareBulkBatchSummary(startDate, endDate, matchedDates, generatedCount, replaceExisting)` |
| `counsellor : <<Model>>` | `findById(counsellorId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT counsellors WHERE id`, `SELECT appointment_slots WHERE slot_date IN matchedDates` |

### External Service

Not required for AS05.

### Domain Class Diagram Notes

The main domain classes from AS05 are:

```text
SlotGenerationBatch
AppointmentSlot
AppointmentSlotSessionType
Counsellor
User
```

For the domain class diagram, associate generated slots with the bulk generation batch and counsellor:

```text
SlotGenerationBatch --> User
SlotGenerationBatch --> AppointmentSlot
AppointmentSlot --> AppointmentSlotSessionType
AppointmentSlot --> Counsellor
```

## AS06: Import CSV Template

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Parent use case: `AS04 Manage Slots`
- Related tables after AS04 save: `slot_generation_batches`, `appointment_slots`, `appointment_slot_session_types`, `counsellors`, `users`
- Key relationships:
  - `slot_generation_batches.created_by_user_id -> users.id`
  - `appointment_slots.batch_id -> slot_generation_batches.id`
  - `appointment_slots.counsellor_id -> counsellors.id`
  - `appointment_slot_session_types.slot_id -> appointment_slots.id`
- Note: AS06 prepares imported slot draft entries. Existing saved slots can be marked for removal when Replace existing slots is enabled, but the actual database insert/delete happens when AS04 Save Slot Changes publishes the draft schedule.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `adminOrCounsellor : <<Actor>>` | `openCsvImportSection()`, `selectCsvFile()`, `enableReplaceExistingDates()`, `cancelCsvImport()` |
| `slotManagerPage : <<View>>` | `displayCsvImportSection()`, `uploadCsvFile(csvFile, replaceExisting)`, `showImportSummary(importSummary)`, `addImportedSlotsToDraft(importedSlots)`, `removeDraftSlotsForImportedDates(importedDates)`, `markSavedSlotsForRemoval(existingSlots)`, `showEmptyCsvError()`, `showInvalidCsvTemplateError()`, `returnToSlotManagerDraft()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `slotImportController : <<Controller>>` | `openCsvImportSection(userId)`, `importCsvSlots(csvFile, replaceExisting)`, `validateCsvFile(csvFile)`, `parseCsvFile(csvFile)`, `validateCsvRows(parsedRows)`, `resolveCsvCounsellors(validRows)`, `convertRowsToSlotDrafts(validRows)`, `applyReplaceExistingDates(importedDates)`, `markSavedSlotsForRemoval(existingSlots)`, `returnImportSummary(importSummary)`, `returnEmptyCsvError()`, `returnInvalidCsvTemplateError()`, `cancelCsvImport()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentSlot : <<Model>>` | `buildDraftSlotsFromCsvRows(validRows)`, `findDraftSlotsByDates(importedDates)`, `removeDraftSlotsByDates(importedDates)`, `findSavedSlotsByDates(importedDates)`, `markSavedSlotsForRemoval(existingSlots)` |
| `appointmentSlotSessionType : <<Model>>` | `buildDraftSessionTypes(slotDraft, sessionTypes)` |
| `slotGenerationBatch : <<Model>>` | `prepareCsvBatchSummary(totalRows, validRows, skippedRows, replaceExisting)` |
| `counsellor : <<Model>>` | `findByCsvValue(counsellorValue)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT counsellors WHERE id OR name`, `SELECT appointment_slots WHERE slot_date IN importedDates` |

### External Service

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `csvImportService : <<Service>>` | `parseCsvFile(csvFile)`, `validateCsvTemplate(parsedRows)`, `extractValidRows(parsedRows)`, `countSkippedRows(parsedRows)`, `buildImportSummary(totalRows, validRows, skippedRows)` |

### Domain Class Diagram Notes

The main domain classes from AS06 are:

```text
SlotGenerationBatch
AppointmentSlot
AppointmentSlotSessionType
Counsellor
User
CsvImportService
```

For the domain class diagram, associate imported slots with the CSV batch and counsellor:

```text
SlotGenerationBatch --> User
SlotGenerationBatch --> AppointmentSlot
AppointmentSlot --> AppointmentSlotSessionType
AppointmentSlot --> Counsellor
CsvImportService --> SlotGenerationBatch
CsvImportService --> AppointmentSlot
```

## AS07: Verify Appointment

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `appointments`, `appointment_slots`, `clients`, `counsellors`, `users`, `email_notifications`
- Key relationships:
  - `appointments.client_id -> clients.id`
  - `appointments.requested_by_user_id -> users.id`
  - `appointments.slot_id -> appointment_slots.id`
  - `appointments.counsellor_id -> counsellors.id`
  - `appointments.admin_review_by_user_id -> users.id`
  - `appointments.counsellor_review_by_user_id -> users.id`
  - `email_notifications.recipient_user_id -> users.id`
  - `email_notifications.appointment_id -> appointments.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `admin : <<Actor>>` | `openAppointmentQueue()`, `selectPendingAppointment()`, `clickApproveForCounsellorReview()`, `confirmAdminApproval()`, `cancelOperation()` |
| `counsellor : <<Actor>>` | `openAppointmentsPage()`, `selectReviewAppointment()`, `clickApproveAppointment()`, `confirmCounsellorApproval()`, `cancelOperation()` |
| `appointmentQueuePage : <<View>>` | `displayPendingAppointmentQueue()`, `displayAppointmentDetails()`, `showAdminReviewConfirmation()`, `showCounsellorReviewConfirmation()`, `showSuccessMessage()`, `showAppointmentNotFoundError()`, `showMissingReviewInformationError()`, `showCounsellorApprovalUnavailableError()`, `redirectToAppointmentList()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentVerificationController : <<Controller>>` | `loadPendingAppointmentQueue(userId, filters)`, `openAppointmentDetails(appointmentId)`, `validateAppointmentExists(appointmentId)`, `loadAppointmentReviewDetails(appointmentId)`, `approveForCounsellorReview(appointmentId, adminReviewData)`, `validateAdminReviewInformation(adminReviewData)`, `updateAppointmentStatus(appointmentId, status, reviewData)`, `openCounsellorReviewAppointment(appointmentId, counsellorId)`, `validateCounsellorReviewEligibility(appointment)`, `approveAppointment(appointmentId, counsellorReviewData)`, `validateCounsellorReviewInformation(counsellorReviewData)`, `requestAppointmentStatusNotification(appointmentId, eventType)`, `returnSuccessMessage()`, `returnAppointmentNotFoundError()`, `returnMissingReviewInformationError()`, `returnCounsellorApprovalUnavailableError()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointment : <<Model>>` | `findPendingAppointments(filters)`, `findById(appointmentId)`, `findReviewDetails(appointmentId)`, `updateAdminReview(appointmentId, status, adminReviewData)`, `updateCounsellorReview(appointmentId, status, counsellorReviewData)`, `isReadyForCounsellorReview(appointment)` |
| `appointmentSlot : <<Model>>` | `findByAppointment(appointmentId)` |
| `clientProfile : <<Model>>` | `findByAppointment(appointmentId)` |
| `counsellorProfile : <<Model>>` | `findByAppointment(appointmentId)`, `findByUserId(userId)` |
| `emailNotification : <<Model>>` | `createQueuedNotification(appointmentId, recipientUserId, eventType)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT appointments WHERE status`, `SELECT appointments WHERE id`, `SELECT clients WHERE id`, `SELECT appointment_slots WHERE id`, `SELECT counsellors WHERE id`, `UPDATE appointments SET status, admin_review_by_user_id, admin_review_note, admin_reviewed_at`, `UPDATE appointments SET status, counsellor_review_by_user_id, counsellor_review_note, counsellor_reviewed_at`, `INSERT email_notifications` |

### External Service

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `appointmentNotificationService : <<Service>>` | `queueAppointmentStatusNotification(appointmentId, eventType)`, `resolveNotificationRecipients(appointmentId)`, `buildAppointmentStatusNotification(appointmentId, eventType)` |

### Domain Class Diagram Notes

The main domain classes from AS07 are:

```text
Appointment
AppointmentSlot
Client
Counsellor
User
EmailNotification
```

For the domain class diagram, associate appointment verification with review users, appointment details, and notifications:

```text
Appointment --> Client
Appointment --> Counsellor
Appointment --> AppointmentSlot
Appointment --> User : requestedBy
Appointment --> User : adminReviewedBy
Appointment --> User : counsellorReviewedBy
EmailNotification --> Appointment
EmailNotification --> User
```

## ER01: Manage Resource Library

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `resource_library_items`, `users`
- Key relationships:
  - `resource_library_items.uploaded_by_user_id -> users.id`
- Note: `resource_access_logs` belongs to ER02 when clients open resources, so it is not required for ER01 upload/manage flow.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `admin : <<Actor>>` | `openLearningMaterialsPage()`, `enterResourceDetails()`, `clickUploadLearningMaterial()`, `reviewResourceLibraryStatus()`, `cancelOperation()` |
| `learningMaterialsPage : <<View>>` | `displayUploadLearningMaterialForm()`, `displayResourceCount()`, `displayResourceMetadata()`, `submitLearningMaterial(resourceData)`, `showUploadSuccessMessage()`, `showMissingTitleOrUrlError()`, `showInvalidResourceUrlError()`, `redirectToPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `resourceLibraryController : <<Controller>>` | `loadLearningMaterialsPage(userId)`, `getResourceLibraryStatus()`, `uploadLearningMaterial(resourceData)`, `validateRequiredResourceFields(resourceData)`, `validateResourceUrl(resourceData.url)`, `createResourceLibraryItem(resourceData, uploadedByUserId)`, `returnResourceLibraryStatus(status)`, `returnUploadSuccessMessage()`, `returnMissingTitleOrUrlError()`, `returnInvalidResourceUrlError()`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `resourceLibraryItem : <<Model>>` | `countPublishedResources()`, `findResourceMetadata()`, `createResource(resourceData, uploadedByUserId)` |
| `user : <<Model>>` | `findById(userId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT users WHERE id`, `SELECT COUNT resource_library_items WHERE visibility = published`, `SELECT resource_library_items metadata`, `INSERT resource_library_items` |

### External Service

Not required for ER01.

### Domain Class Diagram Notes

The main domain classes from ER01 are:

```text
ResourceLibraryItem
User
```

For the domain class diagram, associate learning resources with the admin user who uploaded them:

```text
ResourceLibraryItem --> User : uploadedBy
```

## ER02: Access Learning Materials

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `resource_library_items`, `resource_access_logs`, `clients`
- Key relationships:
  - `resource_access_logs.resource_id -> resource_library_items.id`
  - `resource_access_logs.client_id -> clients.id`
- Note: ER02 does not modify library content. It may create an access log when a client opens a selected material.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openResourceLibraryPage()`, `enterSearchKeyword()`, `selectCategoryFilter()`, `selectLearningMaterial()`, `cancelOperation()` |
| `resourceLibraryPage : <<View>>` | `displayAvailableLearningMaterials()`, `displayFilteredResourceList()`, `openSelectedMaterial(resourceUrl)`, `showNoMatchingResourceMessage()`, `showResourceUnavailableError()`, `redirectToDashboardOrPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `resourceAccessController : <<Controller>>` | `loadResourceLibrary(clientId)`, `searchOrFilterMaterials(criteria)`, `openLearningMaterial(resourceId, clientId)`, `validateResourceUrl(resource)`, `recordResourceAccess(resourceId, clientId)`, `returnAvailableResources(resources)`, `returnFilteredResources(resources)`, `returnNoMatchingResourceMessage()`, `returnResourceUnavailableError()`, `returnResourceUrl(resourceUrl)`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `resourceLibraryItem : <<Model>>` | `findPublishedResources()`, `findBySearchOrFilter(criteria)`, `findById(resourceId)`, `isUrlAvailable(resource)` |
| `resourceAccessLog : <<Model>>` | `createAccessLog(resourceId, clientId)` |
| `clientProfile : <<Model>>` | `findById(clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT resource_library_items WHERE visibility = published`, `SELECT resource_library_items WHERE keyword/category AND visibility = published`, `SELECT resource_library_items WHERE id`, `INSERT resource_access_logs` |

### External Service

Not required for ER02.

### Domain Class Diagram Notes

The main domain classes from ER02 are:

```text
ResourceLibraryItem
ResourceAccessLog
Client
```

For the domain class diagram, associate client access logs with the selected resource and client:

```text
ResourceLibraryItem --> ResourceAccessLog
ResourceAccessLog --> Client
```

## PS01: Submit Forum Post

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `forum_posts`, `forum_categories`, `clients`
- Key relationships:
  - `forum_posts.author_client_id -> clients.id`
  - `forum_posts.category_id -> forum_categories.id`
- Note: `forum_moderation_events` belongs to PS02 when Admin moderates queued or unsafe posts.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `client : <<Actor>>` | `openPeerSupportForum()`, `clickCreatePost()`, `enterForumPostDetails()`, `clickSubmitPost()`, `cancelOperation()` |
| `peerSupportForumPage : <<View>>` | `displayForumPostForm()`, `displayCategoryOptions()`, `submitForumPost(postData)`, `showPostPublishedConfirmation()`, `showPostQueuedForReviewMessage()`, `showMissingPostDetailsError()`, `redirectToForumList()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `forumPostController : <<Controller>>` | `openCreatePostForm(clientId)`, `loadActiveCategories()`, `submitForumPost(postData, clientId)`, `validateForumPostDetails(postData)`, `requestSafetyReview(postData)`, `determinePostStatus(safetyResult)`, `createForumPost(postData, clientId, safetyResult, status)`, `returnPostPublishedConfirmation()`, `returnPostQueuedForReviewMessage()`, `returnMissingPostDetailsError()`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `clientProfile : <<Model>>` | `findById(clientId)` |
| `forumCategory : <<Model>>` | `findActiveCategories()`, `findById(categoryId)` |
| `forumPost : <<Model>>` | `createPost(postData, clientId, categoryId, safetyScore, moderationReason, status)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT clients WHERE id`, `SELECT forum_categories WHERE is_active`, `SELECT forum_categories WHERE id`, `INSERT forum_posts` |

### External Service

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `aiSafetyReviewService : <<Service>>` | `reviewForumPostSafety(title, content)`, `calculateSafetyScore(title, content)`, `returnSafetyResult(safetyScore, moderationReason)` |

### Domain Class Diagram Notes

The main domain classes from PS01 are:

```text
ForumPost
ForumCategory
Client
AiSafetyReviewService
```

For the domain class diagram, associate submitted posts with the author, category, and safety review:

```text
ForumPost --> Client
ForumPost --> ForumCategory
ForumPost --> AiSafetyReviewService
```

## PS02: Moderate Forum

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `forum_posts`, `forum_moderation_events`, `forum_categories`, `clients`, `users`
- Key relationships:
  - `forum_posts.author_client_id -> clients.id`
  - `forum_posts.category_id -> forum_categories.id`
  - `forum_moderation_events.post_id -> forum_posts.id`
  - `forum_moderation_events.moderator_user_id -> users.id`

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `admin : <<Actor>>` | `openForumModerationPage()`, `enterPostFilterCriteria()`, `selectModerationAction()`, `confirmModerationAction()`, `cancelOperation()` |
| `forumModerationPage : <<View>>` | `displayForumModerationPage()`, `displayForumManagementFilters()`, `displayUnsafePostQueue()`, `displayAllForumPosts()`, `displayModerationEventLog()`, `displayMatchingForumPosts(posts)`, `showConfirmModerationDialog()`, `showModerationSuccessMessage()`, `showNoForumPostsFoundMessage()`, `showModerationActionFailedError()`, `redirectToPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `forumModerationController : <<Controller>>` | `loadForumModerationPage(adminUserId)`, `loadModerationDashboard(filters)`, `filterForumPosts(criteria)`, `moderateSelectedPost(postId, action, reason, adminUserId)`, `validateModerationAction(action)`, `determineNextPostStatus(action)`, `updateForumPostStatus(postId, nextStatus, reason)`, `recordModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)`, `returnModerationDashboard(dashboardData)`, `returnFilteredPosts(posts)`, `returnNoForumPostsFoundMessage()`, `returnModerationSuccessMessage()`, `returnModerationActionFailedError()`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `forumPost : <<Model>>` | `findModerationDashboardPosts(filters)`, `findByCriteria(criteria)`, `findById(postId)`, `updateStatus(postId, nextStatus, reason)` |
| `forumModerationEvent : <<Model>>` | `findRecentEvents()`, `createModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)` |
| `user : <<Model>>` | `findById(adminUserId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT users WHERE id`, `SELECT forum_posts WHERE filters`, `SELECT forum_posts WHERE status/safety_score/visibility`, `SELECT forum_posts WHERE id`, `SELECT forum_moderation_events`, `UPDATE forum_posts SET status, moderation_reason`, `INSERT forum_moderation_events` |

### External Service

Not required for PS02.

### Domain Class Diagram Notes

The main domain classes from PS02 are:

```text
ForumPost
ForumModerationEvent
User
```

For the domain class diagram, associate moderation events with the moderated post and Admin user:

```text
ForumPost --> ForumModerationEvent
ForumModerationEvent --> User : moderatedBy
```

## SA02: View Triage Dashboard

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `psychometric_submissions`, `psychometric_tests`, `psychometric_answers`, `clients`, `risk_flags`
- Key relationships:
  - `psychometric_submissions.test_id -> psychometric_tests.id`
  - `psychometric_submissions.client_id -> clients.id`
  - `psychometric_answers.submission_id -> psychometric_submissions.id`
  - `risk_flags.client_id -> clients.id`
  - `risk_flags.source = psychometric`
- Note: SA02 is a review/read-only triage use case. It does not create follow-up tasks; task creation belongs to the flagged-client investigation workflow.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `counsellor : <<Actor>>` | `openTriageDashboard()`, `enterTriageFilterCriteria()`, `selectPsychometricSubmission()`, `cancelOperation()` |
| `psychometricTriagePage : <<View>>` | `displayTriageDashboard()`, `displayLatestSubmissions()`, `displayFilteredTriageResults(results)`, `displaySubmissionDetails(details)`, `showNoTriageResultsFoundMessage()`, `showSubmissionCannotBeLoadedError()`, `redirectToPreviousPageOrDashboard()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `psychometricTriageController : <<Controller>>` | `loadTriageDashboard(counsellorId)`, `loadLatestSubmissions(filters)`, `searchOrFilterSubmissions(criteria)`, `openSubmissionDetails(submissionId)`, `loadSubmissionDetails(submissionId)`, `loadPsychometricRiskFlags(clientId)`, `returnTriageDashboard(results)`, `returnFilteredTriageResults(results)`, `returnSubmissionDetails(details)`, `returnNoTriageResultsFoundMessage()`, `returnSubmissionCannotBeLoadedError()`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `psychometricSubmission : <<Model>>` | `findLatestSubmissions(filters)`, `findByCriteria(criteria)`, `findById(submissionId)` |
| `psychometricTest : <<Model>>` | `findBySubmission(submissionId)` |
| `psychometricAnswer : <<Model>>` | `findBySubmission(submissionId)` |
| `clientProfile : <<Model>>` | `findBySubmission(submissionId)`, `findByCriteria(criteria)` |
| `riskFlag : <<Model>>` | `findOpenPsychometricFlags(clientId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT psychometric_submissions ORDER BY submitted_at DESC`, `SELECT psychometric_submissions WHERE criteria`, `SELECT psychometric_submissions WHERE id`, `SELECT psychometric_tests WHERE id`, `SELECT psychometric_answers WHERE submission_id`, `SELECT clients WHERE id`, `SELECT clients WHERE criteria`, `SELECT risk_flags WHERE client_id AND source = psychometric AND status` |

### External Service

Not required for SA02.

### Domain Class Diagram Notes

The main domain classes from SA02 are:

```text
PsychometricSubmission
PsychometricTest
PsychometricAnswer
Client
RiskFlag
```

For the domain class diagram, associate triage submissions with the test, answers, client, and psychometric risk flags:

```text
PsychometricSubmission --> PsychometricTest
PsychometricSubmission --> PsychometricAnswer
PsychometricSubmission --> Client
RiskFlag --> Client
```

## SA03: Manage Test

Source alignment:

- Use case: `docs/use-case-descriptions.md`
- ERD/schema: `docs/postgresql-database-schema.md`
- Related tables: `psychometric_tests`, `psychometric_questions`, `psychometric_options`, `users`
- Key relationships:
  - `psychometric_tests.uploaded_by_user_id -> users.id`
  - `psychometric_questions.test_id -> psychometric_tests.id`
  - `psychometric_options.test_id -> psychometric_tests.id`
- Note: SA03 uses a generation service because PDF parsing and automatic test generation are specialized processing. The generated test, questions, and options are saved through model lifelines.

### View

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `admin : <<Actor>>` | `openTestingMaterialsPage()`, `enterTestTitle()`, `selectPdfTestingMaterial()`, `clickUploadPdfAndGenerateTest()`, `reviewCurrentTests()`, `cancelOperation()` |
| `testingMaterialsPage : <<View>>` | `displayUploadTestingMaterialForm()`, `displayCurrentTestCount()`, `displayAvailableTestingMaterials()`, `submitPdfGenerationRequest(testData, pdfFile)`, `showGeneratedTestSuccessMessage(testCode, questionCount)`, `showMissingTitleOrPdfError()`, `showUnsupportedFileTypeError()`, `redirectToPreviousPage()` |

### Controller

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `psychometricTestController : <<Controller>>` | `loadTestingMaterialsPage(adminUserId)`, `getCurrentTestSummary()`, `uploadPdfAndGenerateTest(testData, pdfFile, adminUserId)`, `validateTestTitleAndPdf(testData, pdfFile)`, `validatePdfFileType(pdfFile)`, `generatePsychometricTestFromPdf(testData, pdfFile)`, `saveGeneratedTest(generatedTest, adminUserId)`, `returnCurrentTestSummary(summary)`, `returnGeneratedTestSuccessMessage(testCode, questionCount)`, `returnMissingTitleOrPdfError()`, `returnUnsupportedFileTypeError()`, `cancelOperation()` |

### Model

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `psychometricTest : <<Model>>` | `countPublishedTests()`, `findAvailableTests()`, `createGeneratedTest(generatedTest, adminUserId)` |
| `psychometricQuestion : <<Model>>` | `createGeneratedQuestions(testId, generatedQuestions)` |
| `psychometricOption : <<Model>>` | `createGeneratedOptions(testId, generatedOptions)` |
| `user : <<Model>>` | `findById(adminUserId)` |

### Database

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `supabasePostgreSQLDatabase : <<Database>>` | `SELECT users WHERE id`, `SELECT COUNT psychometric_tests WHERE visibility = published`, `SELECT psychometric_tests`, `INSERT psychometric_tests`, `INSERT psychometric_questions`, `INSERT psychometric_options` |

### External Service

| Class / Lifeline | Functions / Responsibilities |
| --- | --- |
| `psychometricTestGenerationService : <<Service>>` | `extractPdfContent(pdfFile)`, `generateTestStructure(testTitle, pdfContent)`, `returnGeneratedTest(generatedTest)` |

### Domain Class Diagram Notes

The main domain classes from SA03 are:

```text
PsychometricTest
PsychometricQuestion
PsychometricOption
User
PsychometricTestGenerationService
```

For the domain class diagram, associate generated tests with the uploader, questions, options, and generation service:

```text
PsychometricTest --> User : uploadedBy
PsychometricTest --> PsychometricQuestion
PsychometricTest --> PsychometricOption
PsychometricTestGenerationService --> PsychometricTest
```
