import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import {
    adminPortalMockData,
    getPsychometricTests,
    getResourceLibraryItems,
    PSYCHOMETRIC_TEST_STORAGE_KEY,
    PSYCHOMETRIC_TEST_UPDATED_EVENT,
    RESOURCE_LIBRARY_STORAGE_KEY,
    RESOURCE_LIBRARY_UPDATED_EVENT,
} from '@/lib/psycare-data';
import { getAdminManagedSchedule } from '@/lib/psycare-admin-slots';

export default function AdminDashboardPage() {
    const [psychometricTestCount, setPsychometricTestCount] = useState(
        getPsychometricTests().length,
    );
    const [resourceCount, setResourceCount] = useState(getResourceLibraryItems().length);

    useEffect(() => {
        const reloadCounts = () => {
            setPsychometricTestCount(getPsychometricTests().length);
            setResourceCount(getResourceLibraryItems().length);
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (
                event.key === PSYCHOMETRIC_TEST_STORAGE_KEY ||
                event.key === RESOURCE_LIBRARY_STORAGE_KEY
            ) {
                reloadCounts();
            }
        };

        window.addEventListener(PSYCHOMETRIC_TEST_UPDATED_EVENT, reloadCounts);
        window.addEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadCounts);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(PSYCHOMETRIC_TEST_UPDATED_EVENT, reloadCounts);
            window.removeEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadCounts);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const metrics = useMemo(() => {
        const requests = adminPortalMockData.appointmentRequests;
        const materials = adminPortalMockData.uploadedMaterials;

        return {
            pendingRequests: requests.filter((request) => request.status === 'pending').length,
            reviewRequired: requests.filter((request) => request.status === 'needs-review').length,
            psychometricTests: psychometricTestCount,
            resources: resourceCount,
            publishedMaterials: materials.filter((item) => item.visibility === 'published').length,
            scheduleDays: getAdminManagedSchedule().length,
        };
    }, [psychometricTestCount, resourceCount]);

    const cards = [
        {
            title: 'Appointment Queue',
            value: `${metrics.pendingRequests} pending / ${metrics.reviewRequired} review`,
            href: '/admin/appointments',
            action: 'Open Queue',
        },
        {
            title: 'Testing Materials',
            value: `${metrics.publishedMaterials} published`,
            href: '/admin/materials',
            action: 'Open Materials',
        },
        {
            title: 'Slot Manager',
            value: `${metrics.scheduleDays} schedule days`,
            href: '/admin/slots',
            action: 'Open Slot Manager',
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <AdminLayout
                title="Dashboard"
                subtitle="Navigate by module using the sidebar, same style as client portal"
            >
                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Psychometric Tests</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.psychometricTests}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Resources</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.resources}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Configured Schedule Days</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.scheduleDays}</p>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <article key={card.href} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                            <p className="mt-1 text-sm text-gray-600">{card.value}</p>
                            <Link
                                href={card.href}
                                className="mt-4 inline-flex rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                            >
                                {card.action}
                            </Link>
                        </article>
                    ))}
                </section>
            </AdminLayout>
        </>
    );
}
