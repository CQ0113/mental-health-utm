# PsyCare 2.0 Full Domain Class Diagram

This document defines the complete PsyCare 2.0 domain class model for the whole system. It is based on:

- `docs/use-cases.md`
- `docs/use-case-descriptions.md`
- `docs/postgresql-database-schema.md`
- `docs/architecture-diagram.md`
- Current Inertia React UI pages under `resources/js/pages`

The diagrams follow the intended Laravel MVC architecture:

- React/Inertia pages are shown as `<<view>>`.
- Laravel controllers are shown as `<<controller>>`.
- Domain/application services are shown as `<<service>>`.
- Supabase PostgreSQL tables are represented as domain model classes.

The diagrams are split by module so they remain readable and professional. Together, they cover every documented use case and the functions that should appear in sequence diagrams for those use cases.

## Complete Use Case Scope

| Module | Covered Use Cases |
| --- | --- |
| User Management | UM01 Onboard Counselor, UM02 Find Client Profile, UM03 Manage User Profile |
| Appointment and Scheduling | AS01 Book Appointment, AS02 Request Follow Up, AS03 Book New Appointment, AS04 Manage Slots, AS05 Bulk Generate Slots, AS06 Import CSV Template, AS07 Verify Appointment |
| Declaration | DC01 View Declaration Form, DC02 Submit Declaration, DC03 Verify Declaration |
| Telemedicine and Attendance | TA01 Join Online Session, TA02 Record Attendance, TA03 Scan Physical QR Code, TA04 Auto-log Attendance Online |
| Chatbot and Tracking | CT01 Log Daily Emotion, CT02 Chat with AI Counselor, CT03 View Emotion History, CT04 Investigate Flagged Client |
| Psychometric Self-Assessment | SA01 Take Psychometric Test, SA02 View Triage Dashboard, SA03 Manage Test |
| Educational Resource Library | ER01 Manage Resource Library, ER02 Access Learning Materials |
| Peer Support Forum | PS01 Submit Forum Post, PS02 Moderate Forum |
| Notifications | Notification events from declaration, appointment, forum, and risk workflows |

## Diagram 1: User Management Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +string passwordHash
  +UserRole role
  +AccountStatus status
  +datetime emailVerifiedAt
  +string rememberToken
  +datetime createdAt
  +datetime updatedAt
  +authenticate()
  +authorizeRole()
  +updateProfile()
  +changeStatus()
  +verifyEmail()
}

class Client {
  +uuid id
  +uuid userId
  +string fullName
  +string preferredName
  +ClientType clientType
  +string nationalId
  +string email
  +string phone
  +string currentAddress
  +string faculty
  +string program
  +string matrixNo
  +string studentNo
  +string workerNo
  +string maritalStatus
  +int dependentCount
  +string treatmentHistory
  +string currentMedications
  +boolean profileLocked
  +datetime createdAt
  +datetime updatedAt
  +findClientProfile()
  +searchClientProfile()
  +filterClientProfile()
  +viewProfileSections()
  +updateAllowedProfile()
  +validateProfileDetails()
  +checkDuplicateIdentifiers()
  +lockProfile()
}

class Counsellor {
  +uuid id
  +uuid userId
  +string ppsiNo
  +string workerNo
  +string name
  +CounsellorType counsellorType
  +string organization
  +uuid locationId
  +AccountStatus status
  +date startDate
  +date endDate
  +string email
  +string phone
  +string specialization
  +datetime createdAt
  +datetime updatedAt
  +createCounsellorRecord()
  +validateCounsellorDetails()
  +checkDuplicateCounsellor()
  +searchCounsellorRecord()
  +filterCounsellorRecord()
  +activateCounsellor()
  +deactivateCounsellor()
}

class CounsellingLocation {
  +uuid id
  +string code
  +string name
  +string campus
  +string address
  +boolean isActive
  +datetime createdAt
  +datetime updatedAt
  +activate()
  +deactivate()
}

class AdminCounsellorPage {
  <<view>>
  +openCounsellorList()
  +displayCounsellorRecords()
  +clickAddCounsellor()
  +displayCounsellorForm()
  +fillCounsellorForm()
  +clickSaveCounsellor()
  +searchCounsellorRecords()
  +filterCounsellorRecords()
  +displaySuccessMessage()
  +displayDuplicateError()
  +displayValidationError()
  +cancelOperation()
}

class ClientInformationPage {
  <<view>>
  +openClientInformation()
  +displayClientRecords()
  +enterSearchKeyword()
  +selectFilter()
  +selectClientRecord()
  +displayClientProfile()
  +displayEmptyState()
  +displayAccessDenied()
  +cancelOperation()
}

class UserProfilePage {
  <<view>>
  +openProfileForm()
  +displayProfileTabs()
  +displayLockedProfileNotice()
  +editPermittedFields()
  +clickSaveProfile()
  +displayProfileSaved()
  +displayValidationError()
  +cancelOperation()
}

class AuthController {
  <<controller>>
  +authenticate()
  +logout()
  +verifyAuthenticatedUser()
  +authorizeRole()
}

class UserController {
  <<controller>>
  +openProfile()
  +updateProfile()
  +validateProfileDetails()
  +checkDuplicateIdentifiers()
  +changeUserStatus()
}

class CounsellorController {
  <<controller>>
  +listCounsellors()
  +openAddCounsellorForm()
  +saveCounsellor()
  +validateCounsellorDetails()
  +checkDuplicateCounsellor()
  +searchCounsellor()
  +filterCounsellor()
  +cancelCounsellorOperation()
}

class ClientProfileController {
  <<controller>>
  +listClientProfiles()
  +searchClientProfile()
  +filterClientProfile()
  +openClientProfile()
  +verifyProfilePermission()
  +updateClientProfile()
  +returnProfileNotFound()
  +returnAccessDenied()
}

class AuthorizationService {
  <<service>>
  +verifyAuthenticatedUser()
  +authorizeAdmin()
  +authorizeCounsellor()
  +authorizeClient()
  +verifyProfilePermission()
}

class ProfileValidationService {
  <<service>>
  +validateRequiredProfileFields()
  +validateCounsellorFields()
  +validateClientFields()
  +checkDuplicateEmail()
  +checkDuplicatePpsiNo()
  +checkDuplicateMatrixNo()
  +checkDuplicateWorkerNo()
}

User "1" --> "0..1" Client : has client profile
User "1" --> "0..1" Counsellor : has counsellor profile
CounsellingLocation "1" --> "0..*" Counsellor : assigned location
AdminCounsellorPage ..> CounsellorController : manages counsellor
ClientInformationPage ..> ClientProfileController : finds client
UserProfilePage ..> UserController : manages profile
AuthController ..> User : authenticates
UserController ..> User : updates account
UserController ..> Client : updates client profile
UserController ..> Counsellor : updates counsellor profile
CounsellorController ..> Counsellor : creates record
ClientProfileController ..> Client : retrieves profile
AuthorizationService ..> User : checks role
ProfileValidationService ..> Client : validates
ProfileValidationService ..> Counsellor : validates
```

## Diagram 2: Appointment And Scheduling Domain

```mermaid
classDiagram
direction LR

class Client {
  +uuid id
  +string fullName
  +ClientType clientType
  +string matrixNo
  +string workerNo
  +string email
  +hasFollowUpRecords()
  +getEligibleFollowUpRecords()
}

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Counsellor {
  +uuid id
  +string name
  +string ppsiNo
  +string email
  +reviewAppointment()
}

class CounsellingLocation {
  +uuid id
  +string code
  +string name
  +string campus
  +boolean isActive
}

class CounsellingService {
  +uuid id
  +string code
  +string name
  +int durationMinutes
  +uuid locationId
  +ServiceSessionMode sessionMode
  +AccountStatus status
  +createService()
  +updateService()
  +deleteService()
  +activateService()
  +deactivateService()
}

class SlotGenerationBatch {
  +uuid id
  +uuid createdByUserId
  +string generationMethod
  +date startDate
  +date endDate
  +string slotTemplate
  +boolean replaceExisting
  +int totalRows
  +int validRows
  +int skippedRows
  +string summary
  +datetime createdAt
  +createManualBatch()
  +createBulkBatch()
  +createCsvBatch()
  +recordGenerationSummary()
}

class AppointmentSlot {
  +uuid id
  +date slotDate
  +time startTime
  +time endTime
  +string label
  +uuid counsellorId
  +uuid locationId
  +uuid batchId
  +int capacity
  +boolean isActive
  +uuid createdByUserId
  +datetime createdAt
  +datetime updatedAt
  +getAvailableSlots()
  +checkSlotAvailability()
  +supportsSessionType()
  +reserveSlot()
  +createSlot()
  +deleteSlot()
  +saveSlotChanges()
}

class AppointmentSlotSessionType {
  +uuid slotId
  +SessionType sessionType
  +addSupportedSessionType()
  +removeSupportedSessionType()
}

class Appointment {
  +uuid id
  +string referenceNo
  +uuid clientId
  +uuid requestedByUserId
  +uuid previousAppointmentId
  +AppointmentType appointmentType
  +SessionType sessionType
  +SessionMode sessionMode
  +uuid serviceId
  +uuid locationId
  +uuid slotId
  +uuid counsellorId
  +date preferredDate
  +string appointmentNeed
  +string issueSummary
  +string attachmentDescription
  +string applicantNote
  +boolean attendedBefore
  +AppointmentStatus status
  +uuid adminReviewByUserId
  +string adminReviewNote
  +datetime adminReviewedAt
  +uuid counsellorReviewByUserId
  +string counsellorReviewNote
  +datetime counsellorReviewedAt
  +string meetingLink
  +datetime submittedAt
  +datetime createdAt
  +datetime updatedAt
  +generateReferenceNumber()
  +createAppointment()
  +submitRequest()
  +submitFollowUpRequest()
  +saveDraft()
  +validateAppointmentReference()
  +getAppointmentDetails()
  +approve()
  +moveToCounsellorReview()
  +openSession()
  +completeSession()
  +markFollowUp()
  +closeAppointment()
  +updateMeetingLink()
}

class AppointmentParticipant {
  +uuid appointmentId
  +uuid clientId
  +string participantRole
  +datetime createdAt
  +addParticipant()
  +removeParticipant()
  +validateGroupParticipants()
}

class AppointmentAttachment {
  +uuid id
  +uuid appointmentId
  +uuid uploadedByUserId
  +string fileName
  +string filePath
  +string description
  +datetime uploadedAt
  +uploadAttachment()
  +deleteAttachment()
}

class SmartAppointmentForm {
  <<view>>
  +openSmartAppointmentForm()
  +loadBookingForm()
  +displayBookingTypeOptions()
  +displayCalendarAndAvailableSlots()
  +selectCreateNewBooking()
  +selectContinueFollowUp()
  +fillAppointmentDetails()
  +saveDraft()
  +submitAppointmentRequest()
  +displayBookingSummary()
  +displayFollowUpUnavailable()
  +displaySlotUnavailableMessage()
  +displayValidationErrors()
  +cancelOperation()
}

class AppointmentRecordsPage {
  <<view>>
  +openAppointmentRecords()
  +displayAppointmentRecords()
  +selectFollowUpAction()
  +displaySelectedAppointment()
  +redirectToSmartAppointmentForm()
}

class AppointmentQueuePage {
  <<view>>
  +openAppointmentQueue()
  +displayAppointmentRequests()
  +filterAppointmentRequests()
  +openAppointmentDetails()
  +clickApprove()
  +clickMoveToCounsellorReview()
  +clickOpenSession()
  +clickCompleteSession()
  +clickMarkFollowUp()
  +clickCloseAppointment()
  +displayStatusUpdated()
}

class SlotManagerPage {
  <<view>>
  +openSlotManager()
  +displaySlotManager()
  +addSlotManually()
  +deleteSlot()
  +configureBulkSetup()
  +toggleBulkWeekday()
  +generateBulkSlots()
  +uploadCsvTemplate()
  +saveSlotChanges()
  +resetDefaultSchedule()
  +displayImportSummary()
  +displayValidationError()
}

class ServiceManagementPage {
  <<view>>
  +openServiceManagement()
  +displayServiceList()
  +openCreateServiceForm()
  +openEditServiceForm()
  +saveService()
  +deleteService()
  +resetFilters()
}

class AppointmentController {
  <<controller>>
  +loadBookingForm()
  +findClientProfileById()
  +getAvailableSlots()
  +hasFollowUpRecords()
  +checkFollowUpAvailability()
  +submitAppointmentRequest()
  +submitFollowUpRequest()
  +validateAppointmentRequest()
  +checkSlotAvailability()
  +generateReferenceNumber()
  +createAppointment()
  +createDeclaration()
  +generateMeetingLink()
  +updateMeetingLink()
  +saveDraft()
  +openAppointmentQueue()
  +openAppointmentDetails()
  +approveAppointment()
  +moveToCounsellorReview()
  +openSession()
  +completeSession()
  +markFollowUpRequired()
  +closeAppointment()
}

class SlotController {
  <<controller>>
  +openSlotManager()
  +addSlot()
  +deleteSlot()
  +saveSlotChanges()
  +generateBulkSlots()
  +validateBulkSetup()
  +parseCsvTemplate()
  +validateCsvRows()
  +importCsvSlots()
  +resetSlotSchedule()
}

class ServiceController {
  <<controller>>
  +listServices()
  +filterServices()
  +saveService()
  +validateServiceDetails()
  +deleteService()
}

class AppointmentBookingService {
  <<service>>
  +loadBookingContext()
  +prepareNewBooking()
  +prepareFollowUpBooking()
  +validateAppointmentRequest()
  +checkFollowUpEligibility()
  +createAppointmentRequest()
  +buildBookingSummary()
}

class SlotAvailabilityService {
  <<service>>
  +getAvailableSlots()
  +filterSlotsBySessionType()
  +checkSlotAvailability()
  +reserveSlot()
  +validateCapacity()
}

class SlotGenerationService {
  <<service>>
  +buildSlotLabel()
  +generateManualSlot()
  +generateBulkSlots()
  +validateDateRange()
  +validateWeekdaySelection()
  +parseSessionTypesFromCsv()
  +parseCsvRows()
  +validateCsvRows()
  +replaceOrAppendSlots()
}

class MeetingLinkService {
  <<service>>
  +generateMeetingLink()
  +validateMeetingLink()
  +updateMeetingLink()
}

class FileStorageService {
  <<service>>
  +uploadAppointmentAttachment()
  +validateFileType()
  +deleteStoredFile()
}

Client "1" --> "0..*" Appointment : books
User "1" --> "0..*" Appointment : requests reviews
Appointment "0..1" --> "0..*" Appointment : follow up
CounsellingService "1" --> "0..*" Appointment : requested service
CounsellingLocation "1" --> "0..*" Appointment : location
AppointmentSlot "1" --> "0..*" Appointment : selected slot
Counsellor "1" --> "0..*" Appointment : assigned
Appointment "1" --> "0..*" AppointmentParticipant : participants
Client "1" --> "0..*" AppointmentParticipant : joins
Appointment "1" --> "0..*" AppointmentAttachment : attachments
User "1" --> "0..*" SlotGenerationBatch : creates
SlotGenerationBatch "1" --> "0..*" AppointmentSlot : generates
Counsellor "1" --> "0..*" AppointmentSlot : assigned slots
CounsellingLocation "1" --> "0..*" AppointmentSlot : hosts
AppointmentSlot "1" --> "1..*" AppointmentSlotSessionType : supports
SmartAppointmentForm ..> AppointmentController : booking request
AppointmentRecordsPage ..> AppointmentController : follow up
AppointmentQueuePage ..> AppointmentController : verify appointment
SlotManagerPage ..> SlotController : manage slots
ServiceManagementPage ..> ServiceController : manage services
AppointmentController ..> AppointmentBookingService : booking workflow
AppointmentController ..> SlotAvailabilityService : slot check
AppointmentController ..> MeetingLinkService : online session
AppointmentController ..> FileStorageService : attachments
SlotController ..> SlotGenerationService : slot generation
SlotController ..> AppointmentSlot : persists slots
ServiceController ..> CounsellingService : persists services
AppointmentBookingService ..> Appointment : creates request
SlotAvailabilityService ..> AppointmentSlot : checks capacity
SlotGenerationService ..> SlotGenerationBatch : records batch
```

## Diagram 3: Terms Acceptance And Declaration Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Client {
  +uuid id
  +string fullName
  +string email
  +boolean profileLocked
}

class Appointment {
  +uuid id
  +string referenceNo
  +AppointmentStatus status
}

class TermsAcceptance {
  +uuid id
  +uuid clientId
  +uuid userId
  +string termsVersion
  +boolean accepted
  +datetime acceptedAt
  +string ipAddress
  +string userAgent
  +datetime createdAt
  +datetime updatedAt
  +checkCurrentVersionAccepted()
  +recordAcceptance()
  +resetAcceptanceForNewVersion()
}

class Declaration {
  +uuid id
  +uuid clientId
  +uuid appointmentId
  +string declarationText
  +boolean isChecked
  +DeclarationStatus status
  +datetime submittedAt
  +uuid verifiedByUserId
  +datetime verifiedAt
  +string correctionNote
  +datetime createdAt
  +datetime updatedAt
  +viewDeclarationForm()
  +validateConfirmationChecked()
  +validateRequiredInformation()
  +submitDeclaration()
  +markPendingVerification()
  +verifyDeclaration()
  +requestCorrection()
  +rejectDeclaration()
}

class TermsAcceptanceModalView {
  <<view>>
  +openTermsModal()
  +displayTermsAndConditions()
  +displayClientIdentity()
  +displayAcceptedTimestamp()
  +toggleAcceptanceCheckbox()
  +clickAgreeAndContinue()
  +displayTermsRequiredError()
  +blockPortalUntilAccepted()
}

class DeclarationVerificationEvent {
  +uuid id
  +uuid declarationId
  +uuid verifierUserId
  +DeclarationStatus action
  +string note
  +datetime createdAt
  +recordVerificationAction()
}

class DeclarationFormView {
  <<view>>
  +openDeclarationForm()
  +displayDeclarationText()
  +displayConfirmationCheckbox()
  +displayProfileConfirmation()
  +clickSubmitDeclaration()
  +displaySubmissionStatus()
  +displayValidationError()
  +cancelOperation()
}

class DeclarationReviewPanel {
  <<view>>
  +openDeclarationReview()
  +displaySubmittedInformation()
  +displayVerificationStatus()
  +clickVerify()
  +clickRequestCorrection()
  +clickReject()
  +displayReviewUpdated()
}

class DeclarationController {
  <<controller>>
  +viewDeclarationForm()
  +submitDeclaration()
  +validateDeclarationCheckbox()
  +validateRequiredInformation()
  +recordSubmittedAt()
  +forwardForVerification()
  +openDeclarationReview()
  +verifyDeclaration()
  +requestCorrection()
  +rejectDeclaration()
  +createVerificationEvent()
}

class TermsAcceptanceController {
  <<controller>>
  +checkTermsAcceptance()
  +openTermsModal()
  +validateAcceptanceCheckbox()
  +acceptTerms()
  +recordAcceptedAt()
  +allowPortalAccess()
}

class DeclarationService {
  <<service>>
  +buildDeclarationText()
  +validateSubmission()
  +submitDeclaration()
  +verifyDeclaration()
  +requestCorrection()
  +rejectDeclaration()
  +createVerificationEvent()
}

class TermsAcceptanceService {
  <<service>>
  +getCurrentTermsVersion()
  +hasAcceptedCurrentVersion()
  +recordTermsAcceptance()
  +invalidateOldVersionAcceptance()
}

class NotificationService {
  <<service>>
  +queueDeclarationSubmittedNotice()
  +queueDeclarationCorrectionNotice()
  +queueDeclarationVerifiedNotice()
}

Client "1" --> "0..*" TermsAcceptance : accepts terms versions
User "1" --> "0..*" TermsAcceptance : accepted by account
TermsAcceptanceModalView ..> TermsAcceptanceController : accepts popup terms
TermsAcceptanceController ..> TermsAcceptanceService : terms workflow
TermsAcceptanceService ..> TermsAcceptance : persists acceptance
Client "1" --> "0..*" Declaration : submits
Appointment "0..1" --> "0..*" Declaration : attached to
User "1" --> "0..*" Declaration : verifies
Declaration "1" --> "0..*" DeclarationVerificationEvent : history
User "1" --> "0..*" DeclarationVerificationEvent : verifier
DeclarationFormView ..> DeclarationController : submits
DeclarationReviewPanel ..> DeclarationController : verifies
DeclarationController ..> DeclarationService : declaration workflow
DeclarationService ..> Declaration : persists status
DeclarationService ..> DeclarationVerificationEvent : records event
DeclarationController ..> NotificationService : notifies client
```

## Diagram 4: Telemedicine And Attendance Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Client {
  +uuid id
  +string fullName
  +string matrixNo
  +string workerNo
}

class Appointment {
  +uuid id
  +string referenceNo
  +uuid clientId
  +uuid slotId
  +uuid counsellorId
  +SessionType sessionType
  +SessionMode sessionMode
  +AppointmentStatus status
  +string meetingLink
  +getAppointmentDetails()
  +validateAppointmentReference()
  +validateSessionType()
  +validateUserAuthorization()
  +isSessionAvailable()
}

class AppointmentParticipant {
  +uuid appointmentId
  +uuid clientId
  +string participantRole
  +validateAssignedParticipant()
}

class AttendanceSession {
  +uuid id
  +uuid appointmentId
  +SessionMode sessionMode
  +string qrTokenHash
  +uuid qrGeneratedByUserId
  +datetime qrGeneratedAt
  +datetime qrExpiresAt
  +datetime createdAt
  +datetime updatedAt
  +getOrCreateAttendanceSession()
  +generateQrToken()
  +expireQrToken()
  +validateQrToken()
}

class AttendanceParticipant {
  +uuid id
  +uuid attendanceSessionId
  +uuid clientId
  +AttendanceStatus status
  +AttendanceMethod method
  +datetime checkedInAt
  +uuid recordedByUserId
  +datetime updatedAt
  +markParticipantPresent()
  +markParticipantAbsent()
  +markParticipantExcused()
  +saveAttendanceStatus()
  +preventDuplicateAttendance()
}

class AttendanceEvent {
  +uuid id
  +uuid attendanceSessionId
  +uuid clientId
  +uuid userId
  +string eventType
  +AttendanceMethod method
  +json metadata
  +datetime createdAt
  +recordManualUpdate()
  +recordQrScan()
  +recordOnlineJoin()
  +recordOnlineLeave()
}

class AppointmentRecordPage {
  <<view>>
  +openAppointmentRecord()
  +displayAppointmentDetails()
  +displayJoinButton()
  +clickJoin()
  +displayJoinSuccess()
  +displayMeetingLinkError()
  +displayAccessDenied()
  +displaySessionNotOpen()
  +redirectToAppointmentList()
}

class AttendanceRecordPanel {
  <<view>>
  +openAttendanceRecord()
  +displayParticipantStatuses()
  +displayAttendanceOptions()
  +selectAttendanceStatus()
  +changeSessionMode()
  +addParticipant()
  +removeParticipant()
  +clickSaveAttendance()
  +displayAttendanceSaved()
  +displayMissingStatusError()
}

class QRDisplayPage {
  <<view>>
  +openQrDisplay()
  +displayAppointmentDetails()
  +displayQrCode()
  +clickRegenerateQr()
  +displayQrGenerationError()
  +closeQrDisplay()
}

class QRScanConfirmationPage {
  <<view>>
  +openQrScanPage()
  +displayAttendanceConfirmation()
  +confirmAttendance()
  +displayQrExpired()
  +displayDuplicateAttendance()
  +displayUnauthorizedScan()
}

class TelemedicineController {
  <<controller>>
  +openAppointmentRecord()
  +getAppointmentDetails()
  +validateAppointmentReference()
  +validateUserIdentity()
  +validateUserAuthorization()
  +validateSessionType()
  +validateMeetingLink()
  +joinOnlineSession()
  +recordJoinEvent()
  +returnMeetingLinkError()
  +returnAccessDenied()
  +returnSessionNotAvailable()
}

class AttendanceController {
  <<controller>>
  +openAttendanceRecord()
  +getOrCreateAttendanceSession()
  +saveAttendance()
  +validateParticipantStatus()
  +updateSessionMode()
  +updateParticipantList()
  +generateQrCode()
  +regenerateQrCode()
  +scanPhysicalQrCode()
  +confirmPhysicalAttendance()
  +autoLogOnlineAttendance()
  +markParticipantPresent()
  +saveAttendanceEvent()
}

class MeetingLinkService {
  <<service>>
  +generateMeetingLink()
  +validateMeetingLink()
  +openMeetingLink()
  +checkMeetingAvailability()
}

class AttendanceService {
  <<service>>
  +getOrCreateAttendanceSession()
  +validateParticipantStatus()
  +validateAssignedParticipant()
  +markParticipantPresent()
  +recordManualAttendance()
  +recordPhysicalQrAttendance()
  +recordOnlineJoinAttendance()
  +preventDuplicateAttendance()
  +saveAttendanceEvent()
}

class QRCodeService {
  <<service>>
  +generateQrPayload()
  +generateQrCode()
  +validateQrPayload()
  +validateAttendanceWindow()
  +expireQrToken()
}

Appointment "1" --> "0..1" AttendanceSession : has session
Appointment "1" --> "1..*" AppointmentParticipant : expected participants
AttendanceSession "1" --> "1..*" AttendanceParticipant : attendance rows
AttendanceSession "1" --> "0..*" AttendanceEvent : events
Client "1" --> "0..*" AttendanceParticipant : attendance
Client "1" --> "0..*" AttendanceEvent : event subject
User "1" --> "0..*" AttendanceEvent : actor
User "1" --> "0..*" AttendanceSession : generates qr
AppointmentRecordPage ..> TelemedicineController : join online
AttendanceRecordPanel ..> AttendanceController : save attendance
QRDisplayPage ..> AttendanceController : show qr
QRScanConfirmationPage ..> AttendanceController : scan qr
TelemedicineController ..> Appointment : validates
TelemedicineController ..> MeetingLinkService : meeting workflow
TelemedicineController ..> AttendanceService : online auto log
AttendanceController ..> AttendanceService : attendance workflow
AttendanceController ..> QRCodeService : qr workflow
AttendanceService ..> AttendanceSession : persists session
AttendanceService ..> AttendanceParticipant : updates status
AttendanceService ..> AttendanceEvent : logs event
QRCodeService ..> AttendanceSession : qr token
```

## Diagram 5: Chatbot, Emotion Tracking, Risk, And Counsellor Tasks

```mermaid
classDiagram
direction LR

class Client {
  +uuid id
  +string fullName
  +string email
  +string matrixNo
  +string workerNo
}

class Counsellor {
  +uuid id
  +string name
  +string email
  +reviewFlaggedClient()
}

class EmotionLog {
  +uuid id
  +uuid clientId
  +int score
  +string moodLabel
  +string note
  +datetime loggedAt
  +datetime createdAt
  +recordMood()
  +validateEmotionSelection()
  +detectRiskLanguage()
}

class ChatSession {
  +uuid id
  +uuid clientId
  +string status
  +datetime startedAt
  +datetime savedAt
  +datetime closedAt
  +openChatbot()
  +getOrCreateChatSession()
  +markAsSaved()
  +closeChatbot()
}

class ChatMessage {
  +uuid id
  +uuid chatSessionId
  +string senderRole
  +string message
  +datetime createdAt
  +validateMessageText()
  +createUserMessage()
  +createBotMessage()
}

class RiskFlag {
  +uuid id
  +uuid clientId
  +uuid assignedCounsellorId
  +string source
  +uuid sourceRefId
  +RiskLevel severity
  +string message
  +RiskFlagStatus status
  +datetime flaggedAt
  +datetime reviewedAt
  +datetime resolvedAt
  +createRiskFlag()
  +assignCounsellor()
  +markInReview()
  +recordReviewDecision()
  +resolve()
  +dismiss()
}

class CounsellorTask {
  +uuid id
  +uuid counsellorId
  +uuid clientId
  +uuid riskFlagId
  +string title
  +TaskPriority priority
  +datetime dueAt
  +TaskStatus status
  +string notes
  +datetime createdAt
  +datetime updatedAt
  +createInterventionTask()
  +startProgress()
  +completeTask()
  +cancelTask()
}

class SmartJournalPage {
  <<view>>
  +openSmartJournal()
  +selectEmotionLevel()
  +enterMoodNote()
  +clickSaveEmotion()
  +displayEmotionSaved()
  +displayRiskGuidance()
  +openAiSupport()
}

class AICounselorChatbot {
  <<view>>
  +openChatbot()
  +displayChatWindow()
  +displayGreeting()
  +displayQuickReplies()
  +typeMessage()
  +clickSend()
  +selectQuickReply()
  +placeQuickReplyInInput()
  +displayClientMessage()
  +displayAiResponse()
  +clickSaveChat()
  +displaySavedConfirmation()
  +displayRiskGuidance()
  +closeChatbot()
}

class EmotionHistoryPage {
  <<view>>
  +openEmotionHistory()
  +displayEmotionEntries()
  +filterEmotionHistory()
  +selectEmotionEntry()
  +displayEmotionDetail()
  +displayNoHistoryFound()
}

class CaseloadPage {
  <<view>>
  +openCaseload()
  +displayFlaggedClients()
  +filterByRisk()
  +selectFlaggedClient()
  +displayRiskIndicators()
  +displayChatbotRiskFlag()
  +displayEmotionHistory()
  +recordReviewNotes()
  +createInterventionTask()
}

class TaskBoardPage {
  <<view>>
  +openTaskBoard()
  +displayTasks()
  +createTask()
  +updateTaskStatus()
  +displayTaskCreated()
}

class EmotionLogController {
  <<controller>>
  +openEmotionLog()
  +saveEmotionLog()
  +validateEmotionSelection()
  +detectRiskLanguage()
  +createRiskFlag()
  +openAiSupport()
  +viewEmotionHistory()
  +filterEmotionHistory()
}

class ChatbotController {
  <<controller>>
  +openChatbot()
  +getOrCreateChatSession()
  +validateMessageText()
  +sendMessage()
  +createUserMessage()
  +generateAiResponse()
  +createBotMessage()
  +detectRisk()
  +createRiskFlag()
  +returnRiskGuidanceMessage()
  +saveChat()
  +markConversationForReview()
  +closeChatbot()
}

class RiskFlagController {
  <<controller>>
  +listFlaggedClients()
  +loadFlaggedClient()
  +viewRiskDetails()
  +calculateOverallRiskLevel()
  +recordReviewDecision()
  +resolveRiskFlag()
  +dismissRiskFlag()
}

class CounsellorTaskController {
  <<controller>>
  +listTasks()
  +createInterventionTask()
  +validateTaskDetails()
  +updateTaskStatus()
  +completeTask()
  +cancelTask()
}

class AIChatService {
  <<service>>
  +generateResponse()
  +generateCopingPrompt()
  +detectRiskIndicators()
  +buildRiskGuidanceMessage()
}

class RiskDetectionService {
  <<service>>
  +evaluateEmotionLog()
  +evaluateChatMessage()
  +evaluatePsychometricSubmission()
  +evaluateForumPost()
  +classifySeverity()
}

class TaskAssignmentService {
  <<service>>
  +assignRiskFlagToCounsellor()
  +createFollowUpTask()
  +calculateDueDate()
}

Client "1" --> "0..*" EmotionLog : logs
Client "1" --> "0..*" ChatSession : starts
ChatSession "1" --> "1..*" ChatMessage : contains
Client "1" --> "0..*" RiskFlag : has flags
Counsellor "1" --> "0..*" RiskFlag : assigned
Counsellor "1" --> "0..*" CounsellorTask : owns
Client "1" --> "0..*" CounsellorTask : subject
RiskFlag "0..1" --> "0..*" CounsellorTask : follow up tasks
SmartJournalPage ..> EmotionLogController : emotion flow
AICounselorChatbot ..> ChatbotController : chat flow
EmotionHistoryPage ..> EmotionLogController : history flow
CaseloadPage ..> RiskFlagController : risk review
TaskBoardPage ..> CounsellorTaskController : task flow
EmotionLogController ..> EmotionLog : persists log
EmotionLogController ..> RiskDetectionService : screens note
EmotionLogController ..> RiskFlag : creates risk
ChatbotController ..> ChatSession : manages session
ChatbotController ..> ChatMessage : stores messages
ChatbotController ..> AIChatService : response
ChatbotController ..> RiskDetectionService : screens chat
ChatbotController ..> RiskFlag : creates risk
RiskFlagController ..> RiskFlag : reviews
CounsellorTaskController ..> CounsellorTask : persists task
TaskAssignmentService ..> CounsellorTask : creates
AIChatService ..> RiskDetectionService : checks risk
RiskDetectionService ..> RiskFlag : creates flag
```

## Diagram 6: Psychometric Self-Assessment Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Client {
  +uuid id
  +string fullName
  +string email
  +string studentNo
  +string matrixNo
}

class Counsellor {
  +uuid id
  +string name
  +string email
}

class PsychometricTest {
  +uuid id
  +string code
  +string titleMs
  +string titleEn
  +string descriptionMs
  +string descriptionEn
  +string category
  +int estimatedMinutes
  +string sourcePdfFileName
  +uuid uploadedByUserId
  +ContentVisibility visibility
  +datetime createdAt
  +datetime updatedAt
  +getAvailableTests()
  +loadTestQuestions()
  +generateFromPdfUpload()
  +publish()
  +hide()
}

class PsychometricQuestion {
  +uuid id
  +uuid testId
  +int position
  +string promptMs
  +string promptEn
  +displayQuestion()
}

class PsychometricOption {
  +uuid id
  +uuid testId
  +int value
  +string labelMs
  +string labelEn
  +displayOption()
}

class PsychometricSubmission {
  +uuid id
  +uuid testId
  +uuid clientId
  +datetime submittedAt
  +int totalScore
  +int maxScore
  +int scorePercent
  +RiskLevel riskLevel
  +string aiSummaryMs
  +string aiSummaryEn
  +string aiRecommendationMs
  +string aiRecommendationEn
  +validateCompleteAnswers()
  +submitPsychometricTest()
  +calculateScore()
  +classifyRiskLevel()
  +generatePsychometricAiResult()
  +saveSubmission()
}

class PsychometricAnswer {
  +uuid id
  +uuid submissionId
  +uuid questionId
  +int optionValue
  +recordAnswer()
}

class RiskFlag {
  +uuid id
  +uuid clientId
  +string source
  +uuid sourceRefId
  +RiskLevel severity
  +RiskFlagStatus status
  +createPsychometricRiskFlag()
}

class PsychometricTestPage {
  <<view>>
  +openPsychometricTestPage()
  +displayAvailableTests()
  +selectTest()
  +displayQuestions()
  +answerQuestion()
  +saveDraft()
  +submitTest()
  +displayResultSummary()
  +displayIncompleteAnswerError()
}

class TestingMaterialsPage {
  <<view>>
  +openTestingMaterials()
  +displayUploadTestingMaterialForm()
  +enterTestTitle()
  +selectPdfFile()
  +clickUploadPdfAndGenerateTest()
  +displayGeneratedTestSummary()
  +displayUnsupportedFileTypeError()
}

class PsychometricResultsPage {
  <<view>>
  +openTriageDashboard()
  +displayLatestSubmissions()
  +searchSubmissions()
  +filterByRisk()
  +openSubmissionDetails()
  +displayNoResultsFound()
  +contactClient()
}

class PsychometricController {
  <<controller>>
  +getAvailableTests()
  +loadTestQuestions()
  +answerQuestion()
  +saveDraft()
  +validateCompleteAnswers()
  +submitPsychometricTest()
  +calculateScore()
  +generatePsychometricAiResult()
  +saveSubmission()
  +createRiskFlagIfHighRisk()
  +listTriageResults()
  +filterTriageResults()
  +openSubmissionDetails()
  +uploadPdfAndGenerateTest()
  +validatePdfUpload()
  +saveGeneratedTest()
}

class PsychometricScoringService {
  <<service>>
  +calculateTotalScore()
  +calculateMaxScore()
  +calculateScorePercent()
  +classifyRiskLevel()
  +generateSummary()
  +generateRecommendation()
}

class PsychometricGenerationService {
  <<service>>
  +extractQuestionsFromPdf()
  +generateTestCode()
  +generateQuestions()
  +generateOptions()
  +validateGeneratedTest()
}

class RiskDetectionService {
  <<service>>
  +evaluatePsychometricSubmission()
  +classifySeverity()
}

class FileStorageService {
  <<service>>
  +uploadPsychometricPdf()
  +validatePdfFile()
  +storeSourcePdf()
}

User "1" --> "0..*" PsychometricTest : uploads
PsychometricTest "1" --> "1..*" PsychometricQuestion : questions
PsychometricTest "1" --> "1..*" PsychometricOption : options
PsychometricTest "1" --> "0..*" PsychometricSubmission : submissions
Client "1" --> "0..*" PsychometricSubmission : submits
PsychometricSubmission "1" --> "1..*" PsychometricAnswer : answers
PsychometricQuestion "1" --> "0..*" PsychometricAnswer : answered
Client "1" --> "0..*" RiskFlag : assessment risk
PsychometricTestPage ..> PsychometricController : take test
TestingMaterialsPage ..> PsychometricController : manage test
PsychometricResultsPage ..> PsychometricController : triage
PsychometricController ..> PsychometricTest : loads saves
PsychometricController ..> PsychometricSubmission : persists
PsychometricController ..> PsychometricAnswer : records
PsychometricController ..> PsychometricScoringService : scores
PsychometricController ..> PsychometricGenerationService : generates
PsychometricController ..> RiskDetectionService : risk check
PsychometricController ..> FileStorageService : stores pdf
RiskDetectionService ..> RiskFlag : creates flag
```

## Diagram 7: Educational Resource Library Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Client {
  +uuid id
  +string fullName
  +string email
}

class ResourceLibraryItem {
  +uuid id
  +string titleMs
  +string titleEn
  +string descriptionMs
  +string descriptionEn
  +ResourceCategory category
  +ResourceType resourceType
  +string durationLabel
  +string url
  +ContentVisibility visibility
  +uuid uploadedByUserId
  +datetime createdAt
  +datetime updatedAt
  +validateResourceDetails()
  +validateResourceUrl()
  +uploadLearningMaterial()
  +publish()
  +hide()
  +deleteResource()
  +openResource()
}

class ResourceAccessLog {
  +uuid id
  +uuid resourceId
  +uuid clientId
  +datetime accessedAt
  +recordAccess()
}

class LearningMaterialsPage {
  <<view>>
  +openLearningMaterials()
  +displayUploadLearningMaterialForm()
  +enterResourceDetails()
  +clickUploadLearningMaterial()
  +displayResourceCount()
  +displayUploadSuccess()
  +displayMissingFieldError()
  +displayInvalidUrlError()
}

class ResourceLibraryPage {
  <<view>>
  +openResourceLibrary()
  +displayLearningMaterials()
  +searchMaterials()
  +filterByCategory()
  +openSelectedMaterial()
  +displayFilteredResources()
  +displayNoMatchingResources()
  +displayResourceUnavailable()
}

class ResourceLibraryController {
  <<controller>>
  +listResources()
  +searchResources()
  +filterResources()
  +openResource()
  +validateResourceUrl()
  +recordResourceAccess()
  +uploadLearningMaterial()
  +validateResourceDetails()
  +saveResource()
  +publishResource()
  +hideResource()
}

class ResourceStorageService {
  <<service>>
  +validateResourceUrl()
  +storeResourceMetadata()
  +resolveResourceUrl()
  +checkResourceAvailability()
}

User "1" --> "0..*" ResourceLibraryItem : uploads
ResourceLibraryItem "1" --> "0..*" ResourceAccessLog : access logs
Client "1" --> "0..*" ResourceAccessLog : accesses
LearningMaterialsPage ..> ResourceLibraryController : manages
ResourceLibraryPage ..> ResourceLibraryController : accesses
ResourceLibraryController ..> ResourceLibraryItem : persists
ResourceLibraryController ..> ResourceAccessLog : logs
ResourceLibraryController ..> ResourceStorageService : validates
ResourceStorageService ..> ResourceLibraryItem : resource data
```

## Diagram 8: Peer Support Forum Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Client {
  +uuid id
  +string fullName
  +string email
}

class ForumCategory {
  +uuid id
  +string name
  +boolean isActive
  +activateCategory()
  +deactivateCategory()
}

class ForumPost {
  +uuid id
  +uuid authorClientId
  +uuid categoryId
  +string title
  +string content
  +int safetyScore
  +string moderationReason
  +ForumPostStatus status
  +datetime createdAt
  +datetime updatedAt
  +validatePostDetails()
  +submitPost()
  +scoreSafety()
  +publishPost()
  +queueForModeration()
  +approvePost()
  +hidePost()
  +restorePost()
  +deletePost()
}

class ForumSupport {
  +uuid postId
  +uuid clientId
  +datetime createdAt
  +supportPost()
}

class ForumModerationEvent {
  +uuid id
  +uuid postId
  +uuid moderatorUserId
  +string action
  +ForumPostStatus previousStatus
  +ForumPostStatus nextStatus
  +string reason
  +datetime createdAt
  +recordModerationAction()
}

class RiskFlag {
  +uuid id
  +uuid clientId
  +string source
  +uuid sourceRefId
  +RiskLevel severity
  +RiskFlagStatus status
  +createForumRiskFlag()
}

class PeerSupportForumPage {
  <<view>>
  +openForum()
  +displayForumPosts()
  +openCreatePostForm()
  +enterPostDetails()
  +submitForumPost()
  +supportPost()
  +displaySubmissionConfirmation()
  +displayModerationNotice()
}

class ForumModerationPage {
  <<view>>
  +openForumModeration()
  +displayUnsafePosts()
  +displayAllForumPosts()
  +filterForumPosts()
  +clickApprovePost()
  +clickHidePost()
  +clickRestorePost()
  +clickDeletePost()
  +displayModerationHistory()
  +displayModerationActionFailed()
}

class ForumController {
  <<controller>>
  +listForumPosts()
  +openCreatePostForm()
  +submitForumPost()
  +validatePostDetails()
  +scoreForumPost()
  +publishOrQueuePost()
  +supportPost()
  +cancelPostOperation()
}

class ForumModerationController {
  <<controller>>
  +openForumModeration()
  +filterForumPosts()
  +approvePost()
  +hidePost()
  +restorePost()
  +deletePost()
  +recordModerationEvent()
  +returnNoPostsFound()
  +returnModerationFailure()
}

class ContentModerationService {
  <<service>>
  +scoreForumPost()
  +detectUnsafeContent()
  +decideModerationStatus()
  +buildModerationReason()
}

class RiskDetectionService {
  <<service>>
  +evaluateForumPost()
  +classifySeverity()
}

ForumCategory "1" --> "0..*" ForumPost : categorizes
Client "1" --> "0..*" ForumPost : authors
ForumPost "1" --> "0..*" ForumSupport : support actions
Client "1" --> "0..*" ForumSupport : supports
ForumPost "1" --> "0..*" ForumModerationEvent : moderation history
User "1" --> "0..*" ForumModerationEvent : moderates
Client "1" --> "0..*" RiskFlag : forum risk
PeerSupportForumPage ..> ForumController : submits
ForumModerationPage ..> ForumModerationController : moderates
ForumController ..> ForumPost : creates
ForumController ..> ForumSupport : supports
ForumController ..> ContentModerationService : safety review
ForumModerationController ..> ForumPost : updates status
ForumModerationController ..> ForumModerationEvent : records
ContentModerationService ..> RiskDetectionService : risk check
RiskDetectionService ..> RiskFlag : creates flag
```

## Diagram 9: Notification Domain

```mermaid
classDiagram
direction LR

class User {
  +uuid id
  +string name
  +string email
  +UserRole role
}

class Appointment {
  +uuid id
  +string referenceNo
  +AppointmentStatus status
  +datetime submittedAt
}

class Declaration {
  +uuid id
  +DeclarationStatus status
  +datetime submittedAt
}

class RiskFlag {
  +uuid id
  +RiskLevel severity
  +RiskFlagStatus status
  +string message
}

class EmailNotification {
  +uuid id
  +uuid recipientUserId
  +uuid appointmentId
  +uuid declarationId
  +string eventType
  +string subject
  +string body
  +NotificationStatus status
  +string errorMessage
  +datetime sentAt
  +datetime createdAt
  +identifyRecipient()
  +prepareNotification()
  +generateSubjectAndBody()
  +queueNotification()
  +markSent()
  +markFailed()
  +retryDelivery()
}

class EmailInboxExternal {
  <<view>>
  +receiveEmail()
  +openNotification()
  +clickNotificationLink()
  +ignoreNotification()
}

class NotificationStatusView {
  <<view>>
  +displayQueuedNotifications()
  +displaySentNotifications()
  +displayFailedNotifications()
  +retryFailedNotification()
}

class NotificationController {
  <<controller>>
  +queueNotification()
  +sendNotification()
  +openNotificationLink()
  +validateNotificationLink()
  +markNotificationSent()
  +markNotificationFailed()
  +retryNotification()
}

class NotificationService {
  <<service>>
  +queueAppointmentSubmittedNotice()
  +queueAppointmentApprovedNotice()
  +queueCounsellorReviewNotice()
  +queueFollowUpCreatedNotice()
  +queueScheduleUpdatedNotice()
  +queueDeclarationSubmittedNotice()
  +queueDeclarationCorrectionNotice()
  +queueRiskFlagNotice()
  +identifyRecipient()
  +generateEmailSubject()
  +generateEmailBody()
  +sendEmail()
  +retryFailedEmail()
}

class EmailService {
  <<service>>
  +sendEmail()
  +handleDeliveryFailure()
  +recordSentAt()
}

User "1" --> "0..*" EmailNotification : receives
Appointment "0..1" --> "0..*" EmailNotification : appointment event
Declaration "0..1" --> "0..*" EmailNotification : declaration event
RiskFlag "0..1" --> "0..*" EmailNotification : risk event
EmailInboxExternal ..> NotificationController : opens link
NotificationStatusView ..> NotificationController : retries
NotificationController ..> NotificationService : notification workflow
NotificationService ..> EmailNotification : persists
NotificationService ..> EmailService : delivery
EmailService ..> EmailNotification : updates status
```

## Complete Sequence Function Coverage

This matrix shows the functions that should be available when generating sequence diagrams for any documented use case.

### User Management

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| UM01 Onboard Counselor | `openCounsellorList()`, `displayCounsellorRecords()`, `clickAddCounsellor()`, `displayCounsellorForm()`, `fillCounsellorForm()`, `clickSaveCounsellor()`, `displaySuccessMessage()`, `displayDuplicateError()`, `cancelOperation()` | `listCounsellors()`, `openAddCounsellorForm()`, `saveCounsellor()`, `validateCounsellorDetails()`, `checkDuplicateCounsellor()`, `searchCounsellor()`, `filterCounsellor()` | `createCounsellorRecord()`, `validateCounsellorDetails()`, `checkDuplicateCounsellor()`, `verifyAuthenticatedUser()`, `authorizeAdmin()` |
| UM02 Find Client Profile | `openClientInformation()`, `displayClientRecords()`, `enterSearchKeyword()`, `selectFilter()`, `selectClientRecord()`, `displayClientProfile()`, `displayEmptyState()`, `displayAccessDenied()` | `listClientProfiles()`, `searchClientProfile()`, `filterClientProfile()`, `openClientProfile()`, `verifyProfilePermission()`, `returnProfileNotFound()`, `returnAccessDenied()` | `findClientProfile()`, `searchClientProfile()`, `filterClientProfile()`, `verifyProfilePermission()` |
| UM03 Manage User Profile | `openProfileForm()`, `displayProfileTabs()`, `displayLockedProfileNotice()`, `editPermittedFields()`, `clickSaveProfile()`, `displayProfileSaved()`, `displayValidationError()` | `openProfile()`, `updateProfile()`, `validateProfileDetails()`, `checkDuplicateIdentifiers()`, `changeUserStatus()` | `updateProfile()`, `updateAllowedProfile()`, `validateProfileDetails()`, `checkDuplicateIdentifiers()` |

### Appointment And Scheduling

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| AS01 Book Appointment | `openSmartAppointmentForm()`, `loadBookingForm()`, `displayBookingTypeOptions()`, `displayCalendarAndAvailableSlots()`, `submitAppointmentRequest()`, `displayBookingSummary()`, `displaySlotUnavailableMessage()`, `displayValidationErrors()` | `loadBookingForm()`, `findClientProfileById()`, `getAvailableSlots()`, `submitAppointmentRequest()`, `validateAppointmentRequest()`, `checkSlotAvailability()`, `createAppointment()`, `createDeclaration()`, `generateMeetingLink()` | `loadBookingContext()`, `validateAppointmentRequest()`, `checkSlotAvailability()`, `generateReferenceNumber()`, `createAppointment()`, `createDeclaration()`, `generateMeetingLink()` |
| AS02 Request Follow Up | `selectContinueFollowUp()`, `openAppointmentRecords()`, `selectFollowUpAction()`, `redirectToSmartAppointmentForm()`, `displayFollowUpUnavailable()` | `hasFollowUpRecords()`, `checkFollowUpAvailability()`, `submitFollowUpRequest()` | `hasFollowUpRecords()`, `getEligibleFollowUpRecords()`, `prepareFollowUpBooking()`, `submitFollowUpRequest()` |
| AS03 Book New Appointment | `selectCreateNewBooking()`, `fillAppointmentDetails()`, `saveDraft()`, `submitAppointmentRequest()`, `cancelOperation()` | `generateReferenceNumber()`, `validateAppointmentRequest()`, `saveDraft()`, `submitAppointmentRequest()` | `prepareNewBooking()`, `saveDraft()`, `createAppointmentRequest()` |
| AS04 Manage Slots | `openSlotManager()`, `displaySlotManager()`, `addSlotManually()`, `deleteSlot()`, `saveSlotChanges()`, `resetDefaultSchedule()` | `openSlotManager()`, `addSlot()`, `deleteSlot()`, `saveSlotChanges()`, `resetSlotSchedule()` | `createSlot()`, `deleteSlot()`, `saveSlotChanges()`, `generateManualSlot()` |
| AS05 Bulk Generate Slots | `configureBulkSetup()`, `toggleBulkWeekday()`, `generateBulkSlots()`, `displayImportSummary()` | `generateBulkSlots()`, `validateBulkSetup()` | `generateBulkSlots()`, `validateDateRange()`, `validateWeekdaySelection()`, `replaceOrAppendSlots()`, `recordGenerationSummary()` |
| AS06 Import CSV Template | `uploadCsvTemplate()`, `displayImportSummary()`, `displayValidationError()` | `parseCsvTemplate()`, `validateCsvRows()`, `importCsvSlots()` | `parseCsvRows()`, `parseSessionTypesFromCsv()`, `validateCsvRows()`, `createCsvBatch()`, `replaceOrAppendSlots()` |
| AS07 Verify Appointment | `openAppointmentQueue()`, `displayAppointmentRequests()`, `filterAppointmentRequests()`, `openAppointmentDetails()`, `clickApprove()`, `clickMoveToCounsellorReview()`, `clickOpenSession()`, `clickCompleteSession()`, `clickMarkFollowUp()`, `clickCloseAppointment()` | `openAppointmentQueue()`, `openAppointmentDetails()`, `approveAppointment()`, `moveToCounsellorReview()`, `openSession()`, `completeSession()`, `markFollowUpRequired()`, `closeAppointment()` | `getAppointmentDetails()`, `approve()`, `moveToCounsellorReview()`, `openSession()`, `completeSession()`, `markFollowUp()`, `closeAppointment()` |

### Declaration

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| DC01 View Declaration Form | `openDeclarationForm()`, `displayDeclarationText()`, `displayConfirmationCheckbox()`, `displayProfileConfirmation()` | `viewDeclarationForm()` | `viewDeclarationForm()`, `buildDeclarationText()` |
| DC02 Submit Declaration | `clickSubmitDeclaration()`, `displaySubmissionStatus()`, `displayValidationError()` | `submitDeclaration()`, `validateDeclarationCheckbox()`, `validateRequiredInformation()`, `recordSubmittedAt()`, `forwardForVerification()` | `validateSubmission()`, `submitDeclaration()`, `markPendingVerification()` |
| DC03 Verify Declaration | `openDeclarationReview()`, `displaySubmittedInformation()`, `clickVerify()`, `clickRequestCorrection()`, `clickReject()`, `displayReviewUpdated()` | `openDeclarationReview()`, `verifyDeclaration()`, `requestCorrection()`, `rejectDeclaration()`, `createVerificationEvent()` | `verifyDeclaration()`, `requestCorrection()`, `rejectDeclaration()`, `createVerificationEvent()`, `recordVerificationAction()` |

### Telemedicine And Attendance

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| TA01 Join Online Session | `openAppointmentRecord()`, `displayAppointmentDetails()`, `displayJoinButton()`, `clickJoin()`, `displayJoinSuccess()`, `displayMeetingLinkError()`, `displayAccessDenied()`, `displaySessionNotOpen()` | `openAppointmentRecord()`, `getAppointmentDetails()`, `validateAppointmentReference()`, `validateUserIdentity()`, `validateUserAuthorization()`, `validateSessionType()`, `validateMeetingLink()`, `joinOnlineSession()`, `recordJoinEvent()` | `getAppointmentDetails()`, `validateAppointmentReference()`, `validateSessionType()`, `validateUserAuthorization()`, `validateMeetingLink()`, `openMeetingLink()`, `recordOnlineJoin()` |
| TA02 Record Attendance | `openAttendanceRecord()`, `displayParticipantStatuses()`, `displayAttendanceOptions()`, `selectAttendanceStatus()`, `changeSessionMode()`, `addParticipant()`, `removeParticipant()`, `clickSaveAttendance()`, `displayAttendanceSaved()` | `openAttendanceRecord()`, `getOrCreateAttendanceSession()`, `saveAttendance()`, `validateParticipantStatus()`, `updateSessionMode()`, `updateParticipantList()` | `getOrCreateAttendanceSession()`, `saveAttendanceStatus()`, `markParticipantPresent()`, `recordManualUpdate()`, `validateParticipantStatus()` |
| TA03 Scan Physical QR Code | `openQrScanPage()`, `displayAttendanceConfirmation()`, `confirmAttendance()`, `displayQrExpired()`, `displayDuplicateAttendance()`, `displayUnauthorizedScan()` | `scanPhysicalQrCode()`, `confirmPhysicalAttendance()`, `markParticipantPresent()`, `saveAttendanceEvent()` | `validateQrPayload()`, `validateAttendanceWindow()`, `validateAssignedParticipant()`, `preventDuplicateAttendance()`, `recordQrScan()` |
| TA04 Auto-log Attendance Online | `clickJoin()`, `displayJoinSuccess()` | `autoLogOnlineAttendance()`, `markParticipantPresent()`, `saveAttendanceEvent()` | `recordOnlineJoinAttendance()`, `preventDuplicateAttendance()`, `recordOnlineJoin()` |

### Chatbot And Tracking

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| CT01 Log Daily Emotion | `openSmartJournal()`, `selectEmotionLevel()`, `enterMoodNote()`, `clickSaveEmotion()`, `displayEmotionSaved()`, `displayRiskGuidance()`, `openAiSupport()` | `openEmotionLog()`, `saveEmotionLog()`, `validateEmotionSelection()`, `detectRiskLanguage()`, `createRiskFlag()`, `openAiSupport()` | `recordMood()`, `validateEmotionSelection()`, `detectRiskLanguage()`, `evaluateEmotionLog()`, `createRiskFlag()` |
| CT02 Chat with AI Counselor | `openChatbot()`, `displayChatWindow()`, `displayQuickReplies()`, `typeMessage()`, `clickSend()`, `selectQuickReply()`, `displayClientMessage()`, `displayAiResponse()`, `clickSaveChat()`, `displaySavedConfirmation()`, `closeChatbot()` | `openChatbot()`, `getOrCreateChatSession()`, `validateMessageText()`, `sendMessage()`, `createUserMessage()`, `generateAiResponse()`, `createBotMessage()`, `detectRisk()`, `createRiskFlag()`, `saveChat()`, `markConversationForReview()`, `closeChatbot()` | `getOrCreateChatSession()`, `validateMessageText()`, `createUserMessage()`, `generateResponse()`, `createBotMessage()`, `detectRiskIndicators()`, `createRiskFlag()`, `markAsSaved()` |
| CT03 View Emotion History | `openEmotionHistory()`, `displayEmotionEntries()`, `filterEmotionHistory()`, `selectEmotionEntry()`, `displayEmotionDetail()`, `displayNoHistoryFound()` | `viewEmotionHistory()`, `filterEmotionHistory()` | `searchClientProfile()`, `recordMood()`, `evaluateEmotionLog()` |
| CT04 Investigate Flagged Client | `openCaseload()`, `displayFlaggedClients()`, `filterByRisk()`, `selectFlaggedClient()`, `displayRiskIndicators()`, `recordReviewNotes()`, `createInterventionTask()` | `listFlaggedClients()`, `loadFlaggedClient()`, `viewRiskDetails()`, `calculateOverallRiskLevel()`, `recordReviewDecision()`, `createInterventionTask()` | `markInReview()`, `recordReviewDecision()`, `resolve()`, `createInterventionTask()`, `assignRiskFlagToCounsellor()` |

### Psychometric Self-Assessment

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| SA01 Take Psychometric Test | `openPsychometricTestPage()`, `displayAvailableTests()`, `selectTest()`, `displayQuestions()`, `answerQuestion()`, `saveDraft()`, `submitTest()`, `displayResultSummary()`, `displayIncompleteAnswerError()` | `getAvailableTests()`, `loadTestQuestions()`, `answerQuestion()`, `saveDraft()`, `validateCompleteAnswers()`, `submitPsychometricTest()`, `calculateScore()`, `generatePsychometricAiResult()`, `saveSubmission()`, `createRiskFlagIfHighRisk()` | `getAvailableTests()`, `loadTestQuestions()`, `recordAnswer()`, `validateCompleteAnswers()`, `calculateTotalScore()`, `calculateScorePercent()`, `classifyRiskLevel()`, `generateRecommendation()`, `saveSubmission()` |
| SA02 View Triage Dashboard | `openTriageDashboard()`, `displayLatestSubmissions()`, `searchSubmissions()`, `filterByRisk()`, `openSubmissionDetails()`, `displayNoResultsFound()`, `contactClient()` | `listTriageResults()`, `filterTriageResults()`, `openSubmissionDetails()` | `evaluatePsychometricSubmission()`, `classifyRiskLevel()` |
| SA03 Manage Test | `openTestingMaterials()`, `displayUploadTestingMaterialForm()`, `enterTestTitle()`, `selectPdfFile()`, `clickUploadPdfAndGenerateTest()`, `displayGeneratedTestSummary()`, `displayUnsupportedFileTypeError()` | `uploadPdfAndGenerateTest()`, `validatePdfUpload()`, `saveGeneratedTest()` | `uploadPsychometricPdf()`, `validatePdfFile()`, `extractQuestionsFromPdf()`, `generateTestCode()`, `generateQuestions()`, `generateOptions()`, `generateFromPdfUpload()` |

### Resource Library, Forum, And Notification

| Use Case | View Functions | Controller Functions | Model / Service Functions |
| --- | --- | --- | --- |
| ER01 Manage Resource Library | `openLearningMaterials()`, `displayUploadLearningMaterialForm()`, `enterResourceDetails()`, `clickUploadLearningMaterial()`, `displayResourceCount()`, `displayUploadSuccess()`, `displayMissingFieldError()`, `displayInvalidUrlError()` | `uploadLearningMaterial()`, `validateResourceDetails()`, `validateResourceUrl()`, `saveResource()` | `validateResourceDetails()`, `validateResourceUrl()`, `uploadLearningMaterial()`, `storeResourceMetadata()` |
| ER02 Access Learning Materials | `openResourceLibrary()`, `displayLearningMaterials()`, `searchMaterials()`, `filterByCategory()`, `openSelectedMaterial()`, `displayFilteredResources()`, `displayNoMatchingResources()`, `displayResourceUnavailable()` | `listResources()`, `searchResources()`, `filterResources()`, `openResource()`, `recordResourceAccess()` | `openResource()`, `checkResourceAvailability()`, `recordAccess()` |
| PS01 Submit Forum Post | `openForum()`, `displayForumPosts()`, `openCreatePostForm()`, `enterPostDetails()`, `submitForumPost()`, `supportPost()`, `displaySubmissionConfirmation()`, `displayModerationNotice()` | `listForumPosts()`, `openCreatePostForm()`, `submitForumPost()`, `validatePostDetails()`, `scoreForumPost()`, `publishOrQueuePost()`, `supportPost()` | `validatePostDetails()`, `submitPost()`, `scoreSafety()`, `queueForModeration()`, `publishPost()`, `supportPost()`, `evaluateForumPost()` |
| PS02 Moderate Forum | `openForumModeration()`, `displayUnsafePosts()`, `filterForumPosts()`, `clickApprovePost()`, `clickHidePost()`, `clickRestorePost()`, `clickDeletePost()`, `displayModerationHistory()` | `openForumModeration()`, `filterForumPosts()`, `approvePost()`, `hidePost()`, `restorePost()`, `deletePost()`, `recordModerationEvent()` | `approvePost()`, `hidePost()`, `restorePost()`, `deletePost()`, `recordModerationAction()` |

## Enum Reference

| Enum | Values |
| --- | --- |
| `UserRole` | `admin`, `client`, `counselor` |
| `AccountStatus` | `active`, `inactive`, `suspended` |
| `ClientType` | `student`, `staff`, `alumni` |
| `CounsellorType` | `staff`, `trainee` |
| `ServiceSessionMode` | `physical`, `online`, `hybrid` |
| `SessionType` | `physical`, `online` |
| `SessionMode` | `individual`, `group` |
| `AppointmentType` | `new`, `follow_up` |
| `AppointmentStatus` | `pending`, `needs_review`, `counsellor_reviewing`, `approved`, `on_going`, `complete`, `completed`, `follow_up`, `closed` |
| `AttendanceStatus` | `pending`, `present`, `absent`, `excused` |
| `AttendanceMethod` | `manual`, `physical_qr`, `online_auto` |
| `DeclarationStatus` | `draft`, `submitted`, `pending_verification`, `verified`, `correction_required`, `rejected` |
| `RiskLevel` | `low`, `moderate`, `high` |
| `RiskFlagStatus` | `open`, `in_review`, `resolved`, `dismissed` |
| `TaskPriority` | `low`, `medium`, `high` |
| `TaskStatus` | `open`, `in_progress`, `completed`, `cancelled` |
| `ResourceCategory` | `stress`, `anxiety`, `sleep`, `support` |
| `ResourceType` | `article`, `video`, `toolkit` |
| `ContentVisibility` | `draft`, `published`, `hidden`, `deleted` |
| `ForumPostStatus` | `pending_review`, `published`, `hidden`, `deleted` |
| `NotificationStatus` | `queued`, `sent`, `failed` |

## Drawing Guidance For Visual Paradigm

Draw these as separate package-level domain class diagrams:

1. `User Management`
2. `Appointment And Scheduling`
3. `Declaration`
4. `Telemedicine And Attendance`
5. `Chatbot Tracking And Risk`
6. `Psychometric Self-Assessment`
7. `Educational Resource Library`
8. `Peer Support Forum`
9. `Notification`

For each diagram:

- Put `<<view>>` classes on the left.
- Put `<<controller>>` classes in the middle.
- Put `<<service>>` classes after controllers.
- Put model/domain classes on the right.
- Draw View to Controller dependencies as dashed dependencies.
- Draw Controller to Service dependencies as dashed dependencies.
- Draw Service to Model dependencies as dashed dependencies.
- Draw Model to Model relationships with multiplicities.
- Keep Supabase PostgreSQL out of the class diagram itself. Supabase belongs in the architecture/component diagram, while these model classes represent the domain data stored in Supabase.
