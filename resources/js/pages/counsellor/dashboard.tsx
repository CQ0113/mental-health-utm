import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import {
    counsellorPortalMockData,
    getPsychometricResults,
    PSYCHOMETRIC_RESULTS_STORAGE_KEY,
    PSYCHOMETRIC_RESULTS_UPDATED_EVENT,
    type PsychometricResult,
} from '@/lib/psycare-data';
import { pastAppointments } from '@/lib/psycare-appointment-records';

export default function CounsellorDashboardPage() {
    const [recentPsychometricResults, setRecentPsychometricResults] = useState<PsychometricResult[]>([]);

    const upcomingAppointment = useMemo(
        () => pastAppointments.find((appointment) => appointment.status === 'open') ?? null,
        [],
    );

    useEffect(() => {
        const loadResults = () => {
            setRecentPsychometricResults(getPsychometricResults());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === PSYCHOMETRIC_RESULTS_STORAGE_KEY) {
                loadResults();
            }
        };

        loadResults();
        window.addEventListener(PSYCHOMETRIC_RESULTS_UPDATED_EVENT, loadResults);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(PSYCHOMETRIC_RESULTS_UPDATED_EVENT, loadResults);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const metrics = useMemo(() => {
        const total = counsellorPortalMockData.clients.length;
        const highRisk = counsellorPortalMockData.clients.filter((client) => client.latestRiskLevel === 'high').length;
        const moderateRisk = counsellorPortalMockData.clients.filter((client) => client.latestRiskLevel === 'moderate').length;

        return {
            total,
            highRisk,
            moderateRisk,
            tasks: counsellorPortalMockData.tasks.length,
            submissions: recentPsychometricResults.length,
        };
    }, [recentPsychometricResults.length]);

    const cards = [
        {
            title: 'Caseload',
            value: `${metrics.total} active clients`,
            href: '/counsellor/caseload',
            action: 'Open Caseload',
        },
        {
            title: 'Tasks',
            value: `${metrics.tasks} pending tasks`,
            href: '/counsellor/tasks',
            action: 'Open Tasks',
        },
        {
            title: 'Psychometric Results',
            value: `${metrics.submissions} latest submissions`,
            href: '/counsellor/assessments',
            action: 'Open Results',
        },
    ];

    const interventionTasks = useMemo(
        () =>
            [...counsellorPortalMockData.tasks].sort((first, second) => {
                const priorityRank = { high: 0, medium: 1, low: 2 } as const;
                return priorityRank[first.priority] - priorityRank[second.priority];
            }),
        [],
    );

    const getTaskBadgeClass = (priority: 'low' | 'medium' | 'high') => {
        if (priority === 'low') {
            return 'bg-slate-100 text-slate-700';
        }

        if (priority === 'medium') {
            return 'bg-amber-100 text-amber-800';
        }

        return 'bg-red-100 text-red-800';
    };

    return (
        <>
            <Head title="Counsellor Dashboard" />
            <CounsellorLayout
                title="Dashboard"
                subtitle="Use the sidebar modules to manage caseload, tasks, and assessments"
            >
                <section className="grid gap-4 md:grid-cols-4">
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Active Caseload</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.total}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">High Risk</p>
                        <p className="mt-2 text-2xl font-semibold text-red-700">{metrics.highRisk}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Moderate Risk</p>
                        <p className="mt-2 text-2xl font-semibold text-amber-700">{metrics.moderateRisk}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">New Test Results</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{metrics.submissions}</p>
                    </article>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-900">Upcoming Appointment</p>
                        {upcomingAppointment ? (
                            <>
                                <p className="mt-1 text-sm text-gray-600">{upcomingAppointment.referenceNo}</p>
                                <p className="mt-1 text-xs text-gray-600">
                                    {upcomingAppointment.date} • {upcomingAppointment.slot}
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                    Session: {upcomingAppointment.sessionType === 'online' ? 'Online' : 'Physical'}
                                </p>
                            </>
                        ) : (
                            <p className="mt-1 text-sm text-gray-600">No upcoming open appointment.</p>
                        )}
                        <Link
                            href="/counsellor/appointments"
                            className="mt-4 inline-flex rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                        >
                            Open Appointments
                        </Link>
                    </article>

                    {cards.map((card) => (
                        <article key={card.href} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                            <p className="mt-1 text-sm text-gray-600">{card.value}</p>
                            <Link
                                href={card.href}
                                className="mt-4 inline-flex rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                            >
                                {card.action}
                            </Link>
                        </article>
                    ))}
                </section>

                <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900">Tasks &amp; Interventions</h2>
                        <Link
                            href="/counsellor/tasks"
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Open Task Board
                        </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                        {interventionTasks.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                                No intervention tasks at the moment.
                            </p>
                        ) : (
                            interventionTasks.map((task) => (
                                <article
                                    key={task.id}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTaskBadgeClass(task.priority)}`}
                                        >
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600">Due: {task.dueAt}</p>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </CounsellorLayout>
        </>
    );
}
