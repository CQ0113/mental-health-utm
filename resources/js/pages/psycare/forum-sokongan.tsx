import { Head } from '@inertiajs/react';
import { Layout, PeerSupportForum } from '@/components/psycare';

export default function PsyCareForumSokonganPage() {
    return (
        <>
            <Head title="Forum Sokongan" />
            <Layout>
                <PeerSupportForum />
            </Layout>
        </>
    );
}
