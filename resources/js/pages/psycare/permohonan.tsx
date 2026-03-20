import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/psycare';
import { pastAppointments } from '@/lib/psycare-appointment-records';
import {
    createReferenceNumber,
    requestFormMockSeed,
    requestFormMockUnavailableSlotIdsByDate,
} from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';
import {
    ADMIN_SLOT_STORAGE_KEY,
    ADMIN_SLOT_UPDATED_EVENT,
    getAdminManagedSchedule,
    type AdminScheduleDay,
    type SessionType,
} from '@/lib/psycare-admin-slots';

type BookingSummary = {
    referenceNo: string;
    date: string;
    slotLabel: string;
    counselorName: string;
    sessionType: SessionType;
    submittedAt: string;
    meetingLink?: string;
};

type RequestMode = 'new' | 'followup' | null;

type CalendarSlot = {
    id: string;
    label: string;
    counselorName: string;
    allowedSessionTypes: SessionType[];
    isAvailable: boolean;
};

type CalendarDay = {
    date: Date;
    isoDate: string;
    isCurrentMonth: boolean;
    slots: CalendarSlot[];
};

const formatDateLabel = (dateValue: string, language: 'ms' | 'en') => {
    const dateObject = new Date(`${dateValue}T00:00:00`);

    return dateObject.toLocaleDateString(language === 'en' ? 'en-GB' : 'ms-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const toIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthName = (date: Date, language: 'ms' | 'en') =>
    date.toLocaleDateString(language === 'en' ? 'en-GB' : 'ms-MY', {
        month: 'long',
        year: 'numeric',
    });

const getWeekdayHeaders = (language: 'ms' | 'en') =>
    language === 'en'
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

export default function PsyCarePermohonanPage() {
    const language = usePsycareLanguage();
    const { url } = usePage();
    const hasAppointmentRecords = pastAppointments.length > 0;
    const [adminSchedule, setAdminSchedule] = useState<AdminScheduleDay[]>(() =>
        getAdminManagedSchedule(),
    );
    const defaultAppointmentDate = getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date());
    const [studentNo] = useState(requestFormMockSeed.studentNo);
    const [studentName] = useState(requestFormMockSeed.studentName);
    const [faculty] = useState(requestFormMockSeed.faculty);
    const [clientType, setClientType] = useState(requestFormMockSeed.clientType);
    const [sessionReferenceNo, setSessionReferenceNo] = useState(
        createReferenceNumber(),
    );
    const [appointmentType, setAppointmentType] = useState('BARU');
    const [requestMode, setRequestMode] = useState<RequestMode>(null);
    const [appointmentDate, setAppointmentDate] = useState(defaultAppointmentDate);
    const [calendarMonth, setCalendarMonth] = useState(() =>
        startOfMonth(new Date(`${defaultAppointmentDate}T00:00:00`)),
    );
    const [sessionType, setSessionType] = useState<SessionType>('physical');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [sessionNeed, setSessionNeed] = useState(requestFormMockSeed.sessionNeed);
    const [location, setLocation] = useState(requestFormMockSeed.location);
    const [hasAttendedBefore, setHasAttendedBefore] = useState(requestFormMockSeed.attendedBefore);
    const [adminReviewStatus, setAdminReviewStatus] = useState('Draf disimpan');
    const [issueSummary, setIssueSummary] = useState(
        requestFormMockSeed.issueSummary,
    );
    const [attachmentDescription, setAttachmentDescription] = useState(
        requestFormMockSeed.attachmentDescription,
    );
    const [attachmentFileName, setAttachmentFileName] = useState('');
    const [applicantNote, setApplicantNote] = useState(requestFormMockSeed.applicantNote);
    const [submitMessage, setSubmitMessage] = useState('');
    const [draftMessage, setDraftMessage] = useState('');
    const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(
        null,
    );

    const followUpContext = useMemo(() => {
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        const searchParams = new URLSearchParams(queryString);
        const mode = searchParams.get('mode');
        const reference = searchParams.get('reference');

        return {
            isFollowUp: mode === 'followup' && Boolean(reference),
            reference: reference ?? '',
        };
    }, [url]);

    const copy = language === 'en'
        ? {
              pageTitle: 'Smart Appointment Form',
              pageSubtitle: 'Counselling Session Request',
              pageDescription:
                  'Appointment slots are configured by admin panel. Choose physical or online session based on available slots.',
              pageSource: 'Slot source: Admin panel configuration (mocked).',
              chooseModeTitle: 'Choose Booking Type',
              chooseModeDescription:
                  'Before filling in the form, choose whether you want to create a new booking or continue a follow-up.',
              chooseNew: 'Create New Booking',
              chooseFollowup: 'Continue Follow Up',
              noRecordsFollowup:
                  'Follow-up is unavailable because there are no appointment records yet.',
              applicantInfo: 'Applicant Information',
              requestInfo: 'Request Information',
              attachment: 'Attachment',
              confirmation: 'Confirmation',
              matricNo: 'Matric No',
              name: 'Name',
              clientType: 'Client Type',
              faculty: 'Faculty / PTJ',
              sessionRef: 'Session Reference No',
              appointmentType: 'Appointment Type',
              appointmentNeed: 'Appointment Need',
              location: 'Location',
              attendedBefore: 'Attended Before?',
              sessionKind: 'Session Type',
              date: 'Date',
              slot: 'Slot (admin-defined)',
              time: 'Time',
              calendar: 'Appointment Calendar',
              selectedSession: 'Selected Session',
              selectedFromCalendar: 'Session selected from calendar',
              today: 'today',
              available: 'Available',
              unavailable: 'Unavailable',
              chooseSlot: '-- Please choose --',
              issueSummary: 'Issue Summary',
              onlineHint:
                  'Online session selected. After submit, the system will auto-generate a meeting link for slot',
              attachmentDesc: 'Attachment Description',
              attachmentFile: 'Attachment File',
              selectedFile: 'Selected file',
              back: 'Back',
              save: 'Save',
              submit: 'Submit',
              applicantConfirmation: 'Applicant Confirmation',
              adminReview: 'Admin Review',
              psychologistApproval: 'Psychologist Officer Confirmation',
              note: 'Note',
              status: 'Status',
              submitDate: 'Submission Date',
              bookingSummary: 'Booking Summary (Demo)',
              refNo: 'Reference No',
              counselor: 'Counselor',
              meetingLink: 'Meeting Link',
              noSlots: 'No available slots',
              noTime: 'No available time',
              issuePlaceholder: 'Briefly explain your appointment purpose',
              reviewWaiting: 'Waiting for admin review.',
              inReview: 'In review',
              waitingApproval: 'Waiting for approval',
              online: 'Online',
              physical: 'Physical',
              saveDraftStatus: 'Draft saved',
              saveDraftMessage: 'Request saved as draft (mock).',
              submitNoSlot:
                  'No slot is available for this selection. Please choose another date or session type.',
              onlineSubmit:
                  'Request submitted successfully. Online session has been scheduled and meeting link generated.',
              physicalSubmit:
                  'Request submitted successfully. Your physical session slot has been scheduled based on admin panel settings.',
              student: 'STUDENT',
              staff: 'STAFF',
              alumni: 'ALUMNI',
              newAppointment: 'NEW',
              followup: 'FOLLOW-UP',
              followupHint:
                  'Follow-up mode selected. You are continuing appointment reference:',
              followupLockHint:
                  'This reference is locked based on the selected appointment record.',
              followupFieldLockHint:
                  'This field is locked because it has already been recorded in previous appointments.',
              autoRefHint:
                  'Reference number is auto-generated for new booking and cannot be edited manually.',
              no: 'NO',
              yes: 'YES',
              physicalOption: 'Physical (counselling center)',
              onlineOption: 'Online (virtual meeting)',
          }
        : {
              pageTitle: 'Borang Temujanji Pintar',
              pageSubtitle: 'Permohonan Sesi Kaunseling',
              pageDescription:
                  'Slot temujanji ditetapkan oleh panel admin. Pilih sesi fizikal atau online mengikut slot yang tersedia.',
              pageSource: 'Sumber slot: Konfigurasi panel admin (mocked).',
              chooseModeTitle: 'Pilih Jenis Tempahan',
              chooseModeDescription:
                  'Sebelum mengisi borang, pilih sama ada anda mahu cipta tempahan baharu atau sambung susulan.',
              chooseNew: 'Cipta Tempahan Baharu',
              chooseFollowup: 'Teruskan Susulan',
              noRecordsFollowup:
                  'Pilihan susulan tidak tersedia kerana belum ada rekod temujanji.',
              applicantInfo: 'Maklumat Pemohon',
              requestInfo: 'Maklumat Permohonan',
              attachment: 'Lampiran',
              confirmation: 'Pengesahan',
              matricNo: 'No Matrik',
              name: 'Nama',
              clientType: 'Jenis Klien',
              faculty: 'Fakulti / PTJ',
              sessionRef: 'No Rujukan Sesi',
              appointmentType: 'Jenis Temujanji',
              appointmentNeed: 'Keperluan Temujanji',
              location: 'Lokasi',
              attendedBefore: 'Pernah Hadir?',
              sessionKind: 'Jenis Sesi',
              date: 'Tarikh',
              slot: 'Slot (ditentukan admin)',
              time: 'Masa',
              calendar: 'Kalendar Temujanji',
              selectedSession: 'Pilihan Sesi',
              selectedFromCalendar: 'Sesi yang dipilih dari kalendar',
              today: 'hari ini',
              available: 'Tersedia',
              unavailable: 'Penuh',
              chooseSlot: '-- Sila Pilih --',
              issueSummary: 'Ringkasan Isu',
              onlineHint:
                  'Sesi online dipilih. Selepas hantar, sistem akan menjana pautan mesyuarat automatik untuk slot',
              attachmentDesc: 'Deskripsi Lampiran',
              attachmentFile: 'Lampiran',
              selectedFile: 'Fail dipilih',
              back: 'Kembali',
              save: 'Simpan',
              submit: 'Hantar',
              applicantConfirmation: 'Pengesahan Pemohon',
              adminReview: 'Semakan Admin',
              psychologistApproval: 'Pengesahan Pegawai Psikologi',
              note: 'Catatan',
              status: 'Status',
              submitDate: 'Tarikh Hantar',
              bookingSummary: 'Ringkasan Tempahan (Demo)',
              refNo: 'No Rujukan',
              counselor: 'Kaunselor',
              meetingLink: 'Pautan Mesyuarat',
              noSlots: 'Tiada slot tersedia',
              noTime: 'Tiada masa',
              issuePlaceholder: 'Terangkan ringkas tujuan temujanji anda',
              reviewWaiting: 'Menunggu semakan admin.',
              inReview: 'Dalam semakan',
              waitingApproval: 'Menunggu pengesahan',
              online: 'Online',
              physical: 'Fizikal',
              saveDraftStatus: 'Draf disimpan',
              saveDraftMessage: 'Permohonan disimpan sebagai draf (mock).',
              submitNoSlot:
                  'Tiada slot tersedia untuk pilihan ini. Sila pilih tarikh atau jenis sesi lain.',
              onlineSubmit:
                  'Permohonan berjaya. Sistem telah menjadualkan sesi online dan pautan mesyuarat dijana.',
              physicalSubmit:
                  'Permohonan berjaya. Slot sesi fizikal anda telah dijadualkan berdasarkan tetapan panel admin.',
              student: 'PELAJAR',
              staff: 'STAF',
              alumni: 'ALUMNI',
              newAppointment: 'BARU',
              followup: 'SUSULAN',
              followupHint:
                  'Mod susulan dipilih. Anda sedang meneruskan temujanji rujukan:',
              followupLockHint:
                  'No rujukan ini dikunci berdasarkan rekod temujanji yang dipilih.',
              followupFieldLockHint:
                  'Medan ini dikunci kerana telah direkod dalam temujanji terdahulu.',
              autoRefHint:
                  'No rujukan dijana automatik untuk tempahan baharu dan tidak boleh diubah secara manual.',
              no: 'TIDAK',
              yes: 'YA',
              physicalOption: 'Fizikal (di pusat kaunseling)',
              onlineOption: 'Online (mesyuarat maya)',
          };

    const getSlotsForDate = (isoDate: string): CalendarSlot[] => {
        const parsedDate = new Date(`${isoDate}T00:00:00`);

        if (parsedDate.getDay() === 0 || parsedDate.getDay() === 6) {
            return [];
        }

        const configuredDay = adminSchedule.find((day) => day.date === isoDate);

        if (!configuredDay) {
            return [];
        }

        const unavailableSlotIds = requestFormMockUnavailableSlotIdsByDate[isoDate] ?? [];

        return configuredDay.slots
            .filter((slot) => slot.allowedSessionTypes.includes(sessionType))
            .map((slot) => ({
                id: slot.id,
                label: slot.label,
                counselorName: slot.counselorName,
                allowedSessionTypes: slot.allowedSessionTypes,
                isAvailable: !unavailableSlotIds.includes(slot.id),
            }));
    };

    const calendarDays = useMemo<CalendarDay[]>(() => {
        const monthStartDate = startOfMonth(calendarMonth);
        const firstWeekday = monthStartDate.getDay();
        const firstGridDate = new Date(monthStartDate);
        firstGridDate.setDate(monthStartDate.getDate() - firstWeekday);

        return Array.from({ length: 42 }, (_, index) => {
            const currentDate = new Date(firstGridDate);
            currentDate.setDate(firstGridDate.getDate() + index);
            const isoDate = toIsoDate(currentDate);

            return {
                date: currentDate,
                isoDate,
                isCurrentMonth: currentDate.getMonth() === calendarMonth.getMonth(),
                slots: getSlotsForDate(isoDate),
            };
        });
    }, [calendarMonth, sessionType]);

    const selectedCalendarDay = useMemo(() => {
        return calendarDays.find((day) => day.isoDate === appointmentDate);
    }, [appointmentDate, calendarDays]);

    const slotsForSelectedDate = useMemo(() => {
        if (!selectedCalendarDay) {
            return [];
        }

        return selectedCalendarDay.slots.filter((slot) => slot.isAvailable);
    }, [selectedCalendarDay]);

    useEffect(() => {
        const reloadAdminSchedule = () => {
            setAdminSchedule(getAdminManagedSchedule());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === ADMIN_SLOT_STORAGE_KEY) {
                reloadAdminSchedule();
            }
        };

        window.addEventListener(ADMIN_SLOT_UPDATED_EVENT, reloadAdminSchedule);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(ADMIN_SLOT_UPDATED_EVENT, reloadAdminSchedule);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    useEffect(() => {
        if (adminSchedule.length === 0) {
            return;
        }

        const hasSelectedDate = adminSchedule.some((day) => day.date === appointmentDate);

        if (!hasSelectedDate) {
            const nextDate = adminSchedule[0].date;
            setAppointmentDate(nextDate);
            setCalendarMonth(startOfMonth(new Date(`${nextDate}T00:00:00`)));
        }
    }, [adminSchedule, appointmentDate]);

    useEffect(() => {
        if (slotsForSelectedDate.length === 0) {
            setSelectedSlotId('');
            return;
        }

        const selectedSlotStillValid = slotsForSelectedDate.some(
            (slot) => slot.id === selectedSlotId,
        );

        if (!selectedSlotStillValid) {
            setSelectedSlotId(slotsForSelectedDate[0].id);
        }
    }, [selectedSlotId, slotsForSelectedDate]);

    useEffect(() => {
        if (!followUpContext.isFollowUp) {
            return;
        }

        setRequestMode('followup');
        setAppointmentType('SUSULAN');
        setHasAttendedBefore('YA');
        if (followUpContext.reference) {
            setSessionReferenceNo(followUpContext.reference);
        }
    }, [followUpContext.isFollowUp, followUpContext.reference]);

    const handleChooseNewRequest = () => {
        setRequestMode('new');
        setAppointmentType('BARU');
        setSessionReferenceNo(createReferenceNumber());
        setHasAttendedBefore('TIDAK');
    };

    const handleChooseFollowUpRequest = () => {
        if (!hasAppointmentRecords) {
            return;
        }

        router.visit('/psycare/rekod-temujanji');
    };

    const selectedSlot = useMemo(() => {
        return slotsForSelectedDate.find((slot) => slot.id === selectedSlotId);
    }, [selectedSlotId, slotsForSelectedDate]);

    const monthLabel = useMemo(
        () => getMonthName(calendarMonth, language),
        [calendarMonth, language],
    );

    const weekdayHeaders = useMemo(() => getWeekdayHeaders(language), [language]);

    const handleSaveDraft = () => {
        setAdminReviewStatus(copy.saveDraftStatus);
        setDraftMessage(copy.saveDraftMessage);
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDraftMessage('');

        if (!selectedSlot) {
            setSubmitMessage(
                copy.submitNoSlot,
            );
            setBookingSummary(null);
            return;
        }

        if (sessionType === 'online') {
            const meetingId = `PC-${appointmentDate.replaceAll('-', '')}-${selectedSlot.id}`;
            const meetingLink = `https://meet.psycareutm.edu/mock/${meetingId.toLowerCase()}`;

            setBookingSummary({
                referenceNo: sessionReferenceNo,
                date: appointmentDate,
                slotLabel: selectedSlot.label,
                counselorName: selectedSlot.counselorName,
                sessionType,
                submittedAt: new Date().toLocaleString(language === 'en' ? 'en-GB' : 'ms-MY'),
                meetingLink,
            });
            setAdminReviewStatus(copy.reviewWaiting);
            setSubmitMessage(copy.onlineSubmit);
            return;
        }

        setBookingSummary({
            referenceNo: sessionReferenceNo,
            date: appointmentDate,
            slotLabel: selectedSlot.label,
            counselorName: selectedSlot.counselorName,
            sessionType,
            submittedAt: new Date().toLocaleString(language === 'en' ? 'en-GB' : 'ms-MY'),
        });
        setAdminReviewStatus(copy.reviewWaiting);
        setSubmitMessage(copy.physicalSubmit);
    };

    const renderSectionTitle = (title: string) => (
        <div className="mb-4 bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800">
            {title}
        </div>
    );

    const renderSummaryCard = (
        title: string,
        content: ReactNode,
    ) => (
        <section className="rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="rounded-t-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white">
                {title}
            </div>
            <div className="space-y-3 p-4 text-sm text-gray-700">{content}</div>
        </section>
    );

    return (
        <>
            <Head title="Permohonan" />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        {copy.pageTitle}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">
                        {copy.pageSubtitle}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {copy.pageDescription}
                    </p>
                    <p className="mt-2 text-xs font-medium text-yellow-800">
                        {copy.pageSource}
                    </p>

                    {!requestMode && !followUpContext.isFollowUp && (
                        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
                            <h3 className="text-base font-semibold text-gray-900">{copy.chooseModeTitle}</h3>
                            <p className="mt-1 text-sm text-gray-600">{copy.chooseModeDescription}</p>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleChooseNewRequest}
                                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                                >
                                    {copy.chooseNew}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleChooseFollowUpRequest}
                                    disabled={!hasAppointmentRecords}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copy.chooseFollowup}
                                </button>
                            </div>

                            {!hasAppointmentRecords && (
                                <p className="mt-3 text-sm text-yellow-700">{copy.noRecordsFollowup}</p>
                            )}
                        </div>
                    )}

                    {(requestMode || followUpContext.isFollowUp) && (
                        <form onSubmit={handleSubmit} className="mt-5">
                        {renderSectionTitle(copy.applicantInfo)}

                        <div className="grid gap-4 md:grid-cols-4">
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.matricNo}</span>
                                <input
                                    value={studentNo}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                />
                            </label>
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.name}</span>
                                <input
                                    value={studentName}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                />
                            </label>
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.clientType}</span>
                                <select
                                    value={clientType}
                                    onChange={(event) => setClientType(event.target.value)}
                                    disabled={followUpContext.isFollowUp}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="PELAJAR">{copy.student}</option>
                                    <option value="STAF">{copy.staff}</option>
                                    <option value="ALUMNI">{copy.alumni}</option>
                                </select>
                                {followUpContext.isFollowUp && (
                                    <p className="text-xs text-gray-500">{copy.followupFieldLockHint}</p>
                                )}
                            </label>
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.faculty}</span>
                                <input
                                    value={faculty}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                />
                            </label>
                        </div>

                        <div className="mt-6">{renderSectionTitle(copy.requestInfo)}</div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.sessionRef}</span>
                                <input
                                    value={sessionReferenceNo}
                                    onChange={(event) => setSessionReferenceNo(event.target.value)}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100 read-only:cursor-not-allowed read-only:bg-gray-100"
                                />
                                <p className="text-xs text-gray-500">
                                    {followUpContext.isFollowUp
                                        ? copy.followupLockHint
                                        : copy.autoRefHint}
                                </p>
                            </label>
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.appointmentType}</span>
                                <input
                                    value={appointmentType === 'SUSULAN' ? copy.followup : copy.newAppointment}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 shadow-sm"
                                />
                                <p className="text-xs text-gray-500">{copy.followupFieldLockHint}</p>
                            </label>

                            {followUpContext.isFollowUp && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 md:col-span-4">
                                    {copy.followupHint}{' '}
                                    <span className="font-semibold">
                                        {followUpContext.reference}
                                    </span>
                                </div>
                            )}

                            <label className="space-y-1 text-sm md:col-span-4">
                                <span className="font-medium text-gray-700">{copy.appointmentNeed}</span>
                                <input
                                    value={sessionNeed}
                                    onChange={(event) => setSessionNeed(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.location}</span>
                                <select
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="PUSAT KAUNSELING (JB)">PUSAT KAUNSELING (JB)</option>
                                    <option value="PUSAT KAUNSELING (KL)">PUSAT KAUNSELING (KL)</option>
                                </select>
                            </label>

                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.attendedBefore}</span>
                                <select
                                    value={hasAttendedBefore}
                                    onChange={(event) => setHasAttendedBefore(event.target.value)}
                                    disabled={followUpContext.isFollowUp}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="TIDAK">{copy.no}</option>
                                    <option value="YA">{copy.yes}</option>
                                </select>
                                {followUpContext.isFollowUp && (
                                    <p className="text-xs text-gray-500">{copy.followupFieldLockHint}</p>
                                )}
                            </label>

                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.sessionKind}</span>
                                <select
                                    value={sessionType}
                                    onChange={(event) =>
                                        setSessionType(event.target.value as SessionType)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="physical">{copy.physicalOption}</option>
                                    <option value="online">{copy.onlineOption}</option>
                                </select>
                            </label>

                            <div className="md:col-span-4">
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-gray-800">{copy.calendar}</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCalendarMonth((previous) => addMonths(previous, -1))}
                                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCalendarMonth(startOfMonth(new Date()))
                                                }
                                                className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                            >
                                                {copy.today}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCalendarMonth((previous) => addMonths(previous, 1))}
                                                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="mt-3 text-center text-2xl font-semibold text-slate-700">{monthLabel}</h3>

                                    <div className="mt-3 grid grid-cols-7 border border-gray-200">
                                        {weekdayHeaders.map((weekday) => (
                                            <div
                                                key={weekday}
                                                className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2 text-center text-sm font-semibold text-gray-700 last:border-r-0"
                                            >
                                                {weekday}
                                            </div>
                                        ))}

                                        {calendarDays.map((day) => {
                                            const isSelectedDay = appointmentDate === day.isoDate;

                                            return (
                                                <div
                                                    key={day.isoDate}
                                                    className={`min-h-28 border-r border-b border-gray-200 px-2 py-1 last:border-r-0 ${
                                                        day.isCurrentMonth
                                                            ? 'bg-white'
                                                            : 'bg-gray-50 text-gray-400'
                                                    } ${isSelectedDay ? 'ring-2 ring-red-200 ring-inset' : ''}`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAppointmentDate(day.isoDate);
                                                            setSelectedSlotId('');
                                                        }}
                                                        className="text-sm font-semibold"
                                                        disabled={!day.isCurrentMonth}
                                                    >
                                                        {day.date.getDate()}
                                                    </button>

                                                    <div className="mt-1 space-y-1">
                                                        {day.slots.slice(0, 3).map((slot) => (
                                                            slot.isAvailable ? (
                                                                <button
                                                                    key={slot.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!day.isCurrentMonth) {
                                                                            return;
                                                                        }

                                                                        setAppointmentDate(day.isoDate);
                                                                        setSelectedSlotId(slot.id);
                                                                    }}
                                                                    disabled={!day.isCurrentMonth}
                                                                    className={`block w-full truncate rounded bg-teal-600 px-1 py-0.5 text-left text-[11px] font-semibold text-white hover:bg-teal-700 ${
                                                                        !day.isCurrentMonth
                                                                            ? 'cursor-not-allowed opacity-80'
                                                                            : 'cursor-pointer'
                                                                    }`}
                                                                >
                                                                    {slot.label.replace(' - ', '–')}
                                                                </button>
                                                            ) : (
                                                                <div
                                                                    key={slot.id}
                                                                    className="block w-full cursor-not-allowed truncate rounded bg-red-600 px-1 py-0.5 text-left text-[11px] font-semibold text-white opacity-80"
                                                                >
                                                                    {slot.label.replace(' - ', '–')}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="h-3 w-3 rounded bg-teal-600" />
                                            {copy.available}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <span className="h-3 w-3 rounded bg-red-600" />
                                            {copy.unavailable}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h4 className="text-sm font-semibold text-gray-800">{copy.selectedSession}</h4>
                                    <p className="mt-1 text-sm text-gray-600">{copy.selectedFromCalendar}</p>

                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">{copy.date}</p>
                                            <p className="mt-1 text-sm text-gray-800">{formatDateLabel(appointmentDate, language)}</p>
                                        </div>

                                        <label className="space-y-1 text-sm md:col-span-2">
                                            <span className="font-medium text-gray-700">{copy.slot}</span>
                                            <select
                                                value={selectedSlotId}
                                                onChange={(event) => setSelectedSlotId(event.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                                disabled={slotsForSelectedDate.length === 0}
                                            >
                                                {slotsForSelectedDate.length === 0 ? (
                                                    <option value="">{copy.noSlots}</option>
                                                ) : (
                                                    <>
                                                        <option value="">{copy.chooseSlot}</option>
                                                        {slotsForSelectedDate.map((slot) => (
                                                            <option key={slot.id} value={slot.id}>
                                                                {slot.label} • {slot.counselorName}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <label className="space-y-1 text-sm md:col-span-4">
                                <span className="font-medium text-gray-700">{copy.issueSummary}</span>
                                <textarea
                                    rows={4}
                                    value={issueSummary}
                                    onChange={(event) => setIssueSummary(event.target.value)}
                                    placeholder={copy.issuePlaceholder}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>
                        </div>

                        {sessionType === 'online' && selectedSlot && (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                {copy.onlineHint}
                                {' '}
                                <span className="font-semibold">{selectedSlot.label}</span>.
                            </div>
                        )}

                        <div className="mt-6">{renderSectionTitle(copy.attachment)}</div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.attachmentDesc}</span>
                                <input
                                    value={attachmentDescription}
                                    onChange={(event) =>
                                        setAttachmentDescription(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>
                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">{copy.attachmentFile}</span>
                                <input
                                    type="file"
                                    onChange={(event) => {
                                        const selectedFile = event.target.files?.[0];
                                        setAttachmentFileName(selectedFile?.name ?? '');
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </label>
                            {attachmentFileName && (
                                <p className="text-sm text-gray-600 md:col-span-2">
                                    {copy.selectedFile}: {attachmentFileName}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200"
                            >
                                {copy.back}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                            >
                                {copy.save}
                            </button>
                            <button
                                type="submit"
                                disabled={slotsForSelectedDate.length === 0}
                                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                            >
                                {copy.submit}
                            </button>
                        </div>

                        {draftMessage && (
                            <p className="mt-3 text-sm text-green-700">{draftMessage}</p>
                        )}

                        {submitMessage && (
                            <p className="mt-2 text-sm text-green-700">{submitMessage}</p>
                        )}

                        <div className="mt-6">{renderSectionTitle(copy.confirmation)}</div>

                        <div className="space-y-5">
                            {renderSummaryCard(
                                copy.applicantConfirmation,
                                <>
                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">{copy.note}</span>
                                        <textarea
                                            rows={3}
                                            value={applicantNote}
                                            onChange={(event) => setApplicantNote(event.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>
                                    <p>{copy.name}: {studentName}</p>
                                    <p>{copy.status}: {adminReviewStatus}</p>
                                    <p>
                                        {copy.submitDate}:{' '}
                                        {bookingSummary?.submittedAt ?? '-'}
                                    </p>
                                </>,
                            )}

                            {renderSummaryCard(
                                copy.adminReview,
                                <>
                                    <p>{copy.note}: {copy.reviewWaiting}</p>
                                    <p>{copy.name}: -</p>
                                    <p>{copy.status}: {copy.inReview}</p>
                                    <p>{copy.submitDate}: -</p>
                                </>,
                            )}

                            {renderSummaryCard(
                                copy.psychologistApproval,
                                <>
                                    <p>{copy.name}: -</p>
                                    <p>{copy.status}: {copy.waitingApproval}</p>
                                    <p>{copy.submitDate}: -</p>
                                </>,
                            )}
                        </div>

                        {bookingSummary && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900">{copy.bookingSummary}</p>
                                <p className="mt-1">{copy.refNo}: {bookingSummary.referenceNo}</p>
                                <p className="mt-1">{copy.date}: {formatDateLabel(bookingSummary.date, language)}</p>
                                <p>{copy.slot}: {bookingSummary.slotLabel}</p>
                                <p>{copy.counselor}: {bookingSummary.counselorName}</p>
                                <p>
                                    {copy.sessionKind}:{' '}
                                    {bookingSummary.sessionType === 'online'
                                        ? copy.online
                                        : copy.physical}
                                </p>
                                {bookingSummary.meetingLink && (
                                    <p>
                                        {copy.meetingLink}:{' '}
                                        <a
                                            href={bookingSummary.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium text-red-800 underline"
                                        >
                                            {bookingSummary.meetingLink}
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                    )}
                </section>
            </Layout>
        </>
    );
}
