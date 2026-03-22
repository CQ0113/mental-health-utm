import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import { adminAppointmentLocationOptions, adminCounselorOptions } from '@/lib/admin-mock-data';
import { mockClientProfiles } from '@/lib/mock-clients';
import { getAdminManagedSchedule } from '@/lib/psycare-admin-slots';
import type { AdminScheduleDay, SessionType } from '@/lib/psycare-admin-slots';
import ReportModal from './ReportModal';
import { pastAppointments } from '@/lib/psycare-appointment-records';
import {
    ATTENDANCE_UPDATED_EVENT,
    getAttendanceSessionByRef,
    getAttendanceSessions,
    upsertAttendanceSession,
} from '@/lib/psycare-attendance';
import type { AttendanceSession, AttendanceStatus } from '@/lib/psycare-attendance';

const getStatusBadgeClass = (
    status: 'open' | 'counsellor-reviewing' | 'approved' | 'on-going' | 'complete' | 'follow-up' | 'closed',
) => {
    if (status === 'open') {
        return 'bg-indigo-100 text-indigo-800';
    }

    if (status === 'counsellor-reviewing') {
        return 'bg-sky-100 text-sky-800';
    }

    if (status === 'approved') {
        return 'bg-indigo-100 text-indigo-800';
    }

    if (status === 'on-going') {
        return 'bg-purple-100 text-purple-800';
    }

    if (status === 'complete') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (status === 'follow-up') {
        return 'bg-orange-100 text-orange-800';
    }

    return 'bg-gray-200 text-gray-700';
};

type CounsellorAppointmentItem = (typeof pastAppointments)[number] & {
    counsellorContinuationNeeded: boolean | null;
    clientName: string;
    appointmentType: string;
    sessionMode: 'individual' | 'group';
    location: string;
};

type AppointmentCreateForm = {
    sessionMode: 'individual' | 'group';
    clientId: string;
    clientName: string;
    selectedGroupClientIds: string[];
    groupClientSearch: string;
    referenceNo: string;
    appointmentType: string;
    purposeNote: string;
    sessionType: SessionType;
    location: string;
    counselorName: string;
};

type SubmittedClientForm = {
    clientName: string;
    clientTypeLabel: 'PELAJAR' | 'STAF' | 'GROUP';
    matrixOrWorkerNo: string;
    faculty: string;
    appointmentNeed: string;
    attendedBefore: 'YA' | 'TIDAK';
    attachmentDescription: string;
    applicantNote: string;
    submittedAt: string;
};

const toIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth() + amount, 1);

const getContinuationBadgeClass = (continuationNeeded: boolean | null) => {
    if (continuationNeeded === true) {
        return 'bg-amber-100 text-amber-800';
    }

    if (continuationNeeded === false) {
        return 'bg-emerald-100 text-emerald-800';
    }

    return 'bg-gray-200 text-gray-700';
};

const getContinuationLabel = (continuationNeeded: boolean | null) => {
    if (continuationNeeded === true) {
        return 'Continue Follow-up';
    }

    if (continuationNeeded === false) {
        return 'No Further Session';
    }

    return 'Pending Counsellor Decision';
};

const getAttendanceBadgeClass = (status: AttendanceStatus) => {
    if (status === 'present') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (status === 'absent') {
        return 'bg-red-100 text-red-800';
    }

    if (status === 'excused') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-gray-200 text-gray-700';
};

const getAttendanceLabel = (status: AttendanceStatus) => {
    if (status === 'present') {
        return 'Present';
    }

    if (status === 'absent') {
        return 'Absent';
    }

    if (status === 'excused') {
        return 'Excused';
    }

    return 'Pending';
};

const toAttendanceMap = (appointments: CounsellorAppointmentItem[]) => {
    const existingSessions = getAttendanceSessions();

    return appointments.reduce<Record<string, AttendanceSession>>((accumulator, appointment) => {
        const existing = existingSessions.find((session) => session.appointmentRef === appointment.referenceNo);
        accumulator[appointment.referenceNo] =
            existing ?? getAttendanceSessionByRef(appointment.referenceNo, 'Assigned Client');
        return accumulator;
    }, {});
};

const generateOnlineMeetingLink = (referenceNo: string) => {
    const normalizedReference = referenceNo.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `https://meet.psycare.local/session/${normalizedReference}?token=${token}`;
};

const buildSubmittedFormByReference = (appointments: CounsellorAppointmentItem[]) =>
    appointments.reduce<Record<string, SubmittedClientForm>>((accumulator, appointment, index) => {
        const matchedClient = mockClientProfiles[index % mockClientProfiles.length];

        accumulator[appointment.referenceNo] = {
            clientName: matchedClient?.fullName ?? 'Assigned Client',
            clientTypeLabel: matchedClient?.clientType === 'staff' ? 'STAF' : 'PELAJAR',
            matrixOrWorkerNo:
                matchedClient?.clientType === 'staff'
                    ? matchedClient.workerNo ?? '-'
                    : matchedClient?.matrixNo ?? '-',
            faculty: matchedClient?.faculty ?? '-',
            appointmentNeed: 'Tekanan akademik dan pengurusan emosi',
            attendedBefore: 'TIDAK',
            attachmentDescription: 'Lampiran sokongan berkaitan isu akademik.',
            applicantNote: 'Mohon slot selepas jam 10 pagi jika boleh.',
            submittedAt: appointment.date,
        };

        return accumulator;
    }, {});

export default function CounsellorAppointmentsPage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const [adminSchedule] = useState<AdminScheduleDay[]>(() => getAdminManagedSchedule());
    const [appointments, setAppointments] = useState<CounsellorAppointmentItem[]>(() =>
        pastAppointments.map((appointment, idx) => {
            // For now, assign a mock client in round-robin
            const client = mockClientProfiles[idx % mockClientProfiles.length];
            return {
                ...appointment,
                clientName: client?.fullName ?? 'Assigned Client',
                appointmentType: 'SUSULAN', // or 'BARU', mock for now
                sessionMode: 'individual', // or 'group', mock for now
                location: appointment.sessionType === 'online' ? 'ONLINE' : 'PUSAT KAUNSELING (JB)',
                counsellorContinuationNeeded:
                    appointment.status === 'follow-up'
                        ? true
                        : appointment.status === 'closed'
                        ? false
                        : null,
            };
        }),
    );
    const [viewingAppointment, setViewingAppointment] = useState<CounsellorAppointmentItem | null>(null);
    const [viewingAttendanceRef, setViewingAttendanceRef] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingReportRef, setViewingReportRef] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'counsellor-reviewing' | 'approved' | 'on-going' | 'complete' | 'follow-up' | 'closed'
    >('all');
    const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | 'online' | 'physical'>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
    const [createForm, setCreateForm] = useState<AppointmentCreateForm>({
        sessionMode: 'individual',
        clientId: mockClientProfiles[0]?.id ?? '',
        clientName: mockClientProfiles[0]?.fullName ?? '',
        selectedGroupClientIds: [],
        groupClientSearch: '',
        referenceNo: 'PSY-NEW-00001',
        appointmentType: 'BARU',
        purposeNote: '',
        sessionType: 'physical',
        location: adminAppointmentLocationOptions[0],
        counselorName: adminCounselorOptions[0] ?? '',
    });
    const [appointmentDate, setAppointmentDate] = useState(
        getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date()),
    );
    const [calendarMonth, setCalendarMonth] = useState(() =>
        startOfMonth(new Date(`${getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date())}T00:00:00`)),
    );
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [flashMessage, setFlashMessage] = useState('');
    const [attendanceByRef, setAttendanceByRef] = useState<Record<string, AttendanceSession>>(() =>
        toAttendanceMap(
            pastAppointments.map((appointment, idx) => {
                const client = mockClientProfiles[idx % mockClientProfiles.length];
                return {
                    ...appointment,
                    clientName: client?.fullName ?? 'Assigned Client',
                    appointmentType: 'SUSULAN',
                    sessionMode: 'individual',
                    location: appointment.sessionType === 'online' ? 'ONLINE' : 'PUSAT KAUNSELING (JB)',
                    counsellorContinuationNeeded:
                        appointment.status === 'follow-up'
                            ? true
                            : appointment.status === 'closed'
                            ? false
                            : null,
                };
            }),
        ),
    );
    const [counsellorNoteByRef, setCounsellorNoteByRef] = useState<Record<string, string>>({});
    const [meetingLinkByRef, setMeetingLinkByRef] = useState<Record<string, string>>({});
    const [submittedFormByReference, setSubmittedFormByReference] = useState<
        Record<string, SubmittedClientForm>
    >(() =>
        buildSubmittedFormByReference(
            pastAppointments.map((appointment, idx) => {
                const client = mockClientProfiles[idx % mockClientProfiles.length];
                return {
                    ...appointment,
                    clientName: client?.fullName ?? 'Assigned Client',
                    appointmentType: 'SUSULAN',
                    sessionMode: 'individual',
                    location: appointment.sessionType === 'online' ? 'ONLINE' : 'PUSAT KAUNSELING (JB)',
                    counsellorContinuationNeeded:
                        appointment.status === 'follow-up'
                            ? true
                            : appointment.status === 'closed'
                            ? false
                            : null,
                };
            }),
        ),
    );

    const getSlotsForDate = useCallback((isoDate: string) => {
        const configuredDay = adminSchedule.find((day) => day.date === isoDate);

        if (!configuredDay) {
            return [];
        }

        return configuredDay.slots.filter((slot) =>
            slot.allowedSessionTypes.includes(createForm.sessionType),
        );
    }, [adminSchedule, createForm.sessionType]);

    const calendarDays = useMemo(() => {
        const monthStartDate = startOfMonth(calendarMonth);
        const firstWeekday = monthStartDate.getDay();
        const firstGridDate = new Date(monthStartDate);
        firstGridDate.setDate(monthStartDate.getDate() - firstWeekday);

        return Array.from({ length: 42 }, (_, index) => {
            const currentDate = new Date(firstGridDate);
            currentDate.setDate(firstGridDate.getDate() + index);
            const isoDate = toIsoDate(currentDate);

            return {
                isoDate,
                day: currentDate.getDate(),
                isCurrentMonth: currentDate.getMonth() === calendarMonth.getMonth(),
                slots: getSlotsForDate(isoDate),
            };
        });
    }, [calendarMonth, getSlotsForDate]);

    const slotsForSelectedDate = useMemo(
        () => getSlotsForDate(appointmentDate),
        [appointmentDate, getSlotsForDate],
    );

    const activeSelectedSlotId = useMemo(() => {
        if (slotsForSelectedDate.length === 0) {
            return '';
        }

        const isStillValid = slotsForSelectedDate.some((slot) => slot.id === selectedSlotId);
        return isStillValid ? selectedSlotId : slotsForSelectedDate[0].id;
    }, [slotsForSelectedDate, selectedSlotId]);

    const selectedSlot = useMemo(
        () => slotsForSelectedDate.find((slot) => slot.id === activeSelectedSlotId),
        [slotsForSelectedDate, activeSelectedSlotId],
    );

    const updateCreateFormField = <K extends keyof AppointmentCreateForm>(
        field: K,
        value: AppointmentCreateForm[K],
    ) => {
        setCreateForm((current) => ({ ...current, [field]: value }));
    };

    const handleClientInputChange = (inputName: string) => {
        const normalizedName = inputName.trim().toLowerCase();
        const selectedClient = mockClientProfiles.find(
            (client) => client.fullName.toLowerCase() === normalizedName,
        );

        setCreateForm((current) => ({
            ...current,
            clientName: inputName,
            clientId: selectedClient?.id ?? '',
        }));
    };

    const handleCreateSessionModeChange = (mode: 'individual' | 'group') => {
        setCreateForm((current) => ({
            ...current,
            sessionMode: mode,
            selectedGroupClientIds:
                mode === 'group'
                    ? current.selectedGroupClientIds.length > 0
                        ? current.selectedGroupClientIds
                        : current.clientId
                          ? [current.clientId]
                          : []
                    : current.selectedGroupClientIds,
        }));
    };

    const handleToggleGroupClient = (clientId: string) => {
        setCreateForm((current) => {
            const isSelected = current.selectedGroupClientIds.includes(clientId);
            const nextIds = isSelected
                ? current.selectedGroupClientIds.filter((id) => id !== clientId)
                : [...current.selectedGroupClientIds, clientId];

            return {
                ...current,
                selectedGroupClientIds: nextIds,
            };
        });
    };

    const filteredGroupClientOptions = useMemo(() => {
        const normalizedSearch = createForm.groupClientSearch.trim().toLowerCase();

        if (!normalizedSearch) {
            return mockClientProfiles;
        }

        return mockClientProfiles.filter((client) => {
            const searchableText = [client.fullName, client.matrixNo ?? '', client.workerNo ?? '']
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedSearch);
        });
    }, [createForm.groupClientSearch]);

    const handleSaveCreatedAppointment = async () => {
        if (!createForm.referenceNo.trim() || !selectedSlot) {
            setFlashMessage('Please complete reference number and select a slot.');
            return;
        }

        if (createForm.sessionMode === 'individual' && !createForm.clientName.trim()) {
            setFlashMessage('Please complete client name for individual session.');
            return;
        }

        if (createForm.sessionMode === 'group' && createForm.selectedGroupClientIds.length < 2) {
            setFlashMessage('Please select at least 2 clients for group session.');
            return;
        }

        const selectedGroupClients = mockClientProfiles.filter((client) =>
            createForm.selectedGroupClientIds.includes(client.id),
        );
        const resolvedClientName =
            createForm.sessionMode === 'group'
                ? selectedGroupClients.map((client) => client.fullName).join(', ')
                : createForm.clientName.trim();

        const approved = await confirm({
            title: 'Create Appointment',
            message: `Create ${createForm.sessionMode} appointment ${createForm.referenceNo} for ${resolvedClientName}?`,
            confirmText: 'Create',
        });

        if (!approved) {
            return;
        }

        const newAppointment: CounsellorAppointmentItem = {
            referenceNo: createForm.referenceNo.trim(),
            date: appointmentDate,
            slot: selectedSlot.label,
            counselor: createForm.counselorName,
            sessionType: createForm.sessionType,
            status: 'approved',
            counsellorContinuationNeeded: null,
            clientName: createForm.clientName,
            appointmentType: createForm.appointmentType,
            sessionMode: createForm.sessionMode,
            location: createForm.sessionType === 'online' ? 'ONLINE' : createForm.location,
        };

        setAppointments((current) => [newAppointment, ...current]);

        const draftAttendance = getAttendanceSessionByRef(
            newAppointment.referenceNo,
            resolvedClientName,
        );

        upsertAttendanceSession({
            ...draftAttendance,
            sessionMode: createForm.sessionMode,
            appointmentRef: newAppointment.referenceNo,
            participants:
                createForm.sessionMode === 'group'
                    ? selectedGroupClients.map((client, index) => ({
                          id: `p-${newAppointment.referenceNo}-${index + 1}`,
                          name: client.fullName,
                          status: 'pending' as const,
                      }))
                    : [
                          {
                              id: draftAttendance.participants[0]?.id ?? `p-${newAppointment.referenceNo}-1`,
                              name: resolvedClientName,
                              status: draftAttendance.participants[0]?.status ?? 'pending',
                          },
                      ],
            updatedAt: new Date().toISOString(),
        });

        setAttendanceByRef((current) => ({
            ...current,
            [newAppointment.referenceNo]: getAttendanceSessionByRef(
                newAppointment.referenceNo,
                resolvedClientName,
            ),
        }));

        const matchedClient = mockClientProfiles.find((client) => client.id === createForm.clientId);
        setSubmittedFormByReference((current) => ({
            ...current,
            [newAppointment.referenceNo]: {
                clientName: resolvedClientName,
                clientTypeLabel:
                    createForm.sessionMode === 'group'
                        ? 'GROUP'
                        : matchedClient?.clientType === 'staff'
                          ? 'STAF'
                          : 'PELAJAR',
                matrixOrWorkerNo:
                    createForm.sessionMode === 'group'
                        ? '-'
                        : matchedClient?.clientType === 'staff'
                          ? matchedClient.workerNo ?? '-'
                          : matchedClient?.matrixNo ?? '-',
                faculty: createForm.sessionMode === 'group' ? '-' : matchedClient?.faculty ?? '-',
                appointmentNeed:
                    createForm.purposeNote.trim() || 'Temujanji dibuat melalui kaunselor.',
                attendedBefore: 'TIDAK',
                attachmentDescription: 'Lampiran dikemaskini oleh pemohon.',
                applicantNote: 'Permohonan diterima melalui aliran kaunselor.',
                submittedAt: appointmentDate,
            },
        }));

        setIsCreateAppointmentOpen(false);
        const nextReferenceNo = `PSY-NEW-${`${appointments.length + 1}`.padStart(5, '0')}`;

        setCreateForm((current) => ({
            ...current,
            sessionMode: 'individual',
            clientId: mockClientProfiles[0]?.id ?? '',
            clientName: mockClientProfiles[0]?.fullName ?? '',
            selectedGroupClientIds: [],
            groupClientSearch: '',
            referenceNo: nextReferenceNo,
            appointmentType: 'BARU',
            purposeNote: '',
            sessionType: 'physical',
            location: adminAppointmentLocationOptions[0],
            counselorName: adminCounselorOptions[0] ?? current.counselorName,
        }));
        setFlashMessage(`Appointment ${newAppointment.referenceNo} created successfully.`);
    };

    const getAttendanceQrUrl = (appointment: CounsellorAppointmentItem) => {
        const qrPayload = [
            `reference=${appointment.referenceNo}`,
            `date=${appointment.date}`,
            `slot=${appointment.slot}`,
            `sessionType=${appointment.sessionType}`,
        ].join('|');

        return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrPayload)}`;
    };

    useEffect(() => {
        const handleAttendanceRefresh = () => {
            setAttendanceByRef(toAttendanceMap(appointments));
        };

        window.addEventListener(ATTENDANCE_UPDATED_EVENT, handleAttendanceRefresh);
        return () => window.removeEventListener(ATTENDANCE_UPDATED_EVENT, handleAttendanceRefresh);
    }, [appointments]);

    const handleCounsellorApprove = async (referenceNo: string) => {
        const approved = await confirm({
            title: 'Approve Appointment',
            message: `Approve appointment ${referenceNo} for scheduling?`,
            confirmText: 'Approve',
        });

        if (!approved) {
            return;
        }

        setAppointments((current) =>
            current.map((appointment) =>
                appointment.referenceNo === referenceNo && appointment.status === 'counsellor-reviewing'
                    ? {
                          ...appointment,
                          status: 'approved',
                      }
                    : appointment,
            ),
        );
        setViewingAppointment((current) =>
            current && current.referenceNo === referenceNo
                ? {
                      ...current,
                      status: 'approved',
                  }
                : current,
        );
    };

    const handleOpenAppointment = async (referenceNo: string, sessionType: 'online' | 'physical') => {
        const approved = await confirm({
            title: 'Open Appointment',
            message: `Open appointment ${referenceNo}? Only approved appointments can be opened.`,
            confirmText: 'Open',
        });

        if (!approved) {
            return;
        }

        setAppointments((current) =>
            current.map((appointment) =>
                appointment.referenceNo === referenceNo && appointment.status === 'approved'
                    ? {
                          ...appointment,
                          status: 'on-going',
                      }
                    : appointment,
            ),
        );
        setViewingAppointment((current) =>
            current && current.referenceNo === referenceNo
                ? {
                      ...current,
                      status: 'on-going',
                  }
                : current,
        );

        if (sessionType === 'online') {
            setMeetingLinkByRef((current) => ({
                ...current,
                [referenceNo]: current[referenceNo] ?? generateOnlineMeetingLink(referenceNo),
            }));
        }
    };

    const handleCompleteAppointment = async (referenceNo: string) => {
        const approved = await confirm({
            title: 'Complete Appointment',
            message: `Mark appointment ${referenceNo} as complete?`,
            confirmText: 'Complete',
        });

        if (!approved) {
            return;
        }

        setAppointments((current) =>
            current.map((appointment) =>
                appointment.referenceNo === referenceNo && appointment.status === 'on-going'
                    ? {
                          ...appointment,
                          status: 'complete',
                      }
                    : appointment,
            ),
        );
        setViewingAppointment((current) =>
            current && current.referenceNo === referenceNo
                ? {
                      ...current,
                      status: 'complete',
                  }
                : current,
        );
    };

    const handleSetFinalOutcome = async (referenceNo: string, continuationNeeded: boolean) => {
        const approved = await confirm({
            title: 'Finalize Outcome',
            message: continuationNeeded
                ? `Set ${referenceNo} as follow-up required?`
                : `Set ${referenceNo} as closed (no follow-up)?`,
            confirmText: 'Confirm',
            tone: continuationNeeded ? 'default' : 'danger',
        });

        if (!approved) {
            return;
        }

        setAppointments((current) =>
            current.map((appointment) =>
                appointment.referenceNo === referenceNo && appointment.status === 'complete'
                    ? {
                          ...appointment,
                          status: continuationNeeded ? 'follow-up' : 'closed',
                          counsellorContinuationNeeded: continuationNeeded,
                      }
                    : appointment,
            ),
        );
        setViewingAppointment((current) =>
            current && current.referenceNo === referenceNo
                ? {
                      ...current,
                      status: continuationNeeded ? 'follow-up' : 'closed',
                      counsellorContinuationNeeded: continuationNeeded,
                  }
                : current,
        );
    };

    const updateAttendanceDraft = (
        referenceNo: string,
        updater: (session: AttendanceSession) => AttendanceSession,
    ) => {
        setAttendanceByRef((current) => {
            const existingSession =
                current[referenceNo] ?? getAttendanceSessionByRef(referenceNo, 'Assigned Client');

            return {
                ...current,
                [referenceNo]: updater(existingSession),
            };
        });
    };

    const handleChangeSessionMode = (referenceNo: string, mode: 'individual' | 'group') => {
        updateAttendanceDraft(referenceNo, (session) => {
            const normalizedParticipants =
                mode === 'individual' ? [session.participants[0] ?? { id: 'p-1', name: 'Assigned Client', status: 'pending' }] : session.participants;

            return {
                ...session,
                sessionMode: mode,
                participants: normalizedParticipants,
                updatedAt: new Date().toISOString(),
            };
        });
    };

    const handleChangeParticipantName = (referenceNo: string, participantId: string, name: string) => {
        updateAttendanceDraft(referenceNo, (session) => ({
            ...session,
            participants: session.participants.map((participant) =>
                participant.id === participantId
                    ? {
                          ...participant,
                          name,
                      }
                    : participant,
            ),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleChangeParticipantStatus = (
        referenceNo: string,
        participantId: string,
        status: AttendanceStatus,
    ) => {
        updateAttendanceDraft(referenceNo, (session) => ({
            ...session,
            participants: session.participants.map((participant) =>
                participant.id === participantId
                    ? {
                          ...participant,
                          status,
                      }
                    : participant,
            ),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleAddParticipant = (referenceNo: string) => {
        updateAttendanceDraft(referenceNo, (session) => ({
            ...session,
            sessionMode: 'group',
            participants: [
                ...session.participants,
                {
                    id: `p-${Date.now()}-${session.participants.length + 1}`,
                    name: `Participant ${session.participants.length + 1}`,
                    status: 'pending',
                },
            ],
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleRemoveParticipant = (referenceNo: string, participantId: string) => {
        updateAttendanceDraft(referenceNo, (session) => ({
            ...session,
            participants: session.participants.filter((participant) => participant.id !== participantId),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleSaveAttendance = async (referenceNo: string) => {
        const attendanceDraft = attendanceByRef[referenceNo] ?? getAttendanceSessionByRef(referenceNo);
        const approved = await confirm({
            title: 'Save Attendance',
            message: `Save attendance for ${referenceNo}?`,
            confirmText: 'Save',
        });

        if (!approved) {
            return;
        }

        upsertAttendanceSession({
            ...attendanceDraft,
            participants: attendanceDraft.participants.map((participant, index) => ({
                ...participant,
                name: participant.name.trim() || `Participant ${index + 1}`,
            })),
            updatedAt: new Date().toISOString(),
        });
    };

    const filteredAppointments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const searchableText = [
                appointment.referenceNo,
                appointment.counselor,
                appointment.date,
                appointment.slot,
                appointment.sessionType,
                appointment.status,
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
            const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
            const matchesSessionType =
                sessionTypeFilter === 'all' || appointment.sessionType === sessionTypeFilter;
            const matchesLocation = locationFilter === 'all' || appointment.location === locationFilter;

            return matchesSearch && matchesStatus && matchesSessionType && matchesLocation;
        });
    }, [appointments, searchTerm, statusFilter, sessionTypeFilter, locationFilter]);

    return (
        <>
            <Head title="Appointments" />
            <CounsellorLayout title="Appointments" subtitle="View and manage your past appointments">
                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-gray-900">Appointments</h2>
                        <button
                            type="button"
                            onClick={() => setIsCreateAppointmentOpen(true)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            Create Appointment
                        </button>
                    </div>

                    {flashMessage && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {flashMessage}
                        </div>
                    )}

                    <div className="mb-4 space-y-2 sm:flex sm:items-end sm:gap-2 sm:space-y-0">
                                                <label className="flex flex-col">
                                                    <span className="mb-1 text-xs font-semibold text-gray-600">Location</span>
                                                    <select
                                                        value={locationFilter}
                                                        onChange={(event) => setLocationFilter(event.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none"
                                                    >
                                                        <option value="all">All</option>
                                                        <option value="ONLINE">ONLINE</option>
                                                        <option value="PUSAT KAUNSELING (JB)">PUSAT KAUNSELING (JB)</option>
                                                    </select>
                                                </label>
                        <label className="flex flex-col">
                            <span className="mb-1 text-xs font-semibold text-gray-600">Search</span>
                            <input
                                type="text"
                                placeholder="By reference, counsellor, date..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none"
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="mb-1 text-xs font-semibold text-gray-600">Status</span>
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value as
                                            | 'all'
                                            | 'counsellor-reviewing'
                                            | 'approved'
                                            | 'on-going'
                                            | 'complete'
                                            | 'follow-up'
                                            | 'closed',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none sm:w-auto"
                            >
                                <option value="all">All Status</option>
                                <option value="counsellor-reviewing">Counsellor Reviewing</option>
                                <option value="approved">Approved</option>
                                <option value="on-going">On-going</option>
                                <option value="complete">Complete</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="closed">Closed</option>
                            </select>
                        </label>

                        <label className="flex flex-col">
                            <span className="mb-1 text-xs font-semibold text-gray-600">Session Type</span>
                            <select
                                value={sessionTypeFilter}
                                onChange={(event) =>
                                    setSessionTypeFilter(event.target.value as 'all' | 'online' | 'physical')
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none sm:w-auto"
                            >
                                <option value="all">All Session Types</option>
                                <option value="online">Online</option>
                                <option value="physical">Physical</option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-4 space-y-3">
                        {filteredAppointments.map((appointment) => {
                            const attendance =
                                attendanceByRef[appointment.referenceNo] ??
                                getAttendanceSessionByRef(appointment.referenceNo, 'Assigned Client');
                            const presentCount = attendance.participants.filter(
                                (participant) => participant.status === 'present',
                            ).length;

                            return (
                                <div key={appointment.referenceNo} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1 text-sm text-gray-700">
                                            {/* Client name as card title */}
                                            <p className="text-base font-semibold text-gray-900">{appointment.clientName || 'Assigned Client'}</p>
                                            <p><span className="font-semibold text-gray-900">No. Rujukan:</span> {appointment.referenceNo}</p>
                                            <p><span className="font-semibold text-gray-900">Jenis Temujanji:</span> {appointment.appointmentType}</p>
                                            <p><span className="font-semibold text-gray-900">Session Mode:</span> {appointment.sessionMode?.toUpperCase?.() || 'INDIVIDUAL'}</p>
                                            <p><span className="font-semibold text-gray-900">Tarikh:</span> {appointment.date}</p>
                                            <p><span className="font-semibold text-gray-900">Slot:</span> {appointment.slot || '-'}</p>
                                            <p><span className="font-semibold text-gray-900">Lokasi:</span> {appointment.sessionType === 'online' ? 'ONLINE' : appointment.location}</p>
                                            <p><span className="font-semibold text-gray-900">Jenis Sesi:</span> {appointment.sessionType === 'online' ? 'ONLINE' : 'PHYSICAL'}</p>
                                            <p><span className="font-semibold text-gray-900">Attendance:</span> {presentCount}/{attendance.participants.length} present{appointment.sessionMode === 'group' ? ' (group)' : ' (individual)'}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 justify-end">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(appointment.status)}`}
                                            >
                                                {appointment.status.toUpperCase()}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => setViewingAppointment(appointment)}
                                                className="rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                            >
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setViewingAttendanceRef(appointment.referenceNo)}
                                                className="rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                                            >
                                                Attendance
                                            </button>

                                            {(appointment.status === 'follow-up' || appointment.status === 'closed') && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getContinuationBadgeClass(appointment.counsellorContinuationNeeded)}`}
                                                >
                                                    {getContinuationLabel(appointment.counsellorContinuationNeeded)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Report Button - bottom right */}
                                    <button
                                        type="button"
                                        className="absolute bottom-3 right-3 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-indigo-700"
                                        onClick={() => setViewingReportRef(appointment.referenceNo)}
                                    >
                                        Report
                                    </button>
                                </div>
                            );
                        })}

                        {filteredAppointments.length === 0 && (
                            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                No appointments match your search.
                            </p>
                        )}
                    </div>
                </section>
            </CounsellorLayout>

            {/* Report Modal */}
            {viewingReportRef && (
                <ReportModal
                    appointment={appointments.find(a => a.referenceNo === viewingReportRef)!}
                    onClose={() => setViewingReportRef(null)}
                />
            )}

            {isCreateAppointmentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Tambah Temujanji</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateAppointmentOpen(false)}
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Session Mode</span>
                                <select
                                    value={createForm.sessionMode}
                                    onChange={(event) =>
                                        handleCreateSessionModeChange(event.target.value as 'individual' | 'group')
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                                >
                                    <option value="individual">INDIVIDUAL</option>
                                    <option value="group">GROUP</option>
                                </select>
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Nama Klien</span>
                                {createForm.sessionMode === 'individual' ? (
                                    <>
                                        <input
                                            type="text"
                                            list="counsellor-appointment-client-options"
                                            value={createForm.clientName}
                                            onChange={(event) => handleClientInputChange(event.target.value)}
                                            placeholder="Type client name"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                                        />
                                        <datalist id="counsellor-appointment-client-options">
                                            {mockClientProfiles.map((client) => (
                                                <option
                                                    key={client.id}
                                                    value={client.fullName}
                                                    label={`${client.fullName} (${client.clientType === 'student' ? client.matrixNo : client.workerNo})`}
                                                />
                                            ))}
                                        </datalist>
                                    </>
                                ) : (
                                    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <input
                                            type="text"
                                            value={createForm.groupClientSearch}
                                            onChange={(event) =>
                                                updateCreateFormField('groupClientSearch', event.target.value)
                                            }
                                            placeholder="Search clients for group"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                                        />
                                        <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-white p-2">
                                            {filteredGroupClientOptions.map((client) => {
                                                const isSelected = createForm.selectedGroupClientIds.includes(client.id);

                                                return (
                                                    <label
                                                        key={client.id}
                                                        className="flex items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleGroupClient(client.id)}
                                                            className="h-3.5 w-3.5"
                                                        />
                                                        <span>
                                                            {client.fullName} ({client.clientType === 'student' ? client.matrixNo : client.workerNo})
                                                        </span>
                                                    </label>
                                                );
                                            })}

                                            {filteredGroupClientOptions.length === 0 && (
                                                <p className="px-1 py-1 text-xs text-gray-500">No clients found.</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Selected: {createForm.selectedGroupClientIds.length} client(s)
                                        </p>
                                    </div>
                                )}
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">No. Rujukan</span>
                                <input
                                    type="text"
                                    value={createForm.referenceNo}
                                    onChange={(event) => updateCreateFormField('referenceNo', event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                                />
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Jenis Temujanji</span>
                                <select
                                    value={createForm.appointmentType}
                                    onChange={(event) => updateCreateFormField('appointmentType', event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                                >
                                    <option value="BARU">BARU</option>
                                    <option value="SUSULAN">SUSULAN</option>
                                </select>
                            </label>

                            <label className="space-y-1 text-sm md:col-span-2">
                                <span className="font-medium text-gray-700">Keperluan Temujanji (Purpose Note)</span>
                                <textarea
                                    value={createForm.purposeNote}
                                    onChange={(event) => updateCreateFormField('purposeNote', event.target.value)}
                                    rows={3}
                                    placeholder="Nyatakan tujuan temujanji ini diwujudkan"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                                />
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Jenis Sesi</span>
                                <select
                                    value={createForm.sessionType}
                                    onChange={(event) =>
                                        updateCreateFormField('sessionType', event.target.value as SessionType)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                                >
                                    <option value="physical">FIZIKAL</option>
                                    <option value="online">ONLINE</option>
                                </select>
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Lokasi</span>
                                <select
                                    value={createForm.location}
                                    onChange={(event) => updateCreateFormField('location', event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                                >
                                    {adminAppointmentLocationOptions.map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="space-y-1 text-sm">
                                <span className="font-medium text-gray-700">Nama Pegawai Psikologi</span>
                                <input
                                    type="text"
                                    list="counsellor-appointment-counsellor-options"
                                    value={createForm.counselorName}
                                    onChange={(event) => updateCreateFormField('counselorName', event.target.value)}
                                    placeholder="Type counsellor name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                                />
                                <datalist id="counsellor-appointment-counsellor-options">
                                    {adminCounselorOptions.map((counsellorName) => (
                                        <option key={counsellorName} value={counsellorName} />
                                    ))}
                                </datalist>
                            </label>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
                                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                                    >
                                        Prev
                                    </button>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {calendarMonth.toLocaleDateString('en-GB', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
                                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <span key={day}>{day}</span>
                                    ))}
                                </div>

                                <div className="mt-1 grid grid-cols-7 gap-1">
                                    {calendarDays.map((day) => (
                                        <button
                                            key={day.isoDate}
                                            type="button"
                                            onClick={() => setAppointmentDate(day.isoDate)}
                                            className={`min-h-16 rounded border p-1 text-left text-xs ${
                                                appointmentDate === day.isoDate
                                                    ? 'border-red-700 bg-red-50'
                                                    : day.isCurrentMonth
                                                      ? 'border-gray-200 bg-white'
                                                      : 'border-gray-100 bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <p className="font-semibold">{day.day}</p>
                                            <p className="mt-1 text-[10px] text-gray-500">{day.slots.length} slot</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <h4 className="text-sm font-semibold text-gray-800">Pilihan Sesi</h4>
                                <p className="mt-1 text-xs text-gray-500">Sesi yang dipilih dari kalendar</p>
                                {createForm.sessionMode === 'group' && (
                                    <p className="mt-1 text-xs font-semibold text-amber-700">
                                        Group session requires assigning at least 2 clients.
                                    </p>
                                )}
                                <p className="mt-3 text-xs font-semibold text-gray-700">Tarikh</p>
                                <p className="text-sm text-gray-800">{appointmentDate}</p>

                                <label className="mt-3 block space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Masa</span>
                                    <select
                                        value={activeSelectedSlotId}
                                        onChange={(event) => setSelectedSlotId(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
                                    >
                                        {slotsForSelectedDate.length === 0 ? (
                                            <option value="">-- Tiada slot --</option>
                                        ) : (
                                            slotsForSelectedDate.map((slot) => (
                                                <option key={slot.id} value={slot.id}>
                                                    {slot.label}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreateAppointmentOpen(false)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCreatedAppointment}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Appointment Details</h3>
                            <button
                                type="button"
                                onClick={() => setViewingAppointment(null)}
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Reference</p>
                                <p className="text-sm font-semibold text-gray-900">{viewingAppointment.referenceNo}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Client Name</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {submittedFormByReference[viewingAppointment.referenceNo]?.clientName ?? 'Assigned Client'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm font-semibold text-gray-900">{viewingAppointment.date}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Slot</p>
                                <p className="text-sm font-semibold text-gray-900">{viewingAppointment.slot}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Session Type</p>
                                <p className="text-sm font-semibold text-gray-900">{viewingAppointment.sessionType === 'online' ? 'Online' : 'Physical'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Status</p>
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(viewingAppointment.status)}`}
                                >
                                    {viewingAppointment.status}
                                </span>
                            </div>
                        </div>

                        {(() => {
                            const viewingSubmittedForm = submittedFormByReference[viewingAppointment.referenceNo];

                            if (!viewingSubmittedForm) {
                                return null;
                            }

                            return (
                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <h4 className="text-sm font-semibold text-gray-800">Submitted Client Form Snapshot</h4>

                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Client Type</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.clientTypeLabel}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">No. Matrik / No. Pekerja</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.matrixOrWorkerNo}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Faculty / PTJ</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.faculty}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Submitted At</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.submittedAt}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:col-span-2">
                                            <p className="text-xs text-gray-500">Keperluan Temujanji</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.appointmentNeed}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Pernah Hadir?</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.attendedBefore}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Attachment Description</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.attachmentDescription}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:col-span-2">
                                            <p className="text-xs text-gray-500">Applicant Note</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingSubmittedForm.applicantNote}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                            <h4 className="text-sm font-semibold text-indigo-900">Approval Workflow</h4>
                            <div className="mt-3 grid gap-3 lg:grid-cols-3">
                                <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">Client Stage</p>
                                    <p className="mt-1 text-sm font-semibold text-emerald-700">SUBMITTED</p>
                                </div>
                                <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">Admin Stage</p>
                                    <p className="mt-1 text-sm font-semibold text-emerald-700">APPROVED</p>
                                </div>
                                <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                    <p className="text-xs text-gray-500">Counsellor Stage</p>
                                    <p
                                        className={`mt-1 text-sm font-semibold ${
                                            viewingAppointment.status === 'counsellor-reviewing'
                                                ? 'text-amber-700'
                                                : 'text-emerald-700'
                                        }`}
                                    >
                                        {viewingAppointment.status === 'counsellor-reviewing' ? 'PENDING' : 'APPROVED'}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">Counsellor Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingAppointment.counselor}</p>
                                    <p className="mt-2 text-xs text-gray-500">Counsellor Note</p>
                                    <textarea
                                        value={counsellorNoteByRef[viewingAppointment.referenceNo] ?? ''}
                                        onChange={(event) =>
                                            setCounsellorNoteByRef((current) => ({
                                                ...current,
                                                [viewingAppointment.referenceNo]: event.target.value,
                                            }))
                                        }
                                        rows={3}
                                        placeholder="Add review notes for this appointment"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-700 focus:ring-1 focus:ring-indigo-100"
                                    />
                                    {viewingAppointment.status === 'counsellor-reviewing' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCounsellorApprove(viewingAppointment.referenceNo)}
                                            className="mt-3 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                        >
                                            Approve Appointment
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(viewingAppointment.status === 'approved' ||
                            viewingAppointment.status === 'on-going' ||
                            viewingAppointment.status === 'complete') && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {viewingAppointment.status === 'approved' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenAppointment(
                                                viewingAppointment.referenceNo,
                                                viewingAppointment.sessionType,
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        Open Appointment
                                    </button>
                                )}

                                {viewingAppointment.status === 'on-going' && (
                                    <button
                                        type="button"
                                        onClick={() => handleCompleteAppointment(viewingAppointment.referenceNo)}
                                        className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                    >
                                        Complete
                                    </button>
                                )}

                                {viewingAppointment.status === 'complete' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleSetFinalOutcome(viewingAppointment.referenceNo, true)}
                                            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                                        >
                                            Follow-up
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSetFinalOutcome(viewingAppointment.referenceNo, false)}
                                            className="rounded-lg border border-gray-400 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {viewingAppointment.sessionType === 'online' &&
                            meetingLinkByRef[viewingAppointment.referenceNo] && (
                                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                    <p className="text-xs font-semibold text-emerald-900">Auto Generated Meeting Link</p>
                                    <a
                                        href={meetingLinkByRef[viewingAppointment.referenceNo]}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 block break-all text-sm font-semibold text-emerald-700 underline"
                                    >
                                        {meetingLinkByRef[viewingAppointment.referenceNo]}
                                    </a>
                                </div>
                            )}
                    </div>
                </div>
            )}

            {viewingAttendanceRef && (() => {
                const attendance =
                    attendanceByRef[viewingAttendanceRef] ??
                    getAttendanceSessionByRef(viewingAttendanceRef, 'Assigned Client');
                const appointment = appointments.find((item) => item.referenceNo === viewingAttendanceRef);

                if (!appointment) {
                    return null;
                }

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900">Attendance Record</h3>
                                <button
                                    type="button"
                                    onClick={() => setViewingAttendanceRef(null)}
                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Client Reference</p>
                                        <p className="text-sm font-semibold text-gray-900">{appointment.referenceNo}</p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {attendance.sessionMode === 'group' ? 'Group Session' : 'Individual Session'}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <label className="text-xs font-medium text-slate-700">Session Mode</label>
                                    <select
                                        value={attendance.sessionMode}
                                        onChange={(event) =>
                                            handleChangeSessionMode(
                                                appointment.referenceNo,
                                                event.target.value as 'individual' | 'group',
                                            )
                                        }
                                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                                    >
                                        <option value="individual">Individual</option>
                                        <option value="group">Group</option>
                                    </select>

                                    {attendance.sessionMode === 'group' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAddParticipant(appointment.referenceNo)}
                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Add Participant
                                        </button>
                                    )}
                                </div>

                                <div className="mt-3 space-y-2">
                                    <datalist id="counsellor-attendance-modal-options">
                                        {mockClientProfiles.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.fullName}
                                                label={`${client.fullName} (${client.clientType === 'student' ? client.matrixNo : client.workerNo})`}
                                            />
                                        ))}
                                    </datalist>

                                    {attendance.participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-[1.5fr_1fr_auto_auto]"
                                        >
                                            <input
                                                type="text"
                                                list="counsellor-attendance-modal-options"
                                                value={participant.name}
                                                onChange={(event) =>
                                                    handleChangeParticipantName(
                                                        appointment.referenceNo,
                                                        participant.id,
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Type client name"
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                            />

                                            <select
                                                value={participant.status}
                                                onChange={(event) =>
                                                    handleChangeParticipantStatus(
                                                        appointment.referenceNo,
                                                        participant.id,
                                                        event.target.value as AttendanceStatus,
                                                    )
                                                }
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="excused">Excused</option>
                                            </select>

                                            <span
                                                className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold ${getAttendanceBadgeClass(participant.status)}`}
                                            >
                                                {getAttendanceLabel(participant.status)}
                                            </span>

                                            {attendance.sessionMode === 'group' && attendance.participants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveParticipant(
                                                            appointment.referenceNo,
                                                            participant.id,
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {appointment.sessionType === 'physical' && (
                                    <div className="my-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                                        <p className="mb-2 text-xs font-semibold text-gray-800">Attendance QR Code</p>
                                        <img
                                            src={getAttendanceQrUrl(appointment)}
                                            alt={`Attendance QR for ${appointment.referenceNo}`}
                                            className="mx-auto h-56 w-56 rounded bg-white p-2"
                                        />
                                        <p className="mt-2 text-xs font-semibold text-gray-800">{appointment.referenceNo}</p>
                                        <p className="text-xs text-gray-600">{appointment.date} • {appointment.slot}</p>
                                    </div>
                                )}

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveAttendance(appointment.referenceNo)}
                                        className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                    >
                                        Save Attendance
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {confirmDialog}
        </>
    );
}