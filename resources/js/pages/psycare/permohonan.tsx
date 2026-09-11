import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Layout } from '@/components/psycare';
import { usePsycareLanguage } from '@/lib/psycare-language';

type SessionType = 'physical' | 'online';

type SlotOption = {
    id: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    label: string;
    counsellorId: string | null;
    counsellorName: string;
    locationId: string | null;
    locationName: string;
    sessionTypes: SessionType[];
    remainingCapacity: number;
};

type FollowUpEligibleAppointment = {
    id: string;
    referenceNo: string;
    date: string | null;
    slotLabel: string;
    counselorName: string;
    sessionType: SessionType;
    status: string;
};

type PageProps = {
    availableSlots: SlotOption[];
    locations: Array<{ id: string; name: string }>;
    client: { fullName: string; matrixOrWorkerNo: string; faculty: string; clientType: string | null } | null;
    followUpEligibleAppointments: FollowUpEligibleAppointment[];
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

type RequestMode = 'new' | 'followup' | null;

type CalendarDay = {
    date: Date;
    isoDate: string;
    isCurrentMonth: boolean;
    slots: SlotOption[];
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

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getMonthName = (date: Date, language: 'ms' | 'en') =>
    date.toLocaleDateString(language === 'en' ? 'en-GB' : 'ms-MY', { month: 'long', year: 'numeric' });

const getWeekdayHeaders = (language: 'ms' | 'en') =>
    language === 'en'
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

export default function PsyCarePermohonanPage({
    availableSlots,
    locations,
    client,
    followUpEligibleAppointments,
}: PageProps) {
    const language = usePsycareLanguage();
    const { url, props } = usePage<PageProps>();
    const hasAppointmentRecords = followUpEligibleAppointments.length > 0;

    const followUpContext = useMemo(() => {
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        const searchParams = new URLSearchParams(queryString);
        const mode = searchParams.get('mode');
        const previousId = searchParams.get('previous');
        const matched = followUpEligibleAppointments.find((appointment) => appointment.id === previousId);

        return {
            isFollowUp: mode === 'followup' && Boolean(matched),
            previous: matched ?? null,
        };
    }, [url, followUpEligibleAppointments]);

    const defaultAppointmentDate = availableSlots[0]?.slotDate ?? toIsoDate(new Date());
    const [requestMode, setRequestMode] = useState<RequestMode>(followUpContext.isFollowUp ? 'followup' : null);
    const [appointmentDate, setAppointmentDate] = useState(defaultAppointmentDate);
    const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date(`${defaultAppointmentDate}T00:00:00`)));
    const [sessionType, setSessionType] = useState<SessionType>('physical');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [sessionNeed, setSessionNeed] = useState('');
    const [locationId, setLocationId] = useState(locations[0]?.id ?? '');
    const [hasAttendedBefore, setHasAttendedBefore] = useState(followUpContext.isFollowUp ? 'YA' : 'TIDAK');
    const [issueSummary, setIssueSummary] = useState('');
    const [attachmentDescription, setAttachmentDescription] = useState('');
    const [attachmentFileName, setAttachmentFileName] = useState('');
    const [applicantNote, setApplicantNote] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const copy = language === 'en'
        ? {
              pageTitle: 'Smart Appointment Form',
              pageSubtitle: 'Counselling Session Request',
              pageDescription:
                  'Appointment slots are configured by the admin panel. Choose physical or online session based on available slots.',
              chooseModeTitle: 'Choose Booking Type',
              chooseModeDescription:
                  'Before filling in the form, choose whether you want to create a new booking or continue a follow-up.',
              chooseNew: 'Create New Booking',
              chooseFollowup: 'Continue Follow Up',
              noRecordsFollowup: 'Follow-up is unavailable because there are no eligible appointment records yet.',
              applicantInfo: 'Applicant Information',
              requestInfo: 'Request Information',
              attachment: 'Attachment',
              confirmation: 'Confirmation',
              matricNo: 'Matric / Worker No',
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
              slot: 'Slot',
              time: 'Time',
              calendar: 'Appointment Calendar',
              selectedSession: 'Selected Session',
              selectedFromCalendar: 'Session selected from calendar',
              today: 'today',
              available: 'Available',
              unavailable: 'Unavailable',
              chooseSlot: '-- Please choose --',
              issueSummary: 'Issue Summary',
              onlineHint: 'Online session selected. After submit, the system will auto-generate a meeting link for slot',
              attachmentDesc: 'Attachment Description',
              attachmentFile: 'Attachment File',
              selectedFile: 'Selected file',
              attachmentNote: 'File upload is not stored yet in this phase — description only is saved.',
              back: 'Back',
              save: 'Save',
              submit: 'Submit',
              applicantConfirmation: 'Applicant Confirmation',
              note: 'Note',
              bookingSummary: 'Booking Summary',
              noSlots: 'No available slots',
              issuePlaceholder: 'Briefly explain your appointment purpose',
              online: 'Online',
              physical: 'Physical',
              saveDraftMessage: 'Draft saving is not available yet — please Submit when ready.',
              submitNoSlot: 'No slot is available for this selection. Please choose another date or session type.',
              newAppointment: 'NEW',
              followup: 'FOLLOW-UP',
              followupHint: 'Follow-up mode selected. You are continuing appointment reference:',
              followupLockHint: 'A new reference number is generated on submit, linked to the previous appointment above.',
              autoRefHint: 'Reference number is auto-generated by the system when you submit.',
              followupUnavailable: 'This appointment record can no longer be used for follow-up.',
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
              chooseModeTitle: 'Pilih Jenis Tempahan',
              chooseModeDescription:
                  'Sebelum mengisi borang, pilih sama ada anda mahu cipta tempahan baharu atau sambung susulan.',
              chooseNew: 'Cipta Tempahan Baharu',
              chooseFollowup: 'Teruskan Susulan',
              noRecordsFollowup: 'Pilihan susulan tidak tersedia kerana tiada rekod temujanji yang layak.',
              applicantInfo: 'Maklumat Pemohon',
              requestInfo: 'Maklumat Permohonan',
              attachment: 'Lampiran',
              confirmation: 'Pengesahan',
              matricNo: 'No Matrik / Pekerja',
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
              slot: 'Slot',
              time: 'Masa',
              calendar: 'Kalendar Temujanji',
              selectedSession: 'Pilihan Sesi',
              selectedFromCalendar: 'Sesi yang dipilih dari kalendar',
              today: 'hari ini',
              available: 'Tersedia',
              unavailable: 'Penuh',
              chooseSlot: '-- Sila Pilih --',
              issueSummary: 'Ringkasan Isu',
              onlineHint: 'Sesi online dipilih. Selepas hantar, sistem akan menjana pautan mesyuarat automatik untuk slot',
              attachmentDesc: 'Deskripsi Lampiran',
              attachmentFile: 'Lampiran',
              selectedFile: 'Fail dipilih',
              attachmentNote: 'Muat naik fail belum disimpan pada fasa ini — hanya deskripsi disimpan.',
              back: 'Kembali',
              save: 'Simpan',
              submit: 'Hantar',
              applicantConfirmation: 'Pengesahan Pemohon',
              note: 'Catatan',
              bookingSummary: 'Ringkasan Tempahan',
              noSlots: 'Tiada slot tersedia',
              issuePlaceholder: 'Terangkan ringkas tujuan temujanji anda',
              online: 'Online',
              physical: 'Fizikal',
              saveDraftMessage: 'Penyimpanan draf belum tersedia — sila Hantar apabila sedia.',
              submitNoSlot: 'Tiada slot tersedia untuk pilihan ini. Sila pilih tarikh atau jenis sesi lain.',
              newAppointment: 'BARU',
              followup: 'SUSULAN',
              followupHint: 'Mod susulan dipilih. Anda sedang meneruskan temujanji rujukan:',
              followupLockHint: 'No rujukan baharu dijana semasa hantar, dikaitkan dengan temujanji terdahulu di atas.',
              autoRefHint: 'No rujukan dijana secara automatik oleh sistem semasa anda menghantar.',
              followupUnavailable: 'Rekod temujanji ini tidak lagi boleh digunakan untuk susulan.',
              no: 'TIDAK',
              yes: 'YA',
              physicalOption: 'Fizikal (di pusat kaunseling)',
              onlineOption: 'Online (mesyuarat maya)',
          };

    const slotsForSelectedDate = useMemo(
        () =>
            availableSlots.filter(
                (slot) => slot.slotDate === appointmentDate && slot.sessionTypes.includes(sessionType),
            ),
        [availableSlots, appointmentDate, sessionType],
    );

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
                slots: availableSlots.filter((slot) => slot.slotDate === isoDate && slot.sessionTypes.includes(sessionType)),
            };
        });
    }, [calendarMonth, sessionType, availableSlots]);

    const selectedSlot = useMemo(
        () => slotsForSelectedDate.find((slot) => slot.id === selectedSlotId),
        [selectedSlotId, slotsForSelectedDate],
    );

    const monthLabel = useMemo(() => getMonthName(calendarMonth, language), [calendarMonth, language]);
    const weekdayHeaders = useMemo(() => getWeekdayHeaders(language), [language]);

    const handleChooseNewRequest = () => {
        setRequestMode('new');
    };

    const handleChooseFollowUpRequest = () => {
        if (!hasAppointmentRecords) return;
        router.visit('/psycare/rekod-temujanji');
    };

    const handleSaveDraft = () => {
        setFormErrors({ _draft: copy.saveDraftMessage });
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormErrors({});

        if (!selectedSlot) {
            setFormErrors({ slot_id: copy.submitNoSlot });
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/psycare/permohonan',
            {
                appointment_type: requestMode === 'followup' ? 'follow_up' : 'new',
                previous_appointment_id: requestMode === 'followup' ? followUpContext.previous?.id ?? null : null,
                session_type: sessionType,
                slot_id: selectedSlot.id,
                location_id: locationId || selectedSlot.locationId,
                appointment_need: sessionNeed,
                issue_summary: issueSummary,
                attachment_description: attachmentDescription,
                applicant_note: applicantNote,
                attended_before: hasAttendedBefore === 'YA',
            },
            {
                preserveScroll: true,
                onError: (errors) => setFormErrors(errors as Record<string, string>),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const renderSectionTitle = (title: string) => (
        <div className="mb-4 bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800">{title}</div>
    );

    const renderSummaryCard = (title: string, content: ReactNode) => (
        <section className="rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="rounded-t-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white">{title}</div>
            <div className="space-y-3 p-4 text-sm text-gray-700">{content}</div>
        </section>
    );

    return (
        <>
            <Head title="Permohonan" />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">{copy.pageTitle}</p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">{copy.pageSubtitle}</h2>
                    <p className="mt-1 text-sm text-gray-600">{copy.pageDescription}</p>

                    {props.flash?.success && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {props.flash.success}
                        </div>
                    )}
                    {props.flash?.error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {props.flash.error}
                        </div>
                    )}

                    {!requestMode && (
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

                    {requestMode === 'followup' && !followUpContext.previous && (
                        <p className="mt-3 text-sm text-yellow-700">{copy.followupUnavailable}</p>
                    )}

                    {requestMode && (
                        <form onSubmit={handleSubmit} className="mt-5">
                            {renderSectionTitle(copy.applicantInfo)}

                            <div className="grid gap-4 md:grid-cols-4">
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.matricNo}</span>
                                    <input
                                        value={client?.matrixOrWorkerNo ?? '-'}
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                    />
                                </label>
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.name}</span>
                                    <input
                                        value={client?.fullName ?? '-'}
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                    />
                                </label>
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.clientType}</span>
                                    <input
                                        value={client?.clientType ?? '-'}
                                        readOnly
                                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                                    />
                                </label>
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.faculty}</span>
                                    <input
                                        value={client?.faculty ?? '-'}
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
                                        value={requestMode === 'followup' && followUpContext.previous ? followUpContext.previous.referenceNo : ''}
                                        placeholder="(auto-generated on submit)"
                                        readOnly
                                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {requestMode === 'followup' ? copy.followupLockHint : copy.autoRefHint}
                                    </p>
                                </label>
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.appointmentType}</span>
                                    <input
                                        value={requestMode === 'followup' ? copy.followup : copy.newAppointment}
                                        readOnly
                                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 shadow-sm"
                                    />
                                </label>

                                {requestMode === 'followup' && followUpContext.previous && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 md:col-span-4">
                                        {copy.followupHint}{' '}
                                        <span className="font-semibold">{followUpContext.previous.referenceNo}</span>
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
                                        value={locationId}
                                        onChange={(event) => setLocationId(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.attendedBefore}</span>
                                    <select
                                        value={hasAttendedBefore}
                                        onChange={(event) => setHasAttendedBefore(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="TIDAK">{copy.no}</option>
                                        <option value="YA">{copy.yes}</option>
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.sessionKind}</span>
                                    <select
                                        value={sessionType}
                                        onChange={(event) => {
                                            setSessionType(event.target.value as SessionType);
                                            setSelectedSlotId('');
                                        }}
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
                                                    onClick={() => setCalendarMonth(startOfMonth(new Date()))}
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
                                                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
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
                                                                <button
                                                                    key={slot.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!day.isCurrentMonth) return;
                                                                        setAppointmentDate(day.isoDate);
                                                                        setSelectedSlotId(slot.id);
                                                                    }}
                                                                    disabled={!day.isCurrentMonth}
                                                                    className={`block w-full truncate rounded bg-teal-600 px-1 py-0.5 text-left text-[11px] font-semibold text-white hover:bg-teal-700 ${
                                                                        !day.isCurrentMonth ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                                                    }`}
                                                                >
                                                                    {slot.label.replace(' - ', '–')}
                                                                </button>
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
                                                                    {slot.label} • {slot.counsellorName}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                                {formErrors.slot_id && (
                                                    <p className="text-xs text-red-600">{formErrors.slot_id}</p>
                                                )}
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
                                    {copy.onlineHint} <span className="font-semibold">{selectedSlot.label}</span>.
                                </div>
                            )}

                            <div className="mt-6">{renderSectionTitle(copy.attachment)}</div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.attachmentDesc}</span>
                                    <input
                                        value={attachmentDescription}
                                        onChange={(event) => setAttachmentDescription(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>
                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">{copy.attachmentFile}</span>
                                    <input
                                        type="file"
                                        onChange={(event) => setAttachmentFileName(event.target.files?.[0]?.name ?? '')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                    <p className="text-xs text-gray-500">{copy.attachmentNote}</p>
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
                                    disabled={isSubmitting || slotsForSelectedDate.length === 0}
                                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:opacity-60"
                                >
                                    {isSubmitting ? '…' : copy.submit}
                                </button>
                            </div>

                            {formErrors._draft && <p className="mt-3 text-sm text-green-700">{formErrors._draft}</p>}

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
                                        <p>{copy.name}: {client?.fullName ?? '-'}</p>
                                    </>,
                                )}
                            </div>
                        </form>
                    )}
                </section>
            </Layout>
        </>
    );
}
