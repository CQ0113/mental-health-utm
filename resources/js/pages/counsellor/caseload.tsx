import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import { getMockClientById } from '@/lib/mock-clients';
import {
    CHATBOT_RISK_FLAG_STORAGE_KEY,
    CHATBOT_RISK_FLAG_UPDATED_EVENT,
    getChatbotRiskFlag,
} from '@/lib/psycare-data';
import type { ChatbotRiskFlag } from '@/lib/psycare-data';

type EmotionEntry = {
    date: string;
    score: number;
};

type MockPsychometricResult = {
    testCode: string;
    testTitle: string;
    submittedAt: string;
    scorePercent: number;
    aiRiskLevel: 'low' | 'moderate' | 'high';
    aiSummary: string;
};

type MockClientCase = {
    caseId: string;
    clientName: string;
    studentNo: string;
    email: string;
    status: 'open' | 'completed' | 'closed' | 'counsellor-reviewing';
    emotionHistory: EmotionEntry[];
    latestPsychometricResult: MockPsychometricResult | null;
    counsellorNotes: string;
};

const mockClientCase: MockClientCase = {
    // Keep caseload identity aligned with centralized mock client directory.
    caseId: 'CASE-UTM-2026-001',
    clientName: getMockClientById('CLT-006')?.preferredName ?? 'Nur Aisyah Binti Rahman',
    studentNo: getMockClientById('CLT-006')?.studentNo ?? 'A22CS0456',
    email: getMockClientById('CLT-006')?.email ?? 'aisyah.rahman@graduate.utm.my',
    status: 'open',
    emotionHistory: [
        { date: '2026-03-01', score: 4 },
        { date: '2026-03-02', score: 3 },
        { date: '2026-03-03', score: 5 },
        { date: '2026-03-04', score: 4 },
        { date: '2026-03-05', score: 3 },
    ],
    latestPsychometricResult: {
        testCode: 'DASS-21',
        testTitle: 'Depression Anxiety Stress Scales',
        submittedAt: '2026-03-04 10:30',
        scorePercent: 72,
        aiRiskLevel: 'high',
        aiSummary:
            'Elevated stress and anxiety indicators detected. Close follow-up is recommended.',
    },
    counsellorNotes:
        'Client reports academic pressure and sleep disruption. Monitor weekly and continue coping intervention.',
};

const getRiskBadgeClass = (risk: 'low' | 'moderate' | 'high') => {
    if (risk === 'low') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (risk === 'moderate') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-red-100 text-red-800';
};

const getOverallRiskLevel = (
    clientCase: MockClientCase,
    chatbotRiskFlag: ChatbotRiskFlag | null,
): 'low' | 'moderate' | 'high' => {
    const latestEmotionScore =
        clientCase.emotionHistory[clientCase.emotionHistory.length - 1]?.score ?? 5;
    const emotionRisk =
        latestEmotionScore >= 8
            ? 'high'
            : latestEmotionScore >= 4
              ? 'moderate'
              : 'low';

    if (
        chatbotRiskFlag?.severity === 'high' ||
        clientCase.latestPsychometricResult?.aiRiskLevel === 'high' ||
        emotionRisk === 'high'
    ) {
        return 'high';
    }

    if (
        chatbotRiskFlag?.severity === 'moderate' ||
        clientCase.latestPsychometricResult?.aiRiskLevel === 'moderate' ||
        emotionRisk === 'moderate'
    ) {
        return 'moderate';
    }

    return 'low';
};

export default function CounsellorCaseloadPage() {
    const [isRecordOpen, setIsRecordOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed' | 'closed'>('all');
    const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'moderate' | 'high'>('all');
    const [chatbotRiskFlag, setChatbotRiskFlag] = useState<ChatbotRiskFlag | null>(() =>
        getChatbotRiskFlag(),
    );

    useEffect(() => {
        const reloadChatbotRiskFlag = () => {
            setChatbotRiskFlag(getChatbotRiskFlag());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === CHATBOT_RISK_FLAG_STORAGE_KEY) {
                reloadChatbotRiskFlag();
            }
        };

        window.addEventListener(CHATBOT_RISK_FLAG_UPDATED_EVENT, reloadChatbotRiskFlag);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(CHATBOT_RISK_FLAG_UPDATED_EVENT, reloadChatbotRiskFlag);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const overallRisk = useMemo(
        () => getOverallRiskLevel(mockClientCase, chatbotRiskFlag),
        [chatbotRiskFlag],
    );

    const isCaseVisible = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchableText = [
            mockClientCase.caseId,
            mockClientCase.clientName,
            mockClientCase.studentNo,
            mockClientCase.email,
            mockClientCase.status,
        ]
            .join(' ')
            .toLowerCase();

        const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
        const matchesStatus = statusFilter === 'all' || mockClientCase.status === statusFilter;
        const matchesRisk = riskFilter === 'all' || overallRisk === riskFilter;

        return matchesSearch && matchesStatus && matchesRisk;
    }, [searchTerm, statusFilter, riskFilter, overallRisk]);

    return (
        <>
            <Head title="Counsellor Caseload" />
            <CounsellorLayout
                title="Caseload"
                subtitle="Track client risk indicators and upcoming sessions"
            >
                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by case ID, client name, student no, email, or status"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Status Filter
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value as 'all' | 'open' | 'completed' | 'closed',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                            </select>
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
                    </div>

                    {isCaseVisible ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    {mockClientCase.clientName}
                                </h2>
                                <p className="mt-1 text-xs text-gray-600">
                                    {mockClientCase.studentNo} • {mockClientCase.email}
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                    Case ID: {mockClientCase.caseId} • Status:{' '}
                                    {mockClientCase.status.toUpperCase()}
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskBadgeClass(overallRisk)}`}
                            >
                                {overallRisk.toUpperCase()} RISK
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsRecordOpen((current) => !current)}
                            className="mt-3 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                        >
                            {isRecordOpen ? 'Hide Mocked Record' : 'Open Mocked Record'}
                        </button>

                        {isRecordOpen && (
                            <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Daily Emotion History (1-10)
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                        {mockClientCase.emotionHistory.map((entry) => (
                                            <li key={entry.date}>
                                                {entry.date}: <span className="font-semibold">{entry.score}</span>/10
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Psychometric Test Result (if applicable)
                                    </p>
                                    {mockClientCase.latestPsychometricResult ? (
                                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                                            <p>
                                                {mockClientCase.latestPsychometricResult.testCode} —{' '}
                                                {mockClientCase.latestPsychometricResult.testTitle}
                                            </p>
                                            <p>
                                                Submitted: {mockClientCase.latestPsychometricResult.submittedAt}
                                            </p>
                                            <p>
                                                Score: {mockClientCase.latestPsychometricResult.scorePercent}%
                                            </p>
                                            <p>
                                                AI Risk:{' '}
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRiskBadgeClass(mockClientCase.latestPsychometricResult.aiRiskLevel)}`}
                                                >
                                                    {mockClientCase.latestPsychometricResult.aiRiskLevel.toUpperCase()}
                                                </span>
                                            </p>
                                            <p className="italic text-gray-600">
                                                {mockClientCase.latestPsychometricResult.aiSummary}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">
                                            No psychometric test submitted yet.
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm font-semibold text-gray-900">
                                        AI Chatbot Risk Flag
                                    </p>
                                    {chatbotRiskFlag ? (
                                        <div className="mt-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
                                            <p className="font-semibold">
                                                Flagged by chatbot ({chatbotRiskFlag.severity.toUpperCase()})
                                            </p>
                                            <p className="mt-1 text-xs text-yellow-800">
                                                {new Date(chatbotRiskFlag.flaggedAt).toLocaleString('en-GB')}
                                            </p>
                                            <p className="mt-2 text-xs text-yellow-900">
                                                Latest flagged message: “{chatbotRiskFlag.message}”
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">
                                            No chatbot risk flag detected for this client.
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-4 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">Counsellor Notes</p>
                                    <p className="mt-1">{mockClientCase.counsellorNotes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    ) : (
                        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                            No caseload record matches your search.
                        </p>
                    )}
                </section>
            </CounsellorLayout>
        </>
    );
}
