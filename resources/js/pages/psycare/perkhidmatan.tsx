import { Head } from '@inertiajs/react';
import { ClientProfileForm, Layout } from '@/components/psycare';
import type { MyClientProfile } from '@/components/psycare/ClientProfileForm';

type PageProps = {
    myClientProfile: MyClientProfile | null;
};

export default function PsyCarePerkhidmatanPage({ myClientProfile }: PageProps) {
    return (
        <>
            <Head title="Perkhidmatan" />
            <Layout>
                <ClientProfileForm myClientProfile={myClientProfile} />
            </Layout>
        </>
    );
}
