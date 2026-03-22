import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import { adminAppointmentLocationOptions, adminCounselorOptions } from '@/lib/admin-mock-data';
import { getMockClientByName, mockClientProfiles } from '@/lib/mock-clients';
import { getAdminManagedSchedule } from '@/lib/psycare-admin-slots';
import type { AdminScheduleDay, SessionType } from '@/lib/psycare-admin-slots';
import {
    ATTENDANCE_UPDATED_EVENT,
    getAttendanceSessionByRef,
    getAttendanceSessions,
    upsertAttendanceSession,
} from '@/lib/psycare-attendance';
import type { AttendanceSession, AttendanceStatus } from '@/lib/psycare-attendance';
import { adminPortalMockData } from '@/lib/psycare-data';

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

const toIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth() + amount, 1);

type AppointmentQueueItem = (typeof adminPortalMockData.appointmentRequests)[number] & {
    appointmentType: string;
    slotLabel: string;
    location: string;
    counselorName: string;
    sessionMode: 'individual' | 'group';
};

type SubmittedClientForm = {
    clientTypeLabel: 'PELAJAR' | 'STAF' | 'GROUP';
    matrixOrWorkerNo: string;
    faculty: string;
    appointmentNeed: string;
    attendedBefore: 'YA' | 'TIDAK';
    attachmentDescription: string;
    applicantNote: string;
    submittedAt: string;
};

type ApprovalWorkflow = {
    applicantStatus: 'submitted';
    adminStatus: 'pending' | 'approved';
    adminName: string;
    adminNote: string;
    adminApprovedAt: string;
    counsellorStatus: 'pending' | 'approved';
    counsellorName: string;
    counsellorApprovedAt: string;
};

const initialAppointmentRequests: AppointmentQueueItem[] =
    adminPortalMockData.appointmentRequests.map((request) => ({
        ...request,
        appointmentType: request.clientFollowUpRequested ? 'SUSULAN' : 'BARU',
        slotLabel: '-',
        location: request.sessionType === 'online' ? 'ONLINE' : adminAppointmentLocationOptions[0],
        counselorName: '-',
        sessionMode: 'individual',
    }));

const formatDate = (dateValue: string) =>
    new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const getStatusBadgeClass = (
    status:
        | 'pending'
        | 'needs-review'
        | 'counsellor-reviewing'
        | 'approved'
        | 'on-going'
        | 'complete'
        | 'completed'
        | 'follow-up'
        | 'closed',
) => {
    if (status === 'pending') {
        return 'bg-amber-100 text-amber-800';
    }

    if (status === 'needs-review') {
        return 'bg-amber-100 text-amber-800';
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

    if (status === 'complete' || status === 'completed') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (status === 'follow-up') {
        return 'bg-orange-100 text-orange-800';
    }

    return 'bg-gray-300 text-gray-800';
};

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

const toAdminAttendanceMap = (requests: AppointmentQueueItem[]) => {
    const existingSessions = getAttendanceSessions();

    return requests.reduce<Record<string, AttendanceSession>>((accumulator, request) => {
        const existing = existingSessions.find((session) => session.appointmentRef === request.id);
        accumulator[request.id] = existing ?? getAttendanceSessionByRef(request.id, request.clientName);
        return accumulator;
    }, {});
};

const buildInitialSubmittedForms = (requests: AppointmentQueueItem[]) =>
    requests.reduce<Record<string, SubmittedClientForm>>((accumulator, request) => {
        const matchedClient = getMockClientByName(request.clientName);

        accumulator[request.id] = {
            clientTypeLabel: request.sessionMode === 'group' ? 'GROUP' : matchedClient?.clientType === 'staff' ? 'STAF' : 'PELAJAR',
            matrixOrWorkerNo:
                request.sessionMode === 'group'
                    ? '-'
                    : matchedClient?.clientType === 'staff'
                      ? matchedClient.workerNo ?? '-'
                      : matchedClient?.matrixNo ?? '-',
            faculty: matchedClient?.faculty ?? '-',
            appointmentNeed: 'Tekanan akademik dan pengurusan emosi',
            attendedBefore: 'TIDAK',
            attachmentDescription: 'Lampiran sokongan berkaitan isu akademik.',
            applicantNote: 'Mohon slot selepas jam 10 pagi jika boleh.',
            submittedAt: request.preferredDate,
        };

        return accumulator;
    }, {});

const buildInitialApprovalWorkflow = (requests: AppointmentQueueItem[]) =>
    requests.reduce<Record<string, ApprovalWorkflow>>((accumulator, request) => {
        accumulator[request.id] = {
            applicantStatus: 'submitted',
            adminStatus: request.status === 'pending' ? 'pending' : 'approved',
            adminName: 'Admin Queue Reviewer',
            adminNote:
                request.status === 'pending'
                    ? 'Menunggu semakan admin.'
                    : 'Diluluskan melalui semakan queue.',
            adminApprovedAt:
                request.status === 'pending'
                    ? '-'
                    : new Date().toLocaleDateString('en-GB'),
            counsellorStatus:
                request.status === 'approved' ||
                request.status === 'on-going' ||
                request.status === 'complete' ||
                request.status === 'follow-up' ||
                request.status === 'closed'
                    ? 'approved'
                    : 'pending',
            counsellorName:
                request.status === 'approved' ||
                request.status === 'on-going' ||
                request.status === 'complete' ||
                request.status === 'follow-up' ||
                request.status === 'closed'
                    ? request.counselorName
                    : '-',
            counsellorApprovedAt:
                request.status === 'approved' ||
                request.status === 'on-going' ||
                request.status === 'complete' ||
                request.status === 'follow-up' ||
                request.status === 'closed'
                    ? new Date().toLocaleDateString('en-GB')
                    : '-',
        };

        return accumulator;
    }, {});

export default function AdminAppointmentsPage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const [requests, setRequests] = useState<AppointmentQueueItem[]>(() => initialAppointmentRequests);
    const [adminSchedule] = useState<AdminScheduleDay[]>(() => getAdminManagedSchedule());
    const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
    const [createForm, setCreateForm] = useState<AppointmentCreateForm>({
        sessionMode: 'individual',
        clientId: mockClientProfiles[0]?.id ?? '',
        clientName: mockClientProfiles[0]?.fullName ?? '',
        selectedGroupClientIds: [],
        groupClientSearch: '',
        referenceNo: 'WJB/2024/00003/1',
        appointmentType: 'BARU',
        purposeNote: '',
        sessionType: 'physical',
        location: adminAppointmentLocationOptions[0],
        counselorName: 'ALLAN A. MARSH',
    });
    const [appointmentDate, setAppointmentDate] = useState(
        getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date()),
    );
    const [calendarMonth, setCalendarMonth] = useState(() =>
        startOfMonth(new Date(`${getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date())}T00:00:00`)),
    );
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [viewingRequest, setViewingRequest] = useState<AppointmentQueueItem | null>(null);
    const [viewingAttendanceRequest, setViewingAttendanceRequest] = useState<AppointmentQueueItem | null>(null);
    const [flashMessage, setFlashMessage] = useState('');
    const [attendanceByRef, setAttendanceByRef] = useState<Record<string, AttendanceSession>>(() =>
        toAdminAttendanceMap(initialAppointmentRequests),
    );
    const [submittedFormByRequestId, setSubmittedFormByRequestId] = useState<Record<string, SubmittedClientForm>>(
        () => buildInitialSubmittedForms(initialAppointmentRequests),
    );
    const [approvalByRequestId, setApprovalByRequestId] = useState<Record<string, ApprovalWorkflow>>(
        () => buildInitialApprovalWorkflow(initialAppointmentRequests),
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sessionTypeFilter, setSessionTypeFilter] = useState('all');

    useEffect(() => {
        const handleAttendanceRefresh = () => {
            setAttendanceByRef(toAdminAttendanceMap(requests));
        };

        window.addEventListener(ATTENDANCE_UPDATED_EVENT, handleAttendanceRefresh);
        return () => window.removeEventListener(ATTENDANCE_UPDATED_EVENT, handleAttendanceRefresh);
    }, [requests]);

    const getSlotsForDate = useCallback(
        (isoDate: string) => {
            const configuredDay = adminSchedule.find((day) => day.date === isoDate);

            if (!configuredDay) {
                return [];
            }

            return configuredDay.slots.filter((slot) =>
                slot.allowedSessionTypes.includes(createForm.sessionType),
            );
        },
        [adminSchedule, createForm.sessionType],
    );

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

    const handleSessionModeChange = (mode: 'individual' | 'group') => {
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

        const newRequest: AppointmentQueueItem = {
            id: createForm.referenceNo.trim(),
            clientName: resolvedClientName,
            sessionType: createForm.sessionType,
            preferredDate: appointmentDate,
            status: 'pending' as const,
            clientFollowUpRequested: false,
            counsellorContinuationNeeded: null,
            appointmentType: createForm.appointmentType,
            slotLabel: selectedSlot.label,
            location: createForm.location,
            counselorName: createForm.counselorName,
            sessionMode: createForm.sessionMode,
        };

        setRequests((current) => [newRequest, ...current]);
        const draftAttendance = getAttendanceSessionByRef(newRequest.id, newRequest.clientName);
        upsertAttendanceSession({
            ...draftAttendance,
            sessionMode: createForm.sessionMode,
            appointmentRef: newRequest.id,
            participants:
                createForm.sessionMode === 'group'
                    ? selectedGroupClients.map((client, index) => ({
                          id: `p-${newRequest.id}-${index + 1}`,
                          name: client.fullName,
                          status: 'pending' as const,
                      }))
                    : [
                          {
                              id: draftAttendance.participants[0]?.id ?? `p-${newRequest.id}-1`,
                              name: newRequest.clientName,
                              status: draftAttendance.participants[0]?.status ?? 'pending',
                          },
                      ],
            updatedAt: new Date().toISOString(),
        });
        setAttendanceByRef((current) => ({
            ...current,
            [newRequest.id]: getAttendanceSessionByRef(newRequest.id, newRequest.clientName),
        }));
        setSubmittedFormByRequestId((current) => ({
            ...current,
            [newRequest.id]: {
                clientTypeLabel:
                    createForm.sessionMode === 'group'
                        ? 'GROUP'
                        : mockClientProfiles.find((client) => client.id === createForm.clientId)?.clientType ===
                            'staff'
                          ? 'STAF'
                          : 'PELAJAR',
                matrixOrWorkerNo:
                    createForm.sessionMode === 'group'
                        ? '-'
                        : mockClientProfiles.find((client) => client.id === createForm.clientId)?.clientType ===
                            'staff'
                          ? mockClientProfiles.find((client) => client.id === createForm.clientId)?.workerNo ?? '-'
                          : mockClientProfiles.find((client) => client.id === createForm.clientId)?.matrixNo ?? '-',
                faculty: createForm.sessionMode === 'group' ? '-' : mockClientProfiles.find((client) => client.id === createForm.clientId)?.faculty ?? '-',
                appointmentNeed:
                    createForm.purposeNote.trim() || 'Temujanji dibuat melalui admin queue.',
                attendedBefore: 'TIDAK',
                attachmentDescription: 'Lampiran dikemaskini oleh pemohon.',
                applicantNote: 'Permohonan diterima melalui aliran queue.',
                submittedAt: appointmentDate,
            },
        }));
        setApprovalByRequestId((current) => ({
            ...current,
            [newRequest.id]: {
                applicantStatus: 'submitted',
                adminStatus: 'pending',
                adminName: 'Admin Queue Reviewer',
                adminNote: 'Menunggu semakan admin.',
                adminApprovedAt: '-',
                counsellorStatus: 'pending',
                counsellorName: '-',
                counsellorApprovedAt: '-',
            },
        }));
        setIsCreateAppointmentOpen(false);
        setCreateForm((current) => ({
            ...current,
            sessionMode: 'individual',
            selectedGroupClientIds: [],
            groupClientSearch: '',
            purposeNote: '',
        }));
        setFlashMessage(`Appointment ${newRequest.id} created successfully.`);
    };

    const updateAttendanceDraft = (
        requestId: string,
        fallbackClientName: string,
        updater: (session: AttendanceSession) => AttendanceSession,
    ) => {
        setAttendanceByRef((current) => {
            const existingSession = current[requestId] ?? getAttendanceSessionByRef(requestId, fallbackClientName);
            return {
                ...current,
                [requestId]: updater(existingSession),
            };
        });
    };

    const handleAttendanceModeChange = (
        requestId: string,
        fallbackClientName: string,
        mode: 'individual' | 'group',
    ) => {
        updateAttendanceDraft(requestId, fallbackClientName, (session) => ({
            ...session,
            sessionMode: mode,
            participants:
                mode === 'individual'
                    ? [session.participants[0] ?? { id: 'p-1', name: fallbackClientName, status: 'pending' }]
                    : session.participants,
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleAttendanceParticipantNameChange = (
        requestId: string,
        fallbackClientName: string,
        participantId: string,
        name: string,
    ) => {
        updateAttendanceDraft(requestId, fallbackClientName, (session) => ({
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

    const handleAttendanceParticipantStatusChange = (
        requestId: string,
        fallbackClientName: string,
        participantId: string,
        status: AttendanceStatus,
    ) => {
        updateAttendanceDraft(requestId, fallbackClientName, (session) => ({
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

    const handleAttendanceAddParticipant = (requestId: string, fallbackClientName: string) => {
        updateAttendanceDraft(requestId, fallbackClientName, (session) => ({
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

    const handleAttendanceRemoveParticipant = (
        requestId: string,
        fallbackClientName: string,
        participantId: string,
    ) => {
        updateAttendanceDraft(requestId, fallbackClientName, (session) => ({
            ...session,
            participants: session.participants.filter((participant) => participant.id !== participantId),
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleAttendanceSaveFromAdmin = async (requestId: string, fallbackClientName: string) => {
        const attendanceDraft = attendanceByRef[requestId] ?? getAttendanceSessionByRef(requestId, fallbackClientName);
        const approved = await confirm({
            title: 'Save Attendance',
            message: `Save attendance for ${requestId}?`,
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
        setFlashMessage(`Attendance for ${requestId} saved.`);
    };

    const handleApproveRequest = async (requestId: string) => {
        const approved = await confirm({
            title: 'Approve Request',
            message: `Approve request ${requestId}?`,
            confirmText: 'Approve',
        });

        if (!approved) {
            return;
        }

        setRequests((current) =>
            current.map((request) =>
                request.id === requestId
                    ? {
                          ...request,
                          status: 'counsellor-reviewing',
                      }
                    : request,
            ),
        );
        setApprovalByRequestId((current) => ({
            ...current,
            [requestId]: {
                ...(current[requestId] ?? {
                    applicantStatus: 'submitted',
                    adminStatus: 'pending',
                    adminName: 'Admin Queue Reviewer',
                    adminNote: '',
                    adminApprovedAt: '-',
                    counsellorStatus: 'pending',
                    counsellorName: '-',
                    counsellorApprovedAt: '-',
                }),
                adminStatus: 'approved',
                adminApprovedAt: new Date().toLocaleDateString('en-GB'),
            },
        }));
        setViewingRequest(null);
        setFlashMessage(`Request ${requestId} moved to counsellor reviewing.`);
    };

    const handleAdminReviewNoteChange = (requestId: string, note: string) => {
        setApprovalByRequestId((current) => ({
            ...current,
            [requestId]: {
                ...(current[requestId] ?? {
                    applicantStatus: 'submitted',
                    adminStatus: 'pending',
                    adminName: 'Admin Queue Reviewer',
                    adminNote: '',
                    adminApprovedAt: '-',
                    counsellorStatus: 'pending',
                    counsellorName: '-',
                    counsellorApprovedAt: '-',
                }),
                adminNote: note,
            },
        }));
    };

    const filteredRequests = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return requests.filter((request) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                request.id.toLowerCase().includes(normalizedSearch) ||
                request.clientName.toLowerCase().includes(normalizedSearch);
            const matchesStatus =
                statusFilter === 'all' || request.status === statusFilter;
            const matchesSessionType =
                sessionTypeFilter === 'all' || request.sessionType === sessionTypeFilter;

            return matchesSearch && matchesStatus && matchesSessionType;
        });
    }, [requests, searchTerm, statusFilter, sessionTypeFilter]);

    const viewingSubmittedForm = viewingRequest ? submittedFormByRequestId[viewingRequest.id] : null;
    const viewingApprovalWorkflow = viewingRequest ? approvalByRequestId[viewingRequest.id] : null;

    return (
        <>
            <Head title="Admin Appointments" />
            <AdminLayout
                title="Appointment Queue"
                subtitle="Review and approve appointment requests"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">Appointment Queue</h2>
                        <button
                            type="button"
                            onClick={() => setIsCreateAppointmentOpen(true)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            Create Appointment
                        </button>
                    </div>

                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600 md:col-span-2">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by request ID or client name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Status
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="counsellor-reviewing">Counsellor Reviewing</option>
                                <option value="approved">Approved</option>
                                <option value="on-going">On-going</option>
                                <option value="complete">Complete</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="closed">Closed</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Session Type
                            <select
                                value={sessionTypeFilter}
                                onChange={(event) => setSessionTypeFilter(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Session Types</option>
                                <option value="online">Online</option>
                                <option value="physical">Physical</option>
                            </select>
                        </label>
                    </div>

                    <div className="space-y-3">
                        {filteredRequests.length === 0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                                No appointment requests match your current search/filter.
                            </div>
                        )}

                        {filteredRequests.map((request) => (
                            <div key={request.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p className="text-base font-semibold text-gray-900">{request.clientName}</p>
                                        <p><span className="font-semibold text-gray-900">No. Rujukan:</span> {request.id}</p>
                                        <p><span className="font-semibold text-gray-900">Jenis Temujanji:</span> {request.appointmentType}</p>
                                        <p><span className="font-semibold text-gray-900">Session Mode:</span> {request.sessionMode === 'group' ? 'GROUP' : 'INDIVIDUAL'}</p>
                                        <p><span className="font-semibold text-gray-900">Tarikh:</span> {formatDate(request.preferredDate)}</p>
                                        <p><span className="font-semibold text-gray-900">Slot:</span> {request.slotLabel}</p>
                                        <p><span className="font-semibold text-gray-900">Lokasi:</span> {request.location}</p>
                                        <p><span className="font-semibold text-gray-900">Jenis Sesi:</span> {request.sessionType.toUpperCase()}</p>
                                        <p>
                                            <span className="font-semibold text-gray-900">Attendance:</span>{' '}
                                            {(() => {
                                                const attendance =
                                                    attendanceByRef[request.id] ??
                                                    getAttendanceSessionByRef(request.id, request.clientName);
                                                const presentCount = attendance.participants.filter(
                                                    (participant) => participant.status === 'present',
                                                ).length;
                                                return `${presentCount}/${attendance.participants.length} present (${attendance.sessionMode})`;
                                            })()}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 justify-end">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(request.status)}`}
                                        >
                                            {request.status}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setViewingRequest(request)}
                                            className="rounded-lg border border-blue-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                        >
                                            View
                                        </button>

                                        {(request.status === 'follow-up' || request.status === 'closed') && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getContinuationBadgeClass(request.counsellorContinuationNeeded)}`}
                                            >
                                                {getContinuationLabel(request.counsellorContinuationNeeded)}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setViewingAttendanceRequest(request)}
                                            className="rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                                        >
                                            Attendance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
                                        onChange={(event) => handleSessionModeChange(event.target.value as 'individual' | 'group')}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
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
                                                list="appointment-client-options"
                                                value={createForm.clientName}
                                                onChange={(event) => handleClientInputChange(event.target.value)}
                                                placeholder="Type client name"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                            />
                                            <datalist id="appointment-client-options">
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
                                                onChange={(event) => updateCreateFormField('groupClientSearch', event.target.value)}
                                                placeholder="Search clients for group"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                            />
                                            <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-white p-2">
                                                {filteredGroupClientOptions.map((client) => {
                                                    const isSelected = createForm.selectedGroupClientIds.includes(client.id);

                                                    return (
                                                        <label key={client.id} className="flex items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleGroupClient(client.id)}
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            <span>{client.fullName} ({client.clientType === 'student' ? client.matrixNo : client.workerNo})</span>
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Jenis Temujanji</span>
                                    <select
                                        value={createForm.appointmentType}
                                        onChange={(event) => updateCreateFormField('appointmentType', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Jenis Sesi</span>
                                    <select
                                        value={createForm.sessionType}
                                        onChange={(event) =>
                                            updateCreateFormField('sessionType', event.target.value as SessionType)
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
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
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
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
                                        list="appointment-counsellor-options"
                                        value={createForm.counselorName}
                                        onChange={(event) => updateCreateFormField('counselorName', event.target.value)}
                                        placeholder="Type counsellor name"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                    <datalist id="appointment-counsellor-options">
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
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
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

                {viewingRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900">Appointment Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setViewingRequest(null)}
                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Request ID</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.id}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Client Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.clientName}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Appointment Type</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.appointmentType}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Session Type</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.sessionType.toUpperCase()}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Preferred Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(viewingRequest.preferredDate)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Slot</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.slotLabel}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.location}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Counsellor</p>
                                    <p className="text-sm font-semibold text-gray-900">{viewingRequest.counselorName}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(viewingRequest.status)}`}
                                    >
                                        {viewingRequest.status}
                                    </span>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Client Follow-up Request</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {viewingRequest.clientFollowUpRequested ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>

                            {viewingSubmittedForm && (
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
                            )}

                            {viewingApprovalWorkflow && (
                                <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                    <h4 className="text-sm font-semibold text-indigo-900">Approval Workflow</h4>

                                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                                        <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Pengesahan Pemohon</p>
                                            <p className="mt-1 text-sm font-semibold text-emerald-700">SUBMITTED</p>
                                        </div>

                                        <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Semakan Admin</p>
                                            <p className={`mt-1 text-sm font-semibold ${viewingApprovalWorkflow.adminStatus === 'approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {viewingApprovalWorkflow.adminStatus.toUpperCase()}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-500">Admin Name</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingApprovalWorkflow.adminName}</p>
                                            <p className="mt-2 text-xs text-gray-500">Admin Note</p>
                                            <textarea
                                                value={viewingApprovalWorkflow.adminNote}
                                                onChange={(event) =>
                                                    handleAdminReviewNoteChange(viewingRequest.id, event.target.value)
                                                }
                                                rows={3}
                                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-700 focus:ring-1 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-gray-500">Approved At: {viewingApprovalWorkflow.adminApprovedAt}</p>
                                            {viewingRequest.status === 'pending' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleApproveRequest(viewingRequest.id)}
                                                    className="mt-3 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                                >
                                                    Approve (Move to Counsellor Reviewing)
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="rounded-lg border border-indigo-200 bg-white p-3">
                                            <p className="text-xs text-gray-500">Pengesahan Pegawai Psikologi</p>
                                            <p className={`mt-1 text-sm font-semibold ${viewingApprovalWorkflow.counsellorStatus === 'approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {viewingApprovalWorkflow.counsellorStatus.toUpperCase()}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-500">Counsellor Name</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {viewingRequest.status === 'approved' ||
                                                viewingRequest.status === 'on-going' ||
                                                viewingRequest.status === 'complete' ||
                                                viewingRequest.status === 'follow-up' ||
                                                viewingRequest.status === 'closed'
                                                    ? viewingRequest.counselorName
                                                    : '-'}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Approved At:{' '}
                                                {viewingRequest.status === 'approved' ||
                                                viewingRequest.status === 'on-going' ||
                                                viewingRequest.status === 'complete' ||
                                                viewingRequest.status === 'follow-up' ||
                                                viewingRequest.status === 'closed'
                                                    ? viewingApprovalWorkflow.counsellorApprovedAt
                                                    : '-'}
                                            </p>
                                            <button
                                                type="button"
                                                disabled
                                                className="mt-3 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500"
                                            >
                                                Counsellor stage handled in Counsellor Portal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewingAttendanceRequest && (() => {
                                const viewingAttendance = viewingAttendanceRequest
                                    ? attendanceByRef[viewingAttendanceRequest.id] ?? getAttendanceSessionByRef(viewingAttendanceRequest.id, viewingAttendanceRequest.clientName)
                                    : null;
                                return (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                                        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900">Attendance Record</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingAttendanceRequest(null)}
                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    Close
                                                </button>
                                            </div>

                                            {viewingAttendance && (
                                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Client Name</p>
                                                            <p className="text-sm font-semibold text-gray-900">{viewingAttendanceRequest.clientName}</p>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {viewingAttendance.sessionMode === 'group'
                                                                ? 'Group Session'
                                                                : 'Individual Session'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                                        <label className="text-xs font-medium text-slate-700">Session Mode</label>
                                                        <select
                                                            value={viewingAttendance.sessionMode}
                                                            onChange={(event) =>
                                                                handleAttendanceModeChange(
                                                                    viewingAttendanceRequest.id,
                                                                    viewingAttendanceRequest.clientName,
                                                                    event.target.value as 'individual' | 'group',
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                                                        >
                                                            <option value="individual">Individual</option>
                                                            <option value="group">Group</option>
                                                        </select>

                                                        {viewingAttendance.sessionMode === 'group' && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAttendanceAddParticipant(
                                                                        viewingAttendanceRequest.id,
                                                                        viewingAttendanceRequest.clientName,
                                                                    )
                                                                }
                                                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Add Participant
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        {viewingAttendance.participants.map((participant) => (
                                                            <div
                                                                key={participant.id}
                                                                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-[1.5fr_1fr_auto_auto]"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={participant.name}
                                                                    onChange={(event) =>
                                                                        handleAttendanceParticipantNameChange(
                                                                            viewingAttendanceRequest.id,
                                                                            viewingAttendanceRequest.clientName,
                                                                            participant.id,
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                                                />

                                                                <select
                                                                    value={participant.status}
                                                                    onChange={(event) =>
                                                                        handleAttendanceParticipantStatusChange(
                                                                            viewingAttendanceRequest.id,
                                                                            viewingAttendanceRequest.clientName,
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

                                                                {viewingAttendance.sessionMode === 'group' &&
                                                                    viewingAttendance.participants.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAttendanceRemoveParticipant(
                                                                                    viewingAttendanceRequest.id,
                                                                                    viewingAttendanceRequest.clientName,
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

                                                    <div className="mt-3 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAttendanceSaveFromAdmin(
                                                                    viewingAttendanceRequest.id,
                                                                    viewingAttendanceRequest.clientName,
                                                                )
                                                            }
                                                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                                        >
                                                            Save Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
