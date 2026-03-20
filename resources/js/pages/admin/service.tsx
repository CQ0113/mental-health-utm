import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import {
    adminInitialServiceItems,
    adminServiceLocationOptions,
} from '@/lib/admin-mock-data';

type ServiceStatus = 'active' | 'inactive';
type SessionMode = 'online' | 'physical' | 'hybrid';

type AdminServiceItem = {
    id: string;
    code: string;
    name: string;
    durationMinutes: number;
    location: string;
    status: ServiceStatus;
    sessionMode: SessionMode;
};

type ServiceForm = {
    code: string;
    name: string;
    durationMinutes: string;
    location: string;
    status: ServiceStatus;
    sessionMode: SessionMode;
};

const getStatusBadgeClass = (status: ServiceStatus) => {
    if (status === 'active') {
        return 'bg-emerald-100 text-emerald-800';
    }

    return 'bg-gray-200 text-gray-700';
};

const normalizeServiceMode = (mode: SessionMode) => {
    if (mode === 'online') {
        return 'Online';
    }

    if (mode === 'physical') {
        return 'Physical';
    }

    return 'Hybrid';
};

export default function AdminServicePage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const [services, setServices] = useState<AdminServiceItem[]>(
        adminInitialServiceItems.map((item) => ({ ...item })),
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [flashMessage, setFlashMessage] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ServiceStatus>('all');
    const [locationFilter, setLocationFilter] = useState('all');

    const [form, setForm] = useState<ServiceForm>({
        code: '',
        name: '',
        durationMinutes: '45',
        location: adminServiceLocationOptions[0],
        status: 'active',
        sessionMode: 'physical',
    });

    const uniqueLocations = useMemo(
        () => ['all', ...Array.from(new Set(services.map((service) => service.location)))],
        [services],
    );

    const filteredServices = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return services.filter((service) => {
            const searchableText = [service.code, service.name, service.location, service.sessionMode]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
            const matchesLocation = locationFilter === 'all' || service.location === locationFilter;

            return matchesSearch && matchesStatus && matchesLocation;
        });
    }, [services, searchTerm, statusFilter, locationFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setLocationFilter('all');
    };

    const updateFormField = <K extends keyof ServiceForm>(field: K, value: ServiceForm[K]) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            code: '',
            name: '',
            durationMinutes: '45',
            location: adminServiceLocationOptions[0],
            status: 'active',
            sessionMode: 'physical',
        });
        setEditingServiceId(null);
    };

    const handleOpenEditService = (service: AdminServiceItem) => {
        setEditingServiceId(service.id);
        setForm({
            code: service.code,
            name: service.name,
            durationMinutes: String(service.durationMinutes),
            location: service.location,
            status: service.status,
            sessionMode: service.sessionMode,
        });
        setIsCreateOpen(true);
    };

    const handleDeleteService = async (service: AdminServiceItem) => {
        const approved = await confirm({
            title: 'Delete Service',
            message: `Delete service ${service.code} (${service.name})?`,
            confirmText: 'Delete',
            tone: 'danger',
        });

        if (!approved) {
            return;
        }

        setServices((current) => current.filter((item) => item.id !== service.id));

        if (editingServiceId === service.id) {
            resetForm();
        }

        setFlashMessage(`Service ${service.code} deleted (mock).`);
    };

    const handleSaveService = async () => {
        const duration = Number(form.durationMinutes);

        if (!form.code.trim() || !form.name.trim() || !form.location.trim()) {
            setFlashMessage('Please complete service code, name, and location.');
            return;
        }

        if (!Number.isFinite(duration) || duration <= 0) {
            setFlashMessage('Please provide a valid session duration in minutes.');
            return;
        }

        const approved = await confirm(
            editingServiceId
                ? {
                      title: 'Update Service Session',
                      message: `Update service ${form.code} (${form.name})?`,
                      confirmText: 'Update Service',
                  }
                : {
                      title: 'Add Service Session',
                      message: `Add service ${form.code} (${form.name})?`,
                      confirmText: 'Add Service',
                  },
        );

        if (!approved) {
            return;
        }

        if (editingServiceId) {
            setServices((current) =>
                current.map((item) =>
                    item.id === editingServiceId
                        ? {
                              ...item,
                              code: form.code.trim(),
                              name: form.name.trim(),
                              durationMinutes: duration,
                              location: form.location.trim(),
                              status: form.status,
                              sessionMode: form.sessionMode,
                          }
                        : item,
                ),
            );
            setFlashMessage(`Service ${form.code.trim()} updated successfully (mock).`);
        } else {
            const newService: AdminServiceItem = {
                id: `SVC-${Date.now()}`,
                code: form.code.trim(),
                name: form.name.trim(),
                durationMinutes: duration,
                location: form.location.trim(),
                status: form.status,
                sessionMode: form.sessionMode,
            };

            setServices((current) => [newService, ...current]);
            setFlashMessage(`Service ${newService.code} added successfully (mock).`);
        }

        resetForm();
        setIsCreateOpen(false);
    };

    return (
        <>
            <Head title="Admin Service" />
            <AdminLayout
                title="Service"
                subtitle="Manage appointment services and add new service sessions"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">Service List</h2>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateOpen((current) => {
                                    const nextState = !current;
                                    if (!nextState) {
                                        resetForm();
                                    }
                                    return nextState;
                                });
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            {isCreateOpen ? 'Hide Form' : 'Add Service'}
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600 md:col-span-2">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by service code, name, location, or mode"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Status
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value as 'all' | ServiceStatus)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Location
                            <select
                                value={locationFilter}
                                onChange={(event) => setLocationFilter(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                {uniqueLocations.map((location) => (
                                    <option key={location} value={location}>
                                        {location === 'all' ? 'All Locations' : location}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{filteredServices.length} result(s)</p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Reset Filters
                        </button>
                    </div>

                    {isCreateOpen && (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                {editingServiceId ? 'Edit Service Session' : 'Add Service Session'}
                            </h3>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Service Code</span>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(event) => updateFormField('code', event.target.value)}
                                        placeholder="Example: SVC/006"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">Service Name</span>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) => updateFormField('name', event.target.value)}
                                        placeholder="Example: Crisis Counselling Session"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Duration (minutes)</span>
                                    <input
                                        type="number"
                                        min={15}
                                        step={5}
                                        value={form.durationMinutes}
                                        onChange={(event) =>
                                            updateFormField('durationMinutes', event.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Session Mode</span>
                                    <select
                                        value={form.sessionMode}
                                        onChange={(event) =>
                                            updateFormField(
                                                'sessionMode',
                                                event.target.value as SessionMode,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="online">Online</option>
                                        <option value="physical">Physical</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Status</span>
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            updateFormField(
                                                'status',
                                                event.target.value as ServiceStatus,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </label>

                                <label className="space-y-1 text-sm md:col-span-3">
                                    <span className="font-medium text-gray-700">Location</span>
                                    <select
                                        value={form.location}
                                        onChange={(event) => updateFormField('location', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        {adminServiceLocationOptions.map((locationOption) => (
                                            <option key={locationOption} value={locationOption}>
                                                {locationOption}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveService}
                                    className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                >
                                    {editingServiceId ? 'Update Service' : 'Save Service'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsCreateOpen(false);
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Code</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Service Name</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Mode</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Location</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredServices.map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-3 py-2 text-gray-700">{service.code}</td>
                                        <td className="px-3 py-2 text-gray-900">{service.name}</td>
                                        <td className="px-3 py-2 text-gray-700">{service.durationMinutes} min</td>
                                        <td className="px-3 py-2 text-gray-700">{normalizeServiceMode(service.sessionMode)}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(service.status)}`}
                                            >
                                                {service.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">{service.location}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditService(service)}
                                                    className="rounded-md border border-blue-300 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteService(service)}
                                                    className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredServices.length === 0 && (
                        <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            No services match your current search/filter.
                        </p>
                    )}
                </section>
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
