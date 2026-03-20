import { Head } from '@inertiajs/react';
import { Layout, SmartJournal } from '@/components/psycare';

export default function PsyCareJurnalPintarPage() {
    return (
        <>
            <Head title="AI Counselor Chatbot" />
            <Layout>
                <SmartJournal />
            </Layout>
        </>
    );
}
