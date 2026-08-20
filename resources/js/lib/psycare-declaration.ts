import { getMockClientById } from '@/lib/mock-clients';

export type PsycareTermsAcceptanceRecord = {
    clientId: string;
    clientName: string;
    accepted: boolean;
    acceptedAt: string;
    version: string;
};

export type PsycareClientInformationDeclarationRecord = {
    clientId: string;
    clientName: string;
    declared: boolean;
    declaredAt: string;
    version: string;
};

export const PSYCARE_TERMS_ACCEPTANCE_STORAGE_KEY =
    'psycare.client.terms-acceptance';
export const PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT =
    'psycare:terms-acceptance-updated';
export const PSYCARE_TERMS_VERSION = '2026-05-29';

export const PSYCARE_CLIENT_INFORMATION_DECLARATION_STORAGE_KEY =
    'psycare.client.information-declarations';
export const PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT =
    'psycare:client-information-declaration-updated';
export const PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION = '2026-05-29';

export const PSYCARE_MOCK_CLIENT_ID = 'CLT-002';

const isBrowser = () => typeof window !== 'undefined';

export const getMockCurrentPsycareClient = () =>
    getMockClientById(PSYCARE_MOCK_CLIENT_ID) ?? getMockClientById('CLT-001');

const readStoredRecords = <T>(storageKey: string): Record<string, T> => {
    if (!isBrowser()) {
        return {};
    }

    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
        return {};
    }

    try {
        const parsedValue = JSON.parse(storedValue) as Record<string, T>;

        if (
            !parsedValue ||
            typeof parsedValue !== 'object' ||
            Array.isArray(parsedValue)
        ) {
            return {};
        }

        return parsedValue;
    } catch {
        return {};
    }
};

const writeStoredRecords = <T>(
    storageKey: string,
    records: Record<string, T>,
    updatedEventName: string,
) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(records));
    window.dispatchEvent(new Event(updatedEventName));
};

const readTermsAcceptanceRecords = () =>
    readStoredRecords<PsycareTermsAcceptanceRecord>(
        PSYCARE_TERMS_ACCEPTANCE_STORAGE_KEY,
    );

const readClientInformationDeclarationRecords = () =>
    readStoredRecords<PsycareClientInformationDeclarationRecord>(
        PSYCARE_CLIENT_INFORMATION_DECLARATION_STORAGE_KEY,
    );

export const getPsycareTermsAcceptanceRecord = (clientId: string) => {
    const records = readTermsAcceptanceRecords();
    return records[clientId] ?? null;
};

export const ensurePsycareTermsAcceptanceRecord = (
    clientId: string,
    clientName: string,
) => {
    if (!isBrowser()) {
        return;
    }

    const records = readTermsAcceptanceRecords();

    if (records[clientId]?.version === PSYCARE_TERMS_VERSION) {
        records[clientId] = {
            ...records[clientId],
            clientName,
        };

        writeStoredRecords(
            PSYCARE_TERMS_ACCEPTANCE_STORAGE_KEY,
            records,
            PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
        );
        return;
    }

    records[clientId] = {
        clientId,
        clientName,
        accepted: false,
        acceptedAt: '',
        version: PSYCARE_TERMS_VERSION,
    };

    writeStoredRecords(
        PSYCARE_TERMS_ACCEPTANCE_STORAGE_KEY,
        records,
        PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
    );
};

export const hasPsycareTermsBeenAccepted = (clientId: string) => {
    const record = getPsycareTermsAcceptanceRecord(clientId);

    return Boolean(
        record && record.accepted && record.version === PSYCARE_TERMS_VERSION,
    );
};

export const savePsycareTermsAcceptance = (
    clientId: string,
    clientName: string,
) => {
    if (!isBrowser()) {
        return;
    }

    const records = readTermsAcceptanceRecords();

    records[clientId] = {
        clientId,
        clientName,
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: PSYCARE_TERMS_VERSION,
    };

    writeStoredRecords(
        PSYCARE_TERMS_ACCEPTANCE_STORAGE_KEY,
        records,
        PSYCARE_TERMS_ACCEPTANCE_UPDATED_EVENT,
    );
};

export const getPsycareClientInformationDeclarationRecord = (
    clientId: string,
) => {
    const records = readClientInformationDeclarationRecords();
    return records[clientId] ?? null;
};

export const savePsycareClientInformationDeclaration = (
    clientId: string,
    clientName: string,
) => {
    if (!isBrowser()) {
        return;
    }

    const records = readClientInformationDeclarationRecords();

    records[clientId] = {
        clientId,
        clientName,
        declared: true,
        declaredAt: new Date().toISOString(),
        version: PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION,
    };

    writeStoredRecords(
        PSYCARE_CLIENT_INFORMATION_DECLARATION_STORAGE_KEY,
        records,
        PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT,
    );
};

export const setPsycareClientInformationDeclarationStatus = (
    clientId: string,
    clientName: string,
    declared: boolean,
) => {
    if (!isBrowser()) {
        return;
    }

    const records = readClientInformationDeclarationRecords();

    records[clientId] = {
        clientId,
        clientName,
        declared,
        declaredAt: declared ? new Date().toISOString() : '',
        version: PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION,
    };

    writeStoredRecords(
        PSYCARE_CLIENT_INFORMATION_DECLARATION_STORAGE_KEY,
        records,
        PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT,
    );
};
