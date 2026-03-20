import { Head } from '@inertiajs/react';
import { ClientProfileForm, Layout } from '@/components/psycare';

export default function PsyCarePerkhidmatanPage() {
    return (
        <>
            <Head title="Perkhidmatan" />
            <Layout>
                <ClientProfileForm />
            </Layout>
        </>
    );
}
