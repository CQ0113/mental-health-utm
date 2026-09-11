import { Head } from '@inertiajs/react';
import { ClientProfileForm, Layout } from '@/components/psycare';
import type { MyClientProfile, MyDeclaration } from '@/components/psycare/ClientProfileForm';

type PageProps = {
    myClientProfile: MyClientProfile | null;
    myDeclaration: MyDeclaration | null;
    declarationText: string;
};

export default function PsyCarePerkhidmatanPage({
    myClientProfile,
    myDeclaration,
    declarationText,
}: PageProps) {
    return (
        <>
            <Head title="Perkhidmatan" />
            <Layout>
                <ClientProfileForm
                    myClientProfile={myClientProfile}
                    myDeclaration={myDeclaration}
                    declarationText={declarationText}
                />
            </Layout>
        </>
    );
}
