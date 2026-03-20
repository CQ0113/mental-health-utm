import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/psycare';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import {
    generatePsychometricAiResult,
    getPsychometricResults,
    getPsychometricTests,
    PSYCHOMETRIC_TEST_STORAGE_KEY,
    PSYCHOMETRIC_TEST_UPDATED_EVENT,
    requestFormMockSeed,
    savePsychometricResults,
    type PsychometricResult,
    type PsychometricRiskLevel,
    psychometricTestOptions,
    type PsychometricTest,
} from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';

type ResponsesMap = Record<string, string>;

type DraftStore = Record<string, ResponsesMap>;

const DRAFT_STORAGE_KEY = 'psycare.psychometric.drafts';

const formatUploadDate = (dateValue: string, language: 'ms' | 'en') =>
    new Date(`${dateValue}T00:00:00`).toLocaleDateString(
        language === 'en' ? 'en-GB' : 'ms-MY',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        },
    );

const formatSubmittedAt = (dateValue: string, language: 'ms' | 'en') =>
    new Date(dateValue).toLocaleString(language === 'en' ? 'en-GB' : 'ms-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const getRiskBadgeClass = (riskLevel: PsychometricRiskLevel) => {
    if (riskLevel === 'low') {
        return 'bg-emerald-100 text-emerald-800';
    }

    if (riskLevel === 'moderate') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-red-100 text-red-800';
};

export default function PsycarePsychometricTestPage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const language = usePsycareLanguage();
    const [availableTests, setAvailableTests] = useState<PsychometricTest[]>(() =>
        getPsychometricTests(),
    );
    const [selectedTestId, setSelectedTestId] = useState(getPsychometricTests()[0]?.id ?? '');
    const [responses, setResponses] = useState<ResponsesMap>({});
    const [draftsByTest, setDraftsByTest] = useState<DraftStore>({});
    const [resultHistory, setResultHistory] = useState<PsychometricResult[]>(() =>
        getPsychometricResults(),
    );
    const [draftMessage, setDraftMessage] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');

    const copy = language === 'en'
        ? {
              title: 'Psychometric Test',
              subtitle: 'Client Self-Assessment',
              description:
                  'Testing forms are uploaded by admin. Choose a test, complete the items, and either save as draft or submit when done.',
              source: 'Source: Admin uploaded tests (mocked data).',
              chooseTest: 'Choose Test',
              testCode: 'Test Code',
              uploadedDate: 'Uploaded by Admin On',
              category: 'Category',
              estimate: 'Estimated Duration',
              minutes: 'minutes',
              progress: 'Progress',
              answered: 'answered',
              saveDraft: 'Save Draft',
              submit: 'Submit Test',
              optionPlaceholder: '-- Select answer --',
              saveSuccess: 'Draft saved successfully (mock). You can continue later.',
              submitSuccess:
                  'Test submitted successfully. AI scoring has been generated and added to your results history (mock).',
              incomplete:
                  'Please complete all questions before submitting. You may also save as draft first.',
              noTests: 'No psychometric tests are currently uploaded by admin.',
              resultsTitle: 'Past Test Results (AI Scoring)',
              noResults: 'No completed test results yet. Submit a test to view AI scoring here.',
              submittedAt: 'Submitted On',
              score: 'Mental Health Score',
              riskLevel: 'AI Risk Level',
              aiSummary: 'AI Summary',
              aiRecommendation: 'AI Recommendation',
              low: 'Low',
              moderate: 'Moderate',
              high: 'High',
          }
        : {
              title: 'Ujian Psikometrik',
              subtitle: 'Penilaian Kendiri Klien',
              description:
                  'Borang ujian dimuat naik oleh admin. Pilih ujian, jawab item, dan simpan sebagai draf atau hantar selepas lengkap.',
              source: 'Sumber: Ujian dimuat naik oleh admin (data mock).',
              chooseTest: 'Pilih Ujian',
              testCode: 'Kod Ujian',
              uploadedDate: 'Dimuat Naik Oleh Admin Pada',
              category: 'Kategori',
              estimate: 'Anggaran Tempoh',
              minutes: 'minit',
              progress: 'Kemajuan',
              answered: 'dijawab',
              saveDraft: 'Simpan Draf',
              submit: 'Hantar Ujian',
              optionPlaceholder: '-- Pilih jawapan --',
              saveSuccess: 'Draf berjaya disimpan (mock). Anda boleh sambung kemudian.',
              submitSuccess:
                  'Ujian berjaya dihantar. Skor AI telah dijana dan ditambah ke sejarah keputusan anda (mock).',
              incomplete:
                  'Sila lengkapkan semua soalan sebelum menghantar. Anda juga boleh simpan sebagai draf dahulu.',
              noTests: 'Tiada ujian psikometrik dimuat naik oleh admin pada masa ini.',
              resultsTitle: 'Sejarah Keputusan Ujian (Skor AI)',
              noResults: 'Belum ada keputusan ujian lengkap. Hantar ujian untuk lihat skor AI di sini.',
              submittedAt: 'Dihantar Pada',
              score: 'Skor Kesihatan Mental',
              riskLevel: 'Tahap Risiko AI',
              aiSummary: 'Ringkasan AI',
              aiRecommendation: 'Cadangan AI',
              low: 'Rendah',
              moderate: 'Sederhana',
              high: 'Tinggi',
          };

    useEffect(() => {
        const reloadTests = () => {
            const tests = getPsychometricTests();
            setAvailableTests(tests);
            setSelectedTestId((previous) => {
                if (tests.some((test) => test.id === previous)) {
                    return previous;
                }

                return tests[0]?.id ?? '';
            });
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === PSYCHOMETRIC_TEST_STORAGE_KEY) {
                reloadTests();
            }
        };

        window.addEventListener(PSYCHOMETRIC_TEST_UPDATED_EVENT, reloadTests);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(PSYCHOMETRIC_TEST_UPDATED_EVENT, reloadTests);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    useEffect(() => {
        const storedDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);

        if (storedDrafts) {
            try {
                const parsedDrafts = JSON.parse(storedDrafts) as DraftStore;
                setDraftsByTest(parsedDrafts);
            } catch {
                setDraftsByTest({});
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftsByTest));
    }, [draftsByTest]);

    useEffect(() => {
        savePsychometricResults(resultHistory);
    }, [resultHistory]);

    const selectedTest = useMemo<PsychometricTest | undefined>(
        () => availableTests.find((test) => test.id === selectedTestId),
        [availableTests, selectedTestId],
    );

    useEffect(() => {
        if (!selectedTest) {
            setResponses({});
            return;
        }

        setResponses(draftsByTest[selectedTest.id] ?? {});
        setDraftMessage('');
        setSubmitMessage('');
    }, [selectedTest, draftsByTest]);

    const answeredCount = selectedTest
        ? selectedTest.questions.filter((question) => responses[question.id]).length
        : 0;

    const totalCount = selectedTest?.questions.length ?? 0;

    const sortedResultHistory = useMemo(() => {
        return [...resultHistory].sort(
            (first, second) =>
                new Date(second.submittedAt).getTime() -
                new Date(first.submittedAt).getTime(),
        );
    }, [resultHistory]);

    const getRiskLevelLabel = (riskLevel: PsychometricRiskLevel) => {
        if (riskLevel === 'low') {
            return copy.low;
        }

        if (riskLevel === 'moderate') {
            return copy.moderate;
        }

        return copy.high;
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setResponses((current) => ({
            ...current,
            [questionId]: value,
        }));
    };

    const handleSaveDraft = () => {
        if (!selectedTest) {
            return;
        }

        setDraftsByTest((current) => ({
            ...current,
            [selectedTest.id]: responses,
        }));
        setSubmitMessage('');
        setDraftMessage(copy.saveSuccess);
    };

    const handleSubmit = async () => {
        if (!selectedTest) {
            return;
        }

        const approved = await confirm({
            title: language === 'en' ? 'Submit Test' : 'Hantar Ujian',
            message:
                language === 'en'
                    ? 'Submit this psychometric test now?'
                    : 'Hantar ujian psikometrik ini sekarang?',
            confirmText: language === 'en' ? 'Submit' : 'Hantar',
        });

        if (!approved) {
            return;
        }

        const isComplete = selectedTest.questions.every((question) => responses[question.id]);

        if (!isComplete) {
            setSubmitMessage(copy.incomplete);
            return;
        }

        setDraftsByTest((current) => {
            const updated = { ...current };
            delete updated[selectedTest.id];
            return updated;
        });

        const aiResult = generatePsychometricAiResult(selectedTest, responses, {
            name: requestFormMockSeed.studentName,
            studentNo: requestFormMockSeed.studentNo,
            email: `${requestFormMockSeed.studentNo.toLowerCase()}@graduate.utm.my`,
        });

        setResultHistory((current) => [aiResult, ...current]);
        setResponses({});
        setDraftMessage('');
        setSubmitMessage(copy.submitSuccess);
    };

    return (
        <>
            <Head title="Ujian Psikometrik" />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        {copy.title}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">{copy.subtitle}</h2>
                    <p className="mt-1 text-sm text-gray-600">{copy.description}</p>
                    <p className="mt-2 text-xs font-medium text-yellow-800">{copy.source}</p>

                    {availableTests.length === 0 ? (
                        <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            {copy.noTests}
                        </p>
                    ) : (
                        <>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">{copy.chooseTest}</span>
                                    <select
                                        value={selectedTestId}
                                        onChange={(event) => setSelectedTestId(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    >
                                        {availableTests.map((test) => (
                                            <option key={test.id} value={test.id}>
                                                {language === 'en' ? test.titleEn : test.titleMs}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {selectedTest && (
                                <>
                                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                        <p>
                                            <span className="font-semibold text-gray-900">{copy.testCode}:</span>{' '}
                                            {selectedTest.code}
                                        </p>
                                        <p className="mt-1">
                                            <span className="font-semibold text-gray-900">{copy.category}:</span>{' '}
                                            {selectedTest.category}
                                        </p>
                                        <p className="mt-1">
                                            <span className="font-semibold text-gray-900">{copy.uploadedDate}:</span>{' '}
                                            {formatUploadDate(selectedTest.uploadedByAdminAt, language)}
                                        </p>
                                        <p className="mt-1">
                                            <span className="font-semibold text-gray-900">{copy.estimate}:</span>{' '}
                                            {selectedTest.estimatedMinutes} {copy.minutes}
                                        </p>
                                        <p className="mt-2 text-gray-600">
                                            {language === 'en'
                                                ? selectedTest.descriptionEn
                                                : selectedTest.descriptionMs}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-red-800">
                                            {copy.progress}: {answeredCount}/{totalCount} {copy.answered}
                                        </p>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {selectedTest.questions.map((question, index) => (
                                            <div
                                                key={question.id}
                                                className="rounded-lg border border-gray-200 bg-white p-4"
                                            >
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {index + 1}.{' '}
                                                    {language === 'en'
                                                        ? question.promptEn
                                                        : question.promptMs}
                                                </p>
                                                <select
                                                    value={responses[question.id] ?? ''}
                                                    onChange={(event) =>
                                                        handleAnswerChange(question.id, event.target.value)
                                                    }
                                                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                                >
                                                    <option value="">{copy.optionPlaceholder}</option>
                                                    {psychometricTestOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {language === 'en'
                                                                ? option.labelEn
                                                                : option.labelMs}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleSaveDraft}
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                                        >
                                            {copy.saveDraft}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                                        >
                                            {copy.submit}
                                        </button>
                                    </div>

                                    {draftMessage && (
                                        <p className="mt-3 text-sm text-green-700">{draftMessage}</p>
                                    )}

                                    {submitMessage && (
                                        <p className="mt-2 text-sm text-green-700">{submitMessage}</p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h3 className="text-base font-semibold text-gray-900">{copy.resultsTitle}</h3>

                        {sortedResultHistory.length === 0 ? (
                            <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                {copy.noResults}
                            </p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {sortedResultHistory.map((result) => (
                                    <article
                                        key={result.id}
                                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {language === 'en'
                                                        ? result.testTitleEn
                                                        : result.testTitleMs}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {copy.testCode}: {result.testCode} • {copy.submittedAt}:{' '}
                                                    {formatSubmittedAt(result.submittedAt, language)}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskBadgeClass(result.riskLevel)}`}
                                            >
                                                {copy.riskLevel}: {getRiskLevelLabel(result.riskLevel)}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">{copy.score}:</span>{' '}
                                            {result.totalScore}/{result.maxScore} ({result.scorePercent}%)
                                        </p>
                                        <p className="mt-2 text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">{copy.aiSummary}:</span>{' '}
                                            {language === 'en'
                                                ? result.aiSummaryEn
                                                : result.aiSummaryMs}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">{copy.aiRecommendation}:</span>{' '}
                                            {language === 'en'
                                                ? result.aiRecommendationEn
                                                : result.aiRecommendationMs}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </Layout>
            {confirmDialog}
        </>
    );
}
