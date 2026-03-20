import { Head } from '@inertiajs/react';
import { Dashboard, Layout } from '@/components/psycare';

export default function PsyCareDashboardPage() {
    return (
        <>
            <Head title="PsyCare Dashboard" />
            <Layout>
                <Dashboard />
            </Layout>
        </>
    );
}
