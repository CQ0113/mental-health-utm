import { Head, router } from '@inertiajs/react';
import { Layout } from '@/components/psycare';
import { usePsycareLanguage } from '@/lib/psycare-language';

type AppointmentRecord = {
    id: string;
    referenceNo: string;
    date: string | null;
    slotLabel: string;
    counselorName: string;
    sessionType: 'physical' | 'online';
    status: string;
};

type PageProps = {
    appointments: AppointmentRecord[];
};

export default function PsyCareAppointmentHistoryPage({ appointments }: PageProps) {
    const language = usePsycareLanguage();

    const copy =
        language === 'en'
            ? {
                  title: 'Appointment Records',
                  subtitle: 'Past Appointments',
                  description: 'Select any previous appointment to continue as a follow-up request.',
                  referenceNo: 'Reference No',
                  date: 'Date',
                  slot: 'Slot',
                  counselor: 'Counselor',
                  sessionType: 'Session Type',
                  status: 'Status',
                  action: 'Action',
                  followUp: 'Follow Up',
                  unavailable: 'Unavailable',
                  online: 'Online',
                  physical: 'Physical',
                  empty: 'No appointment records yet.',
              }
            : {
                  title: 'Rekod Temujanji',
                  subtitle: 'Sejarah Temujanji',
                  description: 'Pilih mana-mana temujanji terdahulu untuk diteruskan sebagai permohonan susulan.',
                  referenceNo: 'No Rujukan',
                  date: 'Tarikh',
                  slot: 'Slot',
                  counselor: 'Kaunselor',
                  sessionType: 'Jenis Sesi',
                  status: 'Status',
                  action: 'Tindakan',
                  followUp: 'Susulan',
                  unavailable: 'Tidak Tersedia',
                  online: 'Online',
                  physical: 'Fizikal',
                  empty: 'Belum ada rekod temujanji.',
              };

    const statusLabels: Record<string, string> = {
        draft: 'Draft',
        pending: 'Pending',
        needs_review: 'Needs Review',
        counsellor_reviewing: 'Counsellor Reviewing',
        approved: 'Approved',
        on_going: 'On Going',
        complete: 'Complete',
        completed: 'Completed',
        follow_up: copy.followUp,
        closed: 'Closed',
    };

    const handleFollowUp = (record: AppointmentRecord) => {
        if (record.status !== 'follow_up') {
            return;
        }
        router.visit(`/psycare/permohonan?mode=followup&previous=${encodeURIComponent(record.id)}`);
    };

    return (
        <>
            <Head title={copy.title} />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">{copy.title}</p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">{copy.subtitle}</h2>
                    <p className="mt-1 text-sm text-gray-600">{copy.description}</p>

                    <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-700">
                                    <th className="px-4 py-3 font-semibold">{copy.referenceNo}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.date}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.slot}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.counselor}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.sessionType}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.status}</th>
                                    <th className="px-4 py-3 font-semibold">{copy.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                                            {copy.empty}
                                        </td>
                                    </tr>
                                )}
                                {appointments.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{record.referenceNo}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.date ?? '-'}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.slotLabel}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.counselorName}</td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {record.sessionType === 'online' ? copy.online : copy.physical}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{statusLabels[record.status] ?? record.status}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleFollowUp(record)}
                                                disabled={record.status !== 'follow_up'}
                                                className="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                                            >
                                                {record.status === 'follow_up' ? copy.followUp : copy.unavailable}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Layout>
        </>
    );
}
