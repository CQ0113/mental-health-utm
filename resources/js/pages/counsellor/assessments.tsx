import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import {
    getPsychometricResults,
    PSYCHOMETRIC_RESULTS_STORAGE_KEY,
    PSYCHOMETRIC_RESULTS_UPDATED_EVENT,
    type PsychometricResult,
} from '@/lib/psycare-data';

const formatDateTime = (dateValue: string) =>
    new Date(dateValue).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const getRiskBadgeClass = (risk: 'low' | 'moderate' | 'high') => {
    if (risk === 'low') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (risk === 'moderate') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-red-100 text-red-800';
};

export default function CounsellorAssessmentsPage() {
    const [results, setResults] = useState<PsychometricResult[]>([]);
    const [actionMessage, setActionMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'moderate' | 'high'>('all');
    const [contactFilter, setContactFilter] = useState<'all' | 'required' | 'not-required'>('all');

    const handleContactClient = (result: PsychometricResult) => {
        const clientName = result.submittedByName ?? 'Unknown Client';
        const clientEmail = result.submittedByEmail ?? 'No email available';

        setActionMessage(
            `Contact workflow opened for ${clientName} (${clientEmail}) based on ${result.riskLevel.toUpperCase()} risk score.`,
        );
    };

    useEffect(() => {
        const loadResults = () => {
            const sortedResults = [...getPsychometricResults()].sort(
                (first, second) =>
                    new Date(second.submittedAt).getTime() -
                    new Date(first.submittedAt).getTime(),
            );
            setResults(sortedResults);
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

    const filteredResults = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return results.filter((result) => {
            const searchableText = [
                result.id,
                result.testCode,
                result.testTitleEn,
                result.submittedByName ?? '',
                result.submittedByStudentNo ?? '',
                result.submittedByEmail ?? '',
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
            const matchesRisk = riskFilter === 'all' || result.riskLevel === riskFilter;
            const needsContact = result.riskLevel !== 'low';
            const matchesContact =
                contactFilter === 'all' ||
                (contactFilter === 'required' && needsContact) ||
                (contactFilter === 'not-required' && !needsContact);

            return matchesSearch && matchesRisk && matchesContact;
        });
    }, [results, searchTerm, riskFilter, contactFilter]);

    return (
        <>
            <Head title="Counsellor Assessments" />
            <CounsellorLayout
                title="Psychometric Results"
                subtitle="Review latest AI-generated psychometric submissions"
            >
                {actionMessage && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {actionMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">Latest AI Psychometric Submissions</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by client, student no, test, email, or ID"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Risk Filter
                            <select
                                value={riskFilter}
                                onChange={(event) =>
                                    setRiskFilter(
                                        event.target.value as 'all' | 'low' | 'moderate' | 'high',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">All Risks</option>
                                <option value="high">High</option>
                                <option value="moderate">Moderate</option>
                                <option value="low">Low</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Contact Filter
                            <select
                                value={contactFilter}
                                onChange={(event) =>
                                    setContactFilter(
                                        event.target.value as 'all' | 'required' | 'not-required',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">All Submissions</option>
                                <option value="required">Contact Required</option>
                                <option value="not-required">Contact Not Required</option>
                            </select>
                        </label>
                    </div>
                    {results.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            No submitted psychometric results yet from clients.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {filteredResults.map((result) => (
                                <article key={result.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {result.submittedByName ?? 'Unknown Client'}
                                            </p>
                                            <p className="mt-0.5 text-xs font-medium text-gray-600">
                                                {result.testTitleEn}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskBadgeClass(result.riskLevel)}`}
                                        >
                                            {result.riskLevel.toUpperCase()} RISK
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Score: {result.totalScore}/{result.maxScore} ({result.scorePercent}%) • Submitted: {formatDateTime(result.submittedAt)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600">
                                        Client: {result.submittedByName ?? 'Unknown'}
                                        {' • '}
                                        Student No: {result.submittedByStudentNo ?? 'Unknown'}
                                        {' • '}
                                        Contact: {result.submittedByEmail ?? 'Not provided'}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-700">{result.aiSummaryEn}</p>

                                    {result.riskLevel !== 'low' && (
                                        <button
                                            type="button"
                                            onClick={() => handleContactClient(result)}
                                            className="mt-3 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                                        >
                                            Contact Client
                                        </button>
                                    )}
                                </article>
                            ))}

                            {filteredResults.length === 0 && (
                                <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                    No psychometric submissions match your search.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </CounsellorLayout>
        </>
    );
}
