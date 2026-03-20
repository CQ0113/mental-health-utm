import { Link, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
    setPsycareLanguage,
    usePsycareLanguage,
} from '@/lib/psycare-language';
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
    const language = usePsycareLanguage();
    const { url } = usePage();

    useEffect(() => {
        const evaluateTodayEmotionStatus = () => {
            const todayIso = new Date().toISOString().slice(0, 10);
            const storedEmotionRecords = localStorage.getItem(EMOTION_RECORDS_STORAGE_KEY);

            if (!storedEmotionRecords) {
                setIsEmotionPendingToday(true);
                return;
            }

            try {
                const parsedEmotionRecords = JSON.parse(storedEmotionRecords) as Array<{ date: string }>;
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
        window.addEventListener('psycare:emotion-records-updated', evaluateTodayEmotionStatus);

        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener('psycare:emotion-records-updated', evaluateTodayEmotionStatus);
        };
    }, []);

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
        setActionMessage(copy.logoutMessage);
        setIsProfileOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <aside className="fixed inset-y-0 left-0 z-30 w-72 border-r border-gray-200 bg-red-800 text-white shadow-sm">
                <Link
                    href="/psycare/dashboard"
                    className="block border-b border-red-700 px-6 py-5 hover:bg-red-700/40"
                >
                    <p className="text-xs tracking-wide text-red-100">PsyCare 2.0</p>
                    <h1 className="text-lg font-semibold">Counselling Portal</h1>
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
                                    <span>{language === 'en' ? item.labelEn : item.labelMs}</span>
                                    {item.href === '/psycare/dashboard' && isEmotionPendingToday && (
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-100">
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

            <div className="pl-72">
                <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{copy.pageTitle}</h2>
                        <p className="text-sm text-gray-500">{copy.welcome}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <Link
                                href="/psycare/dashboard"
                                className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Client Portal
                            </Link>
                            <Link
                                href="/admin/dashboard"
                                className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Admin Portal
                            </Link>
                            <Link
                                href="/counsellor/dashboard"
                                className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Counsellor Portal
                            </Link>
                        </div>
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
                            onClick={() => setIsProfileOpen((previousState) => !previousState)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            {copy.profileButton}
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-12 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
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

            <FloatingChatbot />
        </div>
    );
}
