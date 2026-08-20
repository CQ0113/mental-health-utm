import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import {
    adminClientInitialSessionRecords,
    adminCounselorOptions,
    adminSharedLocationOptions,
} from '@/lib/admin-mock-data';
import { mockClientProfiles } from '@/lib/mock-clients';
import { getAdminManagedSchedule } from '@/lib/psycare-admin-slots';
import type { AdminScheduleDay, SessionType } from '@/lib/psycare-admin-slots';

type ClientType = 'student' | 'staff';
type ClientStatus = 'active' | 'inactive';
type AttendanceStatus = 'yes' | 'no';
type ApplicationType = 'walk-in' | 'appointment' | 'referral';

type ClientRecord = {
    id: string;
    clientId: string | null;
    referenceNo: string;
    applicationType: ApplicationType;
    locationId: string | null;
    location: string;
    counsellorId: string | null;
    counselorName: string;
    appointmentNeed: string;
    attendedBefore: AttendanceStatus;
    status: ClientStatus;
    clientType: ClientType;
    clientName: string;
    faculty: string;
    matrixNo: string;
    workerNo: string;
    nationalId: string;
    email: string;
    phone: string;
    currentAddress: string;
};

type ClientForm = {
    reference_no: string;
    applicationType: ApplicationType;
    location_id: string;
    counsellor_id: string;
    appointment_need: string;
    attended_before: AttendanceStatus;
    status: ClientStatus;
    client_type: ClientType;
    full_name: string;
    faculty: string;
    matrix_no: string;
    worker_no: string;
};

type LocationOption = { id: string; name: string };
type CounsellorOption = { id: string; name: string };

type ClientInformationPageProps = {
    records: ClientRecord[];
    locations: LocationOption[];
    counsellors: CounsellorOption[];
    flash?: { success?: string };
};

type InfoTabKey =
    | 'maklumat-klien'
    | 'maklumat-sesi'
    | 'ujian-saringan'
    | 'lampiran';
type ClientDetailTab =
    | 'maklumat-peribadi'
    | 'maklumat-pengajian-perkhidmatan'
    | 'maklumat-perkahwinan'
    | 'sejarah-kesihatan'
    | 'pengesahan';

type SessionRecord = {
    id: string;
    clientName?: string;
    sessionReferenceNo: string;
    sessionCategory: string;
    appointmentType: string;
    sessionDate: string;
    slotLabel: string;
    location: string;
    status: string;
    attendanceStatus: string;
};

type SessionForm = {
    selectedClientId: string;
    clientName: string;
    sessionReferenceNo: string;
    appointmentType: string;
    meetingCategory: string;
    meetingType: SessionType;
    serviceType: string;
    location: string;
    psychologistName: string;
};

type VerificationState = {
    checked: boolean;
    submitted: boolean;
    date: string;
};

const locationOptions = [...adminSharedLocationOptions];

const counselorOptions = [...adminCounselorOptions];

const getStatusBadgeClass = (status: ClientStatus) =>
    status === 'active'
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-gray-200 text-gray-700';

const normalizeClientType = (type: ClientType) =>
    type === 'student' ? 'PELAJAR' : 'STAF';

const normalizeApplicationType = (type: ApplicationType) => {
    if (type === 'walk-in') {
        return 'WALK-IN';
    }

    if (type === 'appointment') {
        return 'TEMUJANJI';
    }

    return 'RUJUKAN';
};

const normalizeAttendance = (value: AttendanceStatus) =>
    value === 'yes' ? 'YA' : 'TIDAK';

const defaultStudentClient =
    mockClientProfiles.find((client) => client.clientType === 'student') ??
    mockClientProfiles[0];
const defaultStaffClient =
    mockClientProfiles.find((client) => client.clientType === 'staff') ??
    mockClientProfiles[0];

const buildDefaultClientForm = (
    locations: LocationOption[],
    counsellors: CounsellorOption[],
    clientType: ClientType = 'student',
): ClientForm => ({
    reference_no: '',
    applicationType: 'walk-in',
    location_id: locations[0]?.id ?? '',
    counsellor_id: counsellors[0]?.id ?? '',
    appointment_need: '',
    attended_before: 'no',
    status: 'active',
    client_type: clientType,
    full_name: '',
    faculty: '',
    matrix_no: '',
    worker_no: '',
});

const initialSessionRecords: SessionRecord[] =
    adminClientInitialSessionRecords.map((item) => ({ ...item }));

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

export default function AdminClientInformationPage() {
    const { props } = usePage<ClientInformationPageProps>();
    const { records, locations: realLocations, counsellors: realCounsellors } = props;

    const { confirm, confirmDialog } = useConfirmDialog();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [flashMessage, setFlashMessage] = useState(props.flash?.success ?? '');
    const [viewingRecord, setViewingRecord] = useState<ClientRecord | null>(
        null,
    );
    const [clientDetailTab, setClientDetailTab] =
        useState<ClientDetailTab>('maklumat-peribadi');
    const [healthHistoryAnswers, setHealthHistoryAnswers] = useState<
        Record<string, string>
    >({});
    const [marriageRecords, setMarriageRecords] = useState<
        Array<{
            id: string;
            spouseNationalId: string;
            spouseName: string;
            relationship: string;
            spouseOccupation: string;
            marriageDate: string;
            childrenCount: string;
        }>
    >([]);
    const [marriageForm, setMarriageForm] = useState({
        spouseNationalId: '',
        spouseName: '',
        relationship: '',
        spouseOccupation: '',
        marriageDate: '',
        childrenCount: '',
    });
    const [verificationByRecordId, setVerificationByRecordId] = useState<
        Record<string, VerificationState>
    >({});

    const [referenceFilter, setReferenceFilter] = useState('');
    const [applicationFilter, setApplicationFilter] = useState<
        'all' | ApplicationType
    >('all');
    const [locationFilter, setLocationFilter] = useState<'all' | string>('all');
    const [clientNameFilter, setClientNameFilter] = useState('');

    const [form, setForm] = useState<ClientForm>(() =>
        buildDefaultClientForm(realLocations, realCounsellors),
    );
    const [activeInfoTab, setActiveInfoTab] =
        useState<InfoTabKey>('maklumat-klien');
    const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>(
        initialSessionRecords,
    );
    const [sessionSearchTerm, setSessionSearchTerm] = useState('');
    const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
    const [sessionForm, setSessionForm] = useState<SessionForm>({
        selectedClientId: defaultStudentClient?.id ?? '',
        clientName: defaultStudentClient?.fullName ?? '',
        sessionReferenceNo: 'WJB/2024/00003/1',
        appointmentType: 'TEMUJANJI',
        meetingCategory: 'BARU',
        meetingType: 'physical',
        serviceType: 'KAUNSELING INDIVIDU',
        location: locationOptions[0],
        psychologistName: counselorOptions[1],
    });
    const [adminSchedule] = useState<AdminScheduleDay[]>(() =>
        getAdminManagedSchedule(),
    );
    const [sessionDate, setSessionDate] = useState(
        () => getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date()),
    );
    const [calendarMonth, setCalendarMonth] = useState(() =>
        startOfMonth(
            new Date(
                `${getAdminManagedSchedule()[0]?.date ?? toIsoDate(new Date())}T00:00:00`,
            ),
        ),
    );
    const [selectedSlotId, setSelectedSlotId] = useState('');

    const filteredRecords = useMemo(() => {
        const normalizedReference = referenceFilter.trim().toLowerCase();
        const normalizedClientName = clientNameFilter.trim().toLowerCase();

        return records.filter((record) => {
            const matchesReference =
                !normalizedReference ||
                record.referenceNo.toLowerCase().includes(normalizedReference);
            const matchesApplication =
                applicationFilter === 'all' ||
                record.applicationType === applicationFilter;
            const matchesLocation =
                locationFilter === 'all' || record.location === locationFilter;
            const matchesClientName =
                !normalizedClientName ||
                record.clientName.toLowerCase().includes(normalizedClientName);

            return (
                matchesReference &&
                matchesApplication &&
                matchesLocation &&
                matchesClientName
            );
        });
    }, [
        records,
        referenceFilter,
        applicationFilter,
        locationFilter,
        clientNameFilter,
    ]);

    const filteredStudents = useMemo(
        () =>
            filteredRecords.filter((record) => record.clientType === 'student'),
        [filteredRecords],
    );

    const filteredStaff = useMemo(
        () => filteredRecords.filter((record) => record.clientType === 'staff'),
        [filteredRecords],
    );

    const activeCount = useMemo(
        () =>
            filteredRecords.filter((record) => record.status === 'active')
                .length,
        [filteredRecords],
    );

    const getSlotsForDate = useCallback(
        (isoDate: string) => {
            const configuredDay = adminSchedule.find(
                (day) => day.date === isoDate,
            );

            if (!configuredDay) {
                return [];
            }

            return configuredDay.slots.filter((slot) =>
                slot.allowedSessionTypes.includes(sessionForm.meetingType),
            );
        },
        [adminSchedule, sessionForm.meetingType],
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
                isCurrentMonth:
                    currentDate.getMonth() === calendarMonth.getMonth(),
                slots: getSlotsForDate(isoDate),
            };
        });
    }, [calendarMonth, getSlotsForDate]);

    const slotsForSelectedDate = useMemo(
        () => getSlotsForDate(sessionDate),
        [sessionDate, getSlotsForDate],
    );

    const activeSelectedSlotId = useMemo(() => {
        if (slotsForSelectedDate.length === 0) {
            return '';
        }

        const isStillValid = slotsForSelectedDate.some(
            (slot) => slot.id === selectedSlotId,
        );
        return isStillValid ? selectedSlotId : slotsForSelectedDate[0].id;
    }, [slotsForSelectedDate, selectedSlotId]);

    const selectedSlot = useMemo(
        () =>
            slotsForSelectedDate.find(
                (slot) => slot.id === activeSelectedSlotId,
            ),
        [slotsForSelectedDate, activeSelectedSlotId],
    );

    const filteredSessionRecords = useMemo(() => {
        const normalizedSearch = sessionSearchTerm.trim().toLowerCase();

        return sessionRecords.filter((session) => {
            const searchText = [
                session.sessionReferenceNo,
                session.sessionCategory,
                session.slotLabel,
                session.location,
                session.status,
            ]
                .join(' ')
                .toLowerCase();

            return !normalizedSearch || searchText.includes(normalizedSearch);
        });
    }, [sessionRecords, sessionSearchTerm]);

    const updateFormField = <K extends keyof ClientForm>(
        field: K,
        value: ClientForm[K],
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleClientTypeChange = (clientType: ClientType) => {
        setForm((current) => ({
            ...current,
            client_type: clientType,
            matrix_no: clientType === 'student' ? current.matrix_no : '',
            worker_no: clientType === 'staff' ? current.worker_no : '',
        }));
    };

    const updateSessionFormField = <K extends keyof SessionForm>(
        field: K,
        value: SessionForm[K],
    ) => {
        setSessionForm((current) => ({ ...current, [field]: value }));
    };

    const handleSessionClientChange = (clientId: string) => {
        const selectedClient = mockClientProfiles.find(
            (client) => client.id === clientId,
        );

        if (!selectedClient) {
            return;
        }

        setSessionForm((current) => ({
            ...current,
            selectedClientId: selectedClient.id,
            clientName: selectedClient.fullName,
        }));
    };

    const resetForm = (clientType: ClientType = 'student') => {
        setForm(buildDefaultClientForm(realLocations, realCounsellors, clientType));
        setFormErrors({});
        setEditingRecordId(null);
    };

    const resetFilters = () => {
        setReferenceFilter('');
        setApplicationFilter('all');
        setLocationFilter('all');
        setClientNameFilter('');
    };

    const openCreateForm = (clientType: ClientType) => {
        resetForm(clientType);
        setIsFormOpen(true);
    };

    const openEditForm = (record: ClientRecord) => {
        setEditingRecordId(record.id);
        setFormErrors({});
        setForm({
            reference_no: record.referenceNo,
            applicationType: record.applicationType,
            location_id: record.locationId ?? realLocations[0]?.id ?? '',
            counsellor_id: record.counsellorId ?? '',
            appointment_need: record.appointmentNeed === '-' ? '' : record.appointmentNeed,
            attended_before: record.attendedBefore,
            status: record.status,
            client_type: record.clientType,
            full_name: record.clientName,
            faculty: record.faculty,
            matrix_no: record.matrixNo === '-' ? '' : record.matrixNo,
            worker_no: record.workerNo === '-' ? '' : record.workerNo,
        });
        setIsFormOpen(true);
    };

    const handleOpenSessionModal = () => {
        setIsSessionFormOpen(true);
    };

    const handleSaveSession = async () => {
        if (
            !sessionForm.selectedClientId ||
            !sessionForm.sessionReferenceNo.trim() ||
            !sessionDate ||
            !selectedSlot
        ) {
            setFlashMessage(
                'Please select client, then complete session reference, date, and slot before saving session.',
            );
            return;
        }

        const approved = await confirm({
            title: 'Save Session Appointment',
            message: `Save session ${sessionForm.sessionReferenceNo} on ${sessionDate}?`,
            confirmText: 'Simpan',
        });

        if (!approved) {
            return;
        }

        const newSession: SessionRecord = {
            id: `SES-${Date.now()}`,
            clientName: sessionForm.clientName,
            sessionReferenceNo: sessionForm.sessionReferenceNo.trim(),
            sessionCategory: sessionForm.meetingCategory,
            appointmentType: sessionForm.appointmentType,
            sessionDate,
            slotLabel: selectedSlot.label,
            location: sessionForm.location,
            status: 'VERIFIED',
            attendanceStatus: 'BELUM HADIR',
        };

        setSessionRecords((current) => [newSession, ...current]);
        setIsSessionFormOpen(false);
        setFlashMessage(
            `Session ${newSession.sessionReferenceNo} saved successfully.`,
        );
    };

    const handleDeleteRecord = async (record: ClientRecord) => {
        const approved = await confirm({
            title: 'Delete Client Information',
            message: `Delete client record ${record.referenceNo} (${record.clientName})?`,
            confirmText: 'Delete',
            tone: 'danger',
        });

        if (!approved) {
            return;
        }

        router.delete(`/admin/client-information/${record.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingRecordId === record.id) {
                    resetForm();
                }
                setFlashMessage(`Client record ${record.referenceNo} deleted.`);
            },
        });
    };

    const handleSaveRecord = async () => {
        if (
            !form.reference_no.trim() ||
            !form.location_id ||
            !form.full_name.trim() ||
            !form.faculty.trim()
        ) {
            setFlashMessage(
                'Please complete reference no, location, client name, and faculty.',
            );
            return;
        }

        if (form.client_type === 'student' && !form.matrix_no.trim()) {
            setFlashMessage('Please fill in No. Matrik for student client.');
            return;
        }

        if (form.client_type === 'staff' && !form.worker_no.trim()) {
            setFlashMessage('Please fill in No. Pekerja for staff client.');
            return;
        }

        const approved = await confirm(
            editingRecordId
                ? {
                      title: 'Update Client Information',
                      message: `Update client information for ${form.full_name}?`,
                      confirmText: 'Update',
                  }
                : {
                      title: 'Add Client Information',
                      message: `Add new client information for ${form.full_name}?`,
                      confirmText: 'Add',
                  },
        );

        if (!approved) {
            return;
        }

        const payload = {
            reference_no: form.reference_no.trim(),
            location_id: form.location_id,
            counsellor_id: form.counsellor_id || null,
            appointment_need: form.appointment_need.trim() || null,
            attended_before: form.attended_before === 'yes',
            client_type: form.client_type,
            full_name: form.full_name.trim(),
            faculty: form.faculty.trim(),
            matrix_no: form.client_type === 'student' ? form.matrix_no.trim() : null,
            worker_no: form.client_type === 'staff' ? form.worker_no.trim() : null,
        };

        setIsSaving(true);
        setFormErrors({});

        const onSuccess = () => {
            setFlashMessage(
                `Client record ${payload.reference_no} ${editingRecordId ? 'updated' : 'added'} successfully.`,
            );
            resetForm(form.client_type);
            setIsFormOpen(false);
        };
        const onError = (errors: Record<string, string>) => {
            setFormErrors(errors);
            setFlashMessage(Object.values(errors)[0] ?? 'Please fix the errors below.');
        };
        const onFinish = () => setIsSaving(false);

        if (editingRecordId) {
            router.put(`/admin/client-information/${editingRecordId}`, payload, {
                preserveScroll: true,
                onSuccess,
                onError,
                onFinish,
            });
        } else {
            router.post('/admin/client-information', payload, {
                preserveScroll: true,
                onSuccess,
                onError,
                onFinish,
            });
        }
    };

    const openClientDetail = (record: ClientRecord) => {
        setViewingRecord(record);
        setClientDetailTab('maklumat-peribadi');
    };

    const currentVerification = viewingRecord
        ? (verificationByRecordId[viewingRecord.id] ?? {
              checked: false,
              submitted: false,
              date: '',
          })
        : {
              checked: false,
              submitted: false,
              date: '',
          };

    const updateCurrentVerification = useCallback(
        (nextState: Partial<VerificationState>) => {
            if (!viewingRecord) {
                return;
            }

            setVerificationByRecordId((current) => {
                const previousState = current[viewingRecord.id] ?? {
                    checked: false,
                    submitted: false,
                    date: '',
                };

                return {
                    ...current,
                    [viewingRecord.id]: {
                        ...previousState,
                        ...nextState,
                    },
                };
            });
        },
        [viewingRecord],
    );

    const renderActionButtons = (record: ClientRecord) => (
        <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                onClick={() => openClientDetail(record)}
                className="rounded-md bg-sky-500 px-3 py-1 text-sm font-semibold text-white hover:bg-sky-600"
            >
                Papar Maklumat Klien / View Client Info
            </button>
            <button
                type="button"
                onClick={() => openEditForm(record)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
                Edit
            </button>
            <button
                type="button"
                onClick={() => handleDeleteRecord(record)}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
                Delete
            </button>
        </div>
    );

    return (
        <>
            <Head title="Admin Client Information" />
            <AdminLayout
                title="Client Information"
                subtitle="Add, edit, and delete client information records"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">
                            Fail Permohonan
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openCreateForm('student')}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                                + Pelajar
                            </button>
                            <button
                                type="button"
                                onClick={() => openCreateForm('staff')}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                                + Staf
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFormOpen((current) => {
                                        const nextState = !current;
                                        if (!nextState) {
                                            resetForm();
                                        }
                                        return nextState;
                                    });
                                }}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                                {isFormOpen ? 'Hide Form' : 'Daftar Baharu'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <p className="text-xs text-gray-500">
                                Jumlah Rekod
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {filteredRecords.length}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <p className="text-xs text-gray-500">Aktif</p>
                            <p className="text-lg font-semibold text-emerald-700">
                                {activeCount}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <p className="text-xs text-gray-500">Tidak Aktif</p>
                            <p className="text-lg font-semibold text-gray-700">
                                {filteredRecords.length - activeCount}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            No Rujukan
                            <input
                                type="text"
                                value={referenceFilter}
                                onChange={(event) =>
                                    setReferenceFilter(event.target.value)
                                }
                                placeholder="Search no rujukan"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 normal-case shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            Jenis Permohonan
                            <select
                                value={applicationFilter}
                                onChange={(event) =>
                                    setApplicationFilter(
                                        event.target.value as
                                            | 'all'
                                            | ApplicationType,
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 normal-case shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Types</option>
                                <option value="walk-in">Walk-in</option>
                                <option value="appointment">Temujanji</option>
                                <option value="referral">Rujukan</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            Lokasi
                            <select
                                value={locationFilter}
                                onChange={(event) =>
                                    setLocationFilter(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800 normal-case shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Lokasi</option>
                                {realLocations.map((location) => (
                                    <option key={location.id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            Klien Id / Nama
                            <input
                                type="text"
                                value={clientNameFilter}
                                onChange={(event) =>
                                    setClientNameFilter(event.target.value)
                                }
                                placeholder="Search client name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 normal-case shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {filteredRecords.length} result(s)
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>

                    {editingRecordId && (
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <span>
                                Editing mode is active. Update fields and click
                                Kemaskini.
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsFormOpen(false);
                                }}
                                className="rounded border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-800 hover:bg-amber-100"
                            >
                                Cancel Edit
                            </button>
                        </div>
                    )}

                    {isFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Maklumat Fail
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm(form.client_type);
                                            setIsFormOpen(false);
                                        }}
                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Tutup
                                    </button>
                                </div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            No Rujukan
                                        </span>
                                        <input
                                            type="text"
                                            value={form.reference_no}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'reference_no',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Example: WJB/2024/00003"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                        {formErrors.reference_no && (
                                            <p className="text-xs text-red-700">{formErrors.reference_no}</p>
                                        )}
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Jenis Permohonan
                                        </span>
                                        <select
                                            value={form.applicationType}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'applicationType',
                                                    event.target
                                                        .value as ApplicationType,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="walk-in">
                                                WALK-IN
                                            </option>
                                            <option value="appointment">
                                                TEMUJANJI
                                            </option>
                                            <option value="referral">
                                                RUJUKAN
                                            </option>
                                        </select>
                                        <p className="text-[11px] text-gray-400">
                                            Display only — not yet part of the appointment schema.
                                        </p>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Lokasi
                                        </span>
                                        <select
                                            value={form.location_id}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'location_id',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            {realLocations.map((location) => (
                                                <option
                                                    key={location.id}
                                                    value={location.id}
                                                >
                                                    {location.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Pegawai yg Pernah Ditemui
                                        </span>
                                        <select
                                            value={form.counsellor_id}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'counsellor_id',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="">TIADA</option>
                                            {realCounsellors.map(
                                                (counsellor) => (
                                                    <option
                                                        key={counsellor.id}
                                                        value={counsellor.id}
                                                    >
                                                        {counsellor.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm md:col-span-2">
                                        <span className="font-medium text-gray-700">
                                            Keperluan Temujanji
                                        </span>
                                        <textarea
                                            value={form.appointment_need}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'appointment_need',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Pernah Hadir?
                                        </span>
                                        <select
                                            value={form.attended_before}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'attended_before',
                                                    event.target
                                                        .value as AttendanceStatus,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="yes">YA</option>
                                            <option value="no">TIDAK</option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Status
                                        </span>
                                        <select
                                            value={form.status}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'status',
                                                    event.target
                                                        .value as ClientStatus,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="active">
                                                AKTIF
                                            </option>
                                            <option value="inactive">
                                                TIDAK AKTIF
                                            </option>
                                        </select>
                                        <p className="text-[11px] text-gray-400">
                                            Display only — new cases always start as Pending until reviewed (Phase 2).
                                        </p>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Jenis Klien
                                        </span>
                                        <select
                                            value={form.client_type}
                                            onChange={(event) =>
                                                handleClientTypeChange(
                                                    event.target
                                                        .value as ClientType,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="student">
                                                PELAJAR
                                            </option>
                                            <option value="staff">STAF</option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Nama Klien
                                        </span>
                                        <input
                                            type="text"
                                            value={form.full_name}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'full_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Full name"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Fakulti / PTJ
                                        </span>
                                        <input
                                            type="text"
                                            value={form.faculty}
                                            onChange={(event) =>
                                                updateFormField(
                                                    'faculty',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>

                                    {form.client_type === 'student' ? (
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-gray-700">
                                                No. Matrik
                                            </span>
                                            <input
                                                type="text"
                                                value={form.matrix_no}
                                                onChange={(event) =>
                                                    updateFormField(
                                                        'matrix_no',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                            />
                                            {formErrors.matrix_no && (
                                                <p className="text-xs text-red-700">{formErrors.matrix_no}</p>
                                            )}
                                        </label>
                                    ) : (
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-gray-700">
                                                No. Pekerja
                                            </span>
                                            <input
                                                type="text"
                                                value={form.worker_no}
                                                onChange={(event) =>
                                                    updateFormField(
                                                        'worker_no',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                            />
                                            {formErrors.worker_no && (
                                                <p className="text-xs text-red-700">{formErrors.worker_no}</p>
                                            )}
                                        </label>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm(form.client_type);
                                            setIsFormOpen(false);
                                        }}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveRecord}
                                        disabled={isSaving}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? 'Menyimpan...'
                                            : editingRecordId
                                              ? 'Kemaskini'
                                              : 'Daftar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-5 overflow-hidden rounded-lg border border-gray-300 bg-gray-700">
                        <div className="grid grid-cols-4 text-xs font-semibold tracking-wide text-white uppercase">
                            {[
                                {
                                    key: 'maklumat-klien' as const,
                                    label: 'Maklumat Klien',
                                },
                                { key: 'lampiran' as const, label: 'Lampiran' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveInfoTab(tab.key)}
                                    className={`px-3 py-2 text-center ${
                                        activeInfoTab === tab.key
                                            ? 'text-yellow-300'
                                            : 'text-white/85 hover:bg-gray-600'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeInfoTab === 'maklumat-klien' && (
                        <div className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
                            <div className="rounded-md bg-gray-200 px-3 py-2">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Senarai Klien
                                </h3>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => openCreateForm('student')}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    Tambah Pelajar
                                </button>

                                <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                                        <thead className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                            <tr>
                                                <th className="w-[14%] px-3 py-2">
                                                    Jenis Klien
                                                </th>
                                                <th className="w-[24%] px-3 py-2">
                                                    Nama Klien
                                                </th>
                                                <th className="w-[18%] px-3 py-2">
                                                    No. Matrik
                                                </th>
                                                <th className="w-[24%] px-3 py-2">
                                                    Fakulti
                                                </th>
                                                <th className="w-[20%] px-3 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-3 py-3 text-sm text-gray-500"
                                                    >
                                                        No data available in
                                                        table
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredStudents.map(
                                                    (record) => (
                                                        <tr
                                                            key={record.id}
                                                            className="border-t border-gray-200"
                                                        >
                                                            <td className="px-3 py-2 align-top text-xs font-semibold break-words whitespace-normal text-gray-700">
                                                                {normalizeClientType(
                                                                    record.clientType,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 align-top font-medium break-words whitespace-normal text-gray-800">
                                                                {
                                                                    record.clientName
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 align-top break-words whitespace-normal text-gray-700">
                                                                {
                                                                    record.matrixNo
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 align-top break-words whitespace-normal text-gray-700">
                                                                {record.faculty}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                {renderActionButtons(
                                                                    record,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    {filteredStudents.length === 0
                                        ? 'Showing no records'
                                        : `Showing 1 to ${filteredStudents.length} of ${filteredStudents.length} records`}
                                </p>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => openCreateForm('staff')}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    Tambah Staf
                                </button>

                                <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                                        <thead className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                            <tr>
                                                <th className="w-[14%] px-3 py-2">
                                                    Jenis Klien
                                                </th>
                                                <th className="w-[24%] px-3 py-2">
                                                    Nama Staf
                                                </th>
                                                <th className="w-[18%] px-3 py-2">
                                                    No. Pekerja
                                                </th>
                                                <th className="w-[24%] px-3 py-2">
                                                    Fakulti
                                                </th>
                                                <th className="w-[20%] px-3 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStaff.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-3 py-3 text-sm text-gray-500"
                                                    >
                                                        No data available in
                                                        table
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredStaff.map((record) => (
                                                    <tr
                                                        key={record.id}
                                                        className="border-t border-gray-200"
                                                    >
                                                        <td className="px-3 py-2 align-top text-xs font-semibold break-words whitespace-normal text-gray-700">
                                                            {normalizeClientType(
                                                                record.clientType,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 align-top font-medium break-words whitespace-normal text-gray-800">
                                                            {record.clientName}
                                                        </td>
                                                        <td className="px-3 py-2 align-top break-words whitespace-normal text-gray-700">
                                                            {record.workerNo}
                                                        </td>
                                                        <td className="px-3 py-2 align-top break-words whitespace-normal text-gray-700">
                                                            {record.faculty}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            {renderActionButtons(
                                                                record,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    {filteredStaff.length === 0
                                        ? 'Showing no records'
                                        : `Showing 1 to ${filteredStaff.length} of ${filteredStaff.length} records`}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeInfoTab === 'maklumat-sesi' && (
                        <div className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
                            <div className="rounded-md bg-gray-200 px-3 py-2">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Senarai Sesi
                                </h3>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={handleOpenSessionModal}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    Tambah Temujanji
                                </button>

                                <div className="flex items-center gap-2">
                                    <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700">
                                        Excel
                                    </button>
                                    <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700">
                                        PDF
                                    </button>
                                    <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700">
                                        Print
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 max-w-sm">
                                <label className="space-y-1 text-sm text-gray-700">
                                    <span>Carian Keseluruhan:</span>
                                    <input
                                        type="text"
                                        value={sessionSearchTerm}
                                        onChange={(event) =>
                                            setSessionSearchTerm(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>
                            </div>

                            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="min-w-full table-fixed text-left text-sm">
                                    <thead className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                        <tr>
                                            <th className="w-[6%] px-3 py-2">
                                                Bil.
                                            </th>
                                            <th className="w-[18%] px-3 py-2">
                                                No. Rujukan Sesi
                                            </th>
                                            <th className="w-[14%] px-3 py-2">
                                                Jenis Temujanji
                                            </th>
                                            <th className="w-[14%] px-3 py-2">
                                                Tarikh
                                            </th>
                                            <th className="w-[20%] px-3 py-2">
                                                Slot
                                            </th>
                                            <th className="w-[14%] px-3 py-2">
                                                Lokasi
                                            </th>
                                            <th className="w-[8%] px-3 py-2">
                                                Status
                                            </th>
                                            <th className="w-[6%] px-3 py-2">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSessionRecords.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-3 py-3 text-sm text-gray-500"
                                                >
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSessionRecords.map(
                                                (session, index) => (
                                                    <tr
                                                        key={session.id}
                                                        className="border-t border-gray-200"
                                                    >
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {
                                                                session.sessionReferenceNo
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {
                                                                session.sessionCategory
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {
                                                                session.sessionDate
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {session.slotLabel}
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {session.location}
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">
                                                            {session.status}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button
                                                                type="button"
                                                                className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                                                            >
                                                                Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeInfoTab !== 'maklumat-klien' &&
                        activeInfoTab !== 'maklumat-sesi' && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                                Modul ini sedang disediakan.
                            </div>
                        )}

                    {activeInfoTab === 'maklumat-klien' && (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Fail Ringkas (Semua Rekod)
                            </h3>
                            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="min-w-full table-fixed text-left text-sm">
                                    <thead className="bg-gray-100 text-xs tracking-wide text-gray-600 uppercase">
                                        <tr>
                                            <th className="w-[14%] px-3 py-2 whitespace-nowrap">
                                                No Rujukan
                                            </th>
                                            <th className="w-[14%] px-3 py-2 whitespace-nowrap">
                                                Jenis Permohonan
                                            </th>
                                            <th className="w-[16%] px-3 py-2 whitespace-nowrap">
                                                Lokasi
                                            </th>
                                            <th className="w-[18%] px-3 py-2 whitespace-nowrap">
                                                Pegawai Psikologi
                                            </th>
                                            <th className="w-[12%] px-3 py-2 whitespace-nowrap">
                                                Pernah Hadir
                                            </th>
                                            <th className="w-[10%] px-3 py-2 whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="w-[16%] px-3 py-2 whitespace-nowrap">
                                                Tindakan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-3 py-4 text-center text-sm text-gray-500"
                                                >
                                                    No records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRecords.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    className="border-t border-gray-200"
                                                >
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                        {record.referenceNo}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                        {normalizeApplicationType(
                                                            record.applicationType,
                                                        )}
                                                    </td>
                                                    <td className="truncate px-3 py-2 whitespace-nowrap text-gray-700">
                                                        {record.location}
                                                    </td>
                                                    <td className="truncate px-3 py-2 whitespace-nowrap text-gray-700">
                                                        {record.counselorName}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                        {normalizeAttendance(
                                                            record.attendedBefore,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(record.status)}`}
                                                        >
                                                            {record.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        {renderActionButtons(
                                                            record,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isSessionFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Maklumat Temujanji
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSessionFormOpen(false)
                                        }
                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Tutup
                                    </button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Klien
                                        </span>
                                        <select
                                            value={sessionForm.selectedClientId}
                                            onChange={(event) =>
                                                handleSessionClientChange(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            {mockClientProfiles.map(
                                                (client) => (
                                                    <option
                                                        key={client.id}
                                                        value={client.id}
                                                    >
                                                        {client.fullName} (
                                                        {client.clientType ===
                                                        'student'
                                                            ? client.matrixNo
                                                            : client.workerNo}
                                                        )
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            No Rujukan Sesi
                                        </span>
                                        <input
                                            type="text"
                                            value={
                                                sessionForm.sessionReferenceNo
                                            }
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'sessionReferenceNo',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Jenis Temujanji
                                        </span>
                                        <select
                                            value={sessionForm.appointmentType}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'appointmentType',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="TEMUJANJI">
                                                TEMUJANJI
                                            </option>
                                            <option value="SUSULAN">
                                                SUSULAN
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Kategori Pertemuan
                                        </span>
                                        <select
                                            value={sessionForm.meetingCategory}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'meetingCategory',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="BARU">BARU</option>
                                            <option value="SUSULAN">
                                                SUSULAN
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Jenis Pertemuan
                                        </span>
                                        <select
                                            value={sessionForm.meetingType}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'meetingType',
                                                    event.target
                                                        .value as SessionType,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="physical">
                                                FIZIKAL
                                            </option>
                                            <option value="online">
                                                ONLINE
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Jenis Perkhidmatan
                                        </span>
                                        <select
                                            value={sessionForm.serviceType}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'serviceType',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="KAUNSELING INDIVIDU">
                                                KAUNSELING INDIVIDU
                                            </option>
                                            <option value="KAUNSELING KELOMPOK">
                                                KAUNSELING KELOMPOK
                                            </option>
                                            <option value="INTERVENSI KRISIS">
                                                INTERVENSI KRISIS
                                            </option>
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Lokasi
                                        </span>
                                        <select
                                            value={sessionForm.location}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'location',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            {locationOptions.map((location) => (
                                                <option
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-1 text-sm md:col-span-2">
                                        <span className="font-medium text-gray-700">
                                            Nama Pegawai Psikologi
                                        </span>
                                        <select
                                            value={sessionForm.psychologistName}
                                            onChange={(event) =>
                                                updateSessionFormField(
                                                    'psychologistName',
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            {counselorOptions.map(
                                                (counselorName) => (
                                                    <option
                                                        key={counselorName}
                                                        value={counselorName}
                                                    >
                                                        {counselorName}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCalendarMonth(
                                                        (current) =>
                                                            addMonths(
                                                                current,
                                                                -1,
                                                            ),
                                                    )
                                                }
                                                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                                            >
                                                Prev
                                            </button>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {calendarMonth.toLocaleDateString(
                                                    'en-GB',
                                                    {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCalendarMonth(
                                                        (current) =>
                                                            addMonths(
                                                                current,
                                                                1,
                                                            ),
                                                    )
                                                }
                                                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600">
                                            {[
                                                'Sun',
                                                'Mon',
                                                'Tue',
                                                'Wed',
                                                'Thu',
                                                'Fri',
                                                'Sat',
                                            ].map((day) => (
                                                <span key={day}>{day}</span>
                                            ))}
                                        </div>
                                        <div className="mt-1 grid grid-cols-7 gap-1">
                                            {calendarDays.map((day) => (
                                                <button
                                                    key={day.isoDate}
                                                    type="button"
                                                    onClick={() =>
                                                        setSessionDate(
                                                            day.isoDate,
                                                        )
                                                    }
                                                    className={`min-h-16 rounded border p-1 text-left text-xs ${
                                                        sessionDate ===
                                                        day.isoDate
                                                            ? 'border-red-700 bg-red-50'
                                                            : day.isCurrentMonth
                                                              ? 'border-gray-200 bg-white'
                                                              : 'border-gray-100 bg-gray-100 text-gray-400'
                                                    }`}
                                                >
                                                    <p className="font-semibold">
                                                        {day.day}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-gray-500">
                                                        {day.slots.length} slot
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <h4 className="text-sm font-semibold text-gray-800">
                                            Pilihan Sesi
                                        </h4>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Sesi yang dipilih dari kalendar
                                        </p>
                                        <p className="mt-3 text-xs font-semibold text-gray-700">
                                            Tarikh
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {sessionDate}
                                        </p>

                                        <label className="mt-3 block space-y-1 text-sm">
                                            <span className="font-medium text-gray-700">
                                                Masa
                                            </span>
                                            <select
                                                value={activeSelectedSlotId}
                                                onChange={(event) =>
                                                    setSelectedSlotId(
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                            >
                                                {slotsForSelectedDate.length ===
                                                0 ? (
                                                    <option value="">
                                                        -- Tiada slot --
                                                    </option>
                                                ) : (
                                                    slotsForSelectedDate.map(
                                                        (slot) => (
                                                            <option
                                                                key={slot.id}
                                                                value={slot.id}
                                                            >
                                                                {slot.label}
                                                            </option>
                                                        ),
                                                    )
                                                )}
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSessionFormOpen(false)
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveSession}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {viewingRecord && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-6">
                        <div className="w-full max-w-5xl rounded-lg border border-gray-300 bg-white shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between rounded-t-lg bg-gray-700 px-4 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">
                                        {viewingRecord.clientName}
                                    </h3>
                                    <p className="text-xs text-gray-300">
                                        {viewingRecord.referenceNo} &mdash;{' '}
                                        {normalizeClientType(
                                            viewingRecord.clientType,
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewingRecord(null)}
                                    className="rounded-md border border-gray-500 bg-gray-600 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-500"
                                >
                                    Tutup / Close
                                </button>
                            </div>

                            {/* Tab Bar */}
                            <div className="flex overflow-x-auto border-b border-gray-300 bg-gray-800">
                                {(
                                    [
                                        {
                                            key: 'maklumat-peribadi' as ClientDetailTab,
                                            label: 'Maklumat Peribadi / Personal Information',
                                        },
                                        {
                                            key: 'maklumat-pengajian-perkhidmatan' as ClientDetailTab,
                                            label:
                                                viewingRecord.clientType ===
                                                'student'
                                                    ? 'Maklumat Pengajian / Study Information'
                                                    : 'Maklumat Perkhidmatan / Service Information',
                                        },
                                        {
                                            key: 'maklumat-perkahwinan' as ClientDetailTab,
                                            label: 'Maklumat Perkahwinan / Marriage Information',
                                        },
                                        {
                                            key: 'sejarah-kesihatan' as ClientDetailTab,
                                            label: 'Sejarah Kesihatan / Health History',
                                        },
                                        {
                                            key: 'pengesahan' as ClientDetailTab,
                                            label: 'Pengesahan / Confirmation',
                                        },
                                    ] as {
                                        key: ClientDetailTab;
                                        label: string;
                                    }[]
                                ).map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() =>
                                            setClientDetailTab(tab.key)
                                        }
                                        className={`shrink-0 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                                            clientDetailTab === tab.key
                                                ? 'border-b-2 border-yellow-400 text-yellow-300'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="max-h-[70vh] overflow-y-auto p-5">
                                {/* Tab 1: Maklumat Peribadi */}
                                {clientDetailTab === 'maklumat-peribadi' &&
                                    (() => {
                                        const profileFields = [
                                            {
                                                labelMs: 'Nama Penuh',
                                                labelEn: 'Full Name',
                                                value: viewingRecord.clientName,
                                            },
                                            {
                                                labelMs: 'No. KP / Passport',
                                                labelEn:
                                                    'National ID / Passport',
                                                value:
                                                    viewingRecord.nationalId,
                                            },
                                            {
                                                labelMs:
                                                    'No. Matrik / No. Pekerja',
                                                labelEn:
                                                    'Matric No. / Staff No.',
                                                value:
                                                    viewingRecord.clientType ===
                                                    'student'
                                                        ? viewingRecord.matrixNo
                                                        : viewingRecord.workerNo,
                                            },
                                            {
                                                labelMs: 'Fakulti / PTJ',
                                                labelEn: 'Faculty / Department',
                                                value: viewingRecord.faculty,
                                            },
                                            {
                                                labelMs: 'Alamat Semasa',
                                                labelEn: 'Current Address',
                                                value: viewingRecord.currentAddress,
                                            },
                                            {
                                                labelMs: 'Emel',
                                                labelEn: 'Email',
                                                value: viewingRecord.email,
                                            },
                                        ];

                                        return (
                                            <div className="space-y-4">
                                                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                                                    <p className="font-semibold">
                                                        Maklumat asas sahaja
                                                        dipaparkan / Basic
                                                        details only are shown.
                                                    </p>
                                                    <p className="mt-1">
                                                        Maklumat sensitif
                                                        dikunci untuk semakan
                                                        pentadbiran / Sensitive
                                                        details are locked for
                                                        administrative review.
                                                    </p>
                                                </div>

                                                <div className="rounded-md border border-gray-200 bg-white p-4">
                                                    <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                        <h4 className="text-sm font-semibold text-gray-800">
                                                            Maklumat Peribadi /
                                                            Personal Information
                                                        </h4>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {profileFields.map(
                                                            (field) => (
                                                                <label
                                                                    key={
                                                                        field.labelMs
                                                                    }
                                                                    className="space-y-1 text-sm"
                                                                >
                                                                    <span className="font-medium text-gray-700">
                                                                        {
                                                                            field.labelMs
                                                                        }{' '}
                                                                        /{' '}
                                                                        {
                                                                            field.labelEn
                                                                        }
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            field.value
                                                                        }
                                                                        readOnly
                                                                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                                                                    />
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="rounded-md border border-gray-200 bg-white p-4">
                                                    <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                        <h4 className="text-sm font-semibold text-gray-800">
                                                            Ringkasan Fail /
                                                            Case Summary
                                                        </h4>
                                                    </div>
                                                    <div className="grid gap-3 text-sm md:grid-cols-2">
                                                        <div className="flex gap-3">
                                                            <span className="w-40 shrink-0 text-gray-500">
                                                                Jenis Klien /
                                                                Client Type
                                                            </span>
                                                            <span className="text-gray-400">
                                                                :
                                                            </span>
                                                            <span className="font-medium text-gray-800">
                                                                {normalizeClientType(
                                                                    viewingRecord.clientType,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <span className="w-40 shrink-0 text-gray-500">
                                                                No. Rujukan /
                                                                Reference No.
                                                            </span>
                                                            <span className="text-gray-400">
                                                                :
                                                            </span>
                                                            <span className="font-medium text-gray-800">
                                                                {
                                                                    viewingRecord.referenceNo
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <span className="w-40 shrink-0 text-gray-500">
                                                                Permohonan /
                                                                Application
                                                            </span>
                                                            <span className="text-gray-400">
                                                                :
                                                            </span>
                                                            <span className="font-medium text-gray-800">
                                                                {normalizeApplicationType(
                                                                    viewingRecord.applicationType,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <span className="w-40 shrink-0 text-gray-500">
                                                                Status
                                                            </span>
                                                            <span className="text-gray-400">
                                                                :
                                                            </span>
                                                            <span className="font-medium text-gray-800">
                                                                {viewingRecord.status ===
                                                                'active'
                                                                    ? 'AKTIF / ACTIVE'
                                                                    : 'TIDAK AKTIF / INACTIVE'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-center gap-3 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingRecord(
                                                                null,
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Kembali / Back
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                {/* Tab 2: Maklumat Pengajian (student) / Maklumat Perkhidmatan (staff) */}
                                {clientDetailTab ===
                                    'maklumat-pengajian-perkhidmatan' &&
                                    (() => {
                                        const client = mockClientProfiles.find(
                                            (c) =>
                                                c.fullName ===
                                                viewingRecord.clientName,
                                        );
                                        if (
                                            viewingRecord.clientType ===
                                            'student'
                                        ) {
                                            return (
                                                <div className="space-y-4">
                                                    <div className="rounded-md border border-gray-200 bg-white p-4">
                                                        <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                            <h4 className="text-sm font-semibold text-gray-800">
                                                                Maklumat
                                                                Pengajian /
                                                                Study
                                                                Information
                                                            </h4>
                                                        </div>
                                                        <div className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                                                            {[
                                                                {
                                                                    label: 'Peringkat Pengajian',
                                                                    value: 'SARJANA MUDA',
                                                                },
                                                                {
                                                                    label: 'Nama Program',
                                                                    value:
                                                                        client?.program ??
                                                                        '-',
                                                                },
                                                                {
                                                                    label: 'Kampus',
                                                                    value: 'JB',
                                                                },
                                                                {
                                                                    label: 'Fakulti',
                                                                    value: viewingRecord.faculty,
                                                                },
                                                                {
                                                                    label: 'Status Pelajar',
                                                                    value: 'AKTIF',
                                                                },
                                                                {
                                                                    label: 'Sesi / Semester',
                                                                    value: '2023/2024',
                                                                },
                                                                {
                                                                    label: 'Tahun Pengajian',
                                                                    value: '3',
                                                                },
                                                                {
                                                                    label: 'Bilangan Semester',
                                                                    value: '6',
                                                                },
                                                                {
                                                                    label: 'CPA / GPA',
                                                                    value: '-',
                                                                },
                                                                {
                                                                    label: 'Email (Rasmi)',
                                                                    value:
                                                                        client?.email ??
                                                                        '-',
                                                                },
                                                                {
                                                                    label: 'Nama Penaja',
                                                                    value: 'SELF SPONSOR',
                                                                },
                                                                {
                                                                    label: 'Jumlah Hutang',
                                                                    value: '-',
                                                                },
                                                                {
                                                                    label: 'Nama Penasihat Akademik',
                                                                    value: '-',
                                                                },
                                                                {
                                                                    label: 'No. Tel. Penasihat Akademik',
                                                                    value: '-',
                                                                },
                                                            ].map(
                                                                ({
                                                                    label,
                                                                    value,
                                                                }) => (
                                                                    <div
                                                                        key={
                                                                            label
                                                                        }
                                                                        className="flex gap-3"
                                                                    >
                                                                        <span className="w-52 shrink-0 text-gray-500">
                                                                            {
                                                                                label
                                                                            }
                                                                        </span>
                                                                        <span className="text-gray-400">
                                                                            :
                                                                        </span>
                                                                        <span className="font-medium text-gray-800">
                                                                            {
                                                                                value
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewingRecord(
                                                                    null,
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Kembali
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="space-y-4">
                                                <div className="rounded-md border border-gray-200 bg-white p-4">
                                                    <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                        <h4 className="text-sm font-semibold text-gray-800">
                                                            Maklumat
                                                            Perkhidmatan /
                                                            Service Information
                                                        </h4>
                                                    </div>
                                                    <div className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                                                        {[
                                                            {
                                                                label: 'Jawatan',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'Kategori Staf',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'PTJ',
                                                                value: viewingRecord.faculty,
                                                            },
                                                            {
                                                                label: 'Status Lantikan',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'Tarikh Masuk UTM',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'Tempoh Perkhidmatan',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'No. Tel. (Pejabat)',
                                                                value: '-',
                                                            },
                                                            {
                                                                label: 'Email (Rasmi)',
                                                                value:
                                                                    client?.email ??
                                                                    '-',
                                                            },
                                                        ].map(
                                                            ({
                                                                label,
                                                                value,
                                                            }) => (
                                                                <div
                                                                    key={label}
                                                                    className="flex gap-3"
                                                                >
                                                                    <span className="w-44 shrink-0 text-gray-500">
                                                                        {label}
                                                                    </span>
                                                                    <span className="text-gray-400">
                                                                        :
                                                                    </span>
                                                                    <span className="font-medium text-gray-800">
                                                                        {value}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingRecord(
                                                                null,
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Kembali
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                {/* Tab 3: Maklumat Perkahwinan */}
                                {clientDetailTab === 'maklumat-perkahwinan' && (
                                    <div className="space-y-4">
                                        <div className="rounded-md border border-gray-200 bg-white p-4">
                                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    Maklumat Perkahwinan /
                                                    Marriage Information
                                                </h4>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full table-fixed text-left text-sm">
                                                    <thead className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                                        <tr>
                                                            <th className="w-[8%] px-3 py-2">
                                                                BIL
                                                            </th>
                                                            <th className="w-[22%] px-3 py-2">
                                                                NAMA PASANGAN
                                                            </th>
                                                            <th className="w-[16%] px-3 py-2">
                                                                HUBUNGAN
                                                            </th>
                                                            <th className="w-[22%] px-3 py-2">
                                                                PEKERJAAN
                                                                PASANGAN
                                                            </th>
                                                            <th className="w-[18%] px-3 py-2">
                                                                TARIKH KAHWIN
                                                            </th>
                                                            <th className="w-[14%] px-3 py-2">
                                                                BILANGAN ANAK
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {marriageRecords.length ===
                                                        0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={6}
                                                                    className="px-3 py-3 text-sm text-gray-500"
                                                                >
                                                                    No data
                                                                    available in
                                                                    table
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            marriageRecords.map(
                                                                (rec, idx) => (
                                                                    <tr
                                                                        key={
                                                                            rec.id
                                                                        }
                                                                        className="border-t border-gray-200"
                                                                    >
                                                                        <td className="px-3 py-2 text-gray-700">
                                                                            {idx +
                                                                                1}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-800">
                                                                            {
                                                                                rec.spouseName
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-700">
                                                                            {
                                                                                rec.relationship
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-700">
                                                                            {
                                                                                rec.spouseOccupation
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-700">
                                                                            {
                                                                                rec.marriageDate
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-700">
                                                                            {
                                                                                rec.childrenCount
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">
                                                {marriageRecords.length === 0
                                                    ? 'Showing no records'
                                                    : `Showing 1 to ${marriageRecords.length} of ${marriageRecords.length} records`}
                                            </p>
                                        </div>

                                        {/* Add marriage form */}
                                        <div className="rounded-md border border-gray-200 bg-white p-4">
                                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        No. KP / Passport
                                                        Pasangan
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={
                                                            marriageForm.spouseNationalId
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    spouseNationalId:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                </label>
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        Nama Pasangan
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={
                                                            marriageForm.spouseName
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    spouseName:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                </label>
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        Hubungan
                                                    </span>
                                                    <select
                                                        value={
                                                            marriageForm.relationship
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    relationship:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    >
                                                        <option value="">
                                                            --Sila Pilih--
                                                        </option>
                                                        <option value="SUAMI">
                                                            SUAMI
                                                        </option>
                                                        <option value="ISTERI">
                                                            ISTERI
                                                        </option>
                                                    </select>
                                                </label>
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        Pekerjaan Pasangan
                                                    </span>
                                                    <select
                                                        value={
                                                            marriageForm.spouseOccupation
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    spouseOccupation:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    >
                                                        <option value="">
                                                            --Sila Pilih--
                                                        </option>
                                                        <option value="KAKITANGAN AWAM">
                                                            KAKITANGAN AWAM
                                                        </option>
                                                        <option value="SWASTA">
                                                            SWASTA
                                                        </option>
                                                        <option value="BEKERJA SENDIRI">
                                                            BEKERJA SENDIRI
                                                        </option>
                                                        <option value="TIDAK BEKERJA">
                                                            TIDAK BEKERJA
                                                        </option>
                                                    </select>
                                                </label>
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        Tarikh Perkahwinan
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={
                                                            marriageForm.marriageDate
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    marriageDate:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="Pilih Tarikh Mula"
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                </label>
                                                <label className="space-y-1">
                                                    <span className="text-gray-500">
                                                        Bilangan Anak /
                                                        Tanggungan
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={
                                                            marriageForm.childrenCount
                                                        }
                                                        onChange={(e) =>
                                                            setMarriageForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    childrenCount:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                </label>
                                            </div>
                                            <div className="mt-4 flex justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewingRecord(null)
                                                    }
                                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    Kembali
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            !marriageForm.spouseName.trim()
                                                        )
                                                            return;
                                                        setMarriageRecords(
                                                            (prev) => [
                                                                ...prev,
                                                                {
                                                                    id: `MAR-${Date.now()}`,
                                                                    ...marriageForm,
                                                                },
                                                            ],
                                                        );
                                                        setMarriageForm({
                                                            spouseNationalId:
                                                                '',
                                                            spouseName: '',
                                                            relationship: '',
                                                            spouseOccupation:
                                                                '',
                                                            marriageDate: '',
                                                            childrenCount: '',
                                                        });
                                                    }}
                                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 4: Sejarah Kesihatan */}
                                {clientDetailTab === 'sejarah-kesihatan' && (
                                    <div className="space-y-4">
                                        <div className="rounded-md border border-gray-200 bg-white p-4">
                                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    Sejarah Kesihatan Mental
                                                    &amp; Kesihatan Fizikal /
                                                    Mental &amp; Physical Health
                                                    History
                                                </h4>
                                            </div>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                                        <th className="w-[60%] px-3 py-2 text-left">
                                                            Deskripsi Soalan
                                                        </th>
                                                        <th className="w-[40%] px-3 py-2 text-left">
                                                            Jawapan
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {[
                                                        {
                                                            id: 'q1',
                                                            no: '1',
                                                            question:
                                                                'Pernahkah anda menghadiri sesi kaunseling sebelum ini?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q2',
                                                            no: '2',
                                                            question:
                                                                'Jika jawapan No. 1 adalah YA,',
                                                            type: 'label',
                                                        },
                                                        {
                                                            id: 'q2_1',
                                                            no: '2.1',
                                                            question:
                                                                'Bilakah anda menghadiri sesi kaunseling tersebut?',
                                                            type: 'date',
                                                        },
                                                        {
                                                            id: 'q2_2',
                                                            no: '2.2',
                                                            question:
                                                                'Dari mana anda mendapatkan khidmat kaunseling?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'UTM',
                                                                'HOSPITAL',
                                                                'KLINIK',
                                                                'SWASTA',
                                                                'LAIN-LAIN',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q3',
                                                            no: '3',
                                                            question:
                                                                'Adakah anda masih mengikuti sesi kaunseling?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q4',
                                                            no: '4',
                                                            question:
                                                                'Adakah anda pernah didiagnos psikiatri?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q5',
                                                            no: '5',
                                                            question:
                                                                'Jika jawapan No. 4 adalah YA,',
                                                            type: 'label',
                                                        },
                                                        {
                                                            id: 'q5_1',
                                                            no: '5.1',
                                                            question:
                                                                'Bilakah anda berjumpa psikiatri?',
                                                            type: 'date',
                                                        },
                                                        {
                                                            id: 'q5_2',
                                                            no: '5.2',
                                                            question:
                                                                'Adakah anda masih mempunyai temujanji dengan psikiatri?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q6',
                                                            no: '6',
                                                            question:
                                                                'Adakah anda pernah / sedang mengambil ubat yang dipreskripsi oleh psikiatri?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q7',
                                                            no: '7',
                                                            question:
                                                                'Jika YA, sila namakan jenis ubatan tersebut.',
                                                            type: 'text',
                                                        },
                                                        {
                                                            id: 'q8',
                                                            no: '8',
                                                            question:
                                                                'Sila namakan diagnosis yang diberikan oleh psikiatri.',
                                                            type: 'text',
                                                        },
                                                        {
                                                            id: 'q9',
                                                            no: '9',
                                                            question:
                                                                'Mempunyai sejarah keluarga yang didiagnos menghadapi sebarang masalah kesihatan mental?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q10',
                                                            no: '10',
                                                            question:
                                                                'Adakah anda pernah / sedang mengalami penyakit kronik?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q11',
                                                            no: '11',
                                                            question:
                                                                'Jika YA, sila nyatakan jenis penyakit tersebut.',
                                                            type: 'text',
                                                        },
                                                        {
                                                            id: 'q12',
                                                            no: '12',
                                                            question:
                                                                'Adakah anda pernah / sedang mengambil ubat yang dipreskripsi untuk penyakit kronik?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q13',
                                                            no: '13',
                                                            question:
                                                                'Adakah anda pernah menjalani pembedahan?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                        {
                                                            id: 'q14',
                                                            no: '14',
                                                            question:
                                                                'Adakah anda ada alahan terhadap mana-mana ubatan?',
                                                            type: 'select',
                                                            options: [
                                                                '-- Sila Pilih --',
                                                                'YA',
                                                                'TIDAK',
                                                            ],
                                                        },
                                                    ].map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="px-3 py-2 text-gray-700">
                                                                {item.no}
                                                                &nbsp;&nbsp;
                                                                {item.question}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {item.type ===
                                                                'label' ? null : item.type ===
                                                                  'select' ? (
                                                                    <select
                                                                        value={
                                                                            healthHistoryAnswers[
                                                                                item
                                                                                    .id
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setHealthHistoryAnswers(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                                    >
                                                                        {(
                                                                            item.options ??
                                                                            []
                                                                        ).map(
                                                                            (
                                                                                opt,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        opt
                                                                                    }
                                                                                    value={
                                                                                        opt ===
                                                                                        '-- Sila Pilih --'
                                                                                            ? ''
                                                                                            : opt
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        opt
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                ) : item.type ===
                                                                  'date' ? (
                                                                    <input
                                                                        type="date"
                                                                        value={
                                                                            healthHistoryAnswers[
                                                                                item
                                                                                    .id
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setHealthHistoryAnswers(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        placeholder="Pilih Tarikh"
                                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            healthHistoryAnswers[
                                                                                item
                                                                                    .id
                                                                            ] ??
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setHealthHistoryAnswers(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [item.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                                    />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setViewingRecord(null)
                                                }
                                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Kembali
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 5: Pengesahan */}
                                {clientDetailTab === 'pengesahan' && (
                                    <div className="space-y-4">
                                        <div className="rounded-md border border-gray-200 bg-white p-4">
                                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    Pengesahan / Confirmation
                                                </h4>
                                            </div>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        currentVerification.checked
                                                    }
                                                    disabled={
                                                        currentVerification.submitted
                                                    }
                                                    onChange={(e) =>
                                                        updateCurrentVerification(
                                                            {
                                                                checked:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-700 disabled:cursor-not-allowed"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        ** Saya mengaku bahawa
                                                        segala maklumat yang
                                                        diberikan di atas adalah
                                                        BENAR dan TANPA SEBARANG
                                                        UNSUR PAKSAAN DAN
                                                        TEKANAN.
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Pihak UTM tidak akan
                                                        bertanggungjawab ke atas
                                                        sebarang kerosakan,
                                                        kecederaan, kerugian
                                                        atau kesilapan yang
                                                        berlaku dalam
                                                        perkhidmatan akibat
                                                        maklumat yang salah
                                                        diberikan.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="mx-auto max-w-sm rounded-lg bg-blue-950 p-5 text-sm text-white">
                                            <h4 className="mb-3 font-semibold">
                                                Pengesahan Klien
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex gap-3">
                                                    <span className="w-28 text-blue-200">
                                                        Nama
                                                    </span>
                                                    <span>:</span>
                                                    <span className="font-medium">
                                                        {
                                                            viewingRecord.clientName
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <span className="w-28 text-blue-200">
                                                        Status
                                                    </span>
                                                    <span>:</span>
                                                    <span className="font-medium">
                                                        {currentVerification.submitted
                                                            ? 'DIHANTAR'
                                                            : 'BELUM DIHANTAR'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <span className="w-28 text-blue-200">
                                                        Tarikh Hantar
                                                    </span>
                                                    <span>:</span>
                                                    <span className="font-medium">
                                                        {currentVerification.date ||
                                                            '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-center">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !currentVerification.checked ||
                                                        currentVerification.submitted
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            !currentVerification.checked
                                                        )
                                                            return;
                                                        updateCurrentVerification(
                                                            {
                                                                submitted: true,
                                                                date: new Date().toLocaleDateString(
                                                                    'ms-MY',
                                                                ),
                                                            },
                                                        );
                                                    }}
                                                    className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Hantar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setViewingRecord(null)
                                                }
                                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                Kembali
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
