import { Link, router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { setPsycareLanguage, usePsycareLanguage } from '@/lib/psycare-language';
import {
    ensurePsycareTermsAcceptanceRecord,
    getMockCurrentPsycareClient,
    hasPsycareTermsBeenAccepted,
    getPsycareTermsAcceptanceRecord,
    savePsycareTermsAcceptance,
    PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
} from '@/lib/psycare-declaration';
import FloatingChatbot from './FloatingChatbot';

const EMOTION_RECORDS_STORAGE_KEY = 'psycare.emotion.records';

type LayoutProps = {
    children: ReactNode;
};

type NavigationItem = {
    labelMs: string;
    labelEn: string;
    href: string;
};

const navigationItems = [
    {
        labelMs: 'Papan Pemuka',
        labelEn: 'Dashboard',
        href: '/psycare/dashboard',
    },
    {
        labelMs: 'Perkhidmatan (Maklumat Klien, Perakuan Klien)',
        labelEn: 'Services (Client Info, Client Declaration)',
        href: '/psycare/perkhidmatan',
    },
    {
        labelMs: 'Permohonan (Borang Temujanji Pintar)',
        labelEn: 'Request (Smart Appointment Form)',
        href: '/psycare/permohonan',
    },
    {
        labelMs: 'Rekod Temujanji',
        labelEn: 'Appointment Records',
        href: '/psycare/rekod-temujanji',
    },
    {
        labelMs: 'Ujian Psikometrik',
        labelEn: 'Psychometric Test',
        href: '/psycare/ujian-psikometrik',
    },
    {
        labelMs: 'Perpustakaan Sumber',
        labelEn: 'Resource Library',
        href: '/psycare/resource-library',
    },
    {
        labelMs: 'Forum Sokongan',
        labelEn: 'Support Forum',
        href: '/psycare/forum-sokongan',
    },
] satisfies NavigationItem[];

export default function Layout({ children }: LayoutProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [isEmotionPendingToday, setIsEmotionPendingToday] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isTermsConfirmed, setIsTermsConfirmed] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const language = usePsycareLanguage();
    const { url } = usePage();
    const currentClient = getMockCurrentPsycareClient();

    useEffect(() => {
        const evaluateTodayEmotionStatus = () => {
            const todayIso = new Date().toISOString().slice(0, 10);
            const storedEmotionRecords = localStorage.getItem(
                EMOTION_RECORDS_STORAGE_KEY,
            );

            if (!storedEmotionRecords) {
                setIsEmotionPendingToday(true);
                return;
            }

            try {
                const parsedEmotionRecords = JSON.parse(
                    storedEmotionRecords,
                ) as Array<{ date: string }>;
                const hasTodayRecord = parsedEmotionRecords.some(
                    (record) => record.date === todayIso,
                );

                setIsEmotionPendingToday(!hasTodayRecord);
            } catch {
                setIsEmotionPendingToday(true);
            }
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === EMOTION_RECORDS_STORAGE_KEY) {
                evaluateTodayEmotionStatus();
            }
        };

        evaluateTodayEmotionStatus();
        window.addEventListener('storage', handleStorageUpdate);
        window.addEventListener(
            'psycare:emotion-records-updated',
            evaluateTodayEmotionStatus,
        );

        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener(
                'psycare:emotion-records-updated',
                evaluateTodayEmotionStatus,
            );
        };
    }, []);

    useEffect(() => {
        if (!currentClient) {
            setIsTermsAccepted(true);
            return;
        }

        ensurePsycareTermsAcceptanceRecord(
            currentClient.id,
            currentClient.fullName,
        );

        const refreshTermsStatus = () => {
            setIsTermsAccepted(hasPsycareTermsBeenAccepted(currentClient.id));
        };

        refreshTermsStatus();
        window.addEventListener('storage', refreshTermsStatus);
        window.addEventListener(
            PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
            refreshTermsStatus,
        );

        return () => {
            window.removeEventListener('storage', refreshTermsStatus);
            window.removeEventListener(
                PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
                refreshTermsStatus,
            );
        };
    }, [currentClient]);

    useEffect(() => {
        setIsTermsModalOpen(Boolean(currentClient) && !isTermsAccepted);
    }, [currentClient, isTermsAccepted]);

    useEffect(() => {
        if (!isTermsModalOpen) {
            document.body.style.overflow = '';
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isTermsModalOpen]);

    const copy = useMemo(() => {
        if (language === 'en') {
            return {
                portalSubtitle: 'PsyCare 2.0',
                portalTitle: 'Counselling Portal',
                pageTitle: 'Dashboard',
                welcome: 'Welcome to PsyCare 2.0',
                sosButton: '🚨 GET HELP NOW (SOS)',
                profileButton: 'User Profile ▾',
                myAccount: 'My Account',
                settings: 'Settings',
                logout: 'Log Out',
                languageLabel: 'Language',
                malay: 'Malay',
                english: 'English',
                sosMessage:
                    'SOS submitted: on-duty counselor has been notified. Please check immediate support channels.',
                settingsMessage:
                    'Demo settings opened. Backend integration can be connected next.',
                logoutMessage:
                    'Demo logout successful. Real session logout requires backend auth integration.',
                termsTitle: 'Terms and Conditions / Terma dan Syarat',
                termsIntro:
                    'Before using PsyCare 2.0, please review and accept the system terms below.',
                termsIntroMs:
                    'Sebelum menggunakan PsyCare 2.0, sila semak dan terima terma sistem di bawah.',
                termsLabel:
                    'I have read and agree to the terms and conditions of using PsyCare 2.0.',
                termsLabelMs:
                    'Saya telah membaca dan bersetuju dengan terma dan syarat penggunaan PsyCare 2.0.',
                termsSummary:
                    'Your terms acceptance will be saved for this mock client so the form will not appear again unless the record is cleared.',
                termsSummaryMs:
                    'Persetujuan terma akan disimpan untuk klien mock ini supaya borang ini tidak akan muncul lagi kecuali rekod dipadamkan.',
                agreeButton: 'Agree and Continue',
                agreeButtonMs: 'Setuju dan Teruskan',
                clientLabel: 'Current Client',
                termsAcceptedAtLabel: 'Accepted At',
                termsStored: 'Accepted for current terms version',
                termsPending: 'Not yet accepted for current terms version',
            };
        }

        return {
            portalSubtitle: 'PsyCare 2.0',
            portalTitle: 'Counselling Portal',
            pageTitle: 'Papan Pemuka',
            welcome: 'Selamat datang ke PsyCare 2.0',
            sosButton: '🚨 GET HELP NOW (SOS)',
            profileButton: 'Profil Pengguna ▾',
            myAccount: 'Akaun Saya',
            settings: 'Tetapan',
            logout: 'Log Keluar',
            languageLabel: 'Bahasa',
            malay: 'Bahasa Melayu',
            english: 'English',
            sosMessage:
                'SOS dihantar: kaunselor bertugas dimaklumkan. Sila semak saluran bantuan segera.',
            settingsMessage:
                'Tetapan demo dibuka. Fungsi backend akan dihubungkan kemudian.',
            logoutMessage:
                'Log keluar demo berjaya. Sesi sebenar memerlukan integrasi auth backend.',
            termsTitle: 'Terma dan Syarat / Terms and Conditions',
            termsIntro:
                'Sebelum menggunakan PsyCare 2.0, sila semak dan terima terma sistem di bawah.',
            termsIntroMs:
                'Before using PsyCare 2.0, please review and accept the system terms below.',
            termsLabel:
                'Saya telah membaca dan bersetuju dengan terma dan syarat penggunaan PsyCare 2.0.',
            termsLabelMs:
                'I have read and agree to the terms and conditions of using PsyCare 2.0.',
            termsSummary:
                'Persetujuan terma anda akan disimpan untuk klien mock ini supaya borang ini tidak akan muncul lagi kecuali rekod dipadamkan.',
            termsSummaryMs:
                'Your terms acceptance will be saved for this mock client so the form will not appear again unless the record is cleared.',
            agreeButton: 'Setuju dan Teruskan',
            agreeButtonMs: 'Agree and Continue',
            clientLabel: 'Klien Semasa',
            termsAcceptedAtLabel: 'Masa Terima',
            termsStored: 'Diterima untuk versi terma semasa',
            termsPending: 'Belum diterima untuk versi terma semasa',
        };
    }, [language]);

    const handleSOSClick = () => {
        setActionMessage(copy.sosMessage);
    };

    const handleSettingsClick = () => {
        setActionMessage(copy.settingsMessage);
        setIsProfileOpen(false);
    };

    const handleLogoutClick = () => {
        setIsProfileOpen(false);
        router.post('/logout');
    };

    const handleTermsAccept = () => {
        if (!currentClient || !isTermsConfirmed) {
            return;
        }

        savePsycareTermsAcceptance(currentClient.id, currentClient.fullName);
        setActionMessage(
            language === 'en'
                ? 'Terms accepted. You can now use PsyCare 2.0.'
                : 'Terma diterima. Anda kini boleh menggunakan PsyCare 2.0.',
        );
        setIsTermsConfirmed(false);
        setIsTermsModalOpen(false);
    };

    const termsAcceptanceRecord = currentClient
        ? getPsycareTermsAcceptanceRecord(currentClient.id)
        : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <aside className="fixed inset-y-0 left-0 z-30 w-72 border-r border-gray-200 bg-red-800 text-white shadow-sm">
                <Link
                    href="/psycare/dashboard"
                    className="block border-b border-red-700 px-6 py-5 hover:bg-red-700/40"
                >
                    <p className="text-xs tracking-wide text-red-100">
                        PsyCare 2.0
                    </p>
                    <h1 className="text-lg font-semibold">
                        Counselling Portal
                    </h1>
                </Link>

                <nav className="flex h-[calc(100%-89px)] flex-col p-4">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                                        url === item.href
                                            ? 'bg-red-700 text-white'
                                            : 'hover:bg-red-700'
                                    }`}
                                >
                                    <span>
                                        {language === 'en'
                                            ? item.labelEn
                                            : item.labelMs}
                                    </span>
                                    {item.href === '/psycare/dashboard' &&
                                        isEmotionPendingToday && (
                                            <span
                                                aria-label={
                                                    language === 'en'
                                                        ? 'Emotion not recorded today'
                                                        : 'Emosi belum direkod hari ini'
                                                }
                                                title={
                                                    language === 'en'
                                                        ? 'Emotion not recorded today'
                                                        : 'Emosi belum direkod hari ini'
                                                }
                                                className="ml-3 inline-flex h-2.5 w-2.5 rounded-full bg-red-300"
                                            />
                                        )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto rounded-lg border border-red-700 bg-red-900/30 p-3">
                        <p className="text-xs font-semibold tracking-wide text-red-100 uppercase">
                            {copy.languageLabel}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPsycareLanguage('ms')}
                                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                                    language === 'ms'
                                        ? 'bg-yellow-400 text-gray-900'
                                        : 'bg-red-800 text-white hover:bg-red-700'
                                }`}
                            >
                                {copy.malay}
                            </button>
                            <button
                                type="button"
                                onClick={() => setPsycareLanguage('en')}
                                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                                    language === 'en'
                                        ? 'bg-yellow-400 text-gray-900'
                                        : 'bg-red-800 text-white hover:bg-red-700'
                                }`}
                            >
                                {copy.english}
                            </button>
                        </div>
                    </div>
                </nav>
            </aside>

            <div
                className={`pl-72 ${isTermsModalOpen ? 'pointer-events-none blur-[1px] select-none' : ''}`}
                aria-hidden={isTermsModalOpen}
            >
                <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {copy.pageTitle}
                        </h2>
                        <p className="text-sm text-gray-500">{copy.welcome}</p>
                    </div>

                    <div className="relative flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSOSClick}
                            className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                        >
                            {copy.sosButton}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setIsProfileOpen(
                                    (previousState) => !previousState,
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            {copy.profileButton}
                        </button>

                        {isProfileOpen && (
                            <div className="absolute top-12 right-0 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                                <Link
                                    href="/psycare/perkhidmatan"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                    {copy.myAccount}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSettingsClick}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                    {copy.settings}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                >
                                    {copy.logout}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="p-6">
                    {actionMessage && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            {actionMessage}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {isTermsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="bg-gray-900 px-6 py-4 text-white">
                            <p className="text-xs font-semibold tracking-[0.2em] text-yellow-300 uppercase">
                                PsyCare 2.0
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold">
                                {copy.termsTitle}
                            </h2>
                            <p className="mt-2 text-sm text-gray-300">
                                {copy.termsIntro}
                            </p>
                            <p className="text-sm text-gray-300">
                                {copy.termsIntroMs}
                            </p>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            {copy.clientLabel}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {currentClient?.fullName ?? '-'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {currentClient?.nationalId ?? '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            {copy.termsAcceptedAtLabel}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {termsAcceptanceRecord?.acceptedAt
                                                ? new Date(
                                                      termsAcceptanceRecord.acceptedAt,
                                                  ).toLocaleString()
                                                : '-'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {isTermsAccepted
                                                ? copy.termsStored
                                                : copy.termsPending}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={isTermsConfirmed}
                                    onChange={() =>
                                        setIsTermsConfirmed(
                                            (currentState) => !currentState,
                                        )
                                    }
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                />
                                <span>
                                    <span className="block font-semibold text-gray-900">
                                        {copy.termsLabel}
                                    </span>
                                    <span className="block text-gray-600">
                                        {copy.termsLabelMs}
                                    </span>
                                </span>
                            </label>

                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                                <p className="font-semibold">
                                    {copy.termsSummary}
                                </p>
                                <p className="mt-1">{copy.termsSummaryMs}</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTermsConfirmed(false);
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    {language === 'en'
                                        ? 'Reset'
                                        : 'Tetapkan Semula'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTermsAccept}
                                    disabled={!isTermsConfirmed}
                                    className="rounded-lg bg-red-800 px-5 py-2 text-sm font-semibold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copy.agreeButton}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FloatingChatbot />
        </div>
    );
}
