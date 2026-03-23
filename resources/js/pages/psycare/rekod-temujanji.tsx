import { Head, router } from '@inertiajs/react';
import { Layout } from '@/components/psycare';
import type {AppointmentRecord} from '@/lib/psycare-appointment-records';
import {
    pastAppointments,
} from '@/lib/psycare-appointment-records';
import { usePsycareLanguage } from '@/lib/psycare-language';

export default function PsyCareAppointmentHistoryPage() {
    const language = usePsycareLanguage();

    const copy =
        language === 'en'
            ? {
                  title: 'Appointment Records',
                  subtitle: 'Past Appointments',
                  description:
                      'Select any previous appointment to continue as a follow-up request.',
                  referenceNo: 'Reference No',
                  date: 'Date',
                  slot: 'Slot',
                  counselor: 'Counselor',
                  sessionType: 'Session Type',
                  status: 'Status',
                  action: 'Action',
                  followUp: 'Follow Up',
                                    open: 'Open',
                                    closed: 'Closed',
                                    unavailable: 'Unavailable',
                  online: 'Online',
                  physical: 'Physical',
              }
            : {
                  title: 'Rekod Temujanji',
                  subtitle: 'Sejarah Temujanji',
                  description:
                      'Pilih mana-mana temujanji terdahulu untuk diteruskan sebagai permohonan susulan.',
                  referenceNo: 'No Rujukan',
                  date: 'Tarikh',
                  slot: 'Slot',
                  counselor: 'Kaunselor',
                  sessionType: 'Jenis Sesi',
                  status: 'Status',
                  action: 'Tindakan',
                  followUp: 'Susulan',
                  open: 'Buka',
                  closed: 'Tutup',
                  unavailable: 'Tidak Tersedia',
                  online: 'Online',
                  physical: 'Fizikal',
              };


    const handleFollowUp = (referenceNo: string, status: AppointmentRecord['status']) => {
        if (status !== 'follow-up') {
            return;
        }
        router.visit(`/psycare/permohonan?mode=followup&reference=${encodeURIComponent(referenceNo)}`);
    };

    return (
        <>
            <Head title={copy.title} />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        {copy.title}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">
                        {copy.subtitle}
                    </h2>
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
                                {pastAppointments.map((record) => (
                                    <tr key={record.referenceNo}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{record.referenceNo}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.date}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.slot}</td>
                                        <td className="px-4 py-3 text-gray-700">{record.counselor}</td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {record.sessionType === 'online'
                                                ? copy.online
                                                : copy.physical}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {record.status === 'follow-up' ? copy.followUp : record.status === 'open' ? copy.open : copy.closed}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleFollowUp(record.referenceNo, record.status)}
                                                disabled={record.status !== 'follow-up'}
                                                className="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                                            >
                                                {record.status === 'follow-up' ? copy.followUp : copy.unavailable}
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
