import { useEffect, useState } from 'react';
import {
    getMockCurrentPsycareClient,
    getPsycareClientInformationDeclarationRecord,
    PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT,
    PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION,
    savePsycareClientInformationDeclaration,
    setPsycareClientInformationDeclarationStatus,
    type PsycareClientInformationDeclarationRecord,
} from '@/lib/psycare-declaration';
import { clientProfileMockSeed } from '@/lib/psycare-data';

type ProfileTab = 'personal' | 'study' | 'marriage' | 'health' | 'confirmation';

type HealthQuestion =
    | { id: string; no: string; question: string; type: 'label' }
    | {
          id: string;
          no: string;
          question: string;
          type: 'select';
          options: string[];
      }
    | { id: string; no: string; question: string; type: 'date' }
    | { id: string; no: string; question: string; type: 'text' };

const tabs: ProfileTab[] = [
    'personal',
    'study',
    'marriage',
    'health',
    'confirmation',
];

export type MyClientProfile = {
    fullName: string;
    preferredName: string | null;
    clientType: 'student' | 'staff' | 'alumni';
    nationalId: string | null;
    email: string | null;
    phone: string | null;
    currentAddress: string | null;
    faculty: string | null;
    program: string | null;
    matrixNo: string | null;
    studentNo: string | null;
    workerNo: string | null;
    maritalStatus: string | null;
    profileLocked: boolean;
};

type ClientProfileFormProps = {
    myClientProfile?: MyClientProfile | null;
};

const normalizeMyClientType = (type: MyClientProfile['clientType']) => {
    if (type === 'student') return 'PELAJAR / STUDENT';
    if (type === 'staff') return 'STAF / STAFF';
    return 'ALUMNI';
};

export default function ClientProfileForm({ myClientProfile }: ClientProfileFormProps = {}) {
    const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
    const [declarationRecord, setDeclarationRecord] =
        useState<PsycareClientInformationDeclarationRecord | null>(null);
    const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
    const [declarationMessage, setDeclarationMessage] = useState('');
    const profile = clientProfileMockSeed;
    const currentClient = getMockCurrentPsycareClient();

    // Fields that exist on the real `clients` table come from the logged-in
    // client's actual record. Everything else (guardian/study/health/
    // marriage detail) has no schema backing yet and stays on the existing
    // mock content below.
    const personalDetails = {
        clientType: myClientProfile
            ? normalizeMyClientType(myClientProfile.clientType)
            : 'PELAJAR',
        matricNo:
            myClientProfile?.matrixNo ||
            myClientProfile?.workerNo ||
            profile.studyInfo.matricNo,
        fullName: myClientProfile?.fullName ?? profile.fullName,
        nationalId: myClientProfile?.nationalId ?? profile.nationalId,
        gender: '-',
        birthDate: '-',
        age: '-',
        maritalStatus: (
            myClientProfile?.maritalStatus ?? profile.maritalStatus
        ).toUpperCase(),
        nationality: '-',
        religion: '-',
        race: '-',
        permanentAddress: myClientProfile?.currentAddress ?? profile.currentAddress,
        currentAddress: myClientProfile?.currentAddress ?? profile.currentAddress,
        phone: myClientProfile?.phone ?? '-',
        email: myClientProfile?.email ?? 'nur.ainabinti.hamzah@utm.my',
    };

    const familyDetails = {
        guardian1Name: '-',
        guardian1Relationship: '-',
        guardian1Phone: '-',
        guardian2Name: '-',
        guardian2Relationship: '-',
        guardian2Phone: '-',
        siblingCount: '-',
        childOrder: '-',
        motherOccupation: '-',
        fatherOccupation: '-',
        schoolType: '-',
        residencyType: '-',
    };

    const studyDetails = {
        level: 'SARJANA MUDA / BACHELOR',
        program: myClientProfile?.program ?? profile.studyInfo.program,
        campus: 'JOHOR BAHRU / JB',
        faculty: myClientProfile?.faculty ?? profile.studyInfo.faculty,
        studentStatus: 'AKTIF / ACTIVE',
        sessionSemester: '2023/2024',
        yearOfStudy: '3',
        semesterCount: '6',
        cpa: '-',
        officialEmail: myClientProfile?.email ?? 'nur.ainabinti.hamzah@utm.my',
        sponsorName: 'SELF SPONSOR',
        debtAmount: '-',
        advisorName: '-',
        advisorPhone: '-',
    };

    const marriageRows = [
        {
            id: 'marriage-1',
            spouseName: '-',
            relationship: '-',
            spouseOccupation: '-',
            marriageDate: '-',
            childrenCount: '-',
        },
    ];

    const healthQuestions: HealthQuestion[] = [
        {
            id: 'q1',
            no: '1',
            question:
                'Pernahkah anda menghadiri sesi kaunseling sebelum ini? / Have you attended counselling before?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q2',
            no: '2',
            question:
                'Jika jawapan No. 1 adalah YA, / If answer to No. 1 is YES,',
            type: 'label',
        },
        {
            id: 'q2_1',
            no: '2.1',
            question:
                'Bilakah anda menghadiri sesi kaunseling tersebut? / When did you attend the counselling session?',
            type: 'date',
        },
        {
            id: 'q2_2',
            no: '2.2',
            question:
                'Dari mana anda mendapatkan khidmat kaunseling? / Where did you receive counselling services?',
            type: 'select',
            options: [
                '-- Sila Pilih --',
                'UTM',
                'HOSPITAL',
                'KLINIK',
                'SWASTA',
                'LAIN-LAIN / OTHERS',
            ],
        },
        {
            id: 'q3',
            no: '3',
            question:
                'Adakah anda masih mengikuti sesi kaunseling? / Are you still attending counselling sessions?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q4',
            no: '4',
            question:
                'Adakah anda pernah didiagnos psikiatri? / Have you ever been diagnosed by a psychiatrist?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q5',
            no: '5',
            question:
                'Jika jawapan No. 4 adalah YA, / If answer to No. 4 is YES,',
            type: 'label',
        },
        {
            id: 'q5_1',
            no: '5.1',
            question:
                'Bilakah anda berjumpa psikiatri? / When did you meet the psychiatrist?',
            type: 'date',
        },
        {
            id: 'q5_2',
            no: '5.2',
            question:
                'Adakah anda masih mempunyai temujanji dengan psikiatri? / Do you still have appointments with the psychiatrist?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q6',
            no: '6',
            question:
                'Adakah anda pernah / sedang mengambil ubat yang dipreskripsi oleh psikiatri? / Have you ever taken or are currently taking psychiatrist-prescribed medication?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q7',
            no: '7',
            question:
                'Jika YA, sila namakan jenis ubatan tersebut. / If YES, please name the medication type.',
            type: 'text',
        },
        {
            id: 'q8',
            no: '8',
            question:
                'Sila namakan diagnosis yang diberikan oleh psikiatri. / Please name the diagnosis given by the psychiatrist.',
            type: 'text',
        },
        {
            id: 'q9',
            no: '9',
            question:
                'Mempunyai sejarah keluarga yang didiagnos menghadapi sebarang masalah kesihatan mental? / Family history of diagnosed mental health issues?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q10',
            no: '10',
            question:
                'Adakah anda pernah / sedang mengalami penyakit kronik? / Do you have or have you had a chronic illness?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q11',
            no: '11',
            question:
                'Jika YA, sila nyatakan jenis penyakit tersebut. / If YES, please state the illness.',
            type: 'text',
        },
        {
            id: 'q12',
            no: '12',
            question:
                'Adakah anda pernah / sedang mengambil ubat yang dipreskripsi untuk penyakit kronik? / Have you ever taken prescribed medication for a chronic illness?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q13',
            no: '13',
            question:
                'Adakah anda pernah menjalani pembedahan? / Have you ever had surgery?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
        {
            id: 'q14',
            no: '14',
            question:
                'Adakah anda ada alahan terhadap mana-mana ubatan? / Do you have allergies to any medication?',
            type: 'select',
            options: ['-- Sila Pilih --', 'YA / YES', 'TIDAK / NO'],
        },
    ];

    const copy = {
        title: 'Borang Maklumat Klien / Client Information Form',
        tabs: {
            personal: 'Maklumat Peribadi / Personal Information',
            study: 'Maklumat Pengajian / Study Information',
            marriage: 'Maklumat Perkahwinan / Marriage Information',
            health: 'Sejarah Kesihatan / Health History',
            confirmation: 'Pengesahan / Confirmation',
        },
        lockedTitle: 'Profil Dikunci / Profile Locked',
        lockedDescription:
            'Maklumat ini dipaparkan untuk semakan sahaja. Sila hubungi Unit Kaunseling UTM untuk pengesahan dan kemas kini / This information is for review only. Please contact UTM Counselling Unit for verification and updates.',
        personalTitle: 'Maklumat Peribadi / Personal Information',
        familyTitle: 'Maklumat Keluarga / Family Information',
        otherTitle: 'Maklumat Lain / Other Information',
        studyTitle: 'Maklumat Pengajian / Study Information',
        marriageTitle: 'Maklumat Perkahwinan / Marriage Information',
        healthTitle:
            'Sejarah Kesihatan Mental &amp; Kesihatan Fizikal / Mental &amp; Physical Health History',
        confirmationTitle: 'Pengesahan / Confirmation',
        declaration:
            '** Saya mengaku bahawa segala maklumat yang diberikan di atas adalah BENAR dan TANPA SEBARANG UNSUR PAKSAAN DAN TEKANAN. / I declare that all information provided above is TRUE and WITHOUT ANY FORM OF COERCION OR PRESSURE.',
        disclaimer:
            'Pihak UTM tidak akan bertanggungjawab ke atas sebarang kerosakan, kecederaan, kerugian atau kesilapan yang berlaku dalam perkhidmatan akibat maklumat yang salah diberikan. / UTM will not be responsible for any damage, injury, loss, or error arising in the service due to incorrect information provided.',
        submitted: 'DIHANTAR / SUBMITTED',
        notSubmitted: 'BELUM DIHANTAR / NOT SUBMITTED',
        submittedButton: 'Telah Dihantar / Submitted',
        statusControl: 'Status Deklarasi / Declaration Status',
        markNotSubmitted: 'Belum Dihantar / Not Submitted',
        markSubmitted: 'Dihantar / Submitted',
        declarationSaved:
            'Perakuan klien telah dihantar. / Client declaration has been submitted.',
        declarationStatusUpdated:
            'Status deklarasi dikemas kini. / Declaration status updated.',
        declarationRequired:
            'Sila tandakan kotak perakuan sebelum menghantar. / Please tick the declaration checkbox before submitting.',
        noData: 'Tiada data dalam jadual / No data available in table',
        showing: 'Menunjukkan / Showing',
        back: 'Kembali / Back',
        save: 'Simpan / Save',
    };

    const headerSubtitle = `${personalDetails.matricNo} / ${personalDetails.fullName}`;
    const isDeclarationSubmitted = Boolean(
        declarationRecord?.declared &&
        declarationRecord.version ===
            PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION,
    );
    const declarationSubmittedDate =
        isDeclarationSubmitted && declarationRecord?.declaredAt
            ? new Date(declarationRecord.declaredAt).toLocaleString('ms-MY')
            : '-';

    useEffect(() => {
        if (!currentClient) {
            return;
        }

        const refreshDeclarationRecord = () => {
            const nextRecord = getPsycareClientInformationDeclarationRecord(
                currentClient.id,
            );

            setDeclarationRecord(nextRecord);
            setIsDeclarationChecked(
                Boolean(
                    nextRecord?.declared &&
                    nextRecord.version ===
                        PSYCARE_CLIENT_INFORMATION_DECLARATION_VERSION,
                ),
            );
        };

        refreshDeclarationRecord();
        window.addEventListener('storage', refreshDeclarationRecord);
        window.addEventListener(
            PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT,
            refreshDeclarationRecord,
        );

        return () => {
            window.removeEventListener('storage', refreshDeclarationRecord);
            window.removeEventListener(
                PSYCARE_CLIENT_INFORMATION_DECLARATION_UPDATED_EVENT,
                refreshDeclarationRecord,
            );
        };
    }, [currentClient]);

    const handleDeclarationSubmit = () => {
        if (!currentClient) {
            return;
        }

        if (!isDeclarationChecked) {
            setDeclarationMessage(copy.declarationRequired);
            return;
        }

        savePsycareClientInformationDeclaration(
            currentClient.id,
            currentClient.fullName,
        );
        setDeclarationRecord(
            getPsycareClientInformationDeclarationRecord(currentClient.id),
        );
        setDeclarationMessage(copy.declarationSaved);
    };

    const handleDeclarationStatusSwitch = (declared: boolean) => {
        if (!currentClient) {
            return;
        }

        setPsycareClientInformationDeclarationStatus(
            currentClient.id,
            currentClient.fullName,
            declared,
        );
        setDeclarationRecord(
            getPsycareClientInformationDeclarationRecord(currentClient.id),
        );
        setIsDeclarationChecked(declared);
        setDeclarationMessage(copy.declarationStatusUpdated);
    };

    return (
        <section className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gray-700 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {profile.fullName}
                    </h3>
                    <p className="text-xs text-gray-300">{headerSubtitle}</p>
                </div>
                <span className="rounded-md border border-gray-500 bg-gray-600 px-3 py-1 text-xs font-semibold text-white">
                    {copy.title}
                </span>
            </div>

            <div className="flex overflow-x-auto border-b border-gray-300 bg-gray-800">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                                isActive
                                    ? 'border-b-2 border-yellow-400 text-yellow-300'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {copy.tabs[tab]}
                        </button>
                    );
                })}
            </div>

            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 text-sm">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-900">
                    <p className="font-semibold">{copy.lockedTitle}</p>
                    <p className="mt-1">{copy.lockedDescription}</p>
                </div>
            </div>

            <form className="max-h-[70vh] overflow-y-auto p-5">
                {activeTab === 'personal' && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.personalTitle}
                                </h4>
                            </div>
                            <div className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Jenis Klien / Client Type
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.clientType}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        No. Matrik / Matric No.
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.matricNo}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Nama Penuh / Full Name
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.fullName}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        No. KP / Passport
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.nationalId}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Jantina / Gender
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.gender}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Tarikh Lahir / Date of Birth
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.birthDate}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Umur / Age
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.age}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Status Berkahwin / Marital Status
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.maritalStatus}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Warganegara / Nationality
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.nationality}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Agama / Religion
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.religion}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Keturunan / Race
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.race}
                                    </span>
                                </div>
                                <div className="flex gap-3 md:col-span-2">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Alamat Tetap / Permanent Address
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.permanentAddress}
                                    </span>
                                </div>
                                <div className="flex gap-3 md:col-span-2">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Alamat Semasa / Current Address
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.currentAddress}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        No. Tel. (HP) / Mobile No.
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.phone}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Email
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {personalDetails.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.familyTitle}
                                </h4>
                            </div>
                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                {[
                                    [
                                        'Nama Waris (1) / Guardian Name (1)',
                                        familyDetails.guardian1Name,
                                    ],
                                    [
                                        'Nama Waris (2) / Guardian Name (2)',
                                        familyDetails.guardian2Name,
                                    ],
                                    [
                                        'Hubungan Waris (1) / Relationship (1)',
                                        familyDetails.guardian1Relationship,
                                    ],
                                    [
                                        'Hubungan Waris (2) / Relationship (2)',
                                        familyDetails.guardian2Relationship,
                                    ],
                                    [
                                        'No. Tel. Waris (1) / Phone (1)',
                                        familyDetails.guardian1Phone,
                                    ],
                                    [
                                        'No. Tel. Waris (2) / Phone (2)',
                                        familyDetails.guardian2Phone,
                                    ],
                                    [
                                        'Bil. Adik-beradik / Number of Siblings',
                                        familyDetails.siblingCount,
                                    ],
                                    [
                                        'Anak ke / Child Order',
                                        familyDetails.childOrder,
                                    ],
                                    [
                                        'Pekerjaan Ibu / Penjaga / Mother / Guardian Occupation',
                                        familyDetails.motherOccupation,
                                    ],
                                    [
                                        'Pekerjaan Bapa / Penjaga / Father / Guardian Occupation',
                                        familyDetails.fatherOccupation,
                                    ],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex gap-3">
                                        <span className="w-44 shrink-0 text-gray-500">
                                            {label}
                                        </span>
                                        <span className="text-gray-400">:</span>
                                        <span className="font-medium text-gray-800">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.otherTitle}
                                </h4>
                            </div>
                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Jenis Sekolah / School Type
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {familyDetails.schoolType}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-44 shrink-0 text-gray-500">
                                        Jenis Residensi / Residency Type
                                    </span>
                                    <span className="text-gray-400">:</span>
                                    <span className="font-medium text-gray-800">
                                        {familyDetails.residencyType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'study' && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.studyTitle}
                                </h4>
                            </div>
                            <div className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
                                {[
                                    [
                                        'Peringkat Pengajian / Study Level',
                                        studyDetails.level,
                                    ],
                                    [
                                        'Nama Program / Program Name',
                                        studyDetails.program,
                                    ],
                                    ['Kampus / Campus', studyDetails.campus],
                                    ['Fakulti / Faculty', studyDetails.faculty],
                                    [
                                        'Status Pelajar / Student Status',
                                        studyDetails.studentStatus,
                                    ],
                                    [
                                        'Sesi / Semester',
                                        studyDetails.sessionSemester,
                                    ],
                                    [
                                        'Tahun Pengajian / Year of Study',
                                        studyDetails.yearOfStudy,
                                    ],
                                    [
                                        'Bilangan Semester / Number of Semesters',
                                        studyDetails.semesterCount,
                                    ],
                                    ['CPA / GPA', studyDetails.cpa],
                                    [
                                        'Email (Rasmi) / Official Email',
                                        studyDetails.officialEmail,
                                    ],
                                    [
                                        'Nama Penaja / Sponsor Name',
                                        studyDetails.sponsorName,
                                    ],
                                    [
                                        'Jumlah Hutang / Debt Amount',
                                        studyDetails.debtAmount,
                                    ],
                                    [
                                        'Nama Penasihat Akademik / Academic Advisor',
                                        studyDetails.advisorName,
                                    ],
                                    [
                                        'No. Tel. Penasihat Akademik / Advisor Phone',
                                        studyDetails.advisorPhone,
                                    ],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex gap-3">
                                        <span className="w-52 shrink-0 text-gray-500">
                                            {label}
                                        </span>
                                        <span className="text-gray-400">:</span>
                                        <span className="font-medium text-gray-800">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'marriage' && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.marriageTitle}
                                </h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-fixed text-left text-sm">
                                    <thead className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                        <tr>
                                            <th className="w-[8%] px-3 py-2">
                                                BIL
                                            </th>
                                            <th className="w-[22%] px-3 py-2">
                                                NAMA PASANGAN
                                            </th>
                                            <th className="w-[16%] px-3 py-2">
                                                HUBUNGAN
                                            </th>
                                            <th className="w-[22%] px-3 py-2">
                                                PEKERJAAN PASANGAN
                                            </th>
                                            <th className="w-[18%] px-3 py-2">
                                                TARIKH KAHWIN
                                            </th>
                                            <th className="w-[14%] px-3 py-2">
                                                BILANGAN ANAK
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marriageRows.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-3 py-3 text-sm text-gray-500"
                                                >
                                                    {copy.noData}
                                                </td>
                                            </tr>
                                        ) : (
                                            marriageRows.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className="border-t border-gray-200"
                                                >
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-800">
                                                        {row.spouseName}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {row.relationship}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {row.spouseOccupation}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {row.marriageDate}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {row.childrenCount}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {copy.showing} 1 to {marriageRows.length} of{' '}
                                {marriageRows.length} records
                            </p>
                        </div>

                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        No. KP / Passport Pasangan
                                    </span>
                                    <input
                                        type="text"
                                        defaultValue="-"
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        Nama Pasangan
                                    </span>
                                    <input
                                        type="text"
                                        defaultValue="-"
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        Hubungan
                                    </span>
                                    <select
                                        defaultValue=""
                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    >
                                        <option value="">--Sila Pilih--</option>
                                        <option value="SUAMI">SUAMI</option>
                                        <option value="ISTERI">ISTERI</option>
                                    </select>
                                </label>
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        Pekerjaan Pasangan
                                    </span>
                                    <select
                                        defaultValue=""
                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    >
                                        <option value="">--Sila Pilih--</option>
                                        <option value="KAKITANGAN AWAM">
                                            KAKITANGAN AWAM
                                        </option>
                                        <option value="SWASTA">SWASTA</option>
                                        <option value="BEKERJA SENDIRI">
                                            BEKERJA SENDIRI
                                        </option>
                                        <option value="TIDAK BEKERJA">
                                            TIDAK BEKERJA
                                        </option>
                                    </select>
                                </label>
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        Tarikh Perkahwinan
                                    </span>
                                    <input
                                        type="date"
                                        defaultValue=""
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-gray-500">
                                        Bilangan Anak / Tanggungan
                                    </span>
                                    <input
                                        type="text"
                                        defaultValue="-"
                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'health' && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.healthTitle}
                                </h4>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-blue-950 text-xs tracking-wide text-white uppercase">
                                        <th className="w-[60%] px-3 py-2 text-left">
                                            Deskripsi Soalan / Question
                                            Description
                                        </th>
                                        <th className="w-[40%] px-3 py-2 text-left">
                                            Jawapan / Answer
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {healthQuestions.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2 text-gray-700">
                                                {item.no}&nbsp;&nbsp;
                                                {item.question}
                                            </td>
                                            <td className="px-3 py-2">
                                                {item.type ===
                                                'label' ? null : item.type ===
                                                  'select' ? (
                                                    <select
                                                        defaultValue=""
                                                        className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    >
                                                        {item.options.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option ===
                                                                        '-- Sila Pilih --'
                                                                            ? ''
                                                                            : option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : item.type === 'date' ? (
                                                    <input
                                                        type="date"
                                                        defaultValue=""
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        defaultValue=""
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-red-700 focus:ring-1 focus:ring-red-100"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'confirmation' && (
                    <div className="space-y-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="mb-3 rounded bg-gray-100 px-3 py-2">
                                <h4 className="text-sm font-semibold text-gray-800">
                                    {copy.confirmationTitle}
                                </h4>
                            </div>
                            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={isDeclarationChecked}
                                    disabled={isDeclarationSubmitted}
                                    onChange={(event) => {
                                        setIsDeclarationChecked(
                                            event.target.checked,
                                        );
                                        setDeclarationMessage('');
                                    }}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-700 disabled:cursor-not-allowed"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {copy.declaration}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {copy.disclaimer}
                                    </p>
                                </div>
                            </label>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                <p className="font-semibold text-gray-800">
                                    {copy.statusControl}
                                </p>
                                <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeclarationStatusSwitch(false)
                                        }
                                        className={`px-3 py-1.5 text-xs font-semibold ${
                                            !isDeclarationSubmitted
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {copy.markNotSubmitted}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeclarationStatusSwitch(true)
                                        }
                                        className={`border-l border-gray-300 px-3 py-1.5 text-xs font-semibold ${
                                            isDeclarationSubmitted
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {copy.markSubmitted}
                                    </button>
                                </div>
                            </div>

                            <div className="mx-auto mt-4 max-w-sm rounded-lg bg-blue-950 p-5 text-sm text-white">
                                <h4 className="mb-3 font-semibold">
                                    Pengesahan Klien / Client Confirmation
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex gap-3">
                                        <span className="w-28 text-blue-200">
                                            Nama / Name
                                        </span>
                                        <span>:</span>
                                        <span className="font-medium">
                                            {profile.fullName}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="w-28 text-blue-200">
                                            Status
                                        </span>
                                        <span>:</span>
                                        <span className="font-medium">
                                            {isDeclarationSubmitted
                                                ? copy.submitted
                                                : copy.notSubmitted}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="w-28 text-blue-200">
                                            Tarikh Hantar / Submitted Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-medium">
                                            {declarationSubmittedDate}
                                        </span>
                                    </div>
                                </div>
                                {declarationMessage && (
                                    <p className="mt-3 text-center text-xs text-yellow-100">
                                        {declarationMessage}
                                    </p>
                                )}
                                <div className="mt-4 flex justify-center">
                                    <button
                                        type="button"
                                        disabled={isDeclarationSubmitted}
                                        onClick={handleDeclarationSubmit}
                                        className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isDeclarationSubmitted
                                            ? copy.submittedButton
                                            : 'Hantar / Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {copy.back}
                    </button>
                    <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                        {copy.save}
                    </button>
                </div>
            </form>
        </section>
    );
}
