export type MockClientType = 'student' | 'staff';

export type MockClientProfile = {
    id: string;
    fullName: string;
    preferredName: string;
    clientType: MockClientType;
    faculty: string;
    program?: string;
    matrixNo?: string;
    workerNo?: string;
    studentNo?: string;
    nationalId: string;
    email: string;
    address: string;
};

export const mockClientProfiles: MockClientProfile[] = [
    {
        id: 'CLT-001',
        fullName: 'CHU CHENG QING',
        preferredName: 'Chu Cheng Qing',
        clientType: 'student',
        faculty: '28 - Fakulti Komputeran',
        program: 'Sarjana Muda Sains Komputer',
        matrixNo: 'A23CS0218',
        studentNo: 'A23CS0218',
        nationalId: '010101-10-1001',
        email: 'a23cs0218@graduate.utm.my',
        address: 'Kolej Tun Dr Ismail, UTM Johor Bahru',
    },
    {
        id: 'CLT-002',
        fullName: 'NUR AINA HAMZAH',
        preferredName: 'Nur Aina Binti Hamzah',
        clientType: 'student',
        faculty: 'Fakulti Komputeran',
        program: 'Sarjana Muda Sains Komputer',
        matrixNo: 'A23CS4017',
        studentNo: 'A23CS4017',
        nationalId: '010203-10-1234',
        email: 'a23cs4017@graduate.utm.my',
        address: 'Kolej Tun Fatimah, UTM Johor Bahru',
    },
    {
        id: 'CLT-003',
        fullName: 'AMIRUL HAKIM',
        preferredName: 'Amirul Hakim',
        clientType: 'student',
        faculty: 'Fakulti Kejuruteraan Mekanikal',
        program: 'Sarjana Muda Kejuruteraan Mekanikal',
        matrixNo: 'A22ME1102',
        studentNo: 'A22ME1102',
        nationalId: '000504-14-7788',
        email: 'a22me1102@graduate.utm.my',
        address: 'Kolej Perdana, UTM Johor Bahru',
    },
    {
        id: 'CLT-004',
        fullName: 'NUR HAZIQAH BINTI RAMLI',
        preferredName: 'Nur Haziqah Binti Ramli',
        clientType: 'student',
        faculty: 'FAKULTI KOMPUTERAN',
        program: 'Sarjana Muda Sains Komputer',
        matrixNo: 'A23CS9001',
        studentNo: 'A23CS9001',
        nationalId: '011212-01-5678',
        email: 'a23cs9001@graduate.utm.my',
        address: 'Kolej Siswa Jaya, UTM Johor Bahru',
    },
    {
        id: 'CLT-005',
        fullName: 'MARWAN NAGI MOHAMED ALGHAFARI',
        preferredName: 'Marwan Nagi Mohamed Alghafari',
        clientType: 'staff',
        faculty: 'JABATAN PENDAFTAR',
        workerNo: 'MKIEB1079',
        nationalId: '861020-11-8899',
        email: 'marwan.alghafari@utm.my',
        address: 'Taman Universiti, Johor Bahru',
    },
    {
        id: 'CLT-006',
        fullName: 'NUR AISYAH BINTI RAHMAN',
        preferredName: 'Nur Aisyah Binti Rahman',
        clientType: 'student',
        faculty: 'Fakulti Komputeran',
        program: 'Sarjana Muda Sains Data',
        matrixNo: 'A22CS0456',
        studentNo: 'A22CS0456',
        nationalId: '020214-01-7712',
        email: 'aisyah.rahman@graduate.utm.my',
        address: 'Kolej 9, UTM Johor Bahru',
    },
];

export const getMockClientById = (id: string) =>
    mockClientProfiles.find((client) => client.id === id);

export const getMockClientByName = (name: string) => {
    const normalizedName = name.trim().toLowerCase();
    return mockClientProfiles.find((client) => client.fullName.toLowerCase() === normalizedName);
};
