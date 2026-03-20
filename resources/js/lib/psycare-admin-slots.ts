export type SessionType = 'physical' | 'online';

export type AdminSlot = {
    id: string;
    label: string;
    counselorName: string;
    allowedSessionTypes: SessionType[];
};

export type AdminScheduleDay = {
    date: string;
    slots: AdminSlot[];
};

export const ADMIN_SLOT_STORAGE_KEY = 'psycare.admin.slot-schedule';
export const ADMIN_SLOT_UPDATED_EVENT = 'psycare:admin-slot-updated';

export const adminManagedSchedule: AdminScheduleDay[] = [
    {
        date: '2026-03-11',
        slots: [
            {
                id: 'SLT-1101',
                label: 'SLOT 1 (08:30 AM - 09:30 AM)',
                counselorName: 'Pn. Aisyah Rahman',
                allowedSessionTypes: ['physical', 'online'],
            },
            {
                id: 'SLT-1102',
                label: 'SLOT 2 (10:30 AM - 11:30 AM)',
                counselorName: 'En. Hafiz Iskandar',
                allowedSessionTypes: ['online'],
            },
            {
                id: 'SLT-1103',
                label: 'SLOT 3 (02:30 PM - 03:30 PM)',
                counselorName: 'Pn. Nurul Huda',
                allowedSessionTypes: ['physical'],
            },
        ],
    },
    {
        date: '2026-03-12',
        slots: [
            {
                id: 'SLT-1201',
                label: 'SLOT 1 (09:00 AM - 10:00 AM)',
                counselorName: 'Dr. Farhan Omar',
                allowedSessionTypes: ['physical', 'online'],
            },
            {
                id: 'SLT-1202',
                label: 'SLOT 2 (11:00 AM - 12:00 PM)',
                counselorName: 'Pn. Aisyah Rahman',
                allowedSessionTypes: ['online'],
            },
        ],
    },
    {
        date: '2026-03-13',
        slots: [
            {
                id: 'SLT-1301',
                label: 'SLOT 1 (08:30 AM - 09:30 AM)',
                counselorName: 'En. Hafiz Iskandar',
                allowedSessionTypes: ['physical'],
            },
            {
                id: 'SLT-1302',
                label: 'SLOT 2 (01:30 PM - 02:30 PM)',
                counselorName: 'Dr. Farhan Omar',
                allowedSessionTypes: ['physical', 'online'],
            },
        ],
    },
];

const sortScheduleByDate = (schedule: AdminScheduleDay[]) =>
    [...schedule].sort((first, second) => first.date.localeCompare(second.date));

export const getAdminManagedSchedule = (): AdminScheduleDay[] => {
    if (typeof window === 'undefined') {
        return sortScheduleByDate(adminManagedSchedule);
    }

    const storedValue = window.localStorage.getItem(ADMIN_SLOT_STORAGE_KEY);

    if (!storedValue) {
        return sortScheduleByDate(adminManagedSchedule);
    }

    try {
        const parsedValue = JSON.parse(storedValue) as AdminScheduleDay[];

        if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
            return sortScheduleByDate(adminManagedSchedule);
        }

        return sortScheduleByDate(parsedValue);
    } catch {
        return sortScheduleByDate(adminManagedSchedule);
    }
};

export const saveAdminManagedSchedule = (schedule: AdminScheduleDay[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    const normalizedSchedule = sortScheduleByDate(schedule);
    window.localStorage.setItem(ADMIN_SLOT_STORAGE_KEY, JSON.stringify(normalizedSchedule));
    window.dispatchEvent(new Event(ADMIN_SLOT_UPDATED_EVENT));
};
