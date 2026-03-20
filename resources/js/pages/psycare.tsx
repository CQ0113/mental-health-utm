import { Head } from '@inertiajs/react';
import {
    ClientProfileForm,
    Dashboard,
    Layout,
    PeerSupportForum,
    SmartJournal,
} from '@/components/psycare';

export default function PsyCare() {
    return (
        <>
            <Head title="PsyCare 2.0" />

            <Layout>
                <div className="space-y-6">
                    <section id="dashboard" className="scroll-mt-24">
                        <Dashboard />
                    </section>

                    <section id="permohonan" className="scroll-mt-24 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Permohonan (Borang Temujanji Pintar)</h2>
                                <p className="mt-1 text-sm text-gray-600">Hantar permohonan sesi kaunseling dengan kaedah temujanji pintar.</p>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                            >
                                Buka Borang
                            </button>
                        </div>
                    </section>

                    <section id="jurnal-pintar" className="scroll-mt-24">
                        <SmartJournal />
                    </section>

                    <section id="forum-sokongan" className="scroll-mt-24">
                        <PeerSupportForum />
                    </section>

                    <section id="perkhidmatan" className="scroll-mt-24">
                        <ClientProfileForm />
                    </section>
                </div>
            </Layout>
        </>
    );
}
