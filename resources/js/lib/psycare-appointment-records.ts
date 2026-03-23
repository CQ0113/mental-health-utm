export type AppointmentRecord = {
    referenceNo: string;
    date: string;
    slot: string;
    counselor: string;
    sessionType: 'online' | 'physical';
    status:
        | 'open'
        | 'counsellor-reviewing'
        | 'approved'
        | 'on-going'
        | 'complete'
        | 'follow-up'
        | 'closed';
};

export const pastAppointments: AppointmentRecord[] = [
    {
        referenceNo: 'PSY-2026-00011',
        date: '19 Mac 2026',
        slot: 'SLOT 2 (10:30 AM - 11:30 AM)',
        counselor: 'Pn. Aisyah Rahman',
        sessionType: 'online',
        status: 'closed',
    },
    {
        referenceNo: 'PSY-2026-00009',
        date: '12 Mac 2026',
        slot: 'SLOT 1 (08:30 AM - 09:30 AM)',
        counselor: 'Dr. Farhan Omar',
        sessionType: 'physical',
        status: 'closed',
    },
    {
        referenceNo: 'PSY-2026-00007',
        date: '03 Mac 2026',
        slot: 'SLOT 3 (02:30 PM - 03:30 PM)',
        counselor: 'En. Hafiz Iskandar',
        sessionType: 'physical',
        status: 'closed',
    },
    {
        referenceNo: 'PSY-2026-00012',
        date: '26 Mac 2026',
        slot: 'SLOT 1 (09:00 AM - 10:00 AM)',
        counselor: 'Pn. Aisyah Rahman',
        sessionType: 'online',
        status: 'follow-up',
    },
    {
        referenceNo: 'PSY-2026-00013',
        date: '02 Apr 2026',
        slot: 'SLOT 2 (11:00 AM - 12:00 PM)',
        counselor: 'Dr. Farhan Omar',
        sessionType: 'physical',
        status: 'closed',
    },
    {
        referenceNo: 'PSY-2026-00014',
        date: '09 Apr 2026',
        slot: 'SLOT 3 (02:30 PM - 03:30 PM)',
        counselor: 'Pn. Aisyah Rahman',
        sessionType: 'online',
        status: 'closed',
    },
    {
        referenceNo: 'PSY-2026-00015',
        date: '16 Apr 2026',
        slot: 'SLOT 1 (08:30 AM - 09:30 AM)',
        counselor: 'En. Hafiz Iskandar',
        sessionType: 'physical',
        status: 'closed',
    },
];
