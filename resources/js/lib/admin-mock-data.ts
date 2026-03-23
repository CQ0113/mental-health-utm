import { getMockClientById } from '@/lib/mock-clients';

export const adminSharedLocationOptions = [
    'PUSAT KAUNSELING (JB)',
    'PUSAT KAUNSELING (KL)',
];

export const adminCounselorOptions = [
    'TIADA',
    'ALLAN A. MARSH',
    'SOFIAN BIN WAHIDIN',
    'Pn. Aisyah Rahman',
    'Dr. Farhan Omar',
];

export const adminServiceLocationOptions = [
    'UTM Counselling Centre (JB)',
    'UTM Counselling Centre (KL)',
];

export const adminInitialServiceItems = [
    {
        id: 'SVC-001',
        code: 'SVC/001',
        name: 'Leadership Counselling',
        durationMinutes: 60,
        location: 'UTM Counselling Centre (JB)',
        status: 'active',
        sessionMode: 'physical',
    },
    {
        id: 'SVC-002',
        code: 'SVC/002',
        name: 'Hypnotherapy Session',
        durationMinutes: 45,
        location: 'UTM Counselling Centre (KL)',
        status: 'active',
        sessionMode: 'hybrid',
    },
    {
        id: 'SVC-003',
        code: 'SVC/003',
        name: 'Art Therapy Session',
        durationMinutes: 40,
        location: 'UTM Counselling Centre (JB)',
        status: 'inactive',
        sessionMode: 'physical',
    },
] as const;

export const adminPpsiLocationOptions = [
    'PUSAT KAUNSELING (JB)',
    'PUSAT KAUNSELING (KL)',
    'UNIT KAUNSELING (JB - JAB PENDAFTAR)',
];

export const adminPpsiStaffDirectory = [
    {
        workerNo: '169',
        name: 'ALLAN A. MARSH',
        role: 'JURUTEKNOLOGI MAKLUMAT',
        ptjCode: 'J020400 - JABATAN PENDAFTAR',
        email: 'allan.marsh@utm.my',
        phone: '0111001010',
    },
    {
        workerNo: '178',
        name: 'SOFIAN BIN WAHIDIN',
        role: 'PEGAWAI TADBIR',
        ptjCode: 'J020500 - HAL EHWAL PELAJAR',
        email: 'sofian.wahidin@utm.my',
        phone: '0123456789',
    },
] as const;

export const adminPpsiInitialRecords = [
    {
        id: 'PPSI-001',
        ppsiNo: '776',
        type: 'staff',
        name: 'BOBBY L. HINES',
        organization: 'UTM',
        location: 'PUSAT KAUNSELING (JB)',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        email: 'bobby.hines@utm.my',
        phone: '075503051',
    },
    {
        id: 'PPSI-002',
        ppsiNo: 'P510',
        type: 'trainee',
        name: 'TONY SPAIN',
        organization: 'UNITEN',
        location: 'PUSAT KAUNSELING (JB)',
        status: 'active',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        email: 'tony.spain@ggggg.com',
        phone: '0111001010',
    },
] as const;

export const adminRegisteredCounsellors = [
    'Pn. Aisyah Rahman',
    'En. Hafiz Iskandar',
    'Pn. Nurul Huda',
    'Dr. Farhan Omar',
    'Pn. Salina Bakar',
];

export const adminClientInitialRecords = [
    {
        id: 'CLI-001',
        referenceNo: 'WJB/2024/00003',
        applicationType: 'walk-in',
        location: 'PUSAT KAUNSELING (JB)',
        counselorName: 'ALLAN A. MARSH',
        appointmentNeed: 'KLIEN MEMERLUKAN BANTUAN SESI KAUNSELING BERKAITAN KEWANGAN DAN KELUARGA',
        attendedBefore: 'no',
        status: 'active',
        clientType: 'student',
        clientName: getMockClientById('CLT-004')?.fullName ?? 'NUR HAZIQAH BINTI RAMLI',
        faculty: getMockClientById('CLT-004')?.faculty ?? 'FAKULTI KOMPUTERAN',
        matrixNo: getMockClientById('CLT-004')?.matrixNo ?? 'A23CS9001',
        workerNo: '-',
    },
    {
        id: 'CLI-002',
        referenceNo: 'AJB/2024/00011',
        applicationType: 'appointment',
        location: 'PUSAT KAUNSELING (JB)',
        counselorName: 'Pn. Aisyah Rahman',
        appointmentNeed: 'Sesi susulan pengurusan tekanan kerja.',
        attendedBefore: 'yes',
        status: 'active',
        clientType: 'staff',
        clientName: getMockClientById('CLT-005')?.fullName ?? 'MARWAN NAGI MOHAMED ALGHAFARI',
        faculty: getMockClientById('CLT-005')?.faculty ?? 'JABATAN PENDAFTAR',
        matrixNo: '-',
        workerNo: getMockClientById('CLT-005')?.workerNo ?? 'MKIEB1079',
    },
] as const;

export const adminClientInitialSessionRecords = [
    {
        id: 'SES-001',
        sessionReferenceNo: 'WJB/2024/00003/1',
        sessionCategory: 'BARU',
        appointmentType: 'TEMUJANJI',
        sessionDate: '2025-01-03',
        slotLabel: 'SLOT 3 (02:30 PM - 04:30 PM)',
        location: 'PUSAT KAUNSELING (JB)',
        status: 'VERIFIED',
        attendanceStatus: 'BELUM HADIR',
    },
    {
        id: 'SES-002',
        sessionReferenceNo: 'WJB/2024/00003/2',
        sessionCategory: 'SUSULAN',
        appointmentType: 'SUSULAN',
        sessionDate: '2025-01-10',
        slotLabel: 'SLOT 1 (08:30 AM - 09:30 AM)',
        location: 'PUSAT KAUNSELING (KL)',
        status: 'VERIFIED',
        attendanceStatus: 'HADIR',
    },
] as const;

export const adminAppointmentLocationOptions = ['PUSAT KAUNSELING (JB)', 'PUSAT KAUNSELING (KL)'];
