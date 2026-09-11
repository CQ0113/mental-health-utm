# PsyCare 2.0 SRS Class Diagrams

This document contains the updated module-based SRS class diagrams for PsyCare 2.0.

The diagrams are now separated into the 8 system modules and include the classes used in the sequence diagrams:

- `<<View>>`
- `<<Controller>>`
- `<<Model>>`
- `<<Service>>`

Actors and the Supabase PostgreSQL database lifeline are not modeled as classes. Database-backed classes are represented by their related `<<Model>>` classes, and the full entity attributes are documented in `docs/entity-data-dictionary.md`.

Relationship notation used:

- `<|--` inheritance/generalization: a concrete class specializes an abstract layer class such as `View`, `Controller`, `Model`, or `Service`.
- `-->` association: one class is linked to or communicates with another class.
- `o--` aggregation: a controller/service coordinates model or service collaborators but does not own their lifecycle.
- `*--` composition: the parent owns child records/components that normally depend on the parent lifecycle.

## Diagram 1: User Management Module

Covered use cases: UM01 Onboard Counselor, UM02 Find Client Profile, UM03 Manage User Profile.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class CounsellorPPsiPage["<<View>> CounsellorPPsiPage"] {
  +openCounsellorPPsiPage()
  +displayRecordsAndFilters()
  +displayAddCounsellorForm()
  +enterCounsellorDetails()
  +clickSave()
  +showConfirmSaveDialog()
  +showRequiredFieldsError()
  +showDuplicateRecordError()
  +showSuccessMessage()
  +enterSearchOrFilter()
  +displayMatchingRecords()
  +displayNoMatchingResults()
  +cancelOperation()
}

class ClientProfilePage["<<View>> ClientProfilePage"] {
  +displayClientRecordsAndFilters()
  +displaySearchFields()
  +displayMatchingProfiles()
  +displayClientProfileSections()
  +displayInvalidSearchError()
  +displayNoMatchingProfiles()
  +displayAccessDenied()
  +redirectToPreviousPage()
}

class MyAccountPage["<<View>> MyAccountPage"] {
  +displayLockedClientInformationForm()
  +displayProfileLockedNotice()
  +displayReadOnlyTabFields()
  +returnToPreviousPage()
}

class ClientInformationPage["<<View>> ClientInformationPage"] {
  +displayClientInformationList()
  +displayEditableClientForm()
  +showSaveConfirmationDialog()
  +showProfileValidationError()
  +showDuplicateProfileError()
  +showProfileSaveSuccess()
  +displayClientDetailTabs()
  +showTabUpdateSuccess()
}

class CounsellorController["<<Controller>> CounsellorController"] {
  +loadCounsellorList()
  +saveCounsellor(formData)
  +validateCounsellorDetails()
  +requestSaveConfirmation()
  +confirmSaveCounsellor(formData)
  +searchCounsellors(criteria)
  +returnCounsellorList()
  +returnFilteredRecords(records)
  +returnValidationError()
  +returnDuplicateError()
  +returnSuccess()
}

class ClientProfileController["<<Controller>> ClientProfileController"] {
  +loadClientRecords()
  +searchClientProfiles(criteria)
  +validateSearchCriteria(criteria)
  +viewClientProfile(clientId)
  +verifyProfilePermission(userId, clientId)
  +returnClientRecordList()
  +returnMatchingProfiles(records)
  +returnClientProfileDetails(profileDetails)
  +returnInvalidSearchError()
  +returnNoMatchingProfiles()
  +returnAccessDenied()
}

class UserProfileController["<<Controller>> UserProfileController"] {
  +loadMyAccount(userId)
  +loadClientInformationPage()
  +createOrEditClientProfile(formData)
  +validateProfileDetails(formData)
  +checkProfileConflict(formData)
  +requestSaveConfirmation()
  +saveClientProfile(formData)
  +loadClientProfileTabs(clientId)
  +updateClientProfileTabs(tabData)
  +returnProfileSaveSuccess()
  +returnTabUpdateSuccess()
  +returnWithoutSaving()
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  status
  +createOrLinkCounsellorUser(formData)
  +findAccount(userId)
  +checkAdminPermission(userId)
  +checkViewPermission(userId, clientId)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  matrix_no
  worker_no
  profile_locked
  +findByUserId(userId)
  +getClientProfiles()
  +getClientSummaries()
  +findByCriteria(criteria)
  +findProfileById(clientId)
  +checkDuplicateIdentifiers(email, phone, matrixNo, workerNo)
  +createProfile(formData)
  +updateProfile(clientId, formData)
  +updateProfileTabs(clientId, tabData)
}

class Counsellor["<<Model>> Counsellor"] {
  id
  user_id
  ppsi_no
  worker_no
  name
  counsellor_type
  location_id
  status
  +getCounsellors()
  +checkDuplicate(ppsiNo, workerNo, email)
  +createCounsellorProfile(formData, userId)
  +findByCriteria(criteria)
}

class CounsellingLocation["<<Model>> CounsellingLocation"] {
  id
  code
  name
  campus
  address
  is_active
  +findLocation(locationId)
}

class Appointment["<<Model>> Appointment"] {
  id
  reference_no
  client_id
  status
  +getAppointmentsByClient(clientId)
  +createOrUpdateAppointmentInfo(formData, clientId)
}

class Declaration["<<Model>> Declaration"] {
  id
  client_id
  appointment_id
  status
  +getDeclarationsByClient(clientId)
  +updateConfirmationInfo(clientId, confirmationData)
}

View <|-- CounsellorPPsiPage
View <|-- ClientProfilePage
View <|-- MyAccountPage
View <|-- ClientInformationPage
Controller <|-- CounsellorController
Controller <|-- ClientProfileController
Controller <|-- UserProfileController
Model <|-- UserAccount
Model <|-- ClientProfile
Model <|-- Counsellor
Model <|-- CounsellingLocation
Model <|-- Appointment
Model <|-- Declaration
CounsellorPPsiPage --> CounsellorController : submits and filters
ClientProfilePage --> ClientProfileController : searches and opens profile
MyAccountPage --> UserProfileController : loads locked profile
ClientInformationPage --> UserProfileController : manages profile
CounsellorController o-- Counsellor : uses
CounsellorController o-- UserAccount : creates account
CounsellorController o-- CounsellingLocation : validates location
ClientProfileController o-- ClientProfile : reads profiles
ClientProfileController o-- UserAccount : checks permission
ClientProfileController o-- Appointment : loads appointment history
ClientProfileController o-- Declaration : loads declarations
UserProfileController o-- ClientProfile : manages profile
UserProfileController o-- UserAccount : checks account/admin
UserProfileController o-- Appointment : updates appointment info
UserProfileController o-- Declaration : updates confirmation info
UserAccount "1" --> "0..1" ClientProfile : has client profile
UserAccount "1" --> "0..1" Counsellor : has counsellor profile
CounsellingLocation "1" --> "0..*" Counsellor : assigned location
ClientProfile "1" --> "0..*" Appointment : owns appointments
ClientProfile "1" --> "0..*" Declaration : submits declarations
Appointment "1" --> "0..*" Declaration : attached declaration
```

## Diagram 2: Telemedicine And Attendance Module

Covered use cases: TA01 Join Online Session, TA02 Record Attendance, TA03 Scan Physical QR Code, TA04 Auto-log Attendance(Online).

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class AppointmentRecordPage["<<View>> AppointmentRecordPage"] {
  +openAppointmentRecord()
  +getAppointmentDetails(appointmentReference)
  +displayAppointmentDetails()
  +joinOnlineSession(appointmentReference, userId)
  +displayAttendanceAutoLogged()
  +showSessionNotAvailableMessage()
  +showInvalidMeetingLinkError()
  +showAccessDeniedMessage()
  +redirectToAppointmentList()
}

class AttendanceRecordPage["<<View>> AttendanceRecordPage"] {
  +displayAttendanceRecordPanel()
  +displayAttendanceOptions()
  +selectAttendanceStatus()
  +clickSaveAttendance()
  +showMissingStatusError()
  +showInvalidAppointmentReferenceError()
  +showAttendanceSaveSuccess()
  +closeAttendancePanel()
}

class PhysicalQrAttendancePage["<<View>> PhysicalQrAttendancePage"] {
  +openQrAttendancePage(qrPayload)
  +displayAttendanceConfirmationPage()
  +requestClientIdentityConfirmation()
  +confirmAttendance()
  +showInvalidOrExpiredQrError()
  +showAlreadyCheckedInMessage()
  +showUnauthorizedScanError()
  +showNonPhysicalSessionError()
  +showAttendanceConfirmation()
}

class OnlineSessionPage["<<View>> OnlineSessionPage"] {
  +openMeetingLink(appointmentRef)
  +notifyAttendanceView()
  +showAutoLogError()
  +showInvalidOnlineContextError()
}

class TelemedicineController["<<Controller>> TelemedicineController"] {
  +getAppointmentDetails(appointmentReference)
  +joinOnlineSession(appointmentReference, userId)
  +validateAppointmentAccess(appointmentReference, userId)
  +validateMeetingLink(appointmentId, meetingLink)
  +getOrCreateAttendanceSession(appointmentId)
  +markOnlineAttendance(sessionId, userId)
  +recordOnlineJoinEvent(sessionId, userId)
}

class AttendanceController["<<Controller>> AttendanceController"] {
  +loadAttendanceRecord(appointmentRef)
  +validateAppointmentReference(appointmentRef)
  +saveAttendanceStatus(attendanceData)
  +validateParticipantStatuses(attendanceData)
  +recordManualAttendance(attendanceData)
  +loadQrAttendancePage(qrPayload)
  +validateQrPayload(qrPayload)
  +validatePhysicalSession(appointmentId)
  +confirmPhysicalAttendance(qrPayload, clientId)
  +checkDuplicateCheckIn(sessionId, clientId)
  +returnAttendanceSaveSuccess()
}

class OnlineAttendanceController["<<Controller>> OnlineAttendanceController"] {
  +detectOnlineJoinEvent(joinPayload)
  +retrieveAppointmentReference(joinPayload)
  +validateOnlineJoinEvent(joinPayload)
  +validateUserIdentity(userId)
  +validateOnlineSession(appointmentRef)
  +checkDuplicateOnlineAttendance(sessionId, clientId)
  +autoLogOnlineAttendance(sessionId, clientId, userId)
  +returnAutoLogSuccess()
  +returnUnverifiedJoinError()
  +returnInvalidOnlineContextError()
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +findAccount(userId)
  +validateUserIdentity(userId)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  +identifyClient(clientId)
}

class Appointment["<<Model>> Appointment"] {
  id
  reference_no
  client_id
  session_type
  session_mode
  meeting_link
  status
  +findByReference(referenceNo)
  +getSessionDetails(appointmentId)
  +validateSessionType(appointmentId)
  +validatePhysicalSession(appointmentId)
  +validateOnlineSession(appointmentId)
  +validateMeetingLink(appointmentId, meetingLink)
}

class AppointmentParticipant["<<Model>> AppointmentParticipant"] {
  appointment_id
  client_id
  participant_role
  +getParticipantsByAppointment(appointmentId)
  +updateParticipantList(appointmentId, participantIds)
}

class AttendanceSession["<<Model>> AttendanceSession"] {
  id
  appointment_id
  session_mode
  qr_token_hash
  qr_expires_at
  +findOrCreateByAppointment(appointmentId)
  +findByAppointment(appointmentId)
  +updateSessionMode(sessionId, sessionMode)
  +findActiveQrSession(qrTokenHash)
  +validateAttendanceWindow(sessionId)
}

class AttendanceParticipant["<<Model>> AttendanceParticipant"] {
  id
  attendance_session_id
  client_id
  status
  method
  checked_in_at
  +getAttendanceParticipants(sessionId)
  +findParticipant(sessionId, clientId)
  +checkAlreadyPresent(sessionId, clientId)
  +updateParticipantStatus(sessionId, clientId, status, method)
  +markPresentByQr(sessionId, clientId)
  +markPresentByOnlineAuto(sessionId, clientId, userId)
  +syncParticipants(sessionId, participantIds)
}

class AttendanceEvent["<<Model>> AttendanceEvent"] {
  id
  attendance_session_id
  client_id
  user_id
  event_type
  method
  +recordManualUpdateEvent(sessionId, clientId, userId, metadata)
  +recordQrScanEvent(sessionId, clientId, userId, metadata)
  +recordOnlineJoinEvent(sessionId, clientId, userId, metadata)
}

View <|-- AppointmentRecordPage
View <|-- AttendanceRecordPage
View <|-- PhysicalQrAttendancePage
View <|-- OnlineSessionPage
Controller <|-- TelemedicineController
Controller <|-- AttendanceController
Controller <|-- OnlineAttendanceController
Model <|-- UserAccount
Model <|-- ClientProfile
Model <|-- Appointment
Model <|-- AppointmentParticipant
Model <|-- AttendanceSession
Model <|-- AttendanceParticipant
Model <|-- AttendanceEvent
AppointmentRecordPage --> TelemedicineController : joins session
AttendanceRecordPage --> AttendanceController : records attendance
PhysicalQrAttendancePage --> AttendanceController : confirms QR attendance
OnlineSessionPage --> OnlineAttendanceController : auto-log event
TelemedicineController o-- Appointment : validates appointment
TelemedicineController o-- AttendanceSession : creates session
TelemedicineController o-- AttendanceParticipant : marks present
TelemedicineController o-- AttendanceEvent : records join
AttendanceController o-- Appointment : validates session
AttendanceController o-- AppointmentParticipant : reads participants
AttendanceController o-- ClientProfile : identifies client
AttendanceController o-- AttendanceSession : manages session
AttendanceController o-- AttendanceParticipant : updates attendance
AttendanceController o-- AttendanceEvent : records event
OnlineAttendanceController o-- UserAccount : validates identity
OnlineAttendanceController o-- Appointment : validates online session
OnlineAttendanceController o-- AttendanceSession : loads session
OnlineAttendanceController o-- AttendanceParticipant : marks present
OnlineAttendanceController o-- AttendanceEvent : records event
Appointment "1" *-- "0..1" AttendanceSession : attendance session
Appointment "1" *-- "0..*" AppointmentParticipant : participants
AttendanceSession "1" *-- "0..*" AttendanceParticipant : includes
AttendanceSession "1" *-- "0..*" AttendanceEvent : logs events
ClientProfile "1" --> "0..*" AttendanceParticipant : attendance record
UserAccount "1" --> "0..*" AttendanceEvent : user event
```

## Diagram 3: Declaration Module

Covered use cases: DC01 View Declaration Form, DC02 Submit Declaration, DC03 Verify Declaration.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class DeclarationFormPage["<<View>> DeclarationFormPage"] {
  +displayDeclarationStatement()
  +displayClientIdentity()
  +displayDeclarationCheckbox()
  +displayCurrentDeclarationStatus()
  +displaySubmittedDate()
  +showCheckboxRequiredError()
  +showDeclarationUnavailableError()
  +showSubmittedStatus()
  +redirectOrRemainOnDeclarationSection()
}

class DeclarationReviewPage["<<View>> DeclarationReviewPage"] {
  +displayDeclarationReviewDetails()
  +displayReviewStatusBlocks()
  +showIncompleteDeclarationError()
  +showAlreadyVerifiedMessage()
  +showVerificationSuccess()
  +showCorrectionRequiredSuccess()
  +redirectToPreviousReviewPage()
}

class DeclarationController["<<Controller>> DeclarationController"] {
  +loadDeclarationForm(clientId, appointmentId)
  +getClientIdentity(clientId)
  +getCurrentDeclaration(clientId, appointmentId)
  +submitDeclaration(declarationData)
  +validateDeclarationCheckbox(isChecked)
  +validateRequiredDeclarationInfo(clientId, appointmentId)
  +recordSubmittedDeclaration(declarationData)
  +exposeForDeclarationVerification(declarationId)
  +returnDeclarationForm(declarationDetails)
  +returnSubmittedDeclarationStatus()
}

class DeclarationVerificationController["<<Controller>> DeclarationVerificationController"] {
  +loadSubmittedDeclaration(declarationId)
  +validateVerifierPermission(userId)
  +verifyDeclaration(declarationId, verifierUserId)
  +requestDeclarationCorrection(declarationId, verifierUserId, correctionNote)
  +validateDeclarationCompleteness(declarationId)
  +checkAlreadyVerified(declarationId)
  +updateDeclarationStatus(declarationId, status)
  +recordVerificationEvent(declarationId, verifierUserId, action, note)
  +returnVerificationSuccess()
  +returnCorrectionRequiredSuccess()
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  profile_locked
  +findProfileById(clientId)
  +markDeclarationReviewRequired(clientId)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +checkVerifierPermission(userId)
}

class Appointment["<<Model>> Appointment"] {
  id
  reference_no
  client_id
  status
  +findAppointmentForDeclaration(appointmentId)
}

class Declaration["<<Model>> Declaration"] {
  id
  client_id
  appointment_id
  declaration_text
  is_checked
  status
  submitted_at
  verified_by_user_id
  correction_note
  +findCurrentDeclaration(clientId, appointmentId)
  +validateRequiredInfo(clientId, appointmentId)
  +markSubmitted(declarationId)
  +findSubmittedDeclaration(declarationId)
  +validateCompleteness(declarationId)
  +checkAlreadyVerified(declarationId)
  +markVerified(declarationId, verifierUserId)
  +markCorrectionRequired(declarationId, correctionNote)
}

class DeclarationVerificationEvent["<<Model>> DeclarationVerificationEvent"] {
  id
  declaration_id
  verifier_user_id
  action
  note
  +createVerificationEvent(declarationId, verifierUserId, action, note)
}

View <|-- DeclarationFormPage
View <|-- DeclarationReviewPage
Controller <|-- DeclarationController
Controller <|-- DeclarationVerificationController
Model <|-- ClientProfile
Model <|-- UserAccount
Model <|-- Appointment
Model <|-- Declaration
Model <|-- DeclarationVerificationEvent
DeclarationFormPage --> DeclarationController : loads and submits
DeclarationReviewPage --> DeclarationVerificationController : reviews
DeclarationController o-- ClientProfile : reads identity
DeclarationController o-- Declaration : submits declaration
DeclarationController o-- Appointment : optional appointment context
DeclarationVerificationController o-- UserAccount : checks verifier
DeclarationVerificationController o-- Declaration : updates status
DeclarationVerificationController o-- ClientProfile : marks review required
DeclarationVerificationController o-- DeclarationVerificationEvent : records event
ClientProfile "1" --> "0..*" Declaration : submits
Appointment "0..1" --> "0..*" Declaration : attached declaration
UserAccount "1" --> "0..*" Declaration : verifies
Declaration "1" *-- "0..*" DeclarationVerificationEvent : verification history
UserAccount "1" --> "0..*" DeclarationVerificationEvent : verifier
```

## Diagram 4: Chatbot And Tracking Module

Covered use cases: CT01 Log Daily Emotion, CT02 Chat with AI Counselor, CT03 View Emotion History, CT04 Investigate Flagged Client.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class Service["<<Abstract>> Service"] {
}

class DashboardPage["<<View>> DashboardPage"] {
  +openDashboard()
  +displayDateSelector()
  +displayEmotionScoreInput()
  +displayEmotionTrend()
  +displayEmotionScoresGraph()
  +selectDateRange()
  +showEmotionLogSuccess()
  +showInvalidEmotionScoreError()
  +showFutureDateError()
  +showFilteredEmotionHistory()
  +showNoEmotionHistoryMessage()
}

class CaseloadPage["<<View>> CaseloadPage"] {
  +displayFlaggedClientList()
  +displayRiskIndicators()
  +displayFlaggedClientDetails()
  +displayCaseloadDetailPanel()
  +showFilteredEmotionHistory()
  +showFlaggedClientNotFoundError()
  +showReviewSavedSuccess()
  +redirectToPreviousCaseloadOrDashboard()
}

class TaskBoardPage["<<View>> TaskBoardPage"] {
  +displayTaskCreationPanel()
  +showIncompleteTaskDetailsError()
  +showTaskCreatedSuccess()
}

class AICounselorChatbot["<<View>> AICounselorChatbot"] {
  +openAIChatbot()
  +displayChatWindow()
  +displayGreetingMessage()
  +typeMessage(messageText)
  +selectQuickReply(quickReplyText)
  +clickSend()
  +clickSaveChat()
  +closeOrMinimizeChatbot()
  +displayClientMessageAndAIResponse()
  +displayHighStressDetectedMessage()
  +displayChatSavedForCounselorReview()
}

class EmotionLogController["<<Controller>> EmotionLogController"] {
  +loadDashboardEmotionTracker(clientId)
  +saveEmotionScore(emotionData)
  +validateEmotionScore(score)
  +validateEmotionDate(date)
  +generateMeaningfulWords(score)
  +returnEmotionLogSuccess(meaningfulWords)
}

class EmotionHistoryController["<<Controller>> EmotionHistoryController"] {
  +loadEmotionHistory(userId, selectedClientId)
  +verifyEmotionHistoryPermission(userId, selectedClientId)
  +loadFlaggedClientEmotionHistory(counselorId, clientId)
  +filterEmotionHistory(clientId, dateRange)
  +returnEmotionHistory(records)
  +returnFilteredEmotionHistory(records)
  +returnNoEmotionHistoryMessage()
}

class ChatbotController["<<Controller>> ChatbotController"] {
  +openChatbot(clientId)
  +sendMessage(sessionId, clientId, messageText)
  +validateMessage(messageText)
  +placeQuickReplyInInput(quickReplyText)
  +generateResponseAndScreenRisk(messageText)
  +saveChat(sessionId, clientId)
}

class FlaggedClientController["<<Controller>> FlaggedClientController"] {
  +loadFlaggedClientList(counselorId)
  +viewFlaggedClient(riskFlagId)
  +saveReviewDecision(riskFlagId, reviewData)
  +validateTaskDetails(taskData)
  +createInterventionTask(taskData)
  +returnFlaggedClientDetails(details)
  +returnReviewSavedSuccess()
  +returnTaskCreatedSuccess()
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  +findProfileById(clientId)
  +findProfileByUserId(userId)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +checkEmotionHistoryPermission(userId, clientId)
}

class Counsellor["<<Model>> Counsellor"] {
  id
  user_id
  name
  email
  status
  +findByUserId(userId)
}

class EmotionLog["<<Model>> EmotionLog"] {
  id
  client_id
  score
  mood_label
  note
  logged_at
  +findByClient(clientId)
  +findByClientAndDate(clientId, date)
  +findByClientAndDateRange(clientId, startDate, endDate)
  +createEmotionScore(clientId, date, score)
  +updateEmotionScore(clientId, date, score)
}

class ChatSession["<<Model>> ChatSession"] {
  id
  client_id
  status
  started_at
  saved_at
  closed_at
  +getOrCreateOpenSession(clientId)
  +markAsSaved(sessionId)
}

class ChatMessage["<<Model>> ChatMessage"] {
  id
  chat_session_id
  sender_role
  message
  created_at
  +createUserMessage(sessionId, messageText)
  +createBotMessage(sessionId, aiResponse)
}

class RiskFlag["<<Model>> RiskFlag"] {
  id
  client_id
  assigned_counsellor_id
  source
  source_ref_id
  severity
  status
  +findActiveFlagForClient(clientId)
  +findAssignedFlags(counselorId)
  +findById(riskFlagId)
  +verifyCounselorAccess(counselorId, clientId)
  +createRiskFlag(source, severity, message, clientId, sourceRefId)
  +updateReviewDecision(riskFlagId, reviewData)
}

class Appointment["<<Model>> Appointment"] {
  id
  client_id
  reference_no
  status
  +getAppointmentHistoryByClient(clientId)
}

class CounsellorTask["<<Model>> CounsellorTask"] {
  id
  counsellor_id
  client_id
  risk_flag_id
  title
  priority
  status
  +createInterventionTask(counselorId, clientId, riskFlagId, taskData)
}

class AICounselorService["<<Service>> AICounselorService"] {
  +generateResponseAndScreenRisk(messageText)
}

View <|-- DashboardPage
View <|-- CaseloadPage
View <|-- TaskBoardPage
View <|-- AICounselorChatbot
Controller <|-- EmotionLogController
Controller <|-- EmotionHistoryController
Controller <|-- ChatbotController
Controller <|-- FlaggedClientController
Model <|-- ClientProfile
Model <|-- UserAccount
Model <|-- Counsellor
Model <|-- EmotionLog
Model <|-- ChatSession
Model <|-- ChatMessage
Model <|-- RiskFlag
Model <|-- Appointment
Model <|-- CounsellorTask
Service <|-- AICounselorService
DashboardPage --> EmotionLogController : logs score
DashboardPage --> EmotionHistoryController : views graph
CaseloadPage --> EmotionHistoryController : views client history
CaseloadPage --> FlaggedClientController : investigates flag
TaskBoardPage --> FlaggedClientController : creates task
AICounselorChatbot --> ChatbotController : sends chat
EmotionLogController o-- ClientProfile : validates client
EmotionLogController o-- EmotionLog : saves score
EmotionHistoryController o-- ClientProfile : loads client
EmotionHistoryController o-- UserAccount : checks permission
EmotionHistoryController o-- RiskFlag : checks access
EmotionHistoryController o-- EmotionLog : reads history
ChatbotController o-- ChatSession : manages session
ChatbotController o-- ChatMessage : saves messages
ChatbotController o-- RiskFlag : creates risk flag
ChatbotController o-- AICounselorService : requests response
FlaggedClientController o-- Counsellor : loads counsellor
FlaggedClientController o-- RiskFlag : reviews flag
FlaggedClientController o-- ClientProfile : reads client
FlaggedClientController o-- Appointment : reads appointment history
FlaggedClientController o-- CounsellorTask : creates task
ClientProfile "1" --> "0..*" EmotionLog : records emotions
ClientProfile "1" --> "0..*" ChatSession : starts chat
ChatSession "1" *-- "0..*" ChatMessage : contains
ClientProfile "1" --> "0..*" RiskFlag : flagged client
Counsellor "1" --> "0..*" RiskFlag : assigned flag
RiskFlag "1" --> "0..*" CounsellorTask : creates task
Counsellor "1" --> "0..*" CounsellorTask : owns task
ClientProfile "1" --> "0..*" CounsellorTask : task subject
```

## Diagram 5: Appointment Scheduling Module

Covered use cases: AS01 Book Appointment, AS02 Request Follow Up, AS03 Book New Appointment, AS04 Manage Slots, AS05 Bulk Generate Slots, AS06 Import CSV Timetable, AS07 Verify Appointment.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class Service["<<Abstract>> Service"] {
}

class SmartAppointmentForm["<<View>> SmartAppointmentForm"] {
  +loadBookingForm(clientId)
  +displayBookingForm()
  +displayApplicantInformation()
  +displayCalendarAndSlotSelection()
  +displayAttachmentFields()
  +displayConfirmationFields()
  +displayBookingSummary()
  +showFollowUpBookingSummary()
  +showNoAvailableSlotError()
  +showIncompleteAppointmentInfoError()
  +showDraftSavedMessage()
}

class AppointmentRecordsPage["<<View>> AppointmentRecordsPage"] {
  +displayAppointmentRecords()
  +displaySelectedAppointmentSummary()
  +openFollowUpMode()
  +lockPreviousAppointmentReference()
  +displayFollowUpForm()
  +showFollowUpUnavailableMessage()
  +showAppointmentNotEligibleMessage()
  +showNoAvailableFollowUpSlotError()
}

class SlotManagerPage["<<View>> SlotManagerPage"] {
  +displaySlotManagerPage()
  +displayConfiguredSlotOverview()
  +displayManualAddSlotControls()
  +displayBulkSetupSection()
  +displayCsvImportSection()
  +addManualSlotToDraft(slotDraft)
  +addGeneratedSlotsToDraft(generatedSlots)
  +addImportedSlotsToDraft(importedSlots)
  +removeSlotFromDraft(slotId)
  +markSavedSlotsForRemoval(existingSlots)
  +showImportSummary(importSummary)
  +showBulkGenerationSummary(summary)
  +showConfirmSaveDialog()
  +showSaveSuccessMessage()
}

class AppointmentQueuePage["<<View>> AppointmentQueuePage"] {
  +displayPendingAppointmentQueue()
  +displayAppointmentDetails()
  +showAdminReviewConfirmation()
  +showCounsellorReviewConfirmation()
  +showSuccessMessage()
  +showAppointmentNotFoundError()
  +showMissingReviewInformationError()
  +showCounsellorApprovalUnavailableError()
}

class AppointmentController["<<Controller>> AppointmentController"] {
  +loadBookingForm(clientId)
  +getAvailableSlots()
  +submitAppointmentRequest(formData)
  +validateAppointmentRequest(formData)
  +checkSlotAvailability(slotId, sessionType)
  +generateReferenceNumber()
  +createAppointment(formData, status)
  +createDeclaration(appointmentId, confirmationDetails)
  +generateMeetingLink(referenceNo)
  +updateMeetingLink(appointmentId, meetingLink)
  +returnBookingSummary(summary)
}

class NewAppointmentController["<<Controller>> NewAppointmentController"] {
  +startNewAppointment(clientId)
  +generateSessionReferenceNumber()
  +loadAvailableSlots(criteria)
  +validateNewAppointmentDetails(formData)
  +validateSelectedSlot(slotId, sessionType)
  +prepareNewAppointmentDetails(formData)
  +saveDraftAppointment(formData)
  +returnCompletedNewAppointmentDetails(details)
}

class FollowUpAppointmentController["<<Controller>> FollowUpAppointmentController"] {
  +loadAppointmentRecords(clientId)
  +selectFollowUpAppointment(referenceNo)
  +validateFollowUpEligibility(appointmentId)
  +openFollowUpForm(previousAppointmentId)
  +validateFollowUpSlot(slotId, sessionType)
  +submitFollowUpRequest(followUpData)
  +returnFollowUpBookingSummary(summary)
}

class SlotManagementController["<<Controller>> SlotManagementController"] {
  +loadSlotManager(userId)
  +loadConfiguredSlots(filters)
  +addManualSlot(slotData)
  +validateSessionTypes(slotData)
  +validateSlotTime(slotData)
  +checkSlotOverlap(slotData)
  +removeDraftSlot(slotId)
  +markSavedSlotForRemoval(slotId)
  +receiveGeneratedSlotsFromAS05(generatedSlots, slotsMarkedForRemoval)
  +receiveImportedSlotsFromAS06(importedSlots, slotsMarkedForRemoval)
  +saveSlotChanges(draftChanges)
  +createSlotGenerationBatch(batchData)
  +deleteMarkedSavedSlots(slotIds)
  +saveDraftSlots(draftSlots, batchId)
}

class SlotBulkGenerationController["<<Controller>> SlotBulkGenerationController"] {
  +openBulkSetupSection(userId)
  +generateBulkSlots(criteria)
  +validateWeekdaySelection(criteria)
  +validateSessionTypeSelection(criteria)
  +validateDateRange(criteria)
  +findMatchingDates(criteria)
  +generateSlotDrafts(criteria, matchedDates)
  +applyReplaceExistingDates(matchedDates)
  +returnBulkGenerationSummary(summary, generatedSlots)
}

class SlotImportController["<<Controller>> SlotImportController"] {
  +openCsvImportSection(userId)
  +importCsvSlots(csvFile, replaceExisting)
  +validateCsvFile(csvFile)
  +parseCsvFile(csvFile)
  +validateCsvRows(parsedRows)
  +resolveCsvCounsellors(validRows)
  +convertRowsToSlotDrafts(validRows)
  +applyReplaceExistingDates(importedDates)
  +returnImportSummary(importSummary)
}

class AppointmentVerificationController["<<Controller>> AppointmentVerificationController"] {
  +loadPendingAppointmentQueue(userId, filters)
  +openAppointmentDetails(appointmentId)
  +validateAppointmentExists(appointmentId)
  +loadAppointmentReviewDetails(appointmentId)
  +approveForCounsellorReview(appointmentId, adminReviewData)
  +validateAdminReviewInformation(adminReviewData)
  +openCounsellorReviewAppointment(appointmentId, counsellorId)
  +validateCounsellorReviewEligibility(appointment)
  +approveAppointment(appointmentId, counsellorReviewData)
  +validateCounsellorReviewInformation(counsellorReviewData)
  +requestAppointmentStatusNotification(appointmentId, eventType)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  +findClientProfileById(clientId)
  +findProfileById(clientId)
  +findByAppointment(appointmentId)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
}

class Appointment["<<Model>> Appointment"] {
  id
  reference_no
  client_id
  previous_appointment_id
  appointment_type
  session_type
  slot_id
  counsellor_id
  status
  meeting_link
  +generateReferenceNumber()
  +createAppointment(formData, status)
  +createDraftAppointment(formData)
  +updateMeetingLink(appointmentId, meetingLink)
  +findEligibleFollowUpRecords(clientId)
  +findByReference(referenceNo)
  +checkFollowUpStatus(appointmentId)
  +createFollowUpRequest(followUpData)
  +findPendingAppointments(filters)
  +findById(appointmentId)
  +findReviewDetails(appointmentId)
  +updateAdminReview(appointmentId, status, adminReviewData)
  +updateCounsellorReview(appointmentId, status, counsellorReviewData)
  +isReadyForCounsellorReview(appointment)
}

class AppointmentSlot["<<Model>> AppointmentSlot"] {
  id
  slot_date
  start_time
  end_time
  counsellor_id
  location_id
  batch_id
  is_active
  +getAvailableSlots()
  +checkSlotAvailability(slotId, sessionType)
  +findAvailableSlots(criteria)
  +findAvailableSlot(slotId, sessionType)
  +reserveSlotForRequest(slotId)
  +findSlotById(slotId)
  +checkSessionTypeAllowed(slotId, sessionType)
  +findConfiguredSlots(filters)
  +buildManualSlotDraft(slotData)
  +buildDraftSlotsFromBulkCriteria(criteria, matchedDates)
  +buildDraftSlotsFromCsvRows(validRows)
  +checkOverlap(slotData)
  +findDraftSlotsByDates(dates)
  +removeDraftSlotsByDates(dates)
  +findSavedSlotsByDates(dates)
  +markSavedSlotsForRemoval(existingSlots)
  +deleteSlots(slotIds)
  +createSlots(draftSlots, batchId)
  +findByAppointment(appointmentId)
}

class AppointmentSlotSessionType["<<Model>> AppointmentSlotSessionType"] {
  slot_id
  session_type
  +buildDraftSessionTypes(slotDraft, sessionTypes)
  +createSessionTypes(slotId, sessionTypes)
  +deleteBySlotIds(slotIds)
}

class AppointmentAttachment["<<Model>> AppointmentAttachment"] {
  id
  appointment_id
  file_name
  file_path
  +saveDraftAttachment(appointmentId, attachmentData)
}

class Declaration["<<Model>> Declaration"] {
  id
  client_id
  appointment_id
  status
  +createDeclaration(appointmentId, confirmationDetails)
}

class Counsellor["<<Model>> Counsellor"] {
  id
  user_id
  name
  location_id
  status
  +findBySlot(slotId)
  +findActiveCounsellors()
  +findById(counsellorId)
  +findByCsvValue(counsellorValue)
}

class CounsellingLocation["<<Model>> CounsellingLocation"] {
  id
  code
  name
  campus
  +findBySlot(slotId)
}

class SlotGenerationBatch["<<Model>> SlotGenerationBatch"] {
  id
  created_by_user_id
  generation_method
  start_date
  end_date
  total_rows
  valid_rows
  skipped_rows
  +createBatch(batchData)
  +prepareBulkBatchSummary(startDate, endDate, matchedDates, generatedCount, replaceExisting)
  +prepareCsvBatchSummary(totalRows, validRows, skippedRows, replaceExisting)
}

class EmailNotification["<<Model>> EmailNotification"] {
  id
  recipient_user_id
  appointment_id
  event_type
  status
  +createQueuedNotification(appointmentId, recipientUserId, eventType)
}

class MeetingLinkService["<<Service>> MeetingLinkService"] {
  +generateMeetingLink(referenceNo)
}

class CsvImportService["<<Service>> CsvImportService"] {
  +parseCsvFile(csvFile)
  +validateCsvTemplate(parsedRows)
  +extractValidRows(parsedRows)
  +countSkippedRows(parsedRows)
  +buildImportSummary(totalRows, validRows, skippedRows)
}

class AppointmentNotificationService["<<Service>> AppointmentNotificationService"] {
  +queueAppointmentStatusNotification(appointmentId, eventType)
  +resolveNotificationRecipients(appointmentId)
  +buildAppointmentStatusNotification(appointmentId, eventType)
}

View <|-- SmartAppointmentForm
View <|-- AppointmentRecordsPage
View <|-- SlotManagerPage
View <|-- AppointmentQueuePage
Controller <|-- AppointmentController
Controller <|-- NewAppointmentController
Controller <|-- FollowUpAppointmentController
Controller <|-- SlotManagementController
Controller <|-- SlotBulkGenerationController
Controller <|-- SlotImportController
Controller <|-- AppointmentVerificationController
Model <|-- ClientProfile
Model <|-- UserAccount
Model <|-- Appointment
Model <|-- AppointmentSlot
Model <|-- AppointmentSlotSessionType
Model <|-- AppointmentAttachment
Model <|-- Declaration
Model <|-- Counsellor
Model <|-- CounsellingLocation
Model <|-- SlotGenerationBatch
Model <|-- EmailNotification
Service <|-- MeetingLinkService
Service <|-- CsvImportService
Service <|-- AppointmentNotificationService
SmartAppointmentForm --> AppointmentController : books appointment
SmartAppointmentForm --> NewAppointmentController : creates new appointment
AppointmentRecordsPage --> FollowUpAppointmentController : requests follow-up
SlotManagerPage --> SlotManagementController : manages slots
SlotManagerPage --> SlotBulkGenerationController : bulk setup
SlotManagerPage --> SlotImportController : csv import
AppointmentQueuePage --> AppointmentVerificationController : verifies appointment
AppointmentController o-- ClientProfile : loads client
AppointmentController o-- AppointmentSlot : checks slot
AppointmentController o-- Appointment : creates booking
AppointmentController o-- Declaration : creates declaration
AppointmentController o-- MeetingLinkService : creates online link
NewAppointmentController o-- AppointmentAttachment : saves attachment
FollowUpAppointmentController o-- Appointment : creates follow-up
FollowUpAppointmentController o-- AppointmentSlot : reserves slot
SlotManagementController o-- AppointmentSlot : manages slots
SlotManagementController o-- AppointmentSlotSessionType : manages session types
SlotManagementController o-- SlotGenerationBatch : creates batch
SlotManagementController o-- Counsellor : loads counsellors
SlotBulkGenerationController o-- AppointmentSlot : prepares drafts
SlotBulkGenerationController o-- AppointmentSlotSessionType : prepares session types
SlotBulkGenerationController o-- SlotGenerationBatch : prepares summary
SlotImportController o-- CsvImportService : parses csv
SlotImportController o-- AppointmentSlot : imports drafts
SlotImportController o-- AppointmentSlotSessionType : prepares session types
SlotImportController o-- Counsellor : resolves counsellor
AppointmentVerificationController o-- Appointment : reviews status
AppointmentVerificationController o-- AppointmentSlot : loads slot
AppointmentVerificationController o-- ClientProfile : loads client
AppointmentVerificationController o-- Counsellor : loads counsellor
AppointmentVerificationController o-- AppointmentNotificationService : queues notification
AppointmentNotificationService o-- EmailNotification : creates notification
ClientProfile "1" --> "0..*" Appointment : books
Appointment "0..1" --> "0..*" Appointment : follow up of
AppointmentSlot "1" --> "0..*" Appointment : selected slot
AppointmentSlot "1" *-- "1..*" AppointmentSlotSessionType : supports
Appointment "1" *-- "0..*" AppointmentAttachment : has attachments
Appointment "1" --> "0..*" Declaration : creates declaration
Counsellor "1" --> "0..*" AppointmentSlot : assigned slots
CounsellingLocation "1" --> "0..*" AppointmentSlot : hosts slots
SlotGenerationBatch "1" --> "0..*" AppointmentSlot : creates slots
UserAccount "1" --> "0..*" SlotGenerationBatch : creates batch
UserAccount "1" --> "0..*" EmailNotification : receives
Appointment "1" --> "0..*" EmailNotification : appointment notice
```

## Diagram 6: Educational Resource Library Module

Covered use cases: ER01 Manage Resource Library, ER02 Access Learning Materials.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class LearningMaterialsPage["<<View>> LearningMaterialsPage"] {
  +displayUploadLearningMaterialForm()
  +displayResourceCount()
  +displayResourceMetadata()
  +submitLearningMaterial(resourceData)
  +showUploadSuccessMessage()
  +showMissingTitleOrUrlError()
  +showInvalidResourceUrlError()
  +redirectToPreviousPage()
}

class ResourceLibraryPage["<<View>> ResourceLibraryPage"] {
  +displayAvailableLearningMaterials()
  +displayFilteredResourceList()
  +openSelectedMaterial(resourceUrl)
  +showNoMatchingResourceMessage()
  +showResourceUnavailableError()
  +redirectToDashboardOrPreviousPage()
}

class ResourceLibraryController["<<Controller>> ResourceLibraryController"] {
  +loadLearningMaterialsPage(userId)
  +getResourceLibraryStatus()
  +uploadLearningMaterial(resourceData)
  +validateRequiredResourceFields(resourceData)
  +validateResourceUrl(resourceDataUrl)
  +createResourceLibraryItem(resourceData, uploadedByUserId)
  +returnResourceLibraryStatus(status)
  +returnUploadSuccessMessage()
}

class ResourceAccessController["<<Controller>> ResourceAccessController"] {
  +loadResourceLibrary(clientId)
  +searchOrFilterMaterials(criteria)
  +openLearningMaterial(resourceId, clientId)
  +validateResourceUrl(resource)
  +recordResourceAccess(resourceId, clientId)
  +returnAvailableResources(resources)
  +returnFilteredResources(resources)
  +returnResourceUrl(resourceUrl)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +findById(userId)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  +findById(clientId)
}

class ResourceLibraryItem["<<Model>> ResourceLibraryItem"] {
  id
  title_ms
  title_en
  category
  resource_type
  url
  visibility
  uploaded_by_user_id
  +countPublishedResources()
  +findResourceMetadata()
  +findPublishedResources()
  +findBySearchOrFilter(criteria)
  +findById(resourceId)
  +isUrlAvailable(resource)
  +createResource(resourceData, uploadedByUserId)
}

class ResourceAccessLog["<<Model>> ResourceAccessLog"] {
  id
  resource_id
  client_id
  accessed_at
  +createAccessLog(resourceId, clientId)
}

View <|-- LearningMaterialsPage
View <|-- ResourceLibraryPage
Controller <|-- ResourceLibraryController
Controller <|-- ResourceAccessController
Model <|-- UserAccount
Model <|-- ClientProfile
Model <|-- ResourceLibraryItem
Model <|-- ResourceAccessLog
LearningMaterialsPage --> ResourceLibraryController : manages resources
ResourceLibraryPage --> ResourceAccessController : accesses resources
ResourceLibraryController o-- UserAccount : validates admin
ResourceLibraryController o-- ResourceLibraryItem : creates item
ResourceAccessController o-- ClientProfile : validates client
ResourceAccessController o-- ResourceLibraryItem : reads resource
ResourceAccessController o-- ResourceAccessLog : records access
UserAccount "1" --> "0..*" ResourceLibraryItem : uploads resources
ResourceLibraryItem "1" --> "0..*" ResourceAccessLog : access history
ClientProfile "1" --> "0..*" ResourceAccessLog : opens resource
```

## Diagram 7: Peer Support Forum Module

Covered use cases: PS01 Submit Forum Post, PS02 Moderate Forum.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class Service["<<Abstract>> Service"] {
}

class PeerSupportForumPage["<<View>> PeerSupportForumPage"] {
  +displayForumPostForm()
  +displayCategoryOptions()
  +submitForumPost(postData)
  +showPostPublishedConfirmation()
  +showPostQueuedForReviewMessage()
  +showMissingPostDetailsError()
  +redirectToForumList()
}

class ForumModerationPage["<<View>> ForumModerationPage"] {
  +displayForumModerationPage()
  +displayForumManagementFilters()
  +displayUnsafePostQueue()
  +displayAllForumPosts()
  +displayModerationEventLog()
  +displayMatchingForumPosts(posts)
  +showConfirmModerationDialog()
  +showModerationSuccessMessage()
  +showNoForumPostsFoundMessage()
  +showModerationActionFailedError()
}

class ForumPostController["<<Controller>> ForumPostController"] {
  +openCreatePostForm(clientId)
  +loadActiveCategories()
  +submitForumPost(postData, clientId)
  +validateForumPostDetails(postData)
  +requestSafetyReview(postData)
  +determinePostStatus(safetyResult)
  +createForumPost(postData, clientId, safetyResult, status)
  +returnPostPublishedConfirmation()
  +returnPostQueuedForReviewMessage()
}

class ForumModerationController["<<Controller>> ForumModerationController"] {
  +loadForumModerationPage(adminUserId)
  +loadModerationDashboard(filters)
  +filterForumPosts(criteria)
  +moderateSelectedPost(postId, action, reason, adminUserId)
  +validateModerationAction(action)
  +determineNextPostStatus(action)
  +updateForumPostStatus(postId, nextStatus, reason)
  +recordModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)
  +returnModerationDashboard(dashboardData)
  +returnFilteredPosts(posts)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  +findById(clientId)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +findById(adminUserId)
}

class ForumCategory["<<Model>> ForumCategory"] {
  id
  name
  is_active
  +findActiveCategories()
  +findById(categoryId)
}

class ForumPost["<<Model>> ForumPost"] {
  id
  author_client_id
  category_id
  title
  content
  safety_score
  moderation_reason
  status
  +findModerationDashboardPosts(filters)
  +findByCriteria(criteria)
  +findById(postId)
  +createPost(postData, clientId, categoryId, safetyScore, moderationReason, status)
  +updateStatus(postId, nextStatus, reason)
}

class ForumSupport["<<Model>> ForumSupport"] {
  post_id
  client_id
  created_at
}

class ForumModerationEvent["<<Model>> ForumModerationEvent"] {
  id
  post_id
  moderator_user_id
  action
  previous_status
  next_status
  reason
  +findRecentEvents()
  +createModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)
}

class AiSafetyReviewService["<<Service>> AiSafetyReviewService"] {
  +reviewForumPostSafety(title, content)
  +calculateSafetyScore(title, content)
  +returnSafetyResult(safetyScore, moderationReason)
}

View <|-- PeerSupportForumPage
View <|-- ForumModerationPage
Controller <|-- ForumPostController
Controller <|-- ForumModerationController
Model <|-- ClientProfile
Model <|-- UserAccount
Model <|-- ForumCategory
Model <|-- ForumPost
Model <|-- ForumSupport
Model <|-- ForumModerationEvent
Service <|-- AiSafetyReviewService
PeerSupportForumPage --> ForumPostController : submits post
ForumModerationPage --> ForumModerationController : moderates post
ForumPostController o-- ClientProfile : validates author
ForumPostController o-- ForumCategory : loads category
ForumPostController o-- AiSafetyReviewService : checks content
ForumPostController o-- ForumPost : creates post
ForumModerationController o-- UserAccount : validates admin
ForumModerationController o-- ForumPost : updates post
ForumModerationController o-- ForumModerationEvent : records action
ForumCategory "1" --> "0..*" ForumPost : categorizes
ClientProfile "1" --> "0..*" ForumPost : authors
ForumPost "1" --> "0..*" ForumSupport : receives support
ClientProfile "1" --> "0..*" ForumSupport : supports post
ForumPost "1" --> "0..*" ForumModerationEvent : moderation history
UserAccount "1" --> "0..*" ForumModerationEvent : moderates
```

## Diagram 8: Psychometric Self-Assessment Module

Covered use cases: SA01 Take Psychometric Test, SA02 View Triage Dashboard, SA03 Manage Test.

```mermaid
classDiagram
direction LR

class View["<<Abstract>> View"] {
}

class Controller["<<Abstract>> Controller"] {
}

class Model["<<Abstract>> Model"] {
}

class Service["<<Abstract>> Service"] {
}

class PsychometricTestPage["<<View>> PsychometricTestPage"] {
  +openPsychometricTestPage()
  +displayAvailableTests()
  +displayQuestionsAndOptions()
  +displayProgressInformation()
  +submitTest(testId, clientId, answers)
  +displayConfirmationDialog()
  +displayResultSummary()
  +displaySupportRecommendation()
  +displayIncompleteAnswersMessage()
  +cancelTest()
}

class PsychometricTriagePage["<<View>> PsychometricTriagePage"] {
  +displayTriageDashboard()
  +displayLatestSubmissions()
  +displayFilteredTriageResults(results)
  +displaySubmissionDetails(details)
  +showNoTriageResultsFoundMessage()
  +showSubmissionCannotBeLoadedError()
  +redirectToPreviousPageOrDashboard()
}

class TestingMaterialsPage["<<View>> TestingMaterialsPage"] {
  +displayUploadTestingMaterialForm()
  +displayCurrentTestCount()
  +displayAvailableTestingMaterials()
  +submitPdfGenerationRequest(testData, pdfFile)
  +showGeneratedTestSuccessMessage(testCode, questionCount)
  +showMissingTitleOrPdfError()
  +showUnsupportedFileTypeError()
}

class PsychometricController["<<Controller>> PsychometricController"] {
  +loadAvailableTests(clientId)
  +loadTestQuestions(testId)
  +submitTest(testId, clientId, answers)
  +validateAnswers(answers)
  +calculateTotalScore(answers)
  +calculateScorePercent(totalScore)
  +determineRiskLevel(scorePercent)
  +generateInterpretation()
  +createSubmission(testId, clientId, totalScore, scorePercent, riskLevel)
  +createAnswer(submissionId, questionId, optionValue)
  +createRiskFlag(source, severity, clientId, sourceRefId)
}

class PsychometricTriageController["<<Controller>> PsychometricTriageController"] {
  +loadTriageDashboard(counsellorId)
  +loadLatestSubmissions(filters)
  +searchOrFilterSubmissions(criteria)
  +openSubmissionDetails(submissionId)
  +loadSubmissionDetails(submissionId)
  +loadPsychometricRiskFlags(clientId)
  +returnTriageDashboard(results)
  +returnFilteredTriageResults(results)
  +returnSubmissionDetails(details)
}

class PsychometricTestController["<<Controller>> PsychometricTestController"] {
  +loadTestingMaterialsPage(adminUserId)
  +getCurrentTestSummary()
  +uploadPdfAndGenerateTest(testData, pdfFile, adminUserId)
  +validateTestTitleAndPdf(testData, pdfFile)
  +validatePdfFileType(pdfFile)
  +generatePsychometricTestFromPdf(testData, pdfFile)
  +saveGeneratedTest(generatedTest, adminUserId)
  +returnCurrentTestSummary(summary)
  +returnGeneratedTestSuccessMessage(testCode, questionCount)
}

class UserAccount["<<Model>> UserAccount"] {
  id
  name
  email
  role
  +findById(adminUserId)
}

class ClientProfile["<<Model>> ClientProfile"] {
  id
  user_id
  full_name
  email
  matrix_no
  worker_no
  +findBySubmission(submissionId)
  +findByCriteria(criteria)
}

class PsychometricTest["<<Model>> PsychometricTest"] {
  id
  code
  title_ms
  title_en
  category
  visibility
  uploaded_by_user_id
  +getPublishedTests()
  +countPublishedTests()
  +findAvailableTests()
  +findBySubmission(submissionId)
  +createGeneratedTest(generatedTest, adminUserId)
}

class PsychometricQuestion["<<Model>> PsychometricQuestion"] {
  id
  test_id
  position
  prompt_ms
  prompt_en
  +getQuestionsAndOptions(testId)
  +createGeneratedQuestions(testId, generatedQuestions)
}

class PsychometricOption["<<Model>> PsychometricOption"] {
  id
  test_id
  value
  label_ms
  label_en
  +createGeneratedOptions(testId, generatedOptions)
}

class PsychometricSubmission["<<Model>> PsychometricSubmission"] {
  id
  test_id
  client_id
  total_score
  score_percent
  risk_level
  submitted_at
  +createSubmission(testId, clientId, totalScore, scorePercent, riskLevel)
  +findLatestSubmissions(filters)
  +findByCriteria(criteria)
  +findById(submissionId)
}

class PsychometricAnswer["<<Model>> PsychometricAnswer"] {
  id
  submission_id
  question_id
  option_value
  +createAnswer(submissionId, questionId, optionValue)
  +findBySubmission(submissionId)
}

class RiskFlag["<<Model>> RiskFlag"] {
  id
  client_id
  source
  source_ref_id
  severity
  status
  +createRiskFlag(source, severity, clientId, sourceRefId)
  +findOpenPsychometricFlags(clientId)
}

class PsychometricTestGenerationService["<<Service>> PsychometricTestGenerationService"] {
  +extractPdfContent(pdfFile)
  +generateTestStructure(testTitle, pdfContent)
  +returnGeneratedTest(generatedTest)
}

View <|-- PsychometricTestPage
View <|-- PsychometricTriagePage
View <|-- TestingMaterialsPage
Controller <|-- PsychometricController
Controller <|-- PsychometricTriageController
Controller <|-- PsychometricTestController
Model <|-- UserAccount
Model <|-- ClientProfile
Model <|-- PsychometricTest
Model <|-- PsychometricQuestion
Model <|-- PsychometricOption
Model <|-- PsychometricSubmission
Model <|-- PsychometricAnswer
Model <|-- RiskFlag
Service <|-- PsychometricTestGenerationService
PsychometricTestPage --> PsychometricController : takes test
PsychometricTriagePage --> PsychometricTriageController : reviews triage
TestingMaterialsPage --> PsychometricTestController : manages tests
PsychometricController o-- PsychometricTest : loads tests
PsychometricController o-- PsychometricQuestion : loads questions
PsychometricController o-- PsychometricSubmission : saves submission
PsychometricController o-- PsychometricAnswer : saves answers
PsychometricController o-- RiskFlag : creates high-risk flag
PsychometricTriageController o-- PsychometricSubmission : loads submissions
PsychometricTriageController o-- PsychometricTest : loads test
PsychometricTriageController o-- PsychometricAnswer : loads answers
PsychometricTriageController o-- ClientProfile : loads client
PsychometricTriageController o-- RiskFlag : loads flags
PsychometricTestController o-- UserAccount : validates admin
PsychometricTestController o-- PsychometricTestGenerationService : generates test
PsychometricTestController o-- PsychometricTest : creates test
PsychometricTestController o-- PsychometricQuestion : creates questions
PsychometricTestController o-- PsychometricOption : creates options
UserAccount "1" --> "0..*" PsychometricTest : uploads tests
PsychometricTest "1" *-- "1..*" PsychometricQuestion : has questions
PsychometricTest "1" *-- "1..*" PsychometricOption : has options
PsychometricTest "1" --> "0..*" PsychometricSubmission : receives submissions
ClientProfile "1" --> "0..*" PsychometricSubmission : submits
PsychometricSubmission "1" *-- "1..*" PsychometricAnswer : has answers
PsychometricQuestion "1" --> "0..*" PsychometricAnswer : answered question
ClientProfile "1" --> "0..*" RiskFlag : psychometric flag
```
