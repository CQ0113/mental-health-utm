import { getMockClientById } from '@/lib/mock-clients';

export type PsycareAppointment = {
    date: string;
    counselorName: string;
};

export type EmotionRecord = {
    date: string;
    score: number;
};

export type ForumThread = {
    id: number;
    title: string;
    timestamp: string;
    category: string;
    supportCount: number;
};

export type ForumPost = {
    id: number;
    title: string;
    content: string;
    timestamp: string;
    category: string;
    supportCount: number;
    safetyScore: number;
    moderationReason: string;
    isPublished: boolean;
    isHidden: boolean;
    isDeleted: boolean;
};

export type ResourceItem = {
    id: number;
    titleMs: string;
    titleEn: string;
    descriptionMs: string;
    descriptionEn: string;
    category: 'stress' | 'anxiety' | 'sleep' | 'support';
    type: 'Artikel' | 'Video' | 'Toolkit';
    duration: string;
    url: string;
};

export type ClientProfileSeed = {
    fullName: string;
    nationalId: string;
    currentAddress: string;
    maritalStatus: string;
    dependentCount: number;
    treatmentHistory: string;
    currentMedications: string;
    studyInfo: {
        matricNo: string;
        program: string;
        faculty: string;
    };
};

export type RequestApplicantSeed = {
    studentNo: string;
    studentName: string;
    faculty: string;
    clientType: string;
    sessionNeed: string;
    location: string;
    attendedBefore: string;
    issueSummary: string;
    attachmentDescription: string;
    applicantNote: string;
};

export type PsychometricQuestion = {
    id: string;
    promptMs: string;
    promptEn: string;
};

export type PsychometricTest = {
    id: string;
    code: string;
    titleMs: string;
    titleEn: string;
    descriptionMs: string;
    descriptionEn: string;
    category: string;
    estimatedMinutes: number;
    uploadedByAdminAt: string;
    questions: PsychometricQuestion[];
};

export type PsychometricRiskLevel = 'low' | 'moderate' | 'high';

export type PsychometricResult = {
    id: string;
    testId: string;
    testCode: string;
    testTitleMs: string;
    testTitleEn: string;
    submittedByName?: string;
    submittedByStudentNo?: string;
    submittedByEmail?: string;
    submittedAt: string;
    totalScore: number;
    maxScore: number;
    scorePercent: number;
    riskLevel: PsychometricRiskLevel;
    aiSummaryMs: string;
    aiSummaryEn: string;
    aiRecommendationMs: string;
    aiRecommendationEn: string;
};

export type AdminAppointmentRequest = {
    id: string;
    clientName: string;
    sessionType: 'physical' | 'online';
    preferredDate: string;
    clientFollowUpRequested: boolean;
    counsellorContinuationNeeded: boolean | null;
    status:
        | 'pending'
        | 'needs-review'
        | 'counsellor-reviewing'
        | 'approved'
        | 'on-going'
        | 'complete'
        | 'completed'
        | 'follow-up'
        | 'closed';
};

export type AdminUploadedMaterial = {
    id: string;
    name: string;
    type: 'Psychometric Test' | 'Resource' | 'Form';
    uploadedAt: string;
    visibility: 'published' | 'draft';
};

export type CounsellorClient = {
    id: string;
    name: string;
    latestEmotionScore: number;
    latestRiskLevel: PsychometricRiskLevel;
    nextSessionAt: string;
};

export type CounsellorTask = {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    dueAt: string;
};

export type ChatbotRiskFlag = {
    flaggedAt: string;
    message: string;
    severity: 'moderate' | 'high';
    source: 'ai-chatbot';
};

export const PSYCHOMETRIC_TEST_STORAGE_KEY = 'psycare.admin.psychometric-tests';
export const PSYCHOMETRIC_RESULTS_STORAGE_KEY = 'psycare.psychometric.results';
export const RESOURCE_LIBRARY_STORAGE_KEY = 'psycare.admin.resource-library';
export const FORUM_POST_STORAGE_KEY = 'psycare.forum.posts';
export const CHATBOT_RISK_FLAG_STORAGE_KEY = 'psycare.chatbot.risk-flag';
export const PSYCHOMETRIC_TEST_UPDATED_EVENT = 'psycare:psychometric-tests-updated';
export const PSYCHOMETRIC_RESULTS_UPDATED_EVENT = 'psycare:psychometric-results-updated';
export const RESOURCE_LIBRARY_UPDATED_EVENT = 'psycare:resource-library-updated';
export const FORUM_POST_UPDATED_EVENT = 'psycare:forum-posts-updated';
export const CHATBOT_RISK_FLAG_UPDATED_EVENT = 'psycare:chatbot-risk-flag-updated';

const primaryApplicantClient = getMockClientById('CLT-001');
const profileClient = getMockClientById('CLT-002');
const appointmentClientOne = getMockClientById('CLT-001');
const appointmentClientTwo = getMockClientById('CLT-002');
const appointmentClientThree = getMockClientById('CLT-003');

export const dashboardMockData = {
    upcomingAppointment: {
        date: '11 Mac 2026, 10:30 AM',
        counselorName: 'Pn. Aisyah Rahman',
    } as PsycareAppointment,
    initialMiniJournal:
        'Hari ini saya rasa sedikit cemas tentang tugasan akhir, tetapi saya cuba uruskan dengan lebih teratur.',
    initialEmotionRecords: [
        { date: '2026-02-22', score: 4 },
        { date: '2026-02-23', score: 5 },
        { date: '2026-02-24', score: 6 },
        { date: '2026-02-25', score: 7 },
        { date: '2026-02-26', score: 6 },
        { date: '2026-02-27', score: 8 },
        { date: '2026-02-28', score: 6 },
    ] as EmotionRecord[],
};

export const forumMockData = {
    categories: ['Semua', 'Akademik', 'Kewangan', 'Keluarga', 'Kerjaya'],
    threads: [
        {
            id: 1,
            title: 'Macam mana nak urus tekanan minggu peperiksaan?',
            timestamp: '28 Feb 2026, 9:10 AM',
            category: 'Akademik',
            supportCount: 12,
        },
        {
            id: 2,
            title: 'Saya risau tentang komitmen hutang PTPTN.',
            timestamp: '27 Feb 2026, 6:30 PM',
            category: 'Kewangan',
            supportCount: 8,
        },
        {
            id: 3,
            title: 'Cabaran komunikasi dengan keluarga semasa belajar jauh.',
            timestamp: '26 Feb 2026, 8:45 PM',
            category: 'Keluarga',
            supportCount: 15,
        },
    ] as ForumThread[],
};

const defaultForumPosts: ForumPost[] = [
    ...forumMockData.threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        content: '',
        timestamp: thread.timestamp,
        category: thread.category,
        supportCount: thread.supportCount,
        safetyScore: 92,
        moderationReason: 'approved',
        isPublished: true,
        isHidden: false,
        isDeleted: false,
    })),
    {
        id: 101,
        title: 'Saya rasa semua orang patut dipukul sebab saya stres',
        content:
            'Saya sangat marah dan rasa nak lepaskan dekat sesiapa yang ganggu saya sekarang.',
        timestamp: '28 Feb 2026, 11:05 AM',
        category: 'Akademik',
        supportCount: 0,
        safetyScore: 18,
        moderationReason: 'Detected violent intent and threatening language',
        isPublished: false,
        isHidden: true,
        isDeleted: false,
    },
    {
        id: 102,
        title: 'Saya rasa hidup dah tak ada makna langsung',
        content:
            'Saya dah tak larat dan terfikir benda berbahaya pada diri sendiri.',
        timestamp: '28 Feb 2026, 11:12 AM',
        category: 'Keluarga',
        supportCount: 0,
        safetyScore: 12,
        moderationReason: 'Detected self-harm risk language',
        isPublished: false,
        isHidden: true,
        isDeleted: false,
    },
    {
        id: 103,
        title: 'Nak cari siapa yang hutang aku dan ajar dia cukup-cukup',
        content:
            'Saya rasa nak je cari dia malam ni dan bagi dia rasa takut.',
        timestamp: '28 Feb 2026, 11:20 AM',
        category: 'Kewangan',
        supportCount: 0,
        safetyScore: 24,
        moderationReason: 'Detected intimidation and potential violence',
        isPublished: false,
        isHidden: true,
        isDeleted: false,
    },
];

export const getDefaultForumPosts = (): ForumPost[] =>
    defaultForumPosts.map((post) => ({ ...post }));

const normalizeForumPost = (raw: unknown): ForumPost | null => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const candidate = raw as Partial<ForumPost> & {
        title?: unknown;
        category?: unknown;
        supportCount?: unknown;
    };

    if (typeof candidate.title !== 'string' || typeof candidate.category !== 'string') {
        return null;
    }

    const normalizedSupportCount =
        typeof candidate.supportCount === 'number' && Number.isFinite(candidate.supportCount)
            ? candidate.supportCount
            : 0;

    const normalizedSafetyScore =
        typeof candidate.safetyScore === 'number' && Number.isFinite(candidate.safetyScore)
            ? Math.max(0, Math.min(100, candidate.safetyScore))
            : 90;

    const id =
        typeof candidate.id === 'number' && Number.isFinite(candidate.id)
            ? candidate.id
            : Date.now();

    return {
        id,
        title: candidate.title,
        content: typeof candidate.content === 'string' ? candidate.content : '',
        timestamp: typeof candidate.timestamp === 'string' ? candidate.timestamp : 'Unknown',
        category: candidate.category,
        supportCount: normalizedSupportCount,
        safetyScore: normalizedSafetyScore,
        moderationReason:
            typeof candidate.moderationReason === 'string'
                ? candidate.moderationReason
                : 'approved',
        isPublished:
            typeof candidate.isPublished === 'boolean'
                ? candidate.isPublished
                : normalizedSafetyScore >= 30,
        isHidden: typeof candidate.isHidden === 'boolean' ? candidate.isHidden : false,
        isDeleted: typeof candidate.isDeleted === 'boolean' ? candidate.isDeleted : false,
    };
};

export const getForumPosts = (): ForumPost[] => {
    if (typeof window === 'undefined') {
        return getDefaultForumPosts();
    }

    const storedValue = window.localStorage.getItem(FORUM_POST_STORAGE_KEY);

    if (!storedValue) {
        return getDefaultForumPosts();
    }

    try {
        const parsedValue = JSON.parse(storedValue) as ForumPost[];

        if (!Array.isArray(parsedValue)) {
            return getDefaultForumPosts();
        }

        const normalizedPosts = parsedValue
            .map((entry) => normalizeForumPost(entry))
            .filter((entry): entry is ForumPost => entry !== null);

        if (normalizedPosts.length === 0 && parsedValue.length > 0) {
            return getDefaultForumPosts();
        }

        return normalizedPosts;
    } catch {
        return getDefaultForumPosts();
    }
};

export const saveForumPosts = (posts: ForumPost[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(FORUM_POST_STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new Event(FORUM_POST_UPDATED_EVENT));
};

export const resourceLibraryMockData: ResourceItem[] = [
    {
        id: 1,
        titleMs: 'Teknik Pernafasan 4-7-8 untuk Menenangkan Diri',
        titleEn: '4-7-8 Breathing Technique for Calmness',
        descriptionMs:
            'Panduan ringkas untuk menurunkan kadar tekanan apabila fikiran menjadi sesak.',
        descriptionEn:
            'A short guide to reduce stress levels when your thoughts feel overwhelming.',
        category: 'stress',
        type: 'Toolkit',
        duration: '5 min',
        url: 'https://example.org/resources/breathing-478',
    },
    {
        id: 2,
        titleMs: 'Memahami Kebimbangan Akademik',
        titleEn: 'Understanding Academic Anxiety',
        descriptionMs:
            'Artikel praktikal untuk mengenal pasti punca kebimbangan semasa musim peperiksaan.',
        descriptionEn:
            'Practical article to identify anxiety triggers during exam season.',
        category: 'anxiety',
        type: 'Artikel',
        duration: '8 min',
        url: 'https://example.org/resources/academic-anxiety',
    },
    {
        id: 3,
        titleMs: 'Rutin Tidur Sihat untuk Pelajar Universiti',
        titleEn: 'Healthy Sleep Routine for University Students',
        descriptionMs:
            'Cadangan langkah harian untuk memperbaiki kualiti tidur dan fokus belajar.',
        descriptionEn:
            'Daily steps to improve sleep quality and study focus.',
        category: 'sleep',
        type: 'Video',
        duration: '12 min',
        url: 'https://example.org/resources/sleep-routine',
    },
    {
        id: 4,
        titleMs: 'Cara Menyokong Rakan Yang Sedang Tertekan',
        titleEn: 'How to Support a Stressed Friend',
        descriptionMs:
            'Sumber sokongan rakan sebaya untuk membantu tanpa menambah tekanan.',
        descriptionEn:
            'Peer-support resource for helping others without adding pressure.',
        category: 'support',
        type: 'Artikel',
        duration: '6 min',
        url: 'https://example.org/resources/peer-support',
    },
];

export const clientProfileMockSeed: ClientProfileSeed = {
    fullName: profileClient?.preferredName ?? 'Nur Aina Binti Hamzah',
    nationalId: profileClient?.nationalId ?? '010203-10-1234',
    currentAddress: profileClient?.address ?? 'Kolej Tun Fatimah, UTM Johor Bahru',
    maritalStatus: 'single',
    dependentCount: 0,
    treatmentHistory: 'Pernah menjalani sesi kaunseling universiti pada semester lepas.',
    currentMedications: 'Tiada ubat semasa.',
    studyInfo: {
        matricNo: profileClient?.matrixNo ?? 'A23CS4017',
        program: profileClient?.program ?? 'Sarjana Muda Sains Komputer',
        faculty: profileClient?.faculty ?? 'Fakulti Komputeran',
    },
};

export const requestFormMockSeed: RequestApplicantSeed = {
    studentNo: primaryApplicantClient?.studentNo ?? 'A23CS0218',
    studentName: primaryApplicantClient?.fullName ?? 'CHU CHENG QING',
    faculty: primaryApplicantClient?.faculty ?? '28 - Fakulti Komputeran',
    clientType: 'PELAJAR',
    sessionNeed: 'Tekanan akademik dan pengurusan emosi',
    location: 'PUSAT KAUNSELING (JB)',
    attendedBefore: 'TIDAK',
    issueSummary: 'Saya perlukan sesi bimbingan untuk menguruskan tekanan akademik dan jadual belajar.',
    attachmentDescription: 'Lampiran sokongan berkaitan isu akademik.',
    applicantNote: 'Mohon slot selepas jam 10 pagi jika boleh.',
};

export const requestFormMockUnavailableSlotIdsByDate: Record<string, string[]> = {
    '2026-03-11': ['SLT-1102'],
    '2026-03-12': ['SLT-1201'],
};

export const createReferenceNumber = () => {
    const now = Date.now().toString();
    return `PSY-2026-${now.slice(-5)}`;
};

export const psychometricTestOptions = [
    { value: '0', labelMs: 'Tidak Pernah', labelEn: 'Never' },
    { value: '1', labelMs: 'Kadang-kadang', labelEn: 'Sometimes' },
    { value: '2', labelMs: 'Kerap', labelEn: 'Often' },
    { value: '3', labelMs: 'Sangat Kerap', labelEn: 'Very Often' },
];

export const psychometricTestsMockData: PsychometricTest[] = [
    {
        id: 'DASS-21',
        code: 'DASS-21',
        titleMs: 'DASS-21 (Stres, Kebimbangan, Kemurungan)',
        titleEn: 'DASS-21 (Stress, Anxiety, Depression)',
        descriptionMs:
            'Saringan kendiri untuk menilai simptom stres, kebimbangan dan kemurungan dalam 7 hari terakhir.',
        descriptionEn:
            'Self-screening test to assess stress, anxiety, and depression symptoms over the past 7 days.',
        category: 'Emotional Wellbeing',
        estimatedMinutes: 8,
        uploadedByAdminAt: '2026-02-12',
        questions: [
            {
                id: 'DASS-Q1',
                promptMs: 'Saya mendapati diri saya sukar untuk bertenang.',
                promptEn: 'I found it hard to wind down.',
            },
            {
                id: 'DASS-Q2',
                promptMs: 'Saya berasa takut tanpa sebab yang jelas.',
                promptEn: 'I felt scared without clear reason.',
            },
            {
                id: 'DASS-Q3',
                promptMs: 'Saya berasa sukar untuk bersemangat melakukan sesuatu.',
                promptEn: 'I found it difficult to become enthusiastic about anything.',
            },
            {
                id: 'DASS-Q4',
                promptMs: 'Saya cenderung bertindak balas berlebihan terhadap situasi.',
                promptEn: 'I tended to over-react to situations.',
            },
            {
                id: 'DASS-Q5',
                promptMs: 'Saya berasa tidak sabar atau mudah terganggu.',
                promptEn: 'I felt impatient or easily irritated.',
            },
        ],
    },
    {
        id: 'GAD-7',
        code: 'GAD-7',
        titleMs: 'GAD-7 (Saringan Kebimbangan)',
        titleEn: 'GAD-7 (Anxiety Screening)',
        descriptionMs:
            'Menilai simptom kebimbangan umum untuk membantu kaunselor memahami tahap semasa.',
        descriptionEn:
            'Evaluates generalized anxiety symptoms to help counselors understand current severity.',
        category: 'Anxiety',
        estimatedMinutes: 6,
        uploadedByAdminAt: '2026-02-18',
        questions: [
            {
                id: 'GAD-Q1',
                promptMs: 'Saya merasa gugup atau resah sepanjang hari.',
                promptEn: 'I felt nervous or on edge throughout the day.',
            },
            {
                id: 'GAD-Q2',
                promptMs: 'Saya sukar mengawal rasa bimbang saya.',
                promptEn: 'I had trouble controlling my worrying.',
            },
            {
                id: 'GAD-Q3',
                promptMs: 'Saya sukar untuk berehat.',
                promptEn: 'I had trouble relaxing.',
            },
            {
                id: 'GAD-Q4',
                promptMs: 'Saya mudah menjadi marah atau cepat tersinggung.',
                promptEn: 'I became easily annoyed or irritable.',
            },
        ],
    },
];

export const psychometricResultsMockData: PsychometricResult[] = [
    {
        id: 'PSY-RS-MOCK-001',
        testId: 'DASS-21',
        testCode: 'DASS-21',
        testTitleMs: 'DASS-21 (Stres, Kebimbangan, Kemurungan)',
        testTitleEn: 'DASS-21 (Stress, Anxiety, Depression)',
        submittedByName: appointmentClientOne?.fullName ?? 'CHU CHENG QING',
        submittedByStudentNo: appointmentClientOne?.studentNo ?? 'A23CS0218',
        submittedByEmail: appointmentClientOne?.email ?? 'a23cs0218@graduate.utm.my',
        submittedAt: '2026-02-28T09:15:00.000Z',
        totalScore: 9,
        maxScore: 15,
        scorePercent: 60,
        riskLevel: 'moderate',
        aiSummaryMs: 'Analisis AI menunjukkan julat simptom sederhana yang perlu dipantau secara berkala.',
        aiSummaryEn: 'AI analysis indicates a moderate symptom range that needs regular monitoring.',
        aiRecommendationMs: 'Jadualkan susulan dengan kaunselor dan amalkan strategi daya tindak harian.',
        aiRecommendationEn: 'Schedule follow-up with counselor and practice daily coping strategies.',
    },
    {
        id: 'PSY-RS-MOCK-002',
        testId: 'GAD-7',
        testCode: 'GAD-7',
        testTitleMs: 'GAD-7 (Saringan Kebimbangan)',
        testTitleEn: 'GAD-7 (Anxiety Screening)',
        submittedByName: appointmentClientTwo?.fullName ?? 'NUR AINA HAMZAH',
        submittedByStudentNo: appointmentClientTwo?.studentNo ?? 'A23CS4017',
        submittedByEmail: appointmentClientTwo?.email ?? 'a23cs4017@graduate.utm.my',
        submittedAt: '2026-02-28T10:05:00.000Z',
        totalScore: 11,
        maxScore: 12,
        scorePercent: 92,
        riskLevel: 'high',
        aiSummaryMs: 'Analisis AI menunjukkan julat simptom tinggi dan mencadangkan intervensi awal.',
        aiSummaryEn: 'AI analysis indicates a high symptom range and recommends early intervention.',
        aiRecommendationMs: 'Hubungi kaunselor secepat mungkin dan aktifkan pelan sokongan hari ini.',
        aiRecommendationEn: 'Contact counselor as soon as possible and activate support plan today.',
    },
];

const clonePsychometricResultsMockData = () =>
    psychometricResultsMockData.map((result) => ({ ...result }));

const normalizePsychometricResult = (
    raw: unknown,
): PsychometricResult | null => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const candidate = raw as Partial<PsychometricResult>;

    if (
        typeof candidate.id !== 'string' ||
        typeof candidate.testId !== 'string' ||
        typeof candidate.testCode !== 'string' ||
        typeof candidate.testTitleMs !== 'string' ||
        typeof candidate.testTitleEn !== 'string' ||
        typeof candidate.submittedAt !== 'string' ||
        typeof candidate.totalScore !== 'number' ||
        typeof candidate.maxScore !== 'number' ||
        typeof candidate.scorePercent !== 'number' ||
        (candidate.riskLevel !== 'low' && candidate.riskLevel !== 'moderate' && candidate.riskLevel !== 'high') ||
        typeof candidate.aiSummaryMs !== 'string' ||
        typeof candidate.aiSummaryEn !== 'string' ||
        typeof candidate.aiRecommendationMs !== 'string' ||
        typeof candidate.aiRecommendationEn !== 'string'
    ) {
        return null;
    }

    const matchingMock = psychometricResultsMockData.find(
        (mockResult) =>
            mockResult.testId === candidate.testId || mockResult.testCode === candidate.testCode,
    );

    const fallbackName = matchingMock?.submittedByName ?? requestFormMockSeed.studentName;
    const fallbackStudentNo =
        matchingMock?.submittedByStudentNo ?? requestFormMockSeed.studentNo;
    const fallbackEmail =
        matchingMock?.submittedByEmail ??
        `${requestFormMockSeed.studentNo.toLowerCase()}@graduate.utm.my`;

    return {
        ...candidate,
        id: candidate.id,
        testId: candidate.testId,
        testCode: candidate.testCode,
        testTitleMs: candidate.testTitleMs,
        testTitleEn: candidate.testTitleEn,
        submittedByName:
            typeof candidate.submittedByName === 'string' && candidate.submittedByName.trim() !== ''
                ? candidate.submittedByName
                : fallbackName,
        submittedByStudentNo:
            typeof candidate.submittedByStudentNo === 'string' &&
            candidate.submittedByStudentNo.trim() !== ''
                ? candidate.submittedByStudentNo
                : fallbackStudentNo,
        submittedByEmail:
            typeof candidate.submittedByEmail === 'string' && candidate.submittedByEmail.trim() !== ''
                ? candidate.submittedByEmail
                : fallbackEmail,
        submittedAt: candidate.submittedAt,
        totalScore: candidate.totalScore,
        maxScore: candidate.maxScore,
        scorePercent: candidate.scorePercent,
        riskLevel: candidate.riskLevel,
        aiSummaryMs: candidate.aiSummaryMs,
        aiSummaryEn: candidate.aiSummaryEn,
        aiRecommendationMs: candidate.aiRecommendationMs,
        aiRecommendationEn: candidate.aiRecommendationEn,
    } as PsychometricResult;
};

export const getPsychometricTests = (): PsychometricTest[] => {
    if (typeof window === 'undefined') {
        return psychometricTestsMockData;
    }

    const storedValue = window.localStorage.getItem(PSYCHOMETRIC_TEST_STORAGE_KEY);

    if (!storedValue) {
        return psychometricTestsMockData;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as PsychometricTest[];

        if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
            return psychometricTestsMockData;
        }

        return parsedValue;
    } catch {
        return psychometricTestsMockData;
    }
};

const toTestCode = (title: string) => {
    const words = title
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return `TEST-${Date.now().toString().slice(-4)}`;
    }

    const acronym = words.slice(0, 3).map((word) => word[0]).join('');
    return `${acronym || 'TEST'}-${Date.now().toString().slice(-4)}`;
};

export const generatePsychometricTestFromPdfUpload = (
    title: string,
    pdfFile: File,
): PsychometricTest => {
    const normalizedTitle = title.trim();
    const generatedCode = toTestCode(normalizedTitle);
    const questionSeed = [
        {
            en: 'Over the past two weeks, I found it difficult to stay emotionally balanced.',
            ms: 'Dalam dua minggu lepas, saya sukar mengekalkan kestabilan emosi.',
        },
        {
            en: 'I felt tension that affected my ability to focus on study or work.',
            ms: 'Saya berasa tegang sehingga menjejaskan fokus pada belajar atau kerja.',
        },
        {
            en: 'I needed extra support to cope with daily stressors.',
            ms: 'Saya memerlukan sokongan tambahan untuk menghadapi tekanan harian.',
        },
        {
            en: 'I struggled to maintain healthy sleep and recovery routines.',
            ms: 'Saya sukar mengekalkan rutin tidur dan pemulihan yang sihat.',
        },
        {
            en: 'I experienced persistent worry that was hard to control.',
            ms: 'Saya mengalami kebimbangan berterusan yang sukar dikawal.',
        },
        {
            en: 'I found myself withdrawing from social interaction more than usual.',
            ms: 'Saya mendapati diri saya mengasingkan diri daripada interaksi sosial lebih daripada biasa.',
        },
        {
            en: 'I had trouble making decisions due to emotional pressure.',
            ms: 'Saya sukar membuat keputusan kerana tekanan emosi.',
        },
        {
            en: 'I felt overwhelmed when managing study, work, or personal responsibilities.',
            ms: 'Saya berasa terbeban ketika mengurus tanggungjawab belajar, kerja atau peribadi.',
        },
        {
            en: 'I struggled to recover emotionally after stressful situations.',
            ms: 'Saya sukar pulih secara emosi selepas situasi tertekan.',
        },
    ];

    const estimatedPdfPages = Math.max(1, Math.ceil(pdfFile.size / (75 * 1024)));
    const generatedQuestionCount = Math.max(
        5,
        Math.min(20, estimatedPdfPages * 2),
    );

    const generatedQuestions: PsychometricQuestion[] = Array.from(
        { length: generatedQuestionCount },
        (_, index) => {
            const seedQuestion = questionSeed[index % questionSeed.length];

            return {
                id: `${generatedCode}-Q${index + 1}`,
                promptEn: seedQuestion.en,
                promptMs: seedQuestion.ms,
            };
        },
    );

    return {
        id: `${generatedCode}-${Date.now()}`,
        code: generatedCode,
        titleEn: normalizedTitle,
        titleMs: normalizedTitle,
        descriptionEn: `Auto-generated from uploaded PDF: ${pdfFile.name}.`,
        descriptionMs: `Dijana automatik daripada PDF dimuat naik: ${pdfFile.name}.`,
        category: 'Auto-generated from PDF',
        estimatedMinutes: Math.max(5, Math.min(20, Math.ceil(pdfFile.size / (120 * 1024)))),
        uploadedByAdminAt: new Date().toISOString().slice(0, 10),
        questions: generatedQuestions,
    };
};

export const savePsychometricTests = (tests: PsychometricTest[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(PSYCHOMETRIC_TEST_STORAGE_KEY, JSON.stringify(tests));
    window.dispatchEvent(new Event(PSYCHOMETRIC_TEST_UPDATED_EVENT));
};

export const getPsychometricResults = (): PsychometricResult[] => {
    if (typeof window === 'undefined') {
        return clonePsychometricResultsMockData();
    }

    const storedValue = window.localStorage.getItem(PSYCHOMETRIC_RESULTS_STORAGE_KEY);

    if (!storedValue) {
        const seededResults = clonePsychometricResultsMockData();
        window.localStorage.setItem(
            PSYCHOMETRIC_RESULTS_STORAGE_KEY,
            JSON.stringify(seededResults),
        );
        return seededResults;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as PsychometricResult[];

        if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
            const seededResults = clonePsychometricResultsMockData();
            window.localStorage.setItem(
                PSYCHOMETRIC_RESULTS_STORAGE_KEY,
                JSON.stringify(seededResults),
            );
            return seededResults;
        }

        const normalizedResults = parsedValue
            .map((entry) => normalizePsychometricResult(entry))
            .filter((entry): entry is PsychometricResult => entry !== null);

        if (normalizedResults.length === 0) {
            const seededResults = clonePsychometricResultsMockData();
            window.localStorage.setItem(
                PSYCHOMETRIC_RESULTS_STORAGE_KEY,
                JSON.stringify(seededResults),
            );
            return seededResults;
        }

        window.localStorage.setItem(
            PSYCHOMETRIC_RESULTS_STORAGE_KEY,
            JSON.stringify(normalizedResults),
        );

        return normalizedResults;
    } catch {
        const seededResults = clonePsychometricResultsMockData();
        window.localStorage.setItem(
            PSYCHOMETRIC_RESULTS_STORAGE_KEY,
            JSON.stringify(seededResults),
        );
        return seededResults;
    }
};

export const savePsychometricResults = (results: PsychometricResult[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(PSYCHOMETRIC_RESULTS_STORAGE_KEY, JSON.stringify(results));
    window.dispatchEvent(new Event(PSYCHOMETRIC_RESULTS_UPDATED_EVENT));
};

export const getChatbotRiskFlag = (): ChatbotRiskFlag | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedValue = window.localStorage.getItem(CHATBOT_RISK_FLAG_STORAGE_KEY);

    if (!storedValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as ChatbotRiskFlag;

        if (
            !parsedValue ||
            typeof parsedValue.flaggedAt !== 'string' ||
            typeof parsedValue.message !== 'string' ||
            (parsedValue.severity !== 'moderate' && parsedValue.severity !== 'high') ||
            parsedValue.source !== 'ai-chatbot'
        ) {
            return null;
        }

        return parsedValue;
    } catch {
        return null;
    }
};

export const saveChatbotRiskFlag = (riskFlag: ChatbotRiskFlag | null) => {
    if (typeof window === 'undefined') {
        return;
    }

    if (riskFlag === null) {
        window.localStorage.removeItem(CHATBOT_RISK_FLAG_STORAGE_KEY);
    } else {
        window.localStorage.setItem(CHATBOT_RISK_FLAG_STORAGE_KEY, JSON.stringify(riskFlag));
    }

    window.dispatchEvent(new Event(CHATBOT_RISK_FLAG_UPDATED_EVENT));
};

export const getResourceLibraryItems = (): ResourceItem[] => {
    if (typeof window === 'undefined') {
        return resourceLibraryMockData;
    }

    const storedValue = window.localStorage.getItem(RESOURCE_LIBRARY_STORAGE_KEY);

    if (!storedValue) {
        return resourceLibraryMockData;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as ResourceItem[];

        if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
            return resourceLibraryMockData;
        }

        return parsedValue;
    } catch {
        return resourceLibraryMockData;
    }
};

export const saveResourceLibraryItems = (resources: ResourceItem[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(RESOURCE_LIBRARY_STORAGE_KEY, JSON.stringify(resources));
    window.dispatchEvent(new Event(RESOURCE_LIBRARY_UPDATED_EVENT));
};

export const generatePsychometricAiResult = (
    test: PsychometricTest,
    responses: Record<string, string>,
    submitter?: {
        name: string;
        studentNo: string;
        email: string;
    },
): PsychometricResult => {
    const maxScore = test.questions.length * 3;
    const totalScore = test.questions.reduce((sum, question) => {
        const answerValue = Number.parseInt(responses[question.id] ?? '0', 10);
        const safeAnswer = Number.isNaN(answerValue) ? 0 : Math.min(Math.max(answerValue, 0), 3);

        return sum + safeAnswer;
    }, 0);

    const scorePercent = maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100);

    const riskLevel: PsychometricRiskLevel = scorePercent <= 34
        ? 'low'
        : scorePercent <= 67
          ? 'moderate'
          : 'high';

    const aiSummaryEn = riskLevel === 'low'
        ? 'AI analysis indicates a low symptom range at this time.'
        : riskLevel === 'moderate'
          ? 'AI analysis indicates a moderate symptom range that needs regular monitoring.'
          : 'AI analysis indicates a high symptom range and recommends early intervention.';

    const aiSummaryMs = riskLevel === 'low'
        ? 'Analisis AI menunjukkan julat simptom rendah pada masa ini.'
        : riskLevel === 'moderate'
          ? 'Analisis AI menunjukkan julat simptom sederhana yang perlu dipantau secara berkala.'
          : 'Analisis AI menunjukkan julat simptom tinggi dan mencadangkan intervensi awal.';

    const aiRecommendationEn = riskLevel === 'low'
        ? 'Maintain healthy routine and continue weekly self-check.'
        : riskLevel === 'moderate'
          ? 'Schedule follow-up with counselor and practice daily coping strategies.'
          : 'Contact counselor as soon as possible and activate support plan today.';

    const aiRecommendationMs = riskLevel === 'low'
        ? 'Kekalkan rutin sihat dan teruskan semakan kendiri mingguan.'
        : riskLevel === 'moderate'
          ? 'Jadualkan susulan dengan kaunselor dan amalkan strategi daya tindak harian.'
          : 'Hubungi kaunselor secepat mungkin dan aktifkan pelan sokongan hari ini.';

    return {
        id: `PSY-RS-${Date.now()}`,
        testId: test.id,
        testCode: test.code,
        testTitleMs: test.titleMs,
        testTitleEn: test.titleEn,
        submittedByName: submitter?.name,
        submittedByStudentNo: submitter?.studentNo,
        submittedByEmail: submitter?.email,
        submittedAt: new Date().toISOString(),
        totalScore,
        maxScore,
        scorePercent,
        riskLevel,
        aiSummaryMs,
        aiSummaryEn,
        aiRecommendationMs,
        aiRecommendationEn,
    };
};

export const adminPortalMockData = {
    appointmentRequests: [
        {
            id: 'REQ-1001',
            clientName: appointmentClientOne?.fullName ?? 'CHU CHENG QING',
            sessionType: 'online',
            preferredDate: '2026-03-03',
            clientFollowUpRequested: true,
            counsellorContinuationNeeded: null,
            status: 'pending',
        },
        {
            id: 'REQ-1002',
            clientName: appointmentClientTwo?.fullName ?? 'NUR AINA HAMZAH',
            sessionType: 'physical',
            preferredDate: '2026-03-04',
            clientFollowUpRequested: false,
            counsellorContinuationNeeded: null,
            status: 'pending',
        },
        {
            id: 'REQ-1003',
            clientName: appointmentClientThree?.fullName ?? 'AMIRUL HAKIM',
            sessionType: 'online',
            preferredDate: '2026-03-05',
            clientFollowUpRequested: true,
            counsellorContinuationNeeded: true,
            status: 'follow-up',
        },
    ] as AdminAppointmentRequest[],
    uploadedMaterials: [
        {
            id: 'MAT-001',
            name: 'DASS-21',
            type: 'Psychometric Test',
            uploadedAt: '2026-02-12',
            visibility: 'published',
        },
        {
            id: 'MAT-002',
            name: 'GAD-7',
            type: 'Psychometric Test',
            uploadedAt: '2026-02-18',
            visibility: 'published',
        },
        {
            id: 'MAT-003',
            name: 'Stress Coping Starter Pack',
            type: 'Resource',
            uploadedAt: '2026-02-20',
            visibility: 'draft',
        },
    ] as AdminUploadedMaterial[],
};

export const counsellorPortalMockData = {
    clients: [
        {
            id: 'CL-01',
            name: appointmentClientOne?.fullName ?? 'CHU CHENG QING',
            latestEmotionScore: 5,
            latestRiskLevel: 'moderate',
            nextSessionAt: '2026-03-03 10:00',
        },
        {
            id: 'CL-02',
            name: appointmentClientTwo?.fullName ?? 'NUR AINA HAMZAH',
            latestEmotionScore: 3,
            latestRiskLevel: 'high',
            nextSessionAt: '2026-03-03 14:30',
        },
        {
            id: 'CL-03',
            name: appointmentClientThree?.fullName ?? 'AMIRUL HAKIM',
            latestEmotionScore: 8,
            latestRiskLevel: 'low',
            nextSessionAt: '2026-03-04 09:30',
        },
    ] as CounsellorClient[],
    tasks: [
        {
            id: 'TASK-01',
            title: 'Review high-risk psychometric submission',
            priority: 'high',
            dueAt: '2026-03-02 12:00',
        },
        {
            id: 'TASK-02',
            title: 'Prepare follow-up plan for moderate-risk client',
            priority: 'medium',
            dueAt: '2026-03-03 09:00',
        },
        {
            id: 'TASK-03',
            title: 'Update weekly support recommendation notes',
            priority: 'low',
            dueAt: '2026-03-04 17:00',
        },
    ] as CounsellorTask[],
};
