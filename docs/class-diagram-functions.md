# Class Diagram Function Catalogue

This document lists all public functions (`+`) used in the current SRS class diagrams and shows which class uses each function.

Source: `docs/SRS class diagram plantuml.md`

Shared model classes such as `UserAccount`, `ClientProfile`, and `Appointment` may appear in more than one module. They are listed separately under the module where the function appears.

## Summary

| Module | Classes With Functions | Function Count |
| --- | ---: | ---: |
| User Management Module | 13 | 89 |
| Telemedicine And Attendance Module | 14 | 84 |
| Declaration Module | 9 | 49 |
| Chatbot And Tracking Module | 18 | 82 |
| Appointment Scheduling Module | 24 | 169 |
| Educational Resource Library Module | 8 | 40 |
| Peer Support Forum Module | 10 | 50 |
| Psychometric Self-Assessment Module | 15 | 75 |
| **Total** | 88 unique class names | 638 |

## User Management Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `CounsellorPPsiPage` | `<<View>>` | `+openCounsellorPPsiPage()` |
| `CounsellorPPsiPage` | `<<View>>` | `+displayRecordsAndFilters()` |
| `CounsellorPPsiPage` | `<<View>>` | `+displayAddCounsellorForm()` |
| `CounsellorPPsiPage` | `<<View>>` | `+enterCounsellorDetails()` |
| `CounsellorPPsiPage` | `<<View>>` | `+clickSave()` |
| `CounsellorPPsiPage` | `<<View>>` | `+showConfirmSaveDialog()` |
| `CounsellorPPsiPage` | `<<View>>` | `+showRequiredFieldsError()` |
| `CounsellorPPsiPage` | `<<View>>` | `+showDuplicateRecordError()` |
| `CounsellorPPsiPage` | `<<View>>` | `+showSuccessMessage()` |
| `CounsellorPPsiPage` | `<<View>>` | `+enterSearchOrFilter()` |
| `CounsellorPPsiPage` | `<<View>>` | `+displayMatchingRecords()` |
| `CounsellorPPsiPage` | `<<View>>` | `+displayNoMatchingResults()` |
| `CounsellorPPsiPage` | `<<View>>` | `+cancelOperation()` |
| `ClientProfilePage` | `<<View>>` | `+displayClientRecordsAndFilters()` |
| `ClientProfilePage` | `<<View>>` | `+displaySearchFields()` |
| `ClientProfilePage` | `<<View>>` | `+displayMatchingProfiles()` |
| `ClientProfilePage` | `<<View>>` | `+displayClientProfileSections()` |
| `ClientProfilePage` | `<<View>>` | `+displayInvalidSearchError()` |
| `ClientProfilePage` | `<<View>>` | `+displayNoMatchingProfiles()` |
| `ClientProfilePage` | `<<View>>` | `+displayAccessDenied()` |
| `ClientProfilePage` | `<<View>>` | `+redirectToPreviousPage()` |
| `MyAccountPage` | `<<View>>` | `+displayLockedClientInformationForm()` |
| `MyAccountPage` | `<<View>>` | `+displayProfileLockedNotice()` |
| `MyAccountPage` | `<<View>>` | `+displayReadOnlyTabFields()` |
| `MyAccountPage` | `<<View>>` | `+returnToPreviousPage()` |
| `ClientInformationPage` | `<<View>>` | `+displayClientInformationList()` |
| `ClientInformationPage` | `<<View>>` | `+displayEditableClientForm()` |
| `ClientInformationPage` | `<<View>>` | `+showSaveConfirmationDialog()` |
| `ClientInformationPage` | `<<View>>` | `+showProfileValidationError()` |
| `ClientInformationPage` | `<<View>>` | `+showDuplicateProfileError()` |
| `ClientInformationPage` | `<<View>>` | `+showProfileSaveSuccess()` |
| `ClientInformationPage` | `<<View>>` | `+displayClientDetailTabs()` |
| `ClientInformationPage` | `<<View>>` | `+showTabUpdateSuccess()` |
| `CounsellorController` | `<<Controller>>` | `+loadCounsellorList()` |
| `CounsellorController` | `<<Controller>>` | `+saveCounsellor(formData)` |
| `CounsellorController` | `<<Controller>>` | `+validateCounsellorDetails()` |
| `CounsellorController` | `<<Controller>>` | `+requestSaveConfirmation()` |
| `CounsellorController` | `<<Controller>>` | `+confirmSaveCounsellor(formData)` |
| `CounsellorController` | `<<Controller>>` | `+searchCounsellors(criteria)` |
| `CounsellorController` | `<<Controller>>` | `+returnCounsellorList()` |
| `CounsellorController` | `<<Controller>>` | `+returnFilteredRecords(records)` |
| `CounsellorController` | `<<Controller>>` | `+returnValidationError()` |
| `CounsellorController` | `<<Controller>>` | `+returnDuplicateError()` |
| `CounsellorController` | `<<Controller>>` | `+returnSuccess()` |
| `ClientProfileController` | `<<Controller>>` | `+loadClientRecords()` |
| `ClientProfileController` | `<<Controller>>` | `+searchClientProfiles(criteria)` |
| `ClientProfileController` | `<<Controller>>` | `+validateSearchCriteria(criteria)` |
| `ClientProfileController` | `<<Controller>>` | `+viewClientProfile(clientId)` |
| `ClientProfileController` | `<<Controller>>` | `+verifyProfilePermission(userId, clientId)` |
| `ClientProfileController` | `<<Controller>>` | `+returnClientRecordList()` |
| `ClientProfileController` | `<<Controller>>` | `+returnMatchingProfiles(records)` |
| `ClientProfileController` | `<<Controller>>` | `+returnClientProfileDetails(profileDetails)` |
| `ClientProfileController` | `<<Controller>>` | `+returnInvalidSearchError()` |
| `ClientProfileController` | `<<Controller>>` | `+returnNoMatchingProfiles()` |
| `ClientProfileController` | `<<Controller>>` | `+returnAccessDenied()` |
| `UserProfileController` | `<<Controller>>` | `+loadMyAccount(userId)` |
| `UserProfileController` | `<<Controller>>` | `+loadClientInformationPage()` |
| `UserProfileController` | `<<Controller>>` | `+createOrEditClientProfile(formData)` |
| `UserProfileController` | `<<Controller>>` | `+validateProfileDetails(formData)` |
| `UserProfileController` | `<<Controller>>` | `+checkProfileConflict(formData)` |
| `UserProfileController` | `<<Controller>>` | `+requestSaveConfirmation()` |
| `UserProfileController` | `<<Controller>>` | `+saveClientProfile(formData)` |
| `UserProfileController` | `<<Controller>>` | `+loadClientProfileTabs(clientId)` |
| `UserProfileController` | `<<Controller>>` | `+updateClientProfileTabs(tabData)` |
| `UserProfileController` | `<<Controller>>` | `+returnProfileSaveSuccess()` |
| `UserProfileController` | `<<Controller>>` | `+returnTabUpdateSuccess()` |
| `UserProfileController` | `<<Controller>>` | `+returnWithoutSaving()` |
| `UserAccount` | `<<Model>>` | `+createOrLinkCounsellorUser(formData)` |
| `UserAccount` | `<<Model>>` | `+findAccount(userId)` |
| `UserAccount` | `<<Model>>` | `+checkAdminPermission(userId)` |
| `UserAccount` | `<<Model>>` | `+checkViewPermission(userId, clientId)` |
| `ClientProfile` | `<<Model>>` | `+findByUserId(userId)` |
| `ClientProfile` | `<<Model>>` | `+getClientProfiles()` |
| `ClientProfile` | `<<Model>>` | `+getClientSummaries()` |
| `ClientProfile` | `<<Model>>` | `+findByCriteria(criteria)` |
| `ClientProfile` | `<<Model>>` | `+findProfileById(clientId)` |
| `ClientProfile` | `<<Model>>` | `+checkDuplicateIdentifiers(email, phone, matrixNo, workerNo)` |
| `ClientProfile` | `<<Model>>` | `+createProfile(formData)` |
| `ClientProfile` | `<<Model>>` | `+updateProfile(clientId, formData)` |
| `ClientProfile` | `<<Model>>` | `+updateProfileTabs(clientId, tabData)` |
| `Counsellor` | `<<Model>>` | `+getCounsellors()` |
| `Counsellor` | `<<Model>>` | `+checkDuplicate(ppsiNo, workerNo, email)` |
| `Counsellor` | `<<Model>>` | `+createCounsellorProfile(formData, userId)` |
| `Counsellor` | `<<Model>>` | `+findByCriteria(criteria)` |
| `CounsellingLocation` | `<<Model>>` | `+findLocation(locationId)` |
| `Appointment` | `<<Model>>` | `+getAppointmentsByClient(clientId)` |
| `Appointment` | `<<Model>>` | `+createOrUpdateAppointmentInfo(formData, clientId)` |
| `Declaration` | `<<Model>>` | `+getDeclarationsByClient(clientId)` |
| `Declaration` | `<<Model>>` | `+updateConfirmationInfo(clientId, confirmationData)` |

## Telemedicine And Attendance Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `AppointmentRecordPage` | `<<View>>` | `+openAppointmentRecord()` |
| `AppointmentRecordPage` | `<<View>>` | `+getAppointmentDetails(appointmentReference)` |
| `AppointmentRecordPage` | `<<View>>` | `+displayAppointmentDetails()` |
| `AppointmentRecordPage` | `<<View>>` | `+joinOnlineSession(appointmentReference, userId)` |
| `AppointmentRecordPage` | `<<View>>` | `+displayAttendanceAutoLogged()` |
| `AppointmentRecordPage` | `<<View>>` | `+showSessionNotAvailableMessage()` |
| `AppointmentRecordPage` | `<<View>>` | `+showInvalidMeetingLinkError()` |
| `AppointmentRecordPage` | `<<View>>` | `+showAccessDeniedMessage()` |
| `AppointmentRecordPage` | `<<View>>` | `+redirectToAppointmentList()` |
| `AttendanceRecordPage` | `<<View>>` | `+displayAttendanceRecordPanel()` |
| `AttendanceRecordPage` | `<<View>>` | `+displayAttendanceOptions()` |
| `AttendanceRecordPage` | `<<View>>` | `+selectAttendanceStatus()` |
| `AttendanceRecordPage` | `<<View>>` | `+clickSaveAttendance()` |
| `AttendanceRecordPage` | `<<View>>` | `+showMissingStatusError()` |
| `AttendanceRecordPage` | `<<View>>` | `+showInvalidAppointmentReferenceError()` |
| `AttendanceRecordPage` | `<<View>>` | `+showAttendanceSaveSuccess()` |
| `AttendanceRecordPage` | `<<View>>` | `+closeAttendancePanel()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+openQrAttendancePage(qrPayload)` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+displayAttendanceConfirmationPage()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+requestClientIdentityConfirmation()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+confirmAttendance()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+showInvalidOrExpiredQrError()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+showAlreadyCheckedInMessage()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+showUnauthorizedScanError()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+showNonPhysicalSessionError()` |
| `PhysicalQrAttendancePage` | `<<View>>` | `+showAttendanceConfirmation()` |
| `OnlineSessionPage` | `<<View>>` | `+openMeetingLink(appointmentRef)` |
| `OnlineSessionPage` | `<<View>>` | `+notifyAttendanceView()` |
| `OnlineSessionPage` | `<<View>>` | `+showAutoLogError()` |
| `OnlineSessionPage` | `<<View>>` | `+showInvalidOnlineContextError()` |
| `TelemedicineController` | `<<Controller>>` | `+getAppointmentDetails(appointmentReference)` |
| `TelemedicineController` | `<<Controller>>` | `+joinOnlineSession(appointmentReference, userId)` |
| `TelemedicineController` | `<<Controller>>` | `+validateAppointmentAccess(appointmentReference, userId)` |
| `TelemedicineController` | `<<Controller>>` | `+validateMeetingLink(appointmentId, meetingLink)` |
| `TelemedicineController` | `<<Controller>>` | `+getOrCreateAttendanceSession(appointmentId)` |
| `TelemedicineController` | `<<Controller>>` | `+markOnlineAttendance(sessionId, userId)` |
| `TelemedicineController` | `<<Controller>>` | `+recordOnlineJoinEvent(sessionId, userId)` |
| `AttendanceController` | `<<Controller>>` | `+loadAttendanceRecord(appointmentRef)` |
| `AttendanceController` | `<<Controller>>` | `+validateAppointmentReference(appointmentRef)` |
| `AttendanceController` | `<<Controller>>` | `+saveAttendanceStatus(attendanceData)` |
| `AttendanceController` | `<<Controller>>` | `+validateParticipantStatuses(attendanceData)` |
| `AttendanceController` | `<<Controller>>` | `+recordManualAttendance(attendanceData)` |
| `AttendanceController` | `<<Controller>>` | `+loadQrAttendancePage(qrPayload)` |
| `AttendanceController` | `<<Controller>>` | `+validateQrPayload(qrPayload)` |
| `AttendanceController` | `<<Controller>>` | `+validatePhysicalSession(appointmentId)` |
| `AttendanceController` | `<<Controller>>` | `+confirmPhysicalAttendance(qrPayload, clientId)` |
| `AttendanceController` | `<<Controller>>` | `+checkDuplicateCheckIn(sessionId, clientId)` |
| `AttendanceController` | `<<Controller>>` | `+returnAttendanceSaveSuccess()` |
| `OnlineAttendanceController` | `<<Controller>>` | `+detectOnlineJoinEvent(joinPayload)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+retrieveAppointmentReference(joinPayload)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+validateOnlineJoinEvent(joinPayload)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+validateUserIdentity(userId)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+validateOnlineSession(appointmentRef)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+checkDuplicateOnlineAttendance(sessionId, clientId)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+autoLogOnlineAttendance(sessionId, clientId, userId)` |
| `OnlineAttendanceController` | `<<Controller>>` | `+returnAutoLogSuccess()` |
| `OnlineAttendanceController` | `<<Controller>>` | `+returnUnverifiedJoinError()` |
| `OnlineAttendanceController` | `<<Controller>>` | `+returnInvalidOnlineContextError()` |
| `UserAccount` | `<<Model>>` | `+findAccount(userId)` |
| `UserAccount` | `<<Model>>` | `+validateUserIdentity(userId)` |
| `ClientProfile` | `<<Model>>` | `+identifyClient(clientId)` |
| `Appointment` | `<<Model>>` | `+findByReference(referenceNo)` |
| `Appointment` | `<<Model>>` | `+getSessionDetails(appointmentId)` |
| `Appointment` | `<<Model>>` | `+validateSessionType(appointmentId)` |
| `Appointment` | `<<Model>>` | `+validatePhysicalSession(appointmentId)` |
| `Appointment` | `<<Model>>` | `+validateOnlineSession(appointmentId)` |
| `Appointment` | `<<Model>>` | `+validateMeetingLink(appointmentId, meetingLink)` |
| `AppointmentParticipant` | `<<Model>>` | `+getParticipantsByAppointment(appointmentId)` |
| `AppointmentParticipant` | `<<Model>>` | `+updateParticipantList(appointmentId, participantIds)` |
| `AttendanceSession` | `<<Model>>` | `+findOrCreateByAppointment(appointmentId)` |
| `AttendanceSession` | `<<Model>>` | `+findByAppointment(appointmentId)` |
| `AttendanceSession` | `<<Model>>` | `+updateSessionMode(sessionId, sessionMode)` |
| `AttendanceSession` | `<<Model>>` | `+findActiveQrSession(qrTokenHash)` |
| `AttendanceSession` | `<<Model>>` | `+validateAttendanceWindow(sessionId)` |
| `AttendanceParticipant` | `<<Model>>` | `+getAttendanceParticipants(sessionId)` |
| `AttendanceParticipant` | `<<Model>>` | `+findParticipant(sessionId, clientId)` |
| `AttendanceParticipant` | `<<Model>>` | `+checkAlreadyPresent(sessionId, clientId)` |
| `AttendanceParticipant` | `<<Model>>` | `+updateParticipantStatus(sessionId, clientId, status, method)` |
| `AttendanceParticipant` | `<<Model>>` | `+markPresentByQr(sessionId, clientId)` |
| `AttendanceParticipant` | `<<Model>>` | `+markPresentByOnlineAuto(sessionId, clientId, userId)` |
| `AttendanceParticipant` | `<<Model>>` | `+syncParticipants(sessionId, participantIds)` |
| `AttendanceEvent` | `<<Model>>` | `+recordManualUpdateEvent(sessionId, clientId, userId, metadata)` |
| `AttendanceEvent` | `<<Model>>` | `+recordQrScanEvent(sessionId, clientId, userId, metadata)` |
| `AttendanceEvent` | `<<Model>>` | `+recordOnlineJoinEvent(sessionId, clientId, userId, metadata)` |

## Declaration Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `DeclarationFormPage` | `<<View>>` | `+displayDeclarationStatement()` |
| `DeclarationFormPage` | `<<View>>` | `+displayClientIdentity()` |
| `DeclarationFormPage` | `<<View>>` | `+displayDeclarationCheckbox()` |
| `DeclarationFormPage` | `<<View>>` | `+displayCurrentDeclarationStatus()` |
| `DeclarationFormPage` | `<<View>>` | `+displaySubmittedDate()` |
| `DeclarationFormPage` | `<<View>>` | `+showCheckboxRequiredError()` |
| `DeclarationFormPage` | `<<View>>` | `+showDeclarationUnavailableError()` |
| `DeclarationFormPage` | `<<View>>` | `+showSubmittedStatus()` |
| `DeclarationFormPage` | `<<View>>` | `+redirectOrRemainOnDeclarationSection()` |
| `DeclarationReviewPage` | `<<View>>` | `+displayDeclarationReviewDetails()` |
| `DeclarationReviewPage` | `<<View>>` | `+displayReviewStatusBlocks()` |
| `DeclarationReviewPage` | `<<View>>` | `+showIncompleteDeclarationError()` |
| `DeclarationReviewPage` | `<<View>>` | `+showAlreadyVerifiedMessage()` |
| `DeclarationReviewPage` | `<<View>>` | `+showVerificationSuccess()` |
| `DeclarationReviewPage` | `<<View>>` | `+showCorrectionRequiredSuccess()` |
| `DeclarationReviewPage` | `<<View>>` | `+redirectToPreviousReviewPage()` |
| `DeclarationController` | `<<Controller>>` | `+loadDeclarationForm(clientId, appointmentId)` |
| `DeclarationController` | `<<Controller>>` | `+getClientIdentity(clientId)` |
| `DeclarationController` | `<<Controller>>` | `+getCurrentDeclaration(clientId, appointmentId)` |
| `DeclarationController` | `<<Controller>>` | `+submitDeclaration(declarationData)` |
| `DeclarationController` | `<<Controller>>` | `+validateDeclarationCheckbox(isChecked)` |
| `DeclarationController` | `<<Controller>>` | `+validateRequiredDeclarationInfo(clientId, appointmentId)` |
| `DeclarationController` | `<<Controller>>` | `+recordSubmittedDeclaration(declarationData)` |
| `DeclarationController` | `<<Controller>>` | `+exposeForDeclarationVerification(declarationId)` |
| `DeclarationController` | `<<Controller>>` | `+returnDeclarationForm(declarationDetails)` |
| `DeclarationController` | `<<Controller>>` | `+returnSubmittedDeclarationStatus()` |
| `DeclarationVerificationController` | `<<Controller>>` | `+loadSubmittedDeclaration(declarationId)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+validateVerifierPermission(userId)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+verifyDeclaration(declarationId, verifierUserId)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+requestDeclarationCorrection(declarationId, verifierUserId, correctionNote)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+validateDeclarationCompleteness(declarationId)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+checkAlreadyVerified(declarationId)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+updateDeclarationStatus(declarationId, status)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+recordVerificationEvent(declarationId, verifierUserId, action, note)` |
| `DeclarationVerificationController` | `<<Controller>>` | `+returnVerificationSuccess()` |
| `DeclarationVerificationController` | `<<Controller>>` | `+returnCorrectionRequiredSuccess()` |
| `ClientProfile` | `<<Model>>` | `+findProfileById(clientId)` |
| `ClientProfile` | `<<Model>>` | `+markDeclarationReviewRequired(clientId)` |
| `UserAccount` | `<<Model>>` | `+checkVerifierPermission(userId)` |
| `Appointment` | `<<Model>>` | `+findAppointmentForDeclaration(appointmentId)` |
| `Declaration` | `<<Model>>` | `+findCurrentDeclaration(clientId, appointmentId)` |
| `Declaration` | `<<Model>>` | `+validateRequiredInfo(clientId, appointmentId)` |
| `Declaration` | `<<Model>>` | `+markSubmitted(declarationId)` |
| `Declaration` | `<<Model>>` | `+findSubmittedDeclaration(declarationId)` |
| `Declaration` | `<<Model>>` | `+validateCompleteness(declarationId)` |
| `Declaration` | `<<Model>>` | `+checkAlreadyVerified(declarationId)` |
| `Declaration` | `<<Model>>` | `+markVerified(declarationId, verifierUserId)` |
| `Declaration` | `<<Model>>` | `+markCorrectionRequired(declarationId, correctionNote)` |
| `DeclarationVerificationEvent` | `<<Model>>` | `+createVerificationEvent(declarationId, verifierUserId, action, note)` |

## Chatbot And Tracking Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `DashboardPage` | `<<View>>` | `+openDashboard()` |
| `DashboardPage` | `<<View>>` | `+displayDateSelector()` |
| `DashboardPage` | `<<View>>` | `+displayEmotionScoreInput()` |
| `DashboardPage` | `<<View>>` | `+displayEmotionTrend()` |
| `DashboardPage` | `<<View>>` | `+displayEmotionScoresGraph()` |
| `DashboardPage` | `<<View>>` | `+selectDateRange()` |
| `DashboardPage` | `<<View>>` | `+showEmotionLogSuccess()` |
| `DashboardPage` | `<<View>>` | `+showInvalidEmotionScoreError()` |
| `DashboardPage` | `<<View>>` | `+showFutureDateError()` |
| `DashboardPage` | `<<View>>` | `+showFilteredEmotionHistory()` |
| `DashboardPage` | `<<View>>` | `+showNoEmotionHistoryMessage()` |
| `CaseloadPage` | `<<View>>` | `+displayFlaggedClientList()` |
| `CaseloadPage` | `<<View>>` | `+displayRiskIndicators()` |
| `CaseloadPage` | `<<View>>` | `+displayFlaggedClientDetails()` |
| `CaseloadPage` | `<<View>>` | `+displayCaseloadDetailPanel()` |
| `CaseloadPage` | `<<View>>` | `+showFilteredEmotionHistory()` |
| `CaseloadPage` | `<<View>>` | `+showFlaggedClientNotFoundError()` |
| `CaseloadPage` | `<<View>>` | `+showReviewSavedSuccess()` |
| `CaseloadPage` | `<<View>>` | `+redirectToPreviousCaseloadOrDashboard()` |
| `TaskBoardPage` | `<<View>>` | `+displayTaskCreationPanel()` |
| `TaskBoardPage` | `<<View>>` | `+showIncompleteTaskDetailsError()` |
| `TaskBoardPage` | `<<View>>` | `+showTaskCreatedSuccess()` |
| `AICounselorChatbot` | `<<View>>` | `+openAIChatbot()` |
| `AICounselorChatbot` | `<<View>>` | `+displayChatWindow()` |
| `AICounselorChatbot` | `<<View>>` | `+displayGreetingMessage()` |
| `AICounselorChatbot` | `<<View>>` | `+typeMessage(messageText)` |
| `AICounselorChatbot` | `<<View>>` | `+selectQuickReply(quickReplyText)` |
| `AICounselorChatbot` | `<<View>>` | `+clickSend()` |
| `AICounselorChatbot` | `<<View>>` | `+clickSaveChat()` |
| `AICounselorChatbot` | `<<View>>` | `+closeOrMinimizeChatbot()` |
| `AICounselorChatbot` | `<<View>>` | `+displayClientMessageAndAIResponse()` |
| `AICounselorChatbot` | `<<View>>` | `+displayHighStressDetectedMessage()` |
| `AICounselorChatbot` | `<<View>>` | `+displayChatSavedForCounselorReview()` |
| `EmotionLogController` | `<<Controller>>` | `+loadDashboardEmotionTracker(clientId)` |
| `EmotionLogController` | `<<Controller>>` | `+saveEmotionScore(emotionData)` |
| `EmotionLogController` | `<<Controller>>` | `+validateEmotionScore(score)` |
| `EmotionLogController` | `<<Controller>>` | `+validateEmotionDate(date)` |
| `EmotionLogController` | `<<Controller>>` | `+generateMeaningfulWords(score)` |
| `EmotionLogController` | `<<Controller>>` | `+returnEmotionLogSuccess(meaningfulWords)` |
| `EmotionHistoryController` | `<<Controller>>` | `+loadEmotionHistory(userId, selectedClientId)` |
| `EmotionHistoryController` | `<<Controller>>` | `+verifyEmotionHistoryPermission(userId, selectedClientId)` |
| `EmotionHistoryController` | `<<Controller>>` | `+loadFlaggedClientEmotionHistory(counselorId, clientId)` |
| `EmotionHistoryController` | `<<Controller>>` | `+filterEmotionHistory(clientId, dateRange)` |
| `EmotionHistoryController` | `<<Controller>>` | `+returnEmotionHistory(records)` |
| `EmotionHistoryController` | `<<Controller>>` | `+returnFilteredEmotionHistory(records)` |
| `EmotionHistoryController` | `<<Controller>>` | `+returnNoEmotionHistoryMessage()` |
| `ChatbotController` | `<<Controller>>` | `+openChatbot(clientId)` |
| `ChatbotController` | `<<Controller>>` | `+sendMessage(sessionId, clientId, messageText)` |
| `ChatbotController` | `<<Controller>>` | `+validateMessage(messageText)` |
| `ChatbotController` | `<<Controller>>` | `+placeQuickReplyInInput(quickReplyText)` |
| `ChatbotController` | `<<Controller>>` | `+generateResponseAndScreenRisk(messageText)` |
| `ChatbotController` | `<<Controller>>` | `+saveChat(sessionId, clientId)` |
| `FlaggedClientController` | `<<Controller>>` | `+loadFlaggedClientList(counselorId)` |
| `FlaggedClientController` | `<<Controller>>` | `+viewFlaggedClient(riskFlagId)` |
| `FlaggedClientController` | `<<Controller>>` | `+saveReviewDecision(riskFlagId, reviewData)` |
| `FlaggedClientController` | `<<Controller>>` | `+validateTaskDetails(taskData)` |
| `FlaggedClientController` | `<<Controller>>` | `+createInterventionTask(taskData)` |
| `FlaggedClientController` | `<<Controller>>` | `+returnFlaggedClientDetails(details)` |
| `FlaggedClientController` | `<<Controller>>` | `+returnReviewSavedSuccess()` |
| `FlaggedClientController` | `<<Controller>>` | `+returnTaskCreatedSuccess()` |
| `ClientProfile` | `<<Model>>` | `+findProfileById(clientId)` |
| `ClientProfile` | `<<Model>>` | `+findProfileByUserId(userId)` |
| `UserAccount` | `<<Model>>` | `+checkEmotionHistoryPermission(userId, clientId)` |
| `Counsellor` | `<<Model>>` | `+findByUserId(userId)` |
| `EmotionLog` | `<<Model>>` | `+findByClient(clientId)` |
| `EmotionLog` | `<<Model>>` | `+findByClientAndDate(clientId, date)` |
| `EmotionLog` | `<<Model>>` | `+findByClientAndDateRange(clientId, startDate, endDate)` |
| `EmotionLog` | `<<Model>>` | `+createEmotionScore(clientId, date, score)` |
| `EmotionLog` | `<<Model>>` | `+updateEmotionScore(clientId, date, score)` |
| `ChatSession` | `<<Model>>` | `+getOrCreateOpenSession(clientId)` |
| `ChatSession` | `<<Model>>` | `+markAsSaved(sessionId)` |
| `ChatMessage` | `<<Model>>` | `+createUserMessage(sessionId, messageText)` |
| `ChatMessage` | `<<Model>>` | `+createBotMessage(sessionId, aiResponse)` |
| `RiskFlag` | `<<Model>>` | `+findActiveFlagForClient(clientId)` |
| `RiskFlag` | `<<Model>>` | `+findAssignedFlags(counselorId)` |
| `RiskFlag` | `<<Model>>` | `+findById(riskFlagId)` |
| `RiskFlag` | `<<Model>>` | `+verifyCounselorAccess(counselorId, clientId)` |
| `RiskFlag` | `<<Model>>` | `+createRiskFlag(source, severity, message, clientId, sourceRefId)` |
| `RiskFlag` | `<<Model>>` | `+updateReviewDecision(riskFlagId, reviewData)` |
| `Appointment` | `<<Model>>` | `+getAppointmentHistoryByClient(clientId)` |
| `CounsellorTask` | `<<Model>>` | `+createInterventionTask(counselorId, clientId, riskFlagId, taskData)` |
| `AICounselorService` | `<<Service>>` | `+generateResponseAndScreenRisk(messageText)` |

## Appointment Scheduling Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `SmartAppointmentForm` | `<<View>>` | `+loadBookingForm(clientId)` |
| `SmartAppointmentForm` | `<<View>>` | `+displayBookingForm()` |
| `SmartAppointmentForm` | `<<View>>` | `+displayApplicantInformation()` |
| `SmartAppointmentForm` | `<<View>>` | `+displayCalendarAndSlotSelection()` |
| `SmartAppointmentForm` | `<<View>>` | `+displayAttachmentFields()` |
| `SmartAppointmentForm` | `<<View>>` | `+displayConfirmationFields()` |
| `SmartAppointmentForm` | `<<View>>` | `+displayBookingSummary()` |
| `SmartAppointmentForm` | `<<View>>` | `+showFollowUpBookingSummary()` |
| `SmartAppointmentForm` | `<<View>>` | `+showNoAvailableSlotError()` |
| `SmartAppointmentForm` | `<<View>>` | `+showIncompleteAppointmentInfoError()` |
| `SmartAppointmentForm` | `<<View>>` | `+showDraftSavedMessage()` |
| `AppointmentRecordsPage` | `<<View>>` | `+displayAppointmentRecords()` |
| `AppointmentRecordsPage` | `<<View>>` | `+displaySelectedAppointmentSummary()` |
| `AppointmentRecordsPage` | `<<View>>` | `+openFollowUpMode()` |
| `AppointmentRecordsPage` | `<<View>>` | `+lockPreviousAppointmentReference()` |
| `AppointmentRecordsPage` | `<<View>>` | `+displayFollowUpForm()` |
| `AppointmentRecordsPage` | `<<View>>` | `+showFollowUpUnavailableMessage()` |
| `AppointmentRecordsPage` | `<<View>>` | `+showAppointmentNotEligibleMessage()` |
| `AppointmentRecordsPage` | `<<View>>` | `+showNoAvailableFollowUpSlotError()` |
| `SlotManagerPage` | `<<View>>` | `+displaySlotManagerPage()` |
| `SlotManagerPage` | `<<View>>` | `+displayConfiguredSlotOverview()` |
| `SlotManagerPage` | `<<View>>` | `+displayManualAddSlotControls()` |
| `SlotManagerPage` | `<<View>>` | `+displayBulkSetupSection()` |
| `SlotManagerPage` | `<<View>>` | `+displayCsvImportSection()` |
| `SlotManagerPage` | `<<View>>` | `+addManualSlotToDraft(slotDraft)` |
| `SlotManagerPage` | `<<View>>` | `+addGeneratedSlotsToDraft(generatedSlots)` |
| `SlotManagerPage` | `<<View>>` | `+addImportedSlotsToDraft(importedSlots)` |
| `SlotManagerPage` | `<<View>>` | `+removeSlotFromDraft(slotId)` |
| `SlotManagerPage` | `<<View>>` | `+markSavedSlotsForRemoval(existingSlots)` |
| `SlotManagerPage` | `<<View>>` | `+showImportSummary(importSummary)` |
| `SlotManagerPage` | `<<View>>` | `+showBulkGenerationSummary(summary)` |
| `SlotManagerPage` | `<<View>>` | `+showConfirmSaveDialog()` |
| `SlotManagerPage` | `<<View>>` | `+showSaveSuccessMessage()` |
| `AppointmentQueuePage` | `<<View>>` | `+displayPendingAppointmentQueue()` |
| `AppointmentQueuePage` | `<<View>>` | `+displayAppointmentDetails()` |
| `AppointmentQueuePage` | `<<View>>` | `+showAdminReviewConfirmation()` |
| `AppointmentQueuePage` | `<<View>>` | `+showCounsellorReviewConfirmation()` |
| `AppointmentQueuePage` | `<<View>>` | `+showSuccessMessage()` |
| `AppointmentQueuePage` | `<<View>>` | `+showAppointmentNotFoundError()` |
| `AppointmentQueuePage` | `<<View>>` | `+showMissingReviewInformationError()` |
| `AppointmentQueuePage` | `<<View>>` | `+showCounsellorApprovalUnavailableError()` |
| `AppointmentController` | `<<Controller>>` | `+loadBookingForm(clientId)` |
| `AppointmentController` | `<<Controller>>` | `+getAvailableSlots()` |
| `AppointmentController` | `<<Controller>>` | `+submitAppointmentRequest(formData)` |
| `AppointmentController` | `<<Controller>>` | `+validateAppointmentRequest(formData)` |
| `AppointmentController` | `<<Controller>>` | `+checkSlotAvailability(slotId, sessionType)` |
| `AppointmentController` | `<<Controller>>` | `+generateReferenceNumber()` |
| `AppointmentController` | `<<Controller>>` | `+createAppointment(formData, status)` |
| `AppointmentController` | `<<Controller>>` | `+createDeclaration(appointmentId, confirmationDetails)` |
| `AppointmentController` | `<<Controller>>` | `+generateMeetingLink(referenceNo)` |
| `AppointmentController` | `<<Controller>>` | `+updateMeetingLink(appointmentId, meetingLink)` |
| `AppointmentController` | `<<Controller>>` | `+returnBookingSummary(summary)` |
| `NewAppointmentController` | `<<Controller>>` | `+startNewAppointment(clientId)` |
| `NewAppointmentController` | `<<Controller>>` | `+generateSessionReferenceNumber()` |
| `NewAppointmentController` | `<<Controller>>` | `+loadAvailableSlots(criteria)` |
| `NewAppointmentController` | `<<Controller>>` | `+validateNewAppointmentDetails(formData)` |
| `NewAppointmentController` | `<<Controller>>` | `+validateSelectedSlot(slotId, sessionType)` |
| `NewAppointmentController` | `<<Controller>>` | `+prepareNewAppointmentDetails(formData)` |
| `NewAppointmentController` | `<<Controller>>` | `+saveDraftAppointment(formData)` |
| `NewAppointmentController` | `<<Controller>>` | `+returnCompletedNewAppointmentDetails(details)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+loadAppointmentRecords(clientId)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+selectFollowUpAppointment(referenceNo)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+validateFollowUpEligibility(appointmentId)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+openFollowUpForm(previousAppointmentId)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+validateFollowUpSlot(slotId, sessionType)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+submitFollowUpRequest(followUpData)` |
| `FollowUpAppointmentController` | `<<Controller>>` | `+returnFollowUpBookingSummary(summary)` |
| `SlotManagementController` | `<<Controller>>` | `+loadSlotManager(userId)` |
| `SlotManagementController` | `<<Controller>>` | `+loadConfiguredSlots(filters)` |
| `SlotManagementController` | `<<Controller>>` | `+addManualSlot(slotData)` |
| `SlotManagementController` | `<<Controller>>` | `+validateSessionTypes(slotData)` |
| `SlotManagementController` | `<<Controller>>` | `+validateSlotTime(slotData)` |
| `SlotManagementController` | `<<Controller>>` | `+checkSlotOverlap(slotData)` |
| `SlotManagementController` | `<<Controller>>` | `+removeDraftSlot(slotId)` |
| `SlotManagementController` | `<<Controller>>` | `+markSavedSlotForRemoval(slotId)` |
| `SlotManagementController` | `<<Controller>>` | `+receiveGeneratedSlotsFromAS05(generatedSlots, slotsMarkedForRemoval)` |
| `SlotManagementController` | `<<Controller>>` | `+receiveImportedSlotsFromAS06(importedSlots, slotsMarkedForRemoval)` |
| `SlotManagementController` | `<<Controller>>` | `+saveSlotChanges(draftChanges)` |
| `SlotManagementController` | `<<Controller>>` | `+createSlotGenerationBatch(batchData)` |
| `SlotManagementController` | `<<Controller>>` | `+deleteMarkedSavedSlots(slotIds)` |
| `SlotManagementController` | `<<Controller>>` | `+saveDraftSlots(draftSlots, batchId)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+openBulkSetupSection(userId)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+generateBulkSlots(criteria)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+validateWeekdaySelection(criteria)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+validateSessionTypeSelection(criteria)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+validateDateRange(criteria)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+findMatchingDates(criteria)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+generateSlotDrafts(criteria, matchedDates)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+applyReplaceExistingDates(matchedDates)` |
| `SlotBulkGenerationController` | `<<Controller>>` | `+returnBulkGenerationSummary(summary, generatedSlots)` |
| `SlotImportController` | `<<Controller>>` | `+openCsvImportSection(userId)` |
| `SlotImportController` | `<<Controller>>` | `+importCsvSlots(csvFile, replaceExisting)` |
| `SlotImportController` | `<<Controller>>` | `+validateCsvFile(csvFile)` |
| `SlotImportController` | `<<Controller>>` | `+parseCsvFile(csvFile)` |
| `SlotImportController` | `<<Controller>>` | `+validateCsvRows(parsedRows)` |
| `SlotImportController` | `<<Controller>>` | `+resolveCsvCounsellors(validRows)` |
| `SlotImportController` | `<<Controller>>` | `+convertRowsToSlotDrafts(validRows)` |
| `SlotImportController` | `<<Controller>>` | `+applyReplaceExistingDates(importedDates)` |
| `SlotImportController` | `<<Controller>>` | `+returnImportSummary(importSummary)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+loadPendingAppointmentQueue(userId, filters)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+openAppointmentDetails(appointmentId)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+validateAppointmentExists(appointmentId)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+loadAppointmentReviewDetails(appointmentId)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+approveForCounsellorReview(appointmentId, adminReviewData)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+validateAdminReviewInformation(adminReviewData)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+openCounsellorReviewAppointment(appointmentId, counsellorId)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+validateCounsellorReviewEligibility(appointment)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+approveAppointment(appointmentId, counsellorReviewData)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+validateCounsellorReviewInformation(counsellorReviewData)` |
| `AppointmentVerificationController` | `<<Controller>>` | `+requestAppointmentStatusNotification(appointmentId, eventType)` |
| `ClientProfile` | `<<Model>>` | `+findClientProfileById(clientId)` |
| `ClientProfile` | `<<Model>>` | `+findProfileById(clientId)` |
| `ClientProfile` | `<<Model>>` | `+findByAppointment(appointmentId)` |
| `Appointment` | `<<Model>>` | `+generateReferenceNumber()` |
| `Appointment` | `<<Model>>` | `+createAppointment(formData, status)` |
| `Appointment` | `<<Model>>` | `+createDraftAppointment(formData)` |
| `Appointment` | `<<Model>>` | `+updateMeetingLink(appointmentId, meetingLink)` |
| `Appointment` | `<<Model>>` | `+findEligibleFollowUpRecords(clientId)` |
| `Appointment` | `<<Model>>` | `+findByReference(referenceNo)` |
| `Appointment` | `<<Model>>` | `+checkFollowUpStatus(appointmentId)` |
| `Appointment` | `<<Model>>` | `+createFollowUpRequest(followUpData)` |
| `Appointment` | `<<Model>>` | `+findPendingAppointments(filters)` |
| `Appointment` | `<<Model>>` | `+findById(appointmentId)` |
| `Appointment` | `<<Model>>` | `+findReviewDetails(appointmentId)` |
| `Appointment` | `<<Model>>` | `+updateAdminReview(appointmentId, status, adminReviewData)` |
| `Appointment` | `<<Model>>` | `+updateCounsellorReview(appointmentId, status, counsellorReviewData)` |
| `Appointment` | `<<Model>>` | `+isReadyForCounsellorReview(appointment)` |
| `AppointmentSlot` | `<<Model>>` | `+getAvailableSlots()` |
| `AppointmentSlot` | `<<Model>>` | `+checkSlotAvailability(slotId, sessionType)` |
| `AppointmentSlot` | `<<Model>>` | `+findAvailableSlots(criteria)` |
| `AppointmentSlot` | `<<Model>>` | `+findAvailableSlot(slotId, sessionType)` |
| `AppointmentSlot` | `<<Model>>` | `+reserveSlotForRequest(slotId)` |
| `AppointmentSlot` | `<<Model>>` | `+findSlotById(slotId)` |
| `AppointmentSlot` | `<<Model>>` | `+checkSessionTypeAllowed(slotId, sessionType)` |
| `AppointmentSlot` | `<<Model>>` | `+findConfiguredSlots(filters)` |
| `AppointmentSlot` | `<<Model>>` | `+buildManualSlotDraft(slotData)` |
| `AppointmentSlot` | `<<Model>>` | `+buildDraftSlotsFromBulkCriteria(criteria, matchedDates)` |
| `AppointmentSlot` | `<<Model>>` | `+buildDraftSlotsFromCsvRows(validRows)` |
| `AppointmentSlot` | `<<Model>>` | `+checkOverlap(slotData)` |
| `AppointmentSlot` | `<<Model>>` | `+findDraftSlotsByDates(dates)` |
| `AppointmentSlot` | `<<Model>>` | `+removeDraftSlotsByDates(dates)` |
| `AppointmentSlot` | `<<Model>>` | `+findSavedSlotsByDates(dates)` |
| `AppointmentSlot` | `<<Model>>` | `+markSavedSlotsForRemoval(existingSlots)` |
| `AppointmentSlot` | `<<Model>>` | `+deleteSlots(slotIds)` |
| `AppointmentSlot` | `<<Model>>` | `+createSlots(draftSlots, batchId)` |
| `AppointmentSlot` | `<<Model>>` | `+findByAppointment(appointmentId)` |
| `AppointmentSlotSessionType` | `<<Model>>` | `+buildDraftSessionTypes(slotDraft, sessionTypes)` |
| `AppointmentSlotSessionType` | `<<Model>>` | `+createSessionTypes(slotId, sessionTypes)` |
| `AppointmentSlotSessionType` | `<<Model>>` | `+deleteBySlotIds(slotIds)` |
| `AppointmentAttachment` | `<<Model>>` | `+saveDraftAttachment(appointmentId, attachmentData)` |
| `Declaration` | `<<Model>>` | `+createDeclaration(appointmentId, confirmationDetails)` |
| `Counsellor` | `<<Model>>` | `+findBySlot(slotId)` |
| `Counsellor` | `<<Model>>` | `+findActiveCounsellors()` |
| `Counsellor` | `<<Model>>` | `+findById(counsellorId)` |
| `Counsellor` | `<<Model>>` | `+findByCsvValue(counsellorValue)` |
| `CounsellingLocation` | `<<Model>>` | `+findBySlot(slotId)` |
| `SlotGenerationBatch` | `<<Model>>` | `+createBatch(batchData)` |
| `SlotGenerationBatch` | `<<Model>>` | `+prepareBulkBatchSummary(startDate, endDate, matchedDates, generatedCount, replaceExisting)` |
| `SlotGenerationBatch` | `<<Model>>` | `+prepareCsvBatchSummary(totalRows, validRows, skippedRows, replaceExisting)` |
| `EmailNotification` | `<<Model>>` | `+createQueuedNotification(appointmentId, recipientUserId, eventType)` |
| `MeetingLinkService` | `<<Service>>` | `+generateMeetingLink(referenceNo)` |
| `CsvImportService` | `<<Service>>` | `+parseCsvFile(csvFile)` |
| `CsvImportService` | `<<Service>>` | `+validateCsvTemplate(parsedRows)` |
| `CsvImportService` | `<<Service>>` | `+extractValidRows(parsedRows)` |
| `CsvImportService` | `<<Service>>` | `+countSkippedRows(parsedRows)` |
| `CsvImportService` | `<<Service>>` | `+buildImportSummary(totalRows, validRows, skippedRows)` |
| `AppointmentNotificationService` | `<<Service>>` | `+queueAppointmentStatusNotification(appointmentId, eventType)` |
| `AppointmentNotificationService` | `<<Service>>` | `+resolveNotificationRecipients(appointmentId)` |
| `AppointmentNotificationService` | `<<Service>>` | `+buildAppointmentStatusNotification(appointmentId, eventType)` |

## Educational Resource Library Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `LearningMaterialsPage` | `<<View>>` | `+displayUploadLearningMaterialForm()` |
| `LearningMaterialsPage` | `<<View>>` | `+displayResourceCount()` |
| `LearningMaterialsPage` | `<<View>>` | `+displayResourceMetadata()` |
| `LearningMaterialsPage` | `<<View>>` | `+submitLearningMaterial(resourceData)` |
| `LearningMaterialsPage` | `<<View>>` | `+showUploadSuccessMessage()` |
| `LearningMaterialsPage` | `<<View>>` | `+showMissingTitleOrUrlError()` |
| `LearningMaterialsPage` | `<<View>>` | `+showInvalidResourceUrlError()` |
| `LearningMaterialsPage` | `<<View>>` | `+redirectToPreviousPage()` |
| `ResourceLibraryPage` | `<<View>>` | `+displayAvailableLearningMaterials()` |
| `ResourceLibraryPage` | `<<View>>` | `+displayFilteredResourceList()` |
| `ResourceLibraryPage` | `<<View>>` | `+openSelectedMaterial(resourceUrl)` |
| `ResourceLibraryPage` | `<<View>>` | `+showNoMatchingResourceMessage()` |
| `ResourceLibraryPage` | `<<View>>` | `+showResourceUnavailableError()` |
| `ResourceLibraryPage` | `<<View>>` | `+redirectToDashboardOrPreviousPage()` |
| `ResourceLibraryController` | `<<Controller>>` | `+loadLearningMaterialsPage(userId)` |
| `ResourceLibraryController` | `<<Controller>>` | `+getResourceLibraryStatus()` |
| `ResourceLibraryController` | `<<Controller>>` | `+uploadLearningMaterial(resourceData)` |
| `ResourceLibraryController` | `<<Controller>>` | `+validateRequiredResourceFields(resourceData)` |
| `ResourceLibraryController` | `<<Controller>>` | `+validateResourceUrl(resourceDataUrl)` |
| `ResourceLibraryController` | `<<Controller>>` | `+createResourceLibraryItem(resourceData, uploadedByUserId)` |
| `ResourceLibraryController` | `<<Controller>>` | `+returnResourceLibraryStatus(status)` |
| `ResourceLibraryController` | `<<Controller>>` | `+returnUploadSuccessMessage()` |
| `ResourceAccessController` | `<<Controller>>` | `+loadResourceLibrary(clientId)` |
| `ResourceAccessController` | `<<Controller>>` | `+searchOrFilterMaterials(criteria)` |
| `ResourceAccessController` | `<<Controller>>` | `+openLearningMaterial(resourceId, clientId)` |
| `ResourceAccessController` | `<<Controller>>` | `+validateResourceUrl(resource)` |
| `ResourceAccessController` | `<<Controller>>` | `+recordResourceAccess(resourceId, clientId)` |
| `ResourceAccessController` | `<<Controller>>` | `+returnAvailableResources(resources)` |
| `ResourceAccessController` | `<<Controller>>` | `+returnFilteredResources(resources)` |
| `ResourceAccessController` | `<<Controller>>` | `+returnResourceUrl(resourceUrl)` |
| `UserAccount` | `<<Model>>` | `+findById(userId)` |
| `ClientProfile` | `<<Model>>` | `+findById(clientId)` |
| `ResourceLibraryItem` | `<<Model>>` | `+countPublishedResources()` |
| `ResourceLibraryItem` | `<<Model>>` | `+findResourceMetadata()` |
| `ResourceLibraryItem` | `<<Model>>` | `+findPublishedResources()` |
| `ResourceLibraryItem` | `<<Model>>` | `+findBySearchOrFilter(criteria)` |
| `ResourceLibraryItem` | `<<Model>>` | `+findById(resourceId)` |
| `ResourceLibraryItem` | `<<Model>>` | `+isUrlAvailable(resource)` |
| `ResourceLibraryItem` | `<<Model>>` | `+createResource(resourceData, uploadedByUserId)` |
| `ResourceAccessLog` | `<<Model>>` | `+createAccessLog(resourceId, clientId)` |

## Peer Support Forum Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `PeerSupportForumPage` | `<<View>>` | `+displayForumPostForm()` |
| `PeerSupportForumPage` | `<<View>>` | `+displayCategoryOptions()` |
| `PeerSupportForumPage` | `<<View>>` | `+submitForumPost(postData)` |
| `PeerSupportForumPage` | `<<View>>` | `+showPostPublishedConfirmation()` |
| `PeerSupportForumPage` | `<<View>>` | `+showPostQueuedForReviewMessage()` |
| `PeerSupportForumPage` | `<<View>>` | `+showMissingPostDetailsError()` |
| `PeerSupportForumPage` | `<<View>>` | `+redirectToForumList()` |
| `ForumModerationPage` | `<<View>>` | `+displayForumModerationPage()` |
| `ForumModerationPage` | `<<View>>` | `+displayForumManagementFilters()` |
| `ForumModerationPage` | `<<View>>` | `+displayUnsafePostQueue()` |
| `ForumModerationPage` | `<<View>>` | `+displayAllForumPosts()` |
| `ForumModerationPage` | `<<View>>` | `+displayModerationEventLog()` |
| `ForumModerationPage` | `<<View>>` | `+displayMatchingForumPosts(posts)` |
| `ForumModerationPage` | `<<View>>` | `+showConfirmModerationDialog()` |
| `ForumModerationPage` | `<<View>>` | `+showModerationSuccessMessage()` |
| `ForumModerationPage` | `<<View>>` | `+showNoForumPostsFoundMessage()` |
| `ForumModerationPage` | `<<View>>` | `+showModerationActionFailedError()` |
| `ForumPostController` | `<<Controller>>` | `+openCreatePostForm(clientId)` |
| `ForumPostController` | `<<Controller>>` | `+loadActiveCategories()` |
| `ForumPostController` | `<<Controller>>` | `+submitForumPost(postData, clientId)` |
| `ForumPostController` | `<<Controller>>` | `+validateForumPostDetails(postData)` |
| `ForumPostController` | `<<Controller>>` | `+requestSafetyReview(postData)` |
| `ForumPostController` | `<<Controller>>` | `+determinePostStatus(safetyResult)` |
| `ForumPostController` | `<<Controller>>` | `+createForumPost(postData, clientId, safetyResult, status)` |
| `ForumPostController` | `<<Controller>>` | `+returnPostPublishedConfirmation()` |
| `ForumPostController` | `<<Controller>>` | `+returnPostQueuedForReviewMessage()` |
| `ForumModerationController` | `<<Controller>>` | `+loadForumModerationPage(adminUserId)` |
| `ForumModerationController` | `<<Controller>>` | `+loadModerationDashboard(filters)` |
| `ForumModerationController` | `<<Controller>>` | `+filterForumPosts(criteria)` |
| `ForumModerationController` | `<<Controller>>` | `+moderateSelectedPost(postId, action, reason, adminUserId)` |
| `ForumModerationController` | `<<Controller>>` | `+validateModerationAction(action)` |
| `ForumModerationController` | `<<Controller>>` | `+determineNextPostStatus(action)` |
| `ForumModerationController` | `<<Controller>>` | `+updateForumPostStatus(postId, nextStatus, reason)` |
| `ForumModerationController` | `<<Controller>>` | `+recordModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)` |
| `ForumModerationController` | `<<Controller>>` | `+returnModerationDashboard(dashboardData)` |
| `ForumModerationController` | `<<Controller>>` | `+returnFilteredPosts(posts)` |
| `ClientProfile` | `<<Model>>` | `+findById(clientId)` |
| `UserAccount` | `<<Model>>` | `+findById(adminUserId)` |
| `ForumCategory` | `<<Model>>` | `+findActiveCategories()` |
| `ForumCategory` | `<<Model>>` | `+findById(categoryId)` |
| `ForumPost` | `<<Model>>` | `+findModerationDashboardPosts(filters)` |
| `ForumPost` | `<<Model>>` | `+findByCriteria(criteria)` |
| `ForumPost` | `<<Model>>` | `+findById(postId)` |
| `ForumPost` | `<<Model>>` | `+createPost(postData, clientId, categoryId, safetyScore, moderationReason, status)` |
| `ForumPost` | `<<Model>>` | `+updateStatus(postId, nextStatus, reason)` |
| `ForumModerationEvent` | `<<Model>>` | `+findRecentEvents()` |
| `ForumModerationEvent` | `<<Model>>` | `+createModerationEvent(postId, adminUserId, action, previousStatus, nextStatus, reason)` |
| `AiSafetyReviewService` | `<<Service>>` | `+reviewForumPostSafety(title, content)` |
| `AiSafetyReviewService` | `<<Service>>` | `+calculateSafetyScore(title, content)` |
| `AiSafetyReviewService` | `<<Service>>` | `+returnSafetyResult(safetyScore, moderationReason)` |

## Psychometric Self-Assessment Module

| Class | Stereotype | Function |
| --- | --- | --- |
| `PsychometricTestPage` | `<<View>>` | `+openPsychometricTestPage()` |
| `PsychometricTestPage` | `<<View>>` | `+displayAvailableTests()` |
| `PsychometricTestPage` | `<<View>>` | `+displayQuestionsAndOptions()` |
| `PsychometricTestPage` | `<<View>>` | `+displayProgressInformation()` |
| `PsychometricTestPage` | `<<View>>` | `+submitTest(testId, clientId, answers)` |
| `PsychometricTestPage` | `<<View>>` | `+displayConfirmationDialog()` |
| `PsychometricTestPage` | `<<View>>` | `+displayResultSummary()` |
| `PsychometricTestPage` | `<<View>>` | `+displaySupportRecommendation()` |
| `PsychometricTestPage` | `<<View>>` | `+displayIncompleteAnswersMessage()` |
| `PsychometricTestPage` | `<<View>>` | `+cancelTest()` |
| `PsychometricTriagePage` | `<<View>>` | `+displayTriageDashboard()` |
| `PsychometricTriagePage` | `<<View>>` | `+displayLatestSubmissions()` |
| `PsychometricTriagePage` | `<<View>>` | `+displayFilteredTriageResults(results)` |
| `PsychometricTriagePage` | `<<View>>` | `+displaySubmissionDetails(details)` |
| `PsychometricTriagePage` | `<<View>>` | `+showNoTriageResultsFoundMessage()` |
| `PsychometricTriagePage` | `<<View>>` | `+showSubmissionCannotBeLoadedError()` |
| `PsychometricTriagePage` | `<<View>>` | `+redirectToPreviousPageOrDashboard()` |
| `TestingMaterialsPage` | `<<View>>` | `+displayUploadTestingMaterialForm()` |
| `TestingMaterialsPage` | `<<View>>` | `+displayCurrentTestCount()` |
| `TestingMaterialsPage` | `<<View>>` | `+displayAvailableTestingMaterials()` |
| `TestingMaterialsPage` | `<<View>>` | `+submitPdfGenerationRequest(testData, pdfFile)` |
| `TestingMaterialsPage` | `<<View>>` | `+showGeneratedTestSuccessMessage(testCode, questionCount)` |
| `TestingMaterialsPage` | `<<View>>` | `+showMissingTitleOrPdfError()` |
| `TestingMaterialsPage` | `<<View>>` | `+showUnsupportedFileTypeError()` |
| `PsychometricController` | `<<Controller>>` | `+loadAvailableTests(clientId)` |
| `PsychometricController` | `<<Controller>>` | `+loadTestQuestions(testId)` |
| `PsychometricController` | `<<Controller>>` | `+submitTest(testId, clientId, answers)` |
| `PsychometricController` | `<<Controller>>` | `+validateAnswers(answers)` |
| `PsychometricController` | `<<Controller>>` | `+calculateTotalScore(answers)` |
| `PsychometricController` | `<<Controller>>` | `+calculateScorePercent(totalScore)` |
| `PsychometricController` | `<<Controller>>` | `+determineRiskLevel(scorePercent)` |
| `PsychometricController` | `<<Controller>>` | `+generateInterpretation()` |
| `PsychometricController` | `<<Controller>>` | `+createSubmission(testId, clientId, totalScore, scorePercent, riskLevel)` |
| `PsychometricController` | `<<Controller>>` | `+createAnswer(submissionId, questionId, optionValue)` |
| `PsychometricController` | `<<Controller>>` | `+createRiskFlag(source, severity, clientId, sourceRefId)` |
| `PsychometricTriageController` | `<<Controller>>` | `+loadTriageDashboard(counsellorId)` |
| `PsychometricTriageController` | `<<Controller>>` | `+loadLatestSubmissions(filters)` |
| `PsychometricTriageController` | `<<Controller>>` | `+searchOrFilterSubmissions(criteria)` |
| `PsychometricTriageController` | `<<Controller>>` | `+openSubmissionDetails(submissionId)` |
| `PsychometricTriageController` | `<<Controller>>` | `+loadSubmissionDetails(submissionId)` |
| `PsychometricTriageController` | `<<Controller>>` | `+loadPsychometricRiskFlags(clientId)` |
| `PsychometricTriageController` | `<<Controller>>` | `+returnTriageDashboard(results)` |
| `PsychometricTriageController` | `<<Controller>>` | `+returnFilteredTriageResults(results)` |
| `PsychometricTriageController` | `<<Controller>>` | `+returnSubmissionDetails(details)` |
| `PsychometricTestController` | `<<Controller>>` | `+loadTestingMaterialsPage(adminUserId)` |
| `PsychometricTestController` | `<<Controller>>` | `+getCurrentTestSummary()` |
| `PsychometricTestController` | `<<Controller>>` | `+uploadPdfAndGenerateTest(testData, pdfFile, adminUserId)` |
| `PsychometricTestController` | `<<Controller>>` | `+validateTestTitleAndPdf(testData, pdfFile)` |
| `PsychometricTestController` | `<<Controller>>` | `+validatePdfFileType(pdfFile)` |
| `PsychometricTestController` | `<<Controller>>` | `+generatePsychometricTestFromPdf(testData, pdfFile)` |
| `PsychometricTestController` | `<<Controller>>` | `+saveGeneratedTest(generatedTest, adminUserId)` |
| `PsychometricTestController` | `<<Controller>>` | `+returnCurrentTestSummary(summary)` |
| `PsychometricTestController` | `<<Controller>>` | `+returnGeneratedTestSuccessMessage(testCode, questionCount)` |
| `UserAccount` | `<<Model>>` | `+findById(adminUserId)` |
| `ClientProfile` | `<<Model>>` | `+findBySubmission(submissionId)` |
| `ClientProfile` | `<<Model>>` | `+findByCriteria(criteria)` |
| `PsychometricTest` | `<<Model>>` | `+getPublishedTests()` |
| `PsychometricTest` | `<<Model>>` | `+countPublishedTests()` |
| `PsychometricTest` | `<<Model>>` | `+findAvailableTests()` |
| `PsychometricTest` | `<<Model>>` | `+findBySubmission(submissionId)` |
| `PsychometricTest` | `<<Model>>` | `+createGeneratedTest(generatedTest, adminUserId)` |
| `PsychometricQuestion` | `<<Model>>` | `+getQuestionsAndOptions(testId)` |
| `PsychometricQuestion` | `<<Model>>` | `+createGeneratedQuestions(testId, generatedQuestions)` |
| `PsychometricOption` | `<<Model>>` | `+createGeneratedOptions(testId, generatedOptions)` |
| `PsychometricSubmission` | `<<Model>>` | `+createSubmission(testId, clientId, totalScore, scorePercent, riskLevel)` |
| `PsychometricSubmission` | `<<Model>>` | `+findLatestSubmissions(filters)` |
| `PsychometricSubmission` | `<<Model>>` | `+findByCriteria(criteria)` |
| `PsychometricSubmission` | `<<Model>>` | `+findById(submissionId)` |
| `PsychometricAnswer` | `<<Model>>` | `+createAnswer(submissionId, questionId, optionValue)` |
| `PsychometricAnswer` | `<<Model>>` | `+findBySubmission(submissionId)` |
| `RiskFlag` | `<<Model>>` | `+createRiskFlag(source, severity, clientId, sourceRefId)` |
| `RiskFlag` | `<<Model>>` | `+findOpenPsychometricFlags(clientId)` |
| `PsychometricTestGenerationService` | `<<Service>>` | `+extractPdfContent(pdfFile)` |
| `PsychometricTestGenerationService` | `<<Service>>` | `+generateTestStructure(testTitle, pdfContent)` |
| `PsychometricTestGenerationService` | `<<Service>>` | `+returnGeneratedTest(generatedTest)` |


