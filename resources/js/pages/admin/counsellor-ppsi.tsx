import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import { adminPpsiStaffDirectory } from '@/lib/admin-mock-data';

type PpsiType = 'staff' | 'trainee';
type ActiveStatus = 'active' | 'inactive' | 'suspended';

type LocationOption = {
    id: string;
    name: string;
};

type PpsiRecord = {
    id: string;
    ppsiNo: string | null;
    workerNo: string | null;
    type: PpsiType;
    name: string;
    organization: string | null;
    locationId: string | null;
    location: string;
    status: ActiveStatus;
    startDate: string | null;
    endDate: string | null;
    email: string | null;
    phone: string | null;
};

type StaffDirectoryItem = {
    workerNo: string;
    name: string;
    role: string;
    ptjCode: string;
    email: string;
    phone: string;
};

type PpsiForm = {
    counsellor_type: PpsiType;
    worker_no: string;
    ppsi_no: string;
    name: string;
    organization: string;
    email: string;
    phone: string;
    location_id: string;
    status: ActiveStatus;
    start_date: string;
    end_date: string;
};

type PageProps = {
    counsellors: PpsiRecord[];
    locations: LocationOption[];
};

const staffDirectory: StaffDirectoryItem[] = adminPpsiStaffDirectory.map((item) => ({ ...item }));

const getStatusBadgeClass = (status: ActiveStatus) =>
    status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700';

const normalizeType = (type: PpsiType) => (type === 'staff' ? 'STAF' : 'KAUNSELOR PELATIH');

export default function AdminCounsellorPpsiPage() {
    const { props } = usePage<PageProps & { flash?: { success?: string } }>();
    const { counsellors, locations } = props;

    const { confirm, confirmDialog } = useConfirmDialog();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [flashMessage, setFlashMessage] = useState(props.flash?.success ?? '');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | PpsiType>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | ActiveStatus>('all');

    const emptyForm: PpsiForm = {
        counsellor_type: 'staff',
        worker_no: '',
        ppsi_no: '',
        name: '',
        organization: 'UTM',
        email: '',
        phone: '',
        location_id: locations[0]?.id ?? '',
        status: 'active',
        start_date: '',
        end_date: '',
    };

    const [form, setForm] = useState<PpsiForm>(emptyForm);

    const filteredRecords = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return counsellors.filter((record) => {
            const searchableText = [record.ppsiNo, record.name, record.organization, record.location, record.email]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
            const matchesType = typeFilter === 'all' || record.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [counsellors, searchTerm, typeFilter, statusFilter]);

    const updateFormField = <K extends keyof PpsiForm>(field: K, value: PpsiForm[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSelectStaff = (workerNo: string) => {
        updateFormField('worker_no', workerNo);

        const selected = staffDirectory.find((staff) => staff.workerNo === workerNo);

        if (!selected) {
            return;
        }

        setForm((current) => ({
            ...current,
            worker_no: selected.workerNo,
            name: selected.name,
            organization: 'UTM',
            email: selected.email,
            phone: selected.phone,
        }));
    };

    const handleSavePpsi = async () => {
        if (!form.counsellor_type || !form.name.trim() || !form.location_id || !form.start_date || !form.end_date) {
            setFlashMessage('Please complete required fields before saving.');
            return;
        }

        const approved = await confirm({
            title: 'Save Counsellor (PPsi)',
            message: `Save ${normalizeType(form.counsellor_type)} record for ${form.name}?`,
            confirmText: 'Save',
        });

        if (!approved) {
            return;
        }

        setIsSaving(true);
        setFormErrors({});

        router.post('/admin/counsellor-ppsi', form, {
            preserveScroll: true,
            onSuccess: () => {
                setFlashMessage(`Counsellor (PPsi) ${form.name} saved successfully.`);
                setIsFormOpen(false);
                setForm(emptyForm);
            },
            onError: (errors) => {
                setFormErrors(errors as Record<string, string>);
                setFlashMessage(Object.values(errors)[0] ?? 'Please fix the errors below.');
            },
            onFinish: () => setIsSaving(false),
        });
    };

    return (
        <>
            <Head title="Admin Counsellor (PPsi)" />
            <AdminLayout title="Counsellor (PPsi)" subtitle="Manage Staff and Trainee counsellor records">
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">Counsellor (PPsi) List</h2>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen((current) => !current)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            {isFormOpen ? 'Hide Form' : 'Add Counsellor (PPsi)'}
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase md:col-span-2">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by PPsi no, name, location, or organization"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            Type
                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value as 'all' | PpsiType)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Types</option>
                                <option value="staff">Staff</option>
                                <option value="trainee">Trainee</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                            Status
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value as 'all' | ActiveStatus)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </label>
                    </div>

                    {isFormOpen && (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">Add Counsellor (PPsi)</h3>

                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Jenis PPsi</span>
                                    <select
                                        value={form.counsellor_type}
                                        onChange={(event) => updateFormField('counsellor_type', event.target.value as PpsiType)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="staff">STAF</option>
                                        <option value="trainee">KAUNSELOR PELATIH</option>
                                    </select>
                                </label>

                                {form.counsellor_type === 'staff' ? (
                                    <label className="space-y-1 text-sm md:col-span-2">
                                        <span className="font-medium text-gray-700">No. Pekerja</span>
                                        <select
                                            value={form.worker_no}
                                            onChange={(event) => handleSelectStaff(event.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        >
                                            <option value="">-- Sila Pilih --</option>
                                            {staffDirectory.map((staff) => (
                                                <option key={staff.workerNo} value={staff.workerNo}>
                                                    {staff.workerNo} - {staff.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.worker_no && <p className="text-xs text-red-700">{formErrors.worker_no}</p>}
                                    </label>
                                ) : (
                                    <label className="space-y-1 text-sm md:col-span-2">
                                        <span className="font-medium text-gray-700">No. PPsi</span>
                                        <input
                                            type="text"
                                            value={form.ppsi_no}
                                            onChange={(event) => updateFormField('ppsi_no', event.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                        {formErrors.ppsi_no && <p className="text-xs text-red-700">{formErrors.ppsi_no}</p>}
                                    </label>
                                )}

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Nama</span>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) => updateFormField('name', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Organisasi</span>
                                    <input
                                        type="text"
                                        value={form.organization}
                                        onChange={(event) => updateFormField('organization', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Email</span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(event) => updateFormField('email', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                    {formErrors.email && <p className="text-xs text-red-700">{formErrors.email}</p>}
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">No. Tel (HP)</span>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(event) => updateFormField('phone', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Lokasi</span>
                                    <select
                                        value={form.location_id}
                                        onChange={(event) => updateFormField('location_id', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        {locations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Status Aktif</span>
                                    <select
                                        value={form.status}
                                        onChange={(event) => updateFormField('status', event.target.value as ActiveStatus)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="active">AKTIF</option>
                                        <option value="inactive">TIDAK AKTIF</option>
                                        <option value="suspended">DIGANTUNG</option>
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Tarikh Mula</span>
                                    <input
                                        type="date"
                                        value={form.start_date}
                                        onChange={(event) => updateFormField('start_date', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Tarikh Tamat</span>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(event) => updateFormField('end_date', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                    {formErrors.end_date && <p className="text-xs text-red-700">{formErrors.end_date}</p>}
                                </label>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSavePpsi}
                                    disabled={isSaving}
                                    className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Kembali
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">No. PPsi</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Jenis</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Nama</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Lokasi</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Tempoh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-3 py-2 text-gray-700">{record.ppsiNo ?? record.workerNo ?? '-'}</td>
                                        <td className="px-3 py-2 text-gray-700">{normalizeType(record.type)}</td>
                                        <td className="px-3 py-2 text-gray-900">{record.name}</td>
                                        <td className="px-3 py-2 text-gray-700">{record.location}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(record.status)}`}
                                            >
                                                {record.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {record.startDate ?? '-'} - {record.endDate ?? '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredRecords.length === 0 && (
                        <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            No counsellor (PPsi) records match your current search/filter.
                        </p>
                    )}
                </section>
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
