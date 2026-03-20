import { useEffect, useState } from 'react';

export type Language = 'ms' | 'en';

const LANGUAGE_KEY = 'psycare-language';
const LANGUAGE_EVENT = 'psycare-language-change';

const isBrowser = () => typeof window !== 'undefined';

export const getPsycareLanguage = (): Language => {
    if (!isBrowser()) {
        return 'ms';
    }

    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);

    return savedLanguage === 'en' ? 'en' : 'ms';
};

export const setPsycareLanguage = (language: Language) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(LANGUAGE_KEY, language);
    window.dispatchEvent(new CustomEvent<Language>(LANGUAGE_EVENT, { detail: language }));
};

export const usePsycareLanguage = () => {
    const [language, setLanguage] = useState<Language>('ms');

    useEffect(() => {
        setLanguage(getPsycareLanguage());

        const handleStorage = (event: StorageEvent) => {
            if (event.key !== LANGUAGE_KEY) {
                return;
            }

            setLanguage(getPsycareLanguage());
        };

        const handleLanguageChange = (event: Event) => {
            const customEvent = event as CustomEvent<Language>;
            const nextLanguage = customEvent.detail;

            if (nextLanguage === 'ms' || nextLanguage === 'en') {
                setLanguage(nextLanguage);
                return;
            }

            setLanguage(getPsycareLanguage());
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(LANGUAGE_EVENT, handleLanguageChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange as EventListener);
        };
    }, []);

    return language;
};
