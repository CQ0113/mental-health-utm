import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    dashboardMockData,
    type EmotionRecord,
    getPsychometricResults,
    getResourceLibraryItems,
    PSYCHOMETRIC_RESULTS_STORAGE_KEY,
    PSYCHOMETRIC_RESULTS_UPDATED_EVENT,
    type PsychometricResult,
    type PsycareAppointment,
    RESOURCE_LIBRARY_STORAGE_KEY,
    RESOURCE_LIBRARY_UPDATED_EVENT,
} from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';

const EMOTION_RECORDS_STORAGE_KEY = 'psycare.emotion.records';
type UpcomingAppointmentCardProps = {
    appointment: PsycareAppointment;
};

export function UpcomingAppointmentCard({
    appointment,
}: UpcomingAppointmentCardProps) {
    const language = usePsycareLanguage();
    const [isJoiningSession, setIsJoiningSession] = useState(false);

    const handleJoinSession = () => {
        setIsJoiningSession(true);
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                {language === 'en' ? 'Upcoming Session' : 'Sesi Akan Datang'}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {appointment.date}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
                {language === 'en' ? 'Counselor' : 'Kaunselor'}: {appointment.counselorName}
            </p>
            <button
                type="button"
                onClick={handleJoinSession}
                className="mt-4 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-yellow-500"
            >
                {language === 'en' ? 'Join Virtual Session' : 'Sertai Sesi Maya'}
            </button>

            {isJoiningSession && (
                <p className="mt-3 text-sm text-green-700">
                    {language === 'en'
                        ? 'Demo session launched. Video call link will be integrated with backend.'
                        : 'Sesi demo dibuka. Pautan panggilan video akan diintegrasi dengan backend.'}
                </p>
            )}
        </section>
    );
}

type EmotionTrackerWidgetProps = {
    emotionRecords: EmotionRecord[];
    setEmotionRecords: React.Dispatch<React.SetStateAction<EmotionRecord[]>>;
};

export function EmotionTrackerWidget({
    emotionRecords,
    setEmotionRecords,
}: EmotionTrackerWidgetProps) {
    const language = usePsycareLanguage();
    const todayIso = new Date().toISOString().slice(0, 10);
    const [emotionScore, setEmotionScore] = useState(6);
    const [emotionDate, setEmotionDate] = useState(todayIso);
    const [trackerMessage, setTrackerMessage] = useState('');

    const sortedRecords = [...emotionRecords].sort((first, second) =>
        first.date.localeCompare(second.date),
    );

    const recentRecords = sortedRecords.slice(-7);

    const getEmotionEmoji = (score: number) => {
        if (score <= 3) {
            return '😄';
        }
        if (score <= 6) {
            return '😐';
        }
        if (score <= 8) {
            return '😟';
        }
        return '😢';
    };

    const getMoodColor = (score: number) => {
        if (score <= 3) {
            return '#059669';
        }
        if (score <= 6) {
            return '#F59E0B';
        }
        return '#DC2626';
    };

    const latestScore =
        recentRecords.length > 0
            ? recentRecords[recentRecords.length - 1].score
            : emotionScore;

    const supportState =
        latestScore >= 8
            ? {
                  containerClass: 'border-red-200 bg-red-50 text-red-800',
                  title:
                      language === 'en'
                          ? 'You are not alone 💛'
                          : 'Anda tidak keseorangan 💛',
                  message:
                      language === 'en'
                          ? 'It seems today feels heavy. Take a short break, breathe slowly, and consider reaching out to your counselor or trusted friend.'
                          : 'Nampaknya hari ini terasa berat. Rehat seketika, tarik nafas perlahan, dan pertimbangkan untuk hubungi kaunselor atau rakan yang dipercayai.',
              }
                        : latestScore >= 4
              ? {
                    containerClass: 'border-amber-200 bg-amber-50 text-amber-800',
                    title:
                        language === 'en'
                            ? 'You are doing your best 🌤️'
                            : 'Anda sedang berusaha dengan baik 🌤️',
                    message:
                        language === 'en'
                            ? 'Your mood is in the middle range. Keep steady routines today—hydrate, eat well, and try one calming activity.'
                            : 'Mood anda berada di tahap sederhana. Kekalkan rutin stabil hari ini—minum air, makan dengan baik, dan cuba satu aktiviti menenangkan.',
                }
              : {
                    containerClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                    title:
                        language === 'en'
                            ? 'Great momentum today ✨'
                            : 'Momentum anda sangat baik hari ini ✨',
                    message:
                        language === 'en'
                            ? 'You are in a positive zone. Keep this momentum and consider journaling what helped you feel better.'
                            : 'Anda berada dalam zon positif. Kekalkan momentum ini dan cuba catat apa yang membantu anda rasa lebih baik.',
                };

    const averageScore =
        emotionRecords.length > 0
            ? (
                  emotionRecords.reduce(
                      (sum, record) => sum + record.score,
                      0,
                  ) / emotionRecords.length
              ).toFixed(1)
            : '0.0';

    const hasRecordedToday = emotionRecords.some(
        (record) => record.date === todayIso,
    );

    const formatShortDate = (date: string) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString(
            language === 'en' ? 'en-GB' : 'ms-MY',
            {
                day: '2-digit',
                month: 'short',
            },
        );
    };

    const handleLogEmotion = () => {
        if (emotionScore < 1 || emotionScore > 10) {
            setTrackerMessage(
                language === 'en'
                    ? 'Please enter an emotion score between 1 and 10.'
                    : 'Sila masukkan skor emosi antara 1 hingga 10.',
            );
            return;
        }

        if (emotionDate > todayIso) {
            setTrackerMessage(
                language === 'en'
                    ? 'Future emotion records are not allowed. Please select today or a past date.'
                    : 'Rekod emosi masa hadapan tidak dibenarkan. Sila pilih tarikh hari ini atau yang lepas.',
            );
            return;
        }

        setEmotionRecords((previousRecords) => {
            const existingIndex = previousRecords.findIndex(
                (record) => record.date === emotionDate,
            );

            if (existingIndex >= 0) {
                const updated = [...previousRecords];
                updated[existingIndex] = { date: emotionDate, score: emotionScore };
                return updated;
            }

            return [...previousRecords, { date: emotionDate, score: emotionScore }];
        });

        setTrackerMessage(
            language === 'en'
                ? 'Emotion record saved successfully (mock).'
                : 'Rekod emosi berjaya disimpan (mock).',
        );
    };

    const chartWidth = 560;
    const chartHeight = 220;
    const chartPaddingX = 28;
    const chartBottomY = 176;
    const chartTopY = 28;
    const stepX =
        recentRecords.length > 1
            ? (chartWidth - chartPaddingX * 2) / (recentRecords.length - 1)
            : 0;

    const points = recentRecords.map((record, index) => {
        const x = chartPaddingX + index * stepX;
        const normalized = (record.score - 1) / 9;
        const y = chartBottomY - normalized * (chartBottomY - chartTopY);

        return {
            ...record,
            x,
            y,
        };
    });

    const segments = points.slice(1).map((point, index) => {
        const previousPoint = points[index];
        const segmentMoodScore = Math.round((previousPoint.score + point.score) / 2);

        return {
            x1: previousPoint.x,
            y1: previousPoint.y,
            x2: point.x,
            y2: point.y,
            color: getMoodColor(segmentMoodScore),
        };
    });

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900">
                    {language === 'en' ? 'Daily Emotion Tracker' : 'Penjejak Emosi Harian'}
                </h3>
                <span className="text-sm font-medium text-gray-600">
                    {language === 'en' ? 'Average' : 'Purata'}: {averageScore}/10
                </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-4">
                    <p className="text-sm font-semibold text-gray-700">
                        📈{' '}
                        {language === 'en' ? 'Emotion Trend (Last 7 Records)' : 'Trend Emosi (7 Rekod Terkini)'}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-emerald-600" />
                            {language === 'en' ? 'Happiest (1-3)' : 'Paling Gembira (1-3)'}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-amber-500" />
                            {language === 'en' ? 'Medium (4-6)' : 'Sederhana (4-6)'}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-600" />
                            {language === 'en' ? 'Saddest (7-10)' : 'Paling Sedih (7-10)'}
                        </span>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                        <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="h-56 w-full min-w-[560px]"
                            role="img"
                            aria-label={
                                language === 'en'
                                    ? 'Emotion line graph'
                                    : 'Graf garis emosi'
                            }
                        >
                            {[0, 2, 4, 6, 8, 10].map((tick) => {
                                const tickY =
                                    chartBottomY - ((tick - 1) / 9) * (chartBottomY - chartTopY);

                                return (
                                    <g key={tick}>
                                        <line
                                            x1={chartPaddingX}
                                            x2={chartWidth - chartPaddingX}
                                            y1={tickY}
                                            y2={tickY}
                                            stroke="#E5E7EB"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={8}
                                            y={tickY + 4}
                                            fontSize="10"
                                            fill="#6B7280"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                );
                            })}

                            {segments.map((segment, index) => (
                                <line
                                    key={`${segment.x1}-${segment.y1}-${index}`}
                                    x1={segment.x1}
                                    y1={segment.y1}
                                    x2={segment.x2}
                                    y2={segment.y2}
                                    stroke={segment.color}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            ))}

                            {points.map((point) => (
                                <g key={point.date}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill={getMoodColor(point.score)}
                                    />
                                    <text
                                        x={point.x}
                                        y={point.y - 12}
                                        textAnchor="middle"
                                        fontSize="14"
                                    >
                                        {getEmotionEmoji(point.score)}
                                    </text>
                                    <text
                                        x={point.x}
                                        y={chartBottomY + 16}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#6B7280"
                                    >
                                        {formatShortDate(point.date)}
                                    </text>
                                    <text
                                        x={point.x}
                                        y={chartBottomY + 30}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#374151"
                                        fontWeight="700"
                                    >
                                        {point.score}/10
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                <label className="space-y-1 text-sm">
                    <span className="font-medium text-gray-700">
                        {language === 'en' ? 'Date' : 'Tarikh'}
                    </span>
                    <input
                        type="date"
                        value={emotionDate}
                        max={todayIso}
                        onChange={(event) => setEmotionDate(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    />
                </label>

                <label className="space-y-1 text-sm">
                    <span className="font-medium text-gray-700">
                        {language === 'en' ? 'Emotion Score (1-10)' : 'Skor Emosi (1-10)'}{' '}
                        {getEmotionEmoji(emotionScore)}
                    </span>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={emotionScore}
                        onChange={(event) => setEmotionScore(Number(event.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    />
                </label>

                <div className="md:col-span-2 md:flex md:items-end">
                    <button
                        type="button"
                        onClick={handleLogEmotion}
                        className="w-full rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                    >
                        {language === 'en' ? 'Save Emotion Record' : 'Simpan Rekod Emosi'}
                    </button>
                </div>

                <div
                    className={`rounded-lg border px-3 py-2 text-sm md:col-span-4 ${
                        hasRecordedToday
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                >
                    {hasRecordedToday
                        ? language === 'en'
                            ? '✅ You have already recorded today\'s emotion.'
                            : '✅ Anda telah merekod emosi hari ini.'
                        : language === 'en'
                          ? '⚠️ You have not recorded today\'s emotion yet. Please log it so your recommendations stay accurate.'
                          : '⚠️ Anda belum merekod emosi hari ini. Sila simpan rekod supaya cadangan anda lebih tepat.'}
                </div>
            </div>

            {trackerMessage && (
                <p className="mt-3 text-sm text-green-700">{trackerMessage}</p>
            )}

            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${supportState.containerClass}`}>
                <p className="font-semibold">
                    {supportState.title} {getEmotionEmoji(latestScore)}
                </p>
                <p className="mt-1">{supportState.message}</p>
            </div>
        </section>
    );
}

type RecommendationItem = {
    id: number;
    title: string;
    description: string;
    type: string;
    duration: string;
    url: string;
};

type RecommendedResourcesWidgetProps = {
    emotionRecords: EmotionRecord[];
};

export function RecommendedResourcesWidget({
    emotionRecords,
}: RecommendedResourcesWidgetProps) {
    const language = usePsycareLanguage();
    const [resourceItems, setResourceItems] = useState(() => getResourceLibraryItems());
    const [latestPsychometricResult, setLatestPsychometricResult] =
        useState<PsychometricResult | null>(null);

    useEffect(() => {
        const reloadResources = () => {
            setResourceItems(getResourceLibraryItems());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === RESOURCE_LIBRARY_STORAGE_KEY) {
                reloadResources();
            }
        };

        window.addEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadResources);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadResources);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    useEffect(() => {
        const loadLatestResult = () => {
            const sortedResults = [...getPsychometricResults()].sort(
                (first, second) =>
                    new Date(second.submittedAt).getTime() -
                    new Date(first.submittedAt).getTime(),
            );

            setLatestPsychometricResult(sortedResults[0] ?? null);
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === PSYCHOMETRIC_RESULTS_STORAGE_KEY) {
                loadLatestResult();
            }
        };

        loadLatestResult();
        window.addEventListener(PSYCHOMETRIC_RESULTS_UPDATED_EVENT, loadLatestResult);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(PSYCHOMETRIC_RESULTS_UPDATED_EVENT, loadLatestResult);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const latestEmotionScore = useMemo(() => {
        if (emotionRecords.length === 0) {
            return null;
        }

        const sortedRecords = [...emotionRecords].sort((first, second) =>
            first.date.localeCompare(second.date),
        );

        return sortedRecords[sortedRecords.length - 1].score;
    }, [emotionRecords]);

    const recommendationState = useMemo(() => {
        const emotionBand =
            latestEmotionScore === null
                ? 'unknown'
                                : latestEmotionScore >= 8
                  ? 'distressed'
                                    : latestEmotionScore >= 4
                    ? 'medium'
                    : 'positive';

        const riskBand = latestPsychometricResult?.riskLevel ?? 'unknown';

        if (riskBand === 'high' || emotionBand === 'distressed') {
            return {
                categoryOrder: ['support', 'anxiety', 'stress'] as const,
                titleEn: 'Priority Support Recommendations',
                titleMs: 'Cadangan Sokongan Keutamaan',
                summaryEn:
                    'Based on your recent emotion trend and psychometric result, focus on immediate support and anxiety/stress regulation resources.',
                summaryMs:
                    'Berdasarkan trend emosi terkini dan keputusan psikometrik anda, fokus pada sokongan segera serta sumber pengawalan kebimbangan/stres.',
            };
        }

        if (riskBand === 'moderate' || emotionBand === 'medium') {
            return {
                categoryOrder: ['anxiety', 'sleep', 'stress'] as const,
                titleEn: 'Stabilization Recommendations',
                titleMs: 'Cadangan Penstabilan',
                summaryEn:
                    'Your indicators suggest moderate pressure. These resources help you stabilize mood, sleep, and daily coping.',
                summaryMs:
                    'Petunjuk anda menunjukkan tekanan sederhana. Sumber ini membantu menstabilkan emosi, tidur, dan daya tindak harian.',
            };
        }

        return {
            categoryOrder: ['sleep', 'support', 'stress'] as const,
            titleEn: 'Wellbeing Maintenance Recommendations',
            titleMs: 'Cadangan Penyelenggaraan Kesejahteraan',
            summaryEn:
                'Your current indicators look stable. Continue strengthening healthy habits and preventive self-care skills.',
            summaryMs:
                'Petunjuk semasa anda nampak stabil. Teruskan mengukuhkan tabiat sihat dan kemahiran penjagaan diri pencegahan.',
        };
    }, [latestEmotionScore, latestPsychometricResult?.riskLevel]);

    const recommendedResources = useMemo<RecommendationItem[]>(() => {
        const ordered = recommendationState.categoryOrder.flatMap((category) =>
            resourceItems.filter((resource) => resource.category === category),
        );

        return ordered.slice(0, 3).map((resource) => ({
            id: resource.id,
            title: language === 'en' ? resource.titleEn : resource.titleMs,
            description:
                language === 'en' ? resource.descriptionEn : resource.descriptionMs,
            type: resource.type,
            duration: resource.duration,
            url: resource.url,
        }));
    }, [language, recommendationState.categoryOrder, resourceItems]);

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                {language === 'en' ? 'Personalized Learning Recommendations' : 'Cadangan Pembelajaran Peribadi'}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {language === 'en' ? recommendationState.titleEn : recommendationState.titleMs}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
                {language === 'en' ? recommendationState.summaryEn : recommendationState.summaryMs}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {language === 'en' ? 'Latest Emotion Score' : 'Skor Emosi Terkini'}:{' '}
                    {latestEmotionScore ?? '-'}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {language === 'en' ? 'Psychometric Risk' : 'Risiko Psikometrik'}:{' '}
                    {latestPsychometricResult
                        ? latestPsychometricResult.riskLevel.toUpperCase()
                        : language === 'en'
                          ? 'NOT AVAILABLE'
                          : 'TIADA'}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {recommendedResources.map((resource) => (
                    <article
                        key={resource.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                        <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                        <p className="mt-2 text-xs text-gray-500">
                            {resource.type} • {resource.duration}
                        </p>
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-semibold text-red-800 underline"
                        >
                            {language === 'en' ? 'Open Resource' : 'Buka Sumber'}
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function PsychometricTestCard() {
    const language = usePsycareLanguage();

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                {language === 'en' ? 'Psychometric Assessment' : 'Penilaian Psikometrik'}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Complete Admin-Uploaded Tests' : 'Lengkapkan Ujian Dimuat Naik Admin'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
                {language === 'en'
                    ? 'Choose available tests such as DASS, save drafts, and submit when complete.'
                    : 'Pilih ujian tersedia seperti DASS, simpan draf, dan hantar selepas lengkap.'}
            </p>
            <Link
                href="/psycare/ujian-psikometrik"
                className="mt-4 inline-flex rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
            >
                {language === 'en' ? 'Open Psychometric Test' : 'Buka Ujian Psikometrik'}
            </Link>
        </section>
    );
}

export default function Dashboard() {
    const upcomingAppointment = dashboardMockData.upcomingAppointment;
    const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>(
        dashboardMockData.initialEmotionRecords,
    );

    useEffect(() => {
        const storedEmotionRecords = localStorage.getItem(EMOTION_RECORDS_STORAGE_KEY);

        if (!storedEmotionRecords) {
            return;
        }

        try {
            const parsedRecords = JSON.parse(storedEmotionRecords) as EmotionRecord[];
            setEmotionRecords(parsedRecords);
        } catch {
            setEmotionRecords(dashboardMockData.initialEmotionRecords);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(EMOTION_RECORDS_STORAGE_KEY, JSON.stringify(emotionRecords));
        window.dispatchEvent(new Event('psycare:emotion-records-updated'));
    }, [emotionRecords]);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <EmotionTrackerWidget
                emotionRecords={emotionRecords}
                setEmotionRecords={setEmotionRecords}
            />
            <UpcomingAppointmentCard appointment={upcomingAppointment} />
            <PsychometricTestCard />
            <RecommendedResourcesWidget emotionRecords={emotionRecords} />
        </div>
    );
}
